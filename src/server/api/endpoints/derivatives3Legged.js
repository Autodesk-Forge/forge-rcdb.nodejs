
import ServiceManager from '../services/SvcManager'
import compression from 'compression'
import express from 'express'

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
  // GET /formats
  // Get supported formats
  //
  /////////////////////////////////////////////////////////
  router.get('/formats', async (req, res) => {

    try {

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

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

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

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

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

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

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response = await derivativesSvc.getHierarchy(
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

      const urn = req.params.urn

      const guid = req.params.guid

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

      const derivativesSvc = ServiceManager.getService(
        'DerivativesSvc')

      const response =
        await derivativesSvc.getProperties(
          token, urn, guid)

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

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

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

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

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

  return router
}
