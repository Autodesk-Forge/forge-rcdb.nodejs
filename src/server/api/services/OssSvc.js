
import ServiceManager from './SvcManager'
import BaseSvc from './BaseSvc'
import Forge from 'forge-apis'
import request from 'request'
import mzfs from 'mz/fs'
import util from 'util'

export default class OssSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super(config)

    this._bucketsAPI = new Forge.BucketsApi()
    this._objectsAPI = new Forge.ObjectsApi()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'OssSvc'
  }

  /////////////////////////////////////////////////////////////////
  // Returns bucket list
  //
  /////////////////////////////////////////////////////////////////
  getBuckets (token, opts = {}) {

    const options = {
      startAt: opts.startAt || null,
      region: opts.region || 'US',
      limit: opts.limit || 100
    }

    return this._bucketsAPI.getBuckets(
      options, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns bucket details
  //
  /////////////////////////////////////////////////////////////////
  getBucketDetails (token, bucketKey) {

    return this._bucketsAPI.getBucketDetails(
      bucketKey, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns object list in specific bucket
  //
  /////////////////////////////////////////////////////////////////
  getObjects (token, bucketKey, opts = {}) {

    const options = {
      startAt: opts.startAt || null,
      region: opts.region || 'US',
      limit: opts.limit || 100
    }

    return this._objectsAPI.getObjects(
      bucketKey, options, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Returns object details
  //
  /////////////////////////////////////////////////////////////////
  getObjectDetails (token, bucketKey, objectKey, opts = {}) {

    return this._objectsAPI.getObjectDetails (
      bucketKey, objectKey, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // parse objectId into { bucketKey, objectKey }
  //
  /////////////////////////////////////////////////////////////////
  parseObjectId (objectId) {

    var parts = objectId.split('/')

    var bucketKey = parts[0].split(':').pop()

    var objectKey = parts[1]

    return {
      bucketKey,
      objectKey
    }
  }

  /////////////////////////////////////////////////////////////////
  // Creates a new bucket
  //
  /////////////////////////////////////////////////////////////////
  createBucket (token, bucketCreationData, opts = {}) {

    bucketCreationData.bucketKey = validateBucketKey(
      bucketCreationData.bucketKey)

    bucketCreationData.policyKey = validatePolicyKey(
      bucketCreationData.policyKey)

    const options = {
      xAdsRegion: opts.xAdsRegion || 'US'
    }

    return this._bucketsAPI.createBucket(
      bucketCreationData, options, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Uploads object to bucket
  //
  /////////////////////////////////////////////////////////////////
  uploadObject (token, bucketKey, objectKey, file) {

    //TODO: Not working yet - need to migrate to SDK

    //return new Promise( async(resolve, reject) => {
    //
    //  try {
    //
    //    let data = await mzfs.readFile(file.path)
    //
    //    let stat = await mzfs.stat(file.path)
    //
    //    this._APIAuth.accessToken = token
    //
    //    return this._objectsAPI.uploadObject (
    //      bucketKey, objectKey, stat.size, data, {})
    //
    //  } catch (ex) {
    //
    //    console.log(ex)
    //
    //    reject(ex)
    //  }
    //})

    return new Promise(async(resolve, reject) => {

      try {

        let data = await mzfs.readFile(file.path)

        var url = util.format(
            'https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s',
            bucketKey,
            objectKey)

        var response = await requestAsync ({
          method: 'PUT',
          headers: {
            //application/vnd.autodesk.autocad.dwg
            'Content-Type': 'application/octet-stream',
            'Authorization': 'Bearer ' + token.access_token
          },
          body: data,
          url: url
        })

        resolve(JSON.parse(response))
      }
      catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // Download object from bucket
  //
  /////////////////////////////////////////////////////////////////
  getObject (token, bucketKey, objectKey) {

    //TODO: Not working yet - need to migrate to SDK

    //this._APIAuth.accessToken = token
    //
    //return new Promise((resolve, reject) => {
    //
    //  this._objectsAPI.getObject (
    //    bucketKey,
    //    objectKey,
    //    { encoding: null },
    //    function (err, data, response) {
    //
    //      //console.log(err)
    //      //console.log(data)
    //      //console.log(response)
    //
    //      if(err) {
    //
    //        return reject(err)
    //      }
    //
    //      resolve(response)
    //    })
    //})

    return new Promise((resolve, reject) => {

      var url = util.format(
        'https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s',
        bucketKey,
        objectKey)

      request({
        url: url,
        headers: {
          'Authorization': 'Bearer ' + token.access_token
        },
        encoding: null
      }, function(err, response, body) {

        if(err) {

          return reject(err)
        }

        resolve(body)
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  // Deletes bucket
  //
  /////////////////////////////////////////////////////////////////
  deleteBucket (token, bucketKey) {

    return this._bucketsAPI.deleteBucket(
      bucketKey, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  // Deletes object from bucket
  //
  /////////////////////////////////////////////////////////////////
  deleteObject (token, bucketKey, objectKey) {

    return this._objectsAPI.deleteObject(
      bucketKey, objectKey, {autoRefresh:false}, token)
  }
}

/////////////////////////////////////////////////////////////////
// Validates bucketKey
//
/////////////////////////////////////////////////////////////////
function validateBucketKey (bucketKey) {

  var result = bucketKey.replace(
    /[&\/\\#,+()$~%. '":*?<>{}]/g,'-')

  return result.toLowerCase()
}

/////////////////////////////////////////////////////////////////
// Validates policyKey
//
/////////////////////////////////////////////////////////////////
function validatePolicyKey (policyKey) {

  policyKey = policyKey.toLowerCase()

  if ([
      'transient',
      'temporary',
      'persistent'
    ].indexOf(policyKey) < 0) {

    return 'transient'
  }

  return policyKey
}

/////////////////////////////////////////////////////////////////
// REST request wrapper
//
/////////////////////////////////////////////////////////////////
function requestAsync(params) {

  return new Promise( function(resolve, reject) {

    request({

      url: params.url,
      method: params.method || 'GET',
      headers: params.headers || {
        'Authorization': 'Bearer ' + params.token
      },
      json: params.json,
      body: params.body

    }, function (err, response, body) {

      try {

        if (err) {

          console.log('error: ' + params.url)
          console.log(err)

          return reject(err)
        }

        if (body && body.errors) {

          console.log('body error: ' + params.url)
          console.log(body.errors)

          return reject(body.errors)
        }

        if (response && [200, 201, 202].indexOf(
            response.statusCode) < 0) {

          return reject(response.statusMessage)
        }

        return resolve(body ? (body.data || body) : {})

      } catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(ex)
      }
    })
  })
}