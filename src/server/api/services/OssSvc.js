
import ServiceManager from './SvcManager'
import eachLimit from 'async/eachLimit'
import BaseSvc from './BaseSvc'
import Forge from 'forge-apis'
import request from 'request'
import mzfs from 'mz/fs'
import util from 'util'
import fs from 'fs'

export default class OssSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    super(config)

    this._bucketsAPI = new Forge.BucketsApi()
    this._objectsAPI = new Forge.ObjectsApi()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name() {

    return 'OssSvc'
  }

  /////////////////////////////////////////////////////////
  // Returns bucket list
  //
  /////////////////////////////////////////////////////////
  getBuckets (token, opts = {}) {

    const options = {
      startAt: opts.startAt || null,
      region: opts.region || 'US',
      limit: opts.limit || 100
    }

    return this._bucketsAPI.getBuckets(
      options, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////
  // Returns bucket details
  //
  /////////////////////////////////////////////////////////
  getBucketDetails (token, bucketKey) {

    return this._bucketsAPI.getBucketDetails(
      bucketKey, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////
  // Returns object list in specific bucket
  //
  /////////////////////////////////////////////////////////
  getObjects (token, bucketKey, opts = {}) {

    const options = {
      startAt: opts.startAt || null,
      region: opts.region || 'US',
      limit: opts.limit || 100
    }

    return this._objectsAPI.getObjects(
      bucketKey, options,
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////
  // Returns object details
  //
  /////////////////////////////////////////////////////////
  getObjectDetails (token, bucketKey, objectKey, opts = {}) {

    return this._objectsAPI.getObjectDetails (
      bucketKey, objectKey, opts,
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////
  // parse objectId into { bucketKey, objectKey }
  //
  /////////////////////////////////////////////////////////
  parseObjectId (objectId) {

    const parts = objectId.split('/')

    const bucketKey = parts[0].split(':').pop()

    const objectKey = parts[1]

    return {
      bucketKey,
      objectKey
    }
  }

  /////////////////////////////////////////////////////////
  // Creates a new bucket
  //
  /////////////////////////////////////////////////////////
  createBucket (token, bucketCreationData, opts = {}) {

    bucketCreationData.bucketKey = validateBucketKey(
      bucketCreationData.bucketKey)

    bucketCreationData.policyKey = validatePolicyKey(
      bucketCreationData.policyKey)

    const options = {
      xAdsRegion: opts.xAdsRegion || 'US'
    }

    return this._bucketsAPI.createBucket(
      bucketCreationData, options,
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////
  // Uploads object to bucket
  //
  /////////////////////////////////////////////////////////
  uploadObject (token, bucketKey, objectKey, file) {

    //TODO: Not working yet - need to migrate to SDK

    //return new Promise( async(resolve, reject) => {
    //
    //  try {
    //
    //    const data = await mzfs.readFile(file.path)
    //
    //    this._APIAuth.accessToken = token
    //
    //    return this._objectsAPI.uploadObject (
    //      bucketKey, objectKey, file.size, data, {})
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

        const data = await mzfs.readFile(file.path)

        const url = util.format(
            'https://developer.api.autodesk.com/oss/v2/buckets/%s/objects/%s',
            bucketKey,
            objectKey)

        const response = await requestAsync ({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': 'Bearer ' + token.access_token
          },
          body: data,
          url: url
        })

        resolve(JSON.parse(response))

      } catch (ex) {

        return reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Uploads object to bucket using resumable endpoint
  //
  /////////////////////////////////////////////////////////
  uploadObjectChunked (getToken, bucketKey, objectKey,
                       file,  opts = {}) {

    return new Promise((resolve, reject) => {

      const chunkSize = opts.chunkSize || 5 * 1024 * 1024

      const nbChunks = Math.ceil(file.size / chunkSize)

      const chunksMap = Array.from({
        length: nbChunks
      }, (e, i) => i)

      // generates uniques session ID
      const sessionId = this.guid()

      // prepare the upload tasks
      const uploadTasks = chunksMap.map((chunkIdx) => {

        const start = chunkIdx * chunkSize

        const end = Math.min(
            file.size, (chunkIdx + 1) * chunkSize) - 1

        const range = `bytes ${start}-${end}/${file.size}`

        const length = end - start + 1

        const readStream =
          fs.createReadStream(file.path, {
            start, end
          })

        const run = async () => {

          const token = await getToken()

          return this._objectsAPI.uploadChunk(
            bucketKey, objectKey,
            length, range, sessionId,
            readStream, {},
            {autoRefresh: false}, token)
        }

        return {
          chunkIndex: chunkIdx,
          run
        }
      })

      let progress = 0

      // runs asynchronously in parallel the upload tasks
      // number of simultaneous uploads is defined by
      // opts.concurrentUploads
      eachLimit(uploadTasks, opts.concurrentUploads || 3,
        (task, callback) => {

          task.run().then((res) => {

            if (opts.onProgress) {

              progress += 100.0 / nbChunks

              opts.onProgress ({
                progress: Math.round(progress * 100) / 100,
                chunkIndex: task.chunkIndex
              })
            }

            callback ()

          }, (err) => {

            console.log('error')
            console.log(err)

            callback(err)
          })

      }, (err) => {

          if (err) {

            return reject(err)
          }

          return resolve({
            fileSize: file.size,
            bucketKey,
            objectKey,
            nbChunks
          })
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Download object from bucket
  //
  /////////////////////////////////////////////////////////
  getObject (token, bucketKey, objectKey) {

    //TODO: need to migrate to SDK

    //this._APIAuth.accessToken = token
    //
    //return new Promise((resolve, reject) => {
    //
    //  const  wstream = fs.createWriteStream (outputFile)
    //
    //  this._objectsAPI.getObject (
    //    bucketKey,
    //    objectKey,
    //    { encoding: null },
    //
    //    (err, data, response) => {
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
    //    }).pipe (wstream)
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
      }, (err, response, body) => {

        return err
          ? reject(err)
          : resolve(body)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Deletes bucket
  //
  /////////////////////////////////////////////////////////
  deleteBucket (token, bucketKey) {

    return this._bucketsAPI.deleteBucket(
      bucketKey, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////
  // Deletes object from bucket
  //
  /////////////////////////////////////////////////////////
  deleteObject (token, bucketKey, objectKey) {

    return this._objectsAPI.deleteObject(
      bucketKey, objectKey,
      {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  guid (format='xxxxxxxxxxxx') {

    var d = new Date().getTime();

    return format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })
  }
}

/////////////////////////////////////////////////////////
// Validates bucketKey
//
/////////////////////////////////////////////////////////
function validateBucketKey (bucketKey) {

  var result = bucketKey.replace(
    /[&\/\\#,+()$~%. '":*?<>{}]/g,'-')

  return result.toLowerCase()
}

/////////////////////////////////////////////////////////
// Validates policyKey
//
/////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////
// REST request wrapper
//
/////////////////////////////////////////////////////////
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