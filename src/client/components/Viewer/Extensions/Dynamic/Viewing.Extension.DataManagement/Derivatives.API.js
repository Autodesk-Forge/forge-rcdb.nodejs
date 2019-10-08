
import flattenDeep from 'lodash/flattenDeep'
import ClientAPI from 'ClientAPI'

export default class DerivativesSvc extends ClientAPI {
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
  name () {
    return 'DerivativesSvc'
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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getThumbnailUrl (urn, options = { size: 200 }) {
    const query = `width=${options.size}&height=${options.size}`

    const url = `${this.apiUrl}/thumbnails/${urn}?${query}`

    return url
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getThumbnail (urn, options = {
    base64: false,
    size: 200
  }) {
    let query = `width=${options.size}&height=${options.size}`

    if (options.base64) {
      query += '&base64=true'
    }

    const url = `/thumbnails/${urn}?${query}`

    return this.ajax(url)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  findDerivatives (parent, query) {
    if (!parent) {
      return []
    }

    const derivatives = parent.derivatives || parent.children

    if (!derivatives) {
      return []
    }

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
        return query(derivative)
      }
    })

    const childResults = derivatives.map((derivative) => {
      return this.findDerivatives(
        derivative, query)
    })

    return flattenDeep([...matches, ...childResults])
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  hasDerivative (manifest, query) {
    var derivatives = this.findDerivatives(
      manifest, query)

    return derivatives.length > 0
  }
}
