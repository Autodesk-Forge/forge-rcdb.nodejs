import ServiceManager from '../services/SvcManager'
import express from 'express'
import config from 'c0nfig'

module.exports = function() {

  /////////////////////////////////////////////////////////
  // Services
  //
  /////////////////////////////////////////////////////////
  const uploadSvc = ServiceManager.getService(
    'UploadSvc')

  const forgeSvc = ServiceManager.getService(
    'ForgeSvc')

  const ossSvc = ServiceManager.getService(
    'OssSvc')

  const bucket = config.meta.bucket

  /////////////////////////////////////////////////////////
  // initialize
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
  //router
  //
  /////////////////////////////////////////////////////////
  const router = express.Router()

  /////////////////////////////////////////////////////////
  // Get all meta properties for model (debug only)
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/properties',
    async(req, res) => {

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
        bucket.bucketKey,
        req.params.fileId)

      const details = await ossSvc.getObjectDetails(token,
        bucket.bucketKey,
        req.params.fileId)

      res.set('Content-Lenght', details.body.size)
      res.end(object)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // upload resource
  //
  /////////////////////////////////////////////////////////
  router.post('/:db/:modelId/resources/:resourceId',
    uploadSvc.uploader.single('metaFile'),
    async(req, res) => {

    try {

      const db = req.params.db

      const token = await forgeSvc.get2LeggedToken()

      const file = req.file

      const response = await ossSvc.uploadObject (
        token, bucket.bucketKey,
        req.params.resourceId,
        file)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // delete resource
  //
  /////////////////////////////////////////////////////////
  router.delete('/:db/:modelId/resources/:resourceId',
    async(req, res) => {

    try {

      const db = req.params.db

      const token = await forgeSvc.get2LeggedToken()

      const response = await ossSvc.deleteObject (
        token, bucket.bucketKey,
        req.params.resourceId)

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
          bucket.bucketKey,
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

  /////////////////////////////////////////////////////////
  // delete all meta properties on node
  //
  /////////////////////////////////////////////////////////
  router.delete('/:db/:modelId/:dbId/properties',
    async(req, res) => {

    try {

      const modelId = req.params.modelId
      const dbId = req.params.dbId
      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const metaProperties =
        await modelSvc.getNodeMetaProperties (
        modelId, dbId)

      const tasks = metaProperties.map((metaProperty) => {

        if (metaProperty.metaType === 'File') {

          forgeSvc.get2LeggedToken().then((token) => {

            ossSvc.deleteObject(token,
              bucket.bucketKey,
              metaProperty.fileId)
          })
        }

        return modelSvc.deleteNodeMetaProperty(
          modelId, metaProperty.id)
      })

      const response = await Promise.all(tasks)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // Export all meta properties for model
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/properties/export/:format',
    async(req, res) => {

    try {

      const modelId = req.params.modelId
      const format = req.params.format
      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const response =
        await modelSvc.getModelMetaProperties(
          modelId)

      switch (format){

        case 'json':
          res.header('Content-Type','application/json')
          res.send(JSON.stringify(response, null, 2))
          break

        case 'csv':
          res.send(data)
          break

        default:
          res.status(400)
          res.json('Invalid format: ' + format)
      }

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  return router
}
