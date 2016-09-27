
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'
import fs from 'fs'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets', async (req, res) =>{

    try {

      // obtain forge service
      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      // request 2legged token
      var token = await forgeSvc.get2LeggedToken()

      // obtain oss service
      var ossSvc = ServiceManager.getService('OssSvc')

      // get list of bucket by passing valid token
      var response = await ossSvc.getBuckets(
        token.access_token)

      // send json-formatted response
      res.json(response)

    } catch (ex) {

      console.log(ex)
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/details
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/details', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get2LeggedToken()

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.getBucketDetails(
        token.access_token, bucketKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get2LeggedToken()

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.getObjects(
        token.access_token, bucketKey)

      res.send(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey/details
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey/details', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var objectKey = req.params.objectKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get2LeggedToken()

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.getObjectDetails(
        token.access_token,
        bucketKey,
        objectKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // GET /buckets/:bucketKey/objects/:objectKey
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.get('/buckets/:bucketKey/objects/:objectKey', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var objectKey = req.params.objectKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var ossSvc = ServiceManager.getService(
        'OssSvc')

      var token = await forgeSvc.get2LeggedToken()

      var object = await ossSvc.getObject(
        token.access_token,
        bucketKey,
        objectKey)

      res.end(object)

    } catch(ex) {

      console.log(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // POST /buckets
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/buckets', async (req, res) => {

    try {

      var bucketCreationData = req.body.bucketCreationData

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var token = await forgeSvc.get2LeggedToken()

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.createBucket(
        token.access_token,
        bucketCreationData)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.delete('/buckets/:bucketKey', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var ossSvc = ServiceManager.getService(
        'OssSvc')

      var token = await forgeSvc.request2LeggedToken(
        'bucket:delete')

      var response = await ossSvc.deleteBucket(
        token.access_token,
        bucketKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // DELETE /buckets/:bucketKey/objects/:objectKey
  //
  //
  /////////////////////////////////////////////////////////////////////////////
  router.delete('/buckets/:bucketKey/objects/:objectKey', async (req, res) =>{

    try {

      var bucketKey = req.params.bucketKey

      var objectKey = req.params.objectKey

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      var ossSvc = ServiceManager.getService(
        'OssSvc')

      var token = await forgeSvc.get2LeggedToken()

      var response = await ossSvc.deleteObject(
        token.access_token,
        bucketKey,
        objectKey)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router
}