
import ServiceManager from '../services/SvcManager'
import express from 'express'
import config from 'c0nfig'
import fs from 'fs'

module.exports = function() {

  const uploadSvc = ServiceManager.getService('UploadSvc')

  const router = express.Router()

  //////////////////////////////////////////////////////////////
  // GET /buckets
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets', async (req, res) =>{

    try {

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const token = await forgeSvc.get2LeggedToken()

      const options = {
        region: req.query.region || 'US',
        startAt: req.query.startAt || 0,
        limit: req.query.limit || 100
      }

      const response =
        await ossSvc.getBuckets(
          token, options)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/details
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/details',
    async (req, res) =>{

    try {

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const token = await forgeSvc.get2LeggedToken()

      const bucketKey = req.params.bucketKey

      const response = await ossSvc.getBucketDetails(
        token, bucketKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects',
    async(req, res) => {

    try {

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const token = await forgeSvc.get2LeggedToken()

      const bucketKey = req.params.bucketKey

      const options = {
        region: req.query.region || 'US',
        startAt: req.query.startAt || 0,
        limit: req.query.limit || 100
      }

      const response =
        await ossSvc.getObjects(
          token, bucketKey, options)

      res.send(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey/details
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey/details',
    async (req, res) =>{

    try {

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const token = await forgeSvc.get2LeggedToken()

      const bucketKey = req.params.bucketKey

      const objectKey = req.params.objectKey

      const response =
        await ossSvc.getObjectDetails(
          token, bucketKey, objectKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey
  //
  //
  //////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey',
    async (req, res) => {

    try {

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const token = await forgeSvc.get2LeggedToken()

      const bucketKey = req.params.bucketKey

      const objectKey = req.params.objectKey

      const object =
        await ossSvc.getObject(
          token, bucketKey, objectKey)

      res.end(object)

    } catch(ex) {

      console.log(ex)
    }
  })

  //////////////////////////////////////////////////////////////
  // POST /buckets
  //
  //
  //////////////////////////////////////////////////////////////
  //router.post('/buckets', async (req, res) => {
  //
  //  try {
  //
  //    const bucketCreationData = req.body.bucketCreationData
  //
  //    const forgeSvc = ServiceManager.getService('ForgeSvc')
  //
  //    const ossSvc = ServiceManager.getService('OssSvc')
  //
  //    const token = await forgeSvc.get2LeggedToken()
  //
  //    const options = {
  //      xAdsRegion: req.query.region || 'US'
  //    }
  //
  //    const response =
  //      await ossSvc.createBucket(
  //        token, bucketCreationData,
  //        options)
  //
  //    res.json(response)
  //
  //  } catch (ex) {
  //
  //    res.status(ex.statusCode || 500)
  //    res.json(ex)
  //  }
  //})

  /////////////////////////////////////////////////////////
  // upload resource
  //
  /////////////////////////////////////////////////////////
  router.post('/buckets/:bucketKey',
    uploadSvc.uploader.any(),
    async(req, res) => {

    try {

      const file = req.files[0]

      const forgeSvc = ServiceManager.getService('ForgeSvc')

      const ossSvc = ServiceManager.getService('OssSvc')

      const bucketKey = req.params.bucketKey

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

      console.log(error)

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  //////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey
  //
  //
  //////////////////////////////////////////////////////////////
  //router.delete('/buckets/:bucketKey', async (req, res) => {
  //
  //  try {
  //
  //    const forgeSvc = ServiceManager.getService('ForgeSvc')
  //
  //    const ossSvc = ServiceManager.getService('OssSvc')
  //
  //    const token = await forgeSvc.get2LeggedToken()
  //
  //    const bucketKey = req.params.bucketKey
  //
  //    const response =
  //      await ossSvc.deleteBucket(
  //        token, bucketKey)
  //
  //    res.json(response)
  //
  //  } catch (ex) {
  //
  //    res.status(ex.statusCode || 500)
  //    res.json(ex)
  //  }
  //})

  //////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey/objects/:objectKey
  //
  //
  //////////////////////////////////////////////////////////////
  //router.delete('/buckets/:bucketKey/objects/:objectKey',
  //  async (req, res) =>{
  //
  //  try {
  //
  //    const forgeSvc = ServiceManager.getService('ForgeSvc')
  //
  //    const ossSvc = ServiceManager.getService('OssSvc')
  //
  //    const token = await forgeSvc.get2LeggedToken()
  //
  //    const bucketKey = req.params.bucketKey
  //
  //    const objectKey = req.params.objectKey
  //
  //    const response =
  //      await ossSvc.deleteObject(
  //        token, bucketKey, objectKey)
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

