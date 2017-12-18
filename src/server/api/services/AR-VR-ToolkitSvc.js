
import BaseSvc from './BaseSvc'
import request from 'request'


export default class ARVRToolkitSvc extends BaseSvc {

  static BASE_URL = "https://developer-api.autodesk.io"

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    super (config)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name () {

    return 'AR-VR-ToolkitSvc'
  }

  ///////////////////////////////////////////////////////
  // GET /arkit/v1/health
  //
  ///////////////////////////////////////////////////////
  getHealth () {

    const url = `${ARVRToolkitSvc.BASE_URL}/arkit/v1/health`

    return this.requestAsync({
      url
    })
  }

  ///////////////////////////////////////////////////////
  // PUT /arkit/v1/{urn}/scenes/{scene_id}
  //
  // sceneDef: {
  //  prj: {
  //    bucketKey: "bucketKey",
  //    urn: "dXhgdhdghj....",
  //    objectId: 59
  //  }
  // }
  ///////////////////////////////////////////////////////
  createScene (token, urn, sceneId, sceneDef, opts = {}) {

    const  headers = {
      'x-ads-region': opts.region || 'US',
      Authorization: 'Bearer ' + token
    }

    const url =
      `${ARVRToolkitSvc.BASE_URL}/arkit/v1/` +
      `${urn}/scenes/${sceneId}`

    return this.requestAsync({
      body: sceneDef,
      method: 'PUT',
      json: true,
      headers,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  // GET /arkit/v1/{urn}/scenes/{scene_id}
  //
  ///////////////////////////////////////////////////////
  getScene (token, urn, sceneId) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/arkit/v1/` +
      `${urn}/scenes/${sceneId}`

    return this.requestAsync({
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  // DELETE /arkit/v1/{urn}/scenes/{scene_id}
  //
  ///////////////////////////////////////////////////////
  deleteScene (token, urn, sceneId) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/arkit/v1/` +
      `${urn}/scenes/${sceneId}`

    return this.requestAsync({
      method: 'DELETE',
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  // PUT /data/v1/projects/{project_id}/versions/
  //     {version_id}/scenes/{scene_id}
  //
  ///////////////////////////////////////////////////////
  createScene3Legged (
    token,
    projectId, versionId,
    sceneId, sceneDef, opts = {}) {

    const  headers = {
      'x-ads-region': opts.region || 'US',
      Authorization: 'Bearer ' + token
    }

    const url =
      `${ARVRToolkitSvc.BASE_URL}/data/v1/` +
      `projects/${projectId}/` +
      `versions/${encodeURIComponent(versionId)}/` +
      `scenes/${sceneId}`

    return this.requestAsync({
      body: sceneDef,
      method: 'PUT',
      json: true,
      headers,
      url
    })
  }

  ///////////////////////////////////////////////////////
  // GET /data/v1/projects/{project_id}/versions/
  //     {version_id}/scenes/{scene_id}
  //
  ///////////////////////////////////////////////////////
  getScene3Legged (
    token, projectId, versionId, sceneId) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/data/v1/` +
      `projects/${projectId}/` +
      `versions/${encodeURIComponent(versionId)}/` +
      `scenes/${sceneId}`

    return this.requestAsync({
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  // DELETE /data/v1/projects/{project_id}/versions/
  //        {version_id}/scenes/{scene_id}
  //
  ///////////////////////////////////////////////////////
  deleteScene3Legged (token, projectId, versionId, sceneId) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/data/v1/` +
      `projects/${projectId}/` +
      `versions/${encodeURIComponent(versionId)}/` +
      `scenes/${sceneId}`

    return this.requestAsync({
      method: 'DELETE',
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  // POST /modelderivative/v2/arkit/job
  //
  ///////////////////////////////////////////////////////
  processScene (token, urn, sceneId) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/job`

    const job = {
      input: {
        urn
      },
      output: {
        formats: [ {
          type: "arkit",
          scene: sceneId
        }]
      }
    }

    return this.requestAsync({
      method: 'POST',
      json: true,
      body: job,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  // GET /modelderivative/v2/arkit/{urn}/manifest
  //
  ///////////////////////////////////////////////////////
  getManifest (token, urn) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/` +
      `${urn}/manifest`

    return this.requestAsync({
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  // GET /modelderivative/v2/arkit/{urn}/scenes/{scene_id}
  //
  ///////////////////////////////////////////////////////
  getInstanceTree (token, urn, sceneId) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/` +
      `${urn}/scenes/${sceneId}`

    return this.requestAsync({
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  //GET /modelderivative/v2/arkit/{urn}/mesh/{dbId}/{fragId}
  //
  ///////////////////////////////////////////////////////
  getMeshFragment (token, urn, dbId, fragId) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/` +
      `${urn}/mesh/${dbId}/${fragId}`

    return this.requestAsync({
      encoding: null,
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  //GET /modelderivative/v2/arkit/{urn}/scenes/{scene_id}
  //    /mesh/{dbId}/{fragId}
  //
  ///////////////////////////////////////////////////////
  getSceneMeshFragment (
    token, urn, sceneId, dbId, fragId, opts = {}) {

    const  headers = {
      Authorization: 'Bearer ' + token,
      'x-ads-device': opts.device
    }

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/` +
      `${urn}/scenes/${sceneId}/mesh/${dbId}/${fragId}`

    return this.requestAsync({
      json: true,
      headers,
      url
    })
  }

  ///////////////////////////////////////////////////////
  //GET /modelderivative/v2/arkit/{urn}/material/{matId}/{mat}
  //
  ///////////////////////////////////////////////////////
  getMeshFragmentMaterial (
    token, urn, matId, material) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/` +
      `${urn}/material/${matId}/${material}`

    return this.requestAsync({
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  //GET /modelderivative/v2/arkit/{urn}/texture/{tex}
  //
  ///////////////////////////////////////////////////////
  getMeshFragmentTexture (token, urn, texture) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/` +
      `${urn}/texture/${texture}`

    return this.requestAsync({
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////
  arrayToParam (dbIds) {

    return dbIds.reduce((res, dbId) => {
      return res + (res.length ? ',' : '') + dbId
    }, '')
  }

  ///////////////////////////////////////////////////////
  //GET /modelderivative/v2/arkit/{urn}/properties/{dbIds}
  //
  ///////////////////////////////////////////////////////
  getObjectProperties (token, urn, dbIds) {

    const dbIdsParam = Array.isArray (dbIds)
      ? this.arrayToParam(dbIds)
      : dbIds

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/` +
      `${urn}/properties/${dbIdsParam}`

    return this.requestAsync({
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  //GET /modelderivative/v2/arkit/{urn}/bubble
  //
  ///////////////////////////////////////////////////////
  getBubble (token, urn) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/` +
      `${urn}/bubble`

    return this.requestAsync({
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  //GET /modelderivative/v2/arkit/{urn}/unity
  //
  ///////////////////////////////////////////////////////
  getUnityPackage (token, urn) {

    const url =
      `${ARVRToolkitSvc.BASE_URL}/modelderivative/v2/arkit/` +
      `${urn}/unity`

    return this.requestAsync({
      json: true,
      token,
      url
    })
  }

  ///////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////
  requestAsync(params) {

      return new Promise( function(resolve, reject) {

          request({

            url: params.url,
            method: params.method || 'GET',
            headers: params.headers || {
              'Authorization': 'Bearer ' + params.token
            },
            encoding: params.encoding,
            json: params.json,
            body: params.body

          }, function (err, response, body) {

            try {

              if (err) {

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

              return resolve(body)

            } catch(ex){

              return reject(ex)
            }
          })
        })
    }
}
