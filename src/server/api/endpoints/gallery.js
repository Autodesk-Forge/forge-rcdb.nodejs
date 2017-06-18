import ServiceManager from '../services/SvcManager'
import express from 'express'
import config from 'c0nfig'

module.exports = function() {

  const uploadSvc = ServiceManager.getService(
    'UploadSvc')

  const ossSvc = ServiceManager.getService(
    'OssSvc')

  const forgeSvc = ServiceManager.getService(
    'ForgeSvc')

  const bucket = config.gallery.bucket

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

  const router = express.Router()

  //////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/models', async (req, res)=> {

    try {

      const modelSvc = ServiceManager.getService(
        'gallery-ModelSvc')

      let opts = {
        pageQuery: {
          model:  1,
          name: 1,
          env:  1
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

  /////////////////////////////////////////////////////////
  // upload resource
  //
  /////////////////////////////////////////////////////////
  router.post('/models',
    uploadSvc.uploader.single('model'),
    async(req, res) => {

    try {

      const file = req.file

      const bucketKey = bucket.bucketKey

      const objectKey = file.originalname

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

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /thumbnail/{urn}
  // Get design thumbnail
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/thumbnails/:urn', async (req, res) => {

    try {

      const urn = req.params.urn

      const options = {
        height: req.query.height || 400,
        width: req.query.width || 400
      }

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.getThumbnail(
        token, urn, options)

      res.contentType('image/png')
      res.end(response, 'binary')

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router
}
