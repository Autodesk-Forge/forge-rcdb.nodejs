import ServiceManager from '../services/SvcManager'
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

  const ossSvc = ServiceManager.getService(
    'OssSvc')

  const forgeSvc = ServiceManager.getService(
    'ForgeSvc')

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

    return new Buffer(str).toString('base64')
  }

  const atob = (b64Encoded) => {

    return new Buffer(b64Encoded, 'base64').toString()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const postSVFJob = (data) => {

    const bucketKey = queryString.escape(data.bucketKey)
    const objectKey = queryString.escape(data.objectKey)

    const fileId = (
      `urn:adsk.objects:os.object:${bucketKey}/${objectKey}`)

    const urn = btoa(fileId).replace(
      new RegExp('=', 'g'), '')

    const job = {
      input: {
        urn
      },
      output: {
        force: true,
        formats:[{
          type: 'svf',
          views: ['2d', '3d']
        }]
      }
    }

    const socketSvc = ServiceManager.getService(
      'SocketSvc')

    const jobId = guid()

    derivativesSvc.postJobWithProgress(
      data.getToken, job, {
      query: { type: 'geometry' },
      onProgress: async(progress) => {

        if (data.socketId) {

          const msg = {
            filename: data.filename,
            progress,
            jobId
          }

          socketSvc.broadcast (
            'svf.progress', msg, data.socketId)
        }
      }
    }).then(async() => {

      const modelInfo = {
        lifetime: galleryConfig.lifetime,
        env: 'AutodeskProduction',
        timestamp: new Date(),
        owner: data.userId,
        name : data.name,
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
    })
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
    }, 1000 * 60 * 60 * 24)
  }

  /////////////////////////////////////////////////////////
  // Remove models which are not on OSS
  //
  /////////////////////////////////////////////////////////
  const purge = async(modelSvc) => {

    const models = await modelSvc.getModels()

    const token = await forgeSvc.get2LeggedToken()

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

      //purge(svc)
    }
  })

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const router = express.Router()

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  router.get('/:db', async (req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const opts = {
        pageQuery: {
          extraModels: 1,
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
        }
      }

      // Hide private models
      opts.fieldQuery = {
        $or: [
          { private: false },
          { private: null }
        ],
        name: {
          $regex: new RegExp(req.query.search || ''),
          $options : 'i'
        }
      }

      if (req.query.offset) {

        opts.pageQuery.skip = parseInt(req.query.offset)
      }

      if(req.query.limit) {

        opts.pageQuery.limit = parseInt(req.query.limit)
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

      const opts = {}

      // Hide private models
      opts.fieldQuery = {
        $or: [
          { private: false },
          { private: null }
        ],
        name: {
          $regex: new RegExp(req.query.search || ''),
          $options : 'i'
        }
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

      const opts = {
        pageQuery: {
          limit: 15,
          model: 1,
          name: 1,
          urn:  1
        },
        sort: {
          _id: -1
        }
      }

      if(req.query.limit) {

        opts.pageQuery.limit = req.query.limit
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
        thumbnail: 0
      }

      const model = await modelSvc.getById(
        req.params.modelId, {
          pageQuery
        })

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

        res.contentType('image/png')
        return res.end(img, 'binary')
      }

      const options = {
        height: req.query.size || 400,
        width: req.query.size || 400
      }

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.getThumbnail(
        token, model.model.urn, options)

      res.contentType('image/png')
      res.end(response, 'binary')

    } catch (ex) {

      res.status(ex.statusCode || 500)
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

      if (user.uploadLimit &&
          models.length >= user.uploadLimit) {

        res.status(403)
        return res.json('Forbidden: upload limit reached')
      }

      const bucketKey = galleryConfig.bucket.bucketKey

      const socketId = req.body.socketId

      const file = req.file

      const objectKey = guid('xxxx-xxxx-xxxx') +
        path.extname(file.originalname)

      const socketSvc = ServiceManager.getService(
        'SocketSvc')

      const opts = {
        chunkSize: 5 * 1024 * 1024, //5MB chunks
        concurrentUploads: 3,
        onProgress: (info) => {

          if (socketId) {

            const msg = Object.assign({}, info, {
              filename: file.originalname,
              uploadId: req.body.uploadId,
              bucketKey,
              objectKey
            })

            socketSvc.broadcast (
              'upload.progress', msg, socketId)
          }
        },
        onComplete: () => {

          postSVFJob({
            getToken: () => forgeSvc.get2LeggedToken(),
            name: path.parse(file.originalname).name,
            filename: file.originalname,
            userId: user.userId,
            db: req.params.db,
            bucketKey,
            objectKey,
            socketId
          })
        },
        onError: (error) => {

          if (socketId) {

            socketSvc.broadcast (
              'upload.error', error, socketId)
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

      console.log(error)

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // return states sequence
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/states/sequence',
    async(req, res) => {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      var response = await modelSvc.getSequence(
        req.params.modelId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // save states sequence
  //
  /////////////////////////////////////////////////////////
  router.post('/:db/:modelId/states/sequence',
    async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc');

      var sequence = req.body.sequence

      var response = await modelSvc.setSequence(
        req.params.modelId,
        sequence)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // return all states
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/states', async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc');

      var response = await modelSvc.getStates(
        req.params.modelId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // remove state
  //
  /////////////////////////////////////////////////////////
  router.delete('/:db/:modelId/states/:stateId',
    async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc');

      var response = await modelSvc.removeState(
        req.params.modelId,
        req.params.stateId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // adds new state
  //
  /////////////////////////////////////////////////////////
  router.post('/:db/:modelId/states', async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc');

      var state = req.body.state

      var response = await modelSvc.addState(
        req.params.modelId,
        state)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  return router
}




