
import ClientAPI from 'ClientAPI'

export default class ARVRToolkitAPI extends ClientAPI {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (config) {
    super(config.apiUrl)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getManifest (urn) {
    const url = `/manifest/${urn}`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /// ////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////
  getManifestScenes (manifest) {
    const arkitDerivatives =
      manifest.derivatives.filter((derivative) => {
        return (derivative.outputType === 'arkit')
      })

    return arkitDerivatives.length
      ? arkitDerivatives[0].children
      : []
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getScene (urn, sceneId) {
    const url = `/${urn}/scenes/${sceneId}`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  deleteScene (urn, sceneId) {
    const url = `/${urn}/scenes/${sceneId}`

    return this.ajax({
      method: 'DELETE',
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getScene3Legged (projectId, versionId, sceneId) {
    const url = `/projects/${projectId}` +
      `/versions/${encodeURIComponent(versionId)}` +
      `/scenes/${sceneId}`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  deleteScene3Legged (projectId, versionId, sceneId) {
    const url = `/projects/${projectId}` +
      `/versions/${encodeURIComponent(versionId)}` +
      `/scenes/${sceneId}`

    return this.ajax({
      method: 'DELETE',
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getInstanceTree (urn, sceneId) {
    const url = `/${urn}/instanceTree/${sceneId}`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createScene (urn, sceneId, sceneDef, options = {}) {
    const url = '/scenes'

    const payload = {
      sceneDef,
      sceneId,
      options,
      urn
    }

    return this.ajax({
      data: JSON.stringify(payload),
      method: 'PUT',
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createScene3Legged (
    projectId, versionId,
    sceneId, sceneDef, options = {}) {
    const url = '/scenes'

    const payload = {
      projectId,
      versionId,
      sceneDef,
      sceneId,
      options
    }

    return this.ajax({
      data: JSON.stringify(payload),
      method: 'PUT',
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  processScene (urn, sceneId) {
    const url = '/scenes'

    const payload = {
      sceneId,
      urn
    }

    return this.ajax({
      data: JSON.stringify(payload),
      method: 'POST',
      rawBody: true,
      url
    })
  }
}
