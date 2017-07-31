
import ClientAPI from 'ClientAPI'

export default class DerivativesSvc extends ClientAPI {

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
  name() {

    return 'DerivativesSvc'
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getThumbnail(urn, options = { width:100, height:100 }) {

    const query = `width=${options.width}&height=${options.height}`

    const url = `/thumbnails/${urn}?${query}`

    return this.ajax({
      rawBody: true,
      url})
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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

      return _.flattenDeep([...matches, ...childResults])
    }

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  hasDerivative (manifest, query) {

    var derivatives = this.findDerivatives(
      manifest, query)

    return derivatives.length > 0
  }
}
