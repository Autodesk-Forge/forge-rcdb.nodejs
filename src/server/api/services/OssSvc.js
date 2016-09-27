
import ForgeOSS from 'forge-oss'
import BaseSvc from './BaseSvc'
import request from 'request'
import mzfs from 'mz/fs'
import util from 'util'

export default class OssSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(opts) {

    super(opts)

    this._APIAuth =
      ForgeOSS.ApiClient.instance.authentications[
        'oauth2_application']

    this._bucketsAPI = new ForgeOSS.BucketsApi()
    this._objectsAPI = new ForgeOSS.ObjectsApi()
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

    this._APIAuth.accessToken = token

    opts = Object.assign({
      limit: 10,
      startAt: null,
      region: 'US'}, opts)

    return this._bucketsAPI.getBuckets(opts)
  }

  /////////////////////////////////////////////////////////////////
  // Returns bucket details
  //
  /////////////////////////////////////////////////////////////////
  getBucketDetails (token, bucketKey) {

    this._APIAuth.accessToken = token

    return this._bucketsAPI.getBucketDetails(bucketKey)
  }

  /////////////////////////////////////////////////////////////////
  // Returns object list in specific bucket
  //
  /////////////////////////////////////////////////////////////////
  getObjects (token, bucketKey, opts = {}) {

    this._APIAuth.accessToken = token

    opts = Object.assign({
      limit: 10,
      startAt: null,
      region: 'US'}, opts)

    return this._objectsAPI.getObjects(bucketKey, opts)
  }

  /////////////////////////////////////////////////////////////////
  // Returns object details
  //
  /////////////////////////////////////////////////////////////////
  getObjectDetails (token, bucketKey, objectKey) {

    this._APIAuth.accessToken = token

    return this._objectsAPI.getObjectDetails (
      bucketKey, objectKey, {})
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
  createBucket (token, bucketCreationData, headers = {}) {

    bucketCreationData.bucketKey = validateBucketKey(
      bucketCreationData.bucketKey)

    bucketCreationData.policyKey = validatePolicyKey(
      bucketCreationData.policyKey)

    headers = Object.assign({
      xAdsRegion: 'US'}, headers)

    this._APIAuth.accessToken = token

    return this._bucketsAPI.createBucket(
      bucketCreationData,
      headers)
  }

  /////////////////////////////////////////////////////////////////
  // Uploads object to bucket
  //
  /////////////////////////////////////////////////////////////////
  putObject (token, bucketKey, objectKey, file) {

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

    return new Promise( async(resolve, reject) => {

      try {

        let data = await mzfs.readFile(file.path)

        var url = util.format(
            'https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s',
            bucketKey,
            objectKey)

        var response = await requestAsync({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': 'Bearer ' + token
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
          'Authorization': 'Bearer ' + token
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

    this._APIAuth.accessToken = token

    return this._bucketsAPI.deleteBucket(
      bucketKey)
  }

  /////////////////////////////////////////////////////////////////
  // Deletes object from bucket
  //
  /////////////////////////////////////////////////////////////////
  deleteObject (token, bucketKey, objectKey) {

    this._APIAuth.accessToken = token

    return this._objectsAPI.deleteObject(
      bucketKey,
      objectKey)
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
      }
      catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(ex)
      }
    })
  })
}