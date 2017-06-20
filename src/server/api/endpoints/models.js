import ServiceManager from '../services/SvcManager'
import queryString from 'querystring'
import express from 'express'
import {Buffer} from 'buffer'
import config from'c0nfig'
import path from 'path'

module.exports = function() {

  /////////////////////////////////////////////////////////
  //
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

  const bucket = config.gallery.bucket

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  forgeSvc.get2LeggedToken().then((token) => {

    ossSvc.getBucketDetails (
      token, bucket.bucketKey).then(() => {

      }, (error) => {

        if (error.statusCode === 404) {

          ossSvc.createBucket (
            token, bucket)
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

    derivativesSvc.postJobWithProgress(
      data.getToken, job, {
      query: { type: 'geometry' },
      onProgress: (progress) => {

        if (progress === '100%') {

          const modelInfo = {
            env: 'AutodeskProduction',
            name : data.name,
            model : {
              urn
            }
          }

          const modelSvc = ServiceManager.getService(
            data.db + '-ModelSvc')

          modelSvc.register(modelInfo)
        }
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const cleanModels = async(modelSvc) => {

    const models = await modelSvc.getModels()

    const token = await forgeSvc.get2LeggedToken()

    models.forEach((modelInfo) => {

      const fileId = atob(modelInfo.model.urn)

      const objectId = ossSvc.parseObjectId(fileId)

      ossSvc.getObjectDetails (token,
        objectId.bucketKey,
        objectId.objectKey).then((res) => {

        }, (err) => {

          if (err.statusCode === 404) {

          }
        })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  ServiceManager.on('service.register', (svc) => {

    if (svc.name() === 'gallery-ModelSvc') {

      cleanModels(svc)
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

      let opts = {
        pageQuery: {
          model: 1,
          desc: 1,
          path: 1,
          name: 1,
          urn:  1,
          env:  1,
          git:  1
        }
      }

      // Hide private models if not in DEV
      if (config.env !== 'development') {

        opts.fieldQuery = {
          $or: [
            { private: false },
            { private: null }
          ]
        }
      }

      if (req.query.skip) {

        opts.pageQuery.skip = req.query.skip
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

  //////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/:db/:modelId', async (req, res)=> {

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

      const file = req.file

      const bucketKey = bucket.bucketKey

      const objectKey = guid('xxxx-xxxx-xxxx') +
        path.extname(file.originalname)

      const opts = {
        chunkSize: 5 * 1024 * 1024, //5MB chunks
        concurrentUploads: 3,
        onProgress: (info) => {

          const socketId = req.body.socketId

          if (socketId) {

            const socketSvc = ServiceManager.getService(
              'SocketSvc')

            const msg = Object.assign({}, info, {
              bucketKey,
              objectKey
            })

            socketSvc.broadcast (
              'progress', msg, socketId)
          }
        }
      }

      const response =
        await ossSvc.uploadObjectChunked (
        () => forgeSvc.get2LeggedToken(),
        bucketKey,
        objectKey,
        file, opts)

      postSVFJob({
        getToken: () => forgeSvc.get2LeggedToken(),
        name: path.parse(file.originalname).name,
        db: req.params.db,
        bucketKey,
        objectKey
      })

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // return states sequence
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/states/sequence',
    async(req, res)=> {

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
