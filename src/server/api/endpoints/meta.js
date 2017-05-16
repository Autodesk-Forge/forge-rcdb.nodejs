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

  forgeSvc.get2LeggedToken().then((token) => {

    ossSvc.getBucketDetails (
      token, config.meta.bucketKey).then((bucket) => {

        //console.log('Meta Bucket found: ')
        //console.log(bucket)

      }, (error) => {

        if (error.statusCode) {

          const bucketCreationData = {
            bucketKey: config.meta.bucketKey,
            policyKey: 'Persistent'
          }

          ossSvc.createBucket (token, bucketCreationData)
        }
      })
  })

  const router = express.Router()

  /////////////////////////////////////////////////////////
  // Get all meta properties for model (debug only)
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/properties', async(req, res) => {

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
  router.get('/:db/:modelId/:dbId/properties',
    async(req, res) => {

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
  // Get single meta property for specific metaId
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/properties/:metaId',
    async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const response =
        await modelSvc.getNodeMetaProperty (
        req.params.modelId,
        req.params.metaId)

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
  router.get('/:db/:modelId/download/:fileId',
    async(req, res) => {

    try {

      const db = req.params.db

      const token = await forgeSvc.get2LeggedToken()

      const object = await ossSvc.getObject(token,
        config.meta.bucketKey,
        req.params.fileId)

      res.end(object)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // upload file
  //
  /////////////////////////////////////////////////////////
  router.post('/:db/:modelId/upload/:fileId',
    uploadSvc.uploader.single('metaFile'),
    async(req, res) => {

    try {

      const db = req.params.db

      const token = await forgeSvc.get2LeggedToken()

      const file = req.file

      const response = await ossSvc.uploadObject (
        token, config.meta.bucketKey,
        req.params.fileId,
        file)

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
  router.post('/:db/:modelId/properties',
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
  // update meta property
  //
  /////////////////////////////////////////////////////////
  router.put('/:db/:modelId/properties',
    async(req, res) => {

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
  router.delete('/:db/:modelId/properties/:metaId',
    async(req, res) => {

    try {

      const modelId = req.params.modelId
      const metaId = req.params.metaId
      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const metaProperty =
        await modelSvc.getNodeMetaProperty(
          modelId, metaId)

      if (metaProperty.metaType === 'File') {

        const token = await forgeSvc.get2LeggedToken()

        ossSvc.deleteObject(token,
          config.meta.bucketKey,
          metaProperty.fileId)
      }

      const response =
        await modelSvc.deleteNodeMetaProperty(
          modelId, metaId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  return router
}
