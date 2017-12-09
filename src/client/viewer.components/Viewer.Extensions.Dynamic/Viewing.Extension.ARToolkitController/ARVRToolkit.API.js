
import ClientAPI from 'ClientAPI'

export default class ARVRToolkitAPI extends ClientAPI {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    super (config.apiUrl)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getManifest (urn) {

    const url = `/manifest/${urn}`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  ///////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////
  getManifestScenes (manifest) {

    const arkitDerivatives =
      manifest.derivatives.filter((derivative) => {

        return (derivative.outputType === 'arkit')
      })

    return arkitDerivatives.length
      ? arkitDerivatives[0].children
      : []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  postJob (db, modelId, job, opts = {}) {

    const url = `/job/${db}/${modelId}`

    const payload = {
      socketId: opts.socketId,
      job
    }

    return this.ajax({
      data: JSON.stringify(payload),
      method: 'POST',
      rawBody: true,
      url
    })
  }
}
