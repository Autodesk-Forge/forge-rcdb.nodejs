import ServiceManager from '../services/SvcManager'
import compression from 'compression'
import express from 'express'
import mongo from 'mongodb'
import config from'c0nfig'

module.exports = function () {

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
  // GET /formats
  // Get supported formats
  //
  /////////////////////////////////////////////////////////
  router.get('/formats', async (req, res) => {

    try {

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc =
        ServiceManager.getService(
          'DerivativesSvc')

      const response = await derivativesSvc.getFormats(token)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /metadata/{urn}
  // Get design metadata
  //
  /////////////////////////////////////////////////////////
  router.get('/metadata/:urn', async (req, res) => {

    try {

      const urn = req.params.urn

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response =
        await derivativesSvc.getMetadata(
        token, urn)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /manifest/{urn}
  // Get design manifest
  //
  /////////////////////////////////////////////////////////
  router.get('/manifest/:urn', async (req, res) => {

    try {

      const urn = req.params.urn

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response =
        await derivativesSvc.getManifest(
        token, urn)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /hierarchy/{urn}/{guid}
  // Get hierarchy for design
  //
  /////////////////////////////////////////////////////////
  router.get('/hierarchy/:urn/:guid', async (req, res) => {

    try {

      const urn = req.params.urn

      const guid = req.params.guid

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc =
        ServiceManager.getService(
          'DerivativesSvc')

      const response =
        await derivativesSvc.getHierarchy(
          token, urn, guid)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /properties/{urn}/{guid}
  // Get properties for design
  //
  /////////////////////////////////////////////////////////
  router.get('/properties/:urn/:guid', async (req, res) => {

    try {

      const objectId = req.query.objectId || null

      const guid = req.params.guid

      const urn = req.params.urn

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response =
        await derivativesSvc.getProperties(
        token, urn, guid, {
          objectId: objectId
        })

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /download
  // Get download uri for derivative resource
  //
  /////////////////////////////////////////////////////////
  router.get('/download', async (req, res) => {

    try {

      const filename = req.query.filename || 'download'

      const derivativeUrn = req.query.derivativeUrn

      const base64 = req.query.base64

      const urn = req.query.urn

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.download(
        token, urn, derivativeUrn, {
          base64: base64
        })

      res.set('Content-Type', 'application/octet-stream')

      res.set('Content-Disposition',
        `attachment filename="${filename}"`)

      res.end(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /thumbnail/{urn}
  // Get design thumbnail
  //
  /////////////////////////////////////////////////////////
  router.get('/thumbnails/:urn', async (req, res) => {

    try {

      const urn = req.params.urn

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token = await forgeSvc.get2LeggedToken()

      const options = {
        height: req.query.size || 400,
        width: req.query.size || 400,
        base64: req.query.base64,
        guid: req.query.guid
      }

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response =
        await derivativesSvc.getThumbnail(
        token, urn, options)

      if (req.query.base64) {

        res.end(response)

      } else {

        res.contentType('image/png')
        res.end(response, 'binary')
      }

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // POST /job
  // Post a derivative job - generic
  //
  /////////////////////////////////////////////////////////
  router.post('/job/:db/:modelId', async (req, res) => {

    try {

      const userSvc = ServiceManager.getService(
        'UserSvc')

      const user = await userSvc.getCurrentUser(
        req.session)

      if (!user) {

        res.status(401)
        return res.json('Unauthorized')
      }

      const modelId = req.params.modelId

      const db = req.params.db

      const modelsConfig =
        config.database.models[db]

      if (!modelsConfig) {

        res.status(404)
        return res.json('Invalid collection')
      }

      const modelSvc =
        ServiceManager.getService(
          db + '-ModelSvc')

      const dbModel = await modelSvc.getModel({
        fieldQuery: {
          _id: new mongo.ObjectId(modelId)
        }
      })

      if (dbModel.owner !== user.userId) {

        res.status(401)
        return res.json('Unauthorized')
      }

      const {job, socketId} = req.body

      if (job.input.urn !== dbModel.model.urn) {

        res.status(401)
        return res.json('Unauthorized')
      }

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const socketSvc =
        ServiceManager.getService(
          'SocketSvc')

      const derivativesSvc =
        ServiceManager.getService(
          'DerivativesSvc')

      const token = await forgeSvc.get2LeggedToken()

      const jobId = guid()

      const format = job.output.formats[0].type

      const filename = dbModel.name + '.' + format

      const response =
        await derivativesSvc.postJobWithProgress(
          token, job, {
          query: {
            outputType: format
          },
          onProgress: (progress) => {

            socketSvc.broadcast (
              'job.progress', {
                progress,
                filename,
                jobId,
                job
              }, socketId)
          }
      })

      res.json(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // DELETE /manifest/{urn}
  // Delete design manifest
  //
  /////////////////////////////////////////////////////////
  //router.delete('/manifest/:urn', async (req, res) => {
  //
  //  try {
  //
  //    const urn = req.params.urn
  //
  //    const token = await getToken(req.session)
  //
  //    const derivativesSvc = ServiceManager.getService(
  //      'DerivativesSvc')
  //
  //    const response =
  //      await derivativesSvc.deleteManifest(
  //        token, urn)
  //
  //    res.json(response)
  //
  //  } catch (ex) {
  //
  //    res.status(ex.statusCode || 500)
  //    res.json(ex)
  //  }
  //})

  return router
}
