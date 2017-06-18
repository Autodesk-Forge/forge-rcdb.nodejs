
import BaseSvc from './BaseSvc'
import Forge from 'forge-apis'
import request from 'request'
import _ from 'lodash'

export default class DerivativeSvc extends BaseSvc {

  static get SERVICE_BASE_URL () {

    return 'https://developer.api.autodesk.com/modelderivative/v2'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super(config)

    this._derivativesAPI = new Forge.DerivativesApi()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name () {

    return 'DerivativesSvc'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  postJob (token, payload) {

    return this._derivativesAPI.translate (payload, {
      'xAdsForce': payload.output.force
    }, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getFormats (token, opts = {}) {

    return this._derivativesAPI.getFormats(
      opts,  {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getMetadata (token, urn, opts = {}) {

    return this._derivativesAPI.getMetadata(
      urn, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getHierarchy (token, urn, guid, opts = {}) {

    return this._derivativesAPI.getModelviewMetadata(
      urn, guid, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getProperties (token, urn, guid, opts = {}) {

    return this._derivativesAPI.getModelviewProperties(
      urn, guid, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getManifest (token, urn, opts = {}) {

    return this._derivativesAPI.getManifest (
      urn, opts, {autoRefresh:false}, token)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteManifest (token, urn) {

    //return this._derivativesAPI.deleteManifest (
    //  urn, {autoRefresh:false}, token)

    var url = `${DerivativeSvc.SERVICE_BASE_URL}/designdata/` +
      `${urn}/manifest`

    return requestAsync({
      method: 'DELETE',
      token: token,
      json: false,
      url: url
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  download (token, urn, derivativeURN, opts = {}) {

    // TODO SDK KO
    //this._APIAuth.accessToken = token
    //
    //return this._derivativesAPI.getDerivativeManifest(
    //  urn,
    //  derivativeURN,
    //  opts)

    return new Promise((resolve, reject) => {

      const url =
        `${DerivativeSvc.SERVICE_BASE_URL}/designdata/` +
        `${encodeURIComponent(urn)}/manifest/` +
        `${encodeURIComponent(derivativeURN)}`

      request({
        url: url,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token.access_token
        },
        encoding: null
      }, function(err, response, body) {

        try {

          if (err) {

            return reject(err)
          }

          if (response && [200, 201, 202].indexOf(
              response.statusCode) < 0) {

            return reject(response.statusMessage)
          }

          if (opts.base64) {

            resolve(bufferToBase64(body))

          } else {

            resolve(body)
          }

        } catch(ex) {

          console.log(ex)

          reject(ex)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getThumbnail (token, urn, options = {
    width: 100, height: 100
  }) {

    //TODO: SDK KO

    //return this._derivativesAPI.getThumbnail (
    //  urn, {}, {autoRefresh:false}, token)

    const url =
      `${DerivativeSvc.SERVICE_BASE_URL}/designdata/` +
      `${urn}/thumbnail?` +
      `width=${options.width}&` +
      `height=${options.height}`

    return new Promise((resolve, reject) => {

      request({
        url: url,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token.access_token
        },
        encoding: null
      }, (err, response, body) => {

        try {

          if (err) {

            return reject(err)
          }

          if (response && [200, 201, 202].indexOf(
              response.statusCode) < 0) {

            return reject(response.statusMessage)
          }

          //resolve(bufferToBase64(body))
          resolve (body)

        } catch(ex){

          reject(ex)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  postJob (payload) {

    const url = `${this.apiUrl}/job`

    const data = {
      payload: JSON.stringify(payload)
    }

    return this.ajax({
      rawBody: true,
      type: 'POST',
      data,
      url
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  buildDefaultJobQuery (job) {

    switch (job.output.formats[0].type) {

      case 'svf':

        return { type: 'geometry' }

      case 'obj':

        const objIds = job.output.formats[0].advanced.objectIds

        if (objIds) {

          return (derivative) => {
            return (
            derivative.role === 'obj' &&
            _.isEqual(derivative.objectIds, objIds)
            )
          }
        }

      default:

        return { role: job.output.formats[0].type }
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  postJobWithProgress (job, opts) {

    return new Promise(async(resolve, reject) => {

      try {

        console.log('Posting Job:')
        console.log(job)

        var jobRes = await this.postJob(job)

        if (jobRes.result === 'success' || jobRes.result === 'created') {

          const onProgress = (progress) => {

            if (opts.onProgress) {

              opts.onProgress(progress)
            }
          }

          const derivative = await this.getDerivative (
            job.input.urn,
            opts.query || this.buildDefaultJobQuery(job),
            job.output.formats[0].type,
            onProgress, true)

          if (job.output.formats[0].type === 'svf') {

            resolve({
              urn: job.input.urn
            })

          } else {

            resolve(derivative)
          }

        } else {

          return reject(job)
        }

      } catch(ex) {

        return reject(ex)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  findDerivatives (parent, query) {

    if(!parent) {

      return []
    }

    const derivatives = parent.derivatives || parent.children

    if (derivatives) {

      const matches = derivatives.filter((derivative) => {

        derivative.parent = parent

        if (typeof query === 'object') {

          var match = true

          for (const key in query) {

            if (query[key] !== derivative[key]) {

              match = false
            }
          }

          return match

        } else if (typeof query === 'function') {

          return query (derivative)
        }
      })

      const childResults = derivatives.map((derivative) => {

        return this.findDerivatives (
          derivative, query)
      })

      return _.flattenDeep([matches, childResults])
    }

    return []
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  hasDerivative (manifest, query) {

    var derivatives = this.findDerivatives(
      manifest, query)

    return derivatives.length > 0
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getDerivative (urn, query, outputType,
                 onProgress = null,
                 skipNotFound = false) {

    return new Promise(async(resolve, reject) => {

      try {

        while (true) {

          var manifest = await this.getManifest(urn)

          //if(manifest.status === 'failed') {
          //  return reject(manifest)
          //}

          if(!manifest.derivatives) {

            return reject(manifest)
          }

          const derivatives = this.findDerivatives(
            manifest, query)

          if (derivatives.length) {

            const derivative = derivatives[0]

            let progress = manifest.progress.split(' ')[0]

            progress = (progress === 'complete' ? '100%' : progress)

            onProgress ? onProgress(progress) : ''

            const status =
              derivative.status ||
              derivative.parent.status

            if (status === 'success') {

              onProgress ? onProgress('100%') : ''

              return resolve(derivative)

            } else if (status === 'failed') {

              onProgress ? onProgress('failed') : ''

              return reject(derivative)
            }
          }

          // if no parent -> no derivative of this type
          // OR
          // if parent complete and no target -> derivative not requested

          const parentDerivatives = this.findDerivatives(
            manifest, { outputType })

          if (!parentDerivatives.length) {

            if (manifest.status === 'inprogress') {

              const progress = manifest.progress.split(' ')[0]

              onProgress ? onProgress(progress) : ''
            }

            if(!skipNotFound) {

              return resolve({
                status: 'not found'
              })
            }

          } else if(parentDerivatives[0].status === 'success') {

            if(!derivatives.length) {

              onProgress ? onProgress('0%') : ''

              if(!skipNotFound) {

                return resolve({
                  status: 'not found'
                })
              }
            }
          }

          await sleep(1000)
        }

      } catch(ex) {

        return reject(ex)
      }
    })
  }
}

///////////////////////////////////////////////////////////
// Utils
//
///////////////////////////////////////////////////////////
function sleep (ms) {
  return new Promise((resolve)=> {
    setTimeout( ()=>{
      resolve()
    }, ms)
  })
}

function bufferToBase64 (buffer) {

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  var bytes = buffer, i, len = bytes.length, base64 = "";

  for (i = 0; i < len; i+=3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += chars[bytes[i + 2] & 63];
  }

  if ((len % 3) === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }

  return base64
}

function requestAsync(params) {

  return new Promise((resolve, reject) => {

    request({

      url: params.url,
      method: params.method || 'GET',
      headers: {
        'Authorization':
          'Bearer ' + params.token.access_token
      },
      json: params.json,
      body: params.body

    }, (err, response, body) => {

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

        if([200, 201, 202].indexOf(
            response.statusCode) < 0){

          return reject(response)
        }

        return resolve(body || {})

      } catch(ex){

        console.log(params.url)
        console.log(ex)

        return reject(response)
      }
    })
  })
}

