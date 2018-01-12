import ServiceManager from '../services/SvcManager'
import sanitizeHtml from 'sanitize-html'
import compression from 'compression'
import queryString from 'querystring'
import express from 'express'
import {Buffer} from 'buffer'
import config from'c0nfig'
import path from 'path'

module.exports = function() {

  /////////////////////////////////////////////////////////
  // Services
  //
  /////////////////////////////////////////////////////////
  const derivativesSvc = ServiceManager.getService(
    'DerivativesSvc')

  const uploadSvc = ServiceManager.getService(
    'UploadSvc')

  const forgeSvc = ServiceManager.getService(
    'ForgeSvc')

  const ossSvc = ServiceManager.getService(
    'OssSvc')

  const galleryConfig = config.gallery

  /////////////////////////////////////////////////////////
  // initialize
  //
  /////////////////////////////////////////////////////////
  forgeSvc.get2LeggedToken().then((token) => {

    ossSvc.getBucketDetails (
      token, galleryConfig.bucket.bucketKey).then(() => {

      }, (error) => {

        if (error.statusCode === 404) {

          ossSvc.createBucket (
            token, galleryConfig.bucket)
        }
      })
  })

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const guid = (format = 'xxxxxxxxxx') => {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const btoa = (str) => {

    return new Buffer(str).toString('base64').replace(
      new RegExp('=', 'g'), '')
  }

  const atob = (b64Encoded) => {

    return new Buffer(b64Encoded, 'base64').toString()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const postSVFJob = async(data) => {

    const bucketKey = queryString.escape(data.bucketKey)
    const objectKey = queryString.escape(data.objectKey)

    const fileId =
      `urn:adsk.objects:os.object:${bucketKey}/${objectKey}`

    const urn = btoa(fileId)

    const socketSvc = ServiceManager.getService(
      'SocketSvc')

    const jobId = guid()

    try {

      const input = Object.assign({urn}, data.compressedUrn
        ? {
            compressedUrn: data.compressedUrn,
            rootFilename: data.rootFilename
          }
        : null)

      const job = {
        input,
        output: {
          force: true,
          formats:[{
            views: ['2d', '3d'],
            type: 'svf'
          }]
        }
      }

      await derivativesSvc.postJobWithProgress (
        data.getToken, job, {
          waitResult: true,
          query: { outputType: 'svf' },
          onProgress: async(progress) => {

            if (data.socketId) {

              const filename = data.compressedUrn
                ? data.rootFilename
                : data.filename

              const msg = {
                filename,
                progress,
                jobId
              }

              socketSvc.broadcast (
                'svf.progress', msg, data.socketId)
            }
          }
        })

      const modelInfo = {
        lifetime: galleryConfig.lifetime,
        name : sanitizeHtml(data.name),
        env: 'AutodeskProduction',
        timestamp: new Date(),
        //owner: data.userId,
        model : {
          objectKey,
          fileId,
          urn
        }
      }

      const modelSvc = ServiceManager.getService(
        data.db + '-ModelSvc')

      const res = await modelSvc.register(modelInfo)

      const msg = {
        filename: data.filename,
        modelId: res._id,
        jobId
      }

      socketSvc.broadcast ('model.added', msg)

    } catch (ex) {

      // removes circular buffer
      const error = Object.assign(ex, {
        parent: undefined
      })

      const msg = {
        filename: data.filename,
        jobId,
        error
      }

      socketSvc.broadcast ('svf.error', msg)

      data.getToken().then((token) => {
        ossSvc.deleteObject(
          token, bucketKey, objectKey)
      })
    }
  }

  /////////////////////////////////////////////////////////
  // Remove models which are too old
  //
  /////////////////////////////////////////////////////////
  const cleanModels = async(modelSvc) => {

    const models = await modelSvc.getModels()

    models.forEach((modelInfo) => {

      if (modelInfo.lifetime) {

        const now = new Date()

        const age = (now - modelInfo.timestamp) / 1000

        if (age > modelInfo.lifetime) {

          deleteModel(modelSvc, modelInfo)
        }
      }
    })

    setTimeout(() => {
      cleanModels(modelSvc)
    }, 1000 * 60 * 60) //Every hour
  }

  /////////////////////////////////////////////////////////
  // Remove DB models which are not on OSS
  // or have no geometry (extraction failed)
  //
  /////////////////////////////////////////////////////////
  const purgeDB = async(modelSvc) => {

    const token = await forgeSvc.get2LeggedToken()

    const models = await modelSvc.getModels()

    models.forEach(async(modelInfo) => {

      try {

        if (modelInfo.env === 'Local') {

          return
        }

        const urn = modelInfo.model.urn

        const fileId = atob(urn)

        const objectId = ossSvc.parseObjectId(fileId)

        const res =
          await ossSvc.getObjectDetails(token,
            objectId.bucketKey,
            objectId.objectKey)

        const manifest =
          await derivativesSvc.getManifest(
            token, urn)

        if (!derivativesSvc.hasDerivative(
            manifest.body, {type: 'geometry'})) {

          deleteModel(modelSvc, modelInfo)
        }

      } catch (ex) {

        if (ex.statusCode === 404) {

          deleteModel(modelSvc, modelInfo)
        }
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Remove OSS models which are not in the DB
  //
  /////////////////////////////////////////////////////////
  const purgeOSS = async(modelSvc) => {

    const token = await forgeSvc.get2LeggedToken()

    const bucketKey = galleryConfig.bucket.bucketKey

    const res = await ossSvc.getObjects(token, bucketKey)

    res.body.items.forEach((object) => {

      const urn = btoa(object.objectId)

      const opts = {
        fieldQuery: {
          'model.urn': urn
        },
        pageQuery: {
          name: 1
        }
      }

      modelSvc.getModel(opts).then((model) => {

        //console.log(model.name)

      }, () => {

        console.log(`NOT FOUND: ${object.objectKey}`)

        ossSvc.deleteObject(
          token, bucketKey, object.objectKey)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // delete a model
  //
  /////////////////////////////////////////////////////////
  const deleteModel = async(modelSvc, modelInfo) => {

    const token = await forgeSvc.get2LeggedToken()

    const modelId = modelInfo._id

    modelSvc.deleteModel(modelId)

    const urn = modelInfo.model.urn

    derivativesSvc.deleteManifest(
      token, urn)

    const fileId = atob(urn)

    const objectId = ossSvc.parseObjectId(fileId)

    ossSvc.deleteObject(token,
      objectId.bucketKey,
      objectId.objectKey)

    const socketSvc = ServiceManager.getService(
      'SocketSvc')

    const msg = {
      modelId,
      urn
    }

    socketSvc.broadcast ('model.deleted', msg)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  ServiceManager.on('service.register', (svc) => {

    if (svc.name() === 'gallery-ModelSvc') {

      cleanModels(svc)

      //purgeOSS(svc)
      //purgeDB(svc)
    }
  })

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const router = express.Router()

  const shouldCompress = (req, res) => {
    return true
  }

  router.use(compression({
    filter: shouldCompress
  }))

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const buildUserWhiteListQuery = async(req, inQuery) => {

    try {

      const userSvc = ServiceManager.getService(
        'UserSvc')

      const user = await userSvc.getCurrentUser(
        req.session)

      const emailId = user ? user.emailId : ''

      const funcDef = `
        function () {
          const allowed = this.whiteList.filter(
            function(email){
              return "${emailId}".match(new RegExp(email))
            })
          return (allowed.length > 0)
        }`

      return Object.assign({}, inQuery, {
        $or: [
          {whiteList: null},
          {$where: funcDef}
        ]
      })

    } catch (ex) {

      return inQuery
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  router.get('/:db', async (req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const fieldQuery =
        await buildUserWhiteListQuery(req, {
          private: null
        })

      if (req.query.search) {

        fieldQuery.name = {
          $regex: new RegExp(req.query.search),
          $options: 'i'
        }
      }

      const limit = parseInt(req.query.limit || 100)

      const skip = parseInt(req.query.offset || 0)

      const opts = {
        fieldQuery,
        pageQuery: {
          extraModels: 1,
          displayName: 1,
          timestamp: 1,
          lifetime: 1,
          model: 1,
          desc: 1,
          path: 1,
          name: 1,
          urn:  1,
          env:  1,
          git:  1
        },
        sort: {
          name: 1
        },
        limit,
        skip
      }

      const response = await modelSvc.getModels(opts)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/count', async (req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const fieldQuery =
        await buildUserWhiteListQuery(req, {
          private: null
        })

      if (req.query.search) {

        fieldQuery.name = {
          $regex: new RegExp(req.query.search),
          $options: 'i'
        }
      }

      const opts = {
        fieldQuery
      }

      const models = await modelSvc.getModels(opts)

      res.json({
        count: models.length
      })

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/recents', async (req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const fieldQuery =
        await buildUserWhiteListQuery(req, {
          private: null
        })

      if (req.query.search) {

        fieldQuery.name = {
          $regex: new RegExp(req.query.search),
          $options: 'i'
        }
      }

      const limit = parseInt(req.query.limit || 15)

      const skip = parseInt(req.query.offset || 0)

      const opts = {
        fieldQuery,
        pageQuery: {
          model: 1,
          name: 1,
          urn:  1
        },
        sort: {
          _id: -1
        },
        limit,
        skip
      }

      const response = await modelSvc.getModels(opts)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId', async (req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const pageQuery = {
        dynamicExtensions: 1,
        layout:1,
        name: 1,
        model:1,
        env:1
      }

      const model = await modelSvc.getById(
        req.params.modelId, {
          pageQuery
        })

      if (model.whiteList) {

        const userSvc = ServiceManager.getService(
          'UserSvc')

        const user = await userSvc.getCurrentUser(
          req.session)

        if (!user) {

          res.status(401)
          return res.json('Unauthorized')

        } else {

          const allowed = model.whiteList.filter(
            (email) => {

              return user.emailId.match(new RegExp(email))
            })

          if (!allowed.length) {

            res.status(403)
            return res.json('Forbidden')
          }
        }
      }

      res.json(model)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /{collection}/model/{modelId}/thumbnail
  // Get model thumbnail
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/thumbnail', async (req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const model = await modelSvc.getById(
        req.params.modelId)

      if (model.thumbnail) {

        const img = new Buffer(model.thumbnail, 'base64')

        const expire = new Date(Date.now() + 2592000000).toUTCString()

        res.setHeader('Cache-Control', 'public, max-age=2592000')
        res.setHeader('Expires', expire)
        res.contentType('image/png')

        return res.end(img, 'binary')
      }

      const options = {
        height: req.query.size || 400,
        width: req.query.size || 400,
        guid: req.query.guid
      }

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.getThumbnail(
        token, model.model.urn, options)

      const expire = new Date(Date.now() + 2592000000).toUTCString()

      res.setHeader('Cache-Control', 'public, max-age=2592000')
      res.setHeader('Expires', expire)
      res.contentType('image/png')
      res.end(response, 'binary')

    } catch (ex) {

      res.status(ex.statusCode || 404)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // upload resource
  //
  /////////////////////////////////////////////////////////
  router.post('/:db',
    uploadSvc.uploader.single('model'),
    async(req, res) => {

    try {

      const userSvc = ServiceManager.getService(
        'UserSvc')

      const user = await userSvc.getCurrentUser(
        req.session)

      if (!user) {

        res.status(401)
        return res.json('Unauthorized')
      }

      const models = await userSvc.getActiveModels(
        config.database.models.gallery.collection,
        user.userId)

      if (user.uploadLimit !== undefined &&
          models.length >= user.uploadLimit) {

        res.status(403)
        return res.json('Forbidden: upload limit reached')
      }

      const bucketKey = galleryConfig.bucket.bucketKey

      const socketId = req.body.socketId

      const uploadId = req.body.uploadId

      const file = req.file

      const objectKey = guid('xxxx-xxxx-xxxx') +
        path.extname(file.originalname)

      const socketSvc = ServiceManager.getService(
        'SocketSvc')

      const rootFilename = req.body.rootFilename

      const compressedUrn = !!rootFilename

      const name =
        rootFilename ||
        path.parse(file.originalname).name

      const opts = {
        chunkSize: 5 * 1024 * 1024, //5MB chunks
        concurrentUploads: 3,
        onProgress: (info) => {

          if (socketId) {

            const msg = Object.assign({}, info, {
              filename: file.originalname,
              bucketKey,
              objectKey,
              uploadId
            })

            socketSvc.broadcast (
              'upload.progress', msg, socketId)
          }
        },
        onComplete: () => {

          postSVFJob({
            getToken: () => forgeSvc.get2LeggedToken(),
            filename: file.originalname,
            userId: user.userId,
            db: req.params.db,
            compressedUrn,
            rootFilename,
            bucketKey,
            objectKey,
            socketId,
            name
          })
        },
        onError: (error) => {

          if (socketId) {

            const msg = {
              filename: file.originalname,
              uploadId,
              error
            }

            socketSvc.broadcast (
              'upload.error', msg, socketId)
          }
        }
      }

      const response =
        await ossSvc.uploadObjectChunked (
        () => forgeSvc.get2LeggedToken(),
        bucketKey,
        objectKey,
        file, opts)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  return router
}


