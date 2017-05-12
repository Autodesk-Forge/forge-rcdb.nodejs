import ServiceManager from '../services/SvcManager'
import express from 'express'

module.exports = function() {

  const uploadSvc = ServiceManager.getService(
    'UploadSvc')

  const router = express.Router()

  /////////////////////////////////////////////////////////
  // Get all meta properties for model (debug only)
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId', async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const response =
        await modelSvc.getModelMetaProperties(
          req.params.modelId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // Get meta properties for specific dbId
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/:dbId', async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const response =
        await modelSvc.getNodeMetaProperties (
          req.params.modelId,
          req.params.dbId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // Get download link for specific fileId
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/download/:fileId', async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const response =
        await modelSvc.getNodeMetaProperties (
        req.params.modelId,
        req.params.fileId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // upload file
  //
  /////////////////////////////////////////////////////////
  router.post('/:db/:modelId', uploadSvc.uploader.any(),
    async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService (
        db + '-ModelSvc')

      const metaProperty = req.body.metaProperty

      const response =
        await modelSvc.addNodeMetaProperty (
        req.params.modelId, metaProperty)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // add meta property
  //
  /////////////////////////////////////////////////////////
  router.post('/:db/:modelId', async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService (
        db + '-ModelSvc')

      const metaProperty = req.body.metaProperty

      const response =
        await modelSvc.addNodeMetaProperty (
          req.params.modelId, metaProperty)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // update meta property
  //
  /////////////////////////////////////////////////////////
  router.put('/:db/:modelId', async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService (
        db + '-ModelSvc')

      const metaProperty = req.body.metaProperty

      const response =
        await modelSvc.updateNodeMetaProperty (
          req.params.modelId, metaProperty)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // delete meta property
  //
  /////////////////////////////////////////////////////////
  router.delete('/:db/:modelId/:metaId',
    async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const response =
        await modelSvc.deleteNodeMetaProperty(
        req.params.modelId,
        req.params.metaId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  return router
}
