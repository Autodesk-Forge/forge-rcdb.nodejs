/// /////////////////////////////////////////////////////////////
// ConfigManager API
//
/// //////////////////////////////////////////////////////////////
import ClientAPI from 'ClientAPI'

function buildUrl (url, obj) {
  const qs = Object.entries(obj || {}).map(pair => pair.map(encodeURIComponent).join('=')).join('&')
  return qs.length ? (url + (url.indexOf('&') > -1 ? '&' : '?') + qs) : url
}

export default class DatabaseAPI extends ClientAPI {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (apiUrl) {
    super(apiUrl)
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  getItems (dbName, query) {
    const url = dbName

    return this.ajax(buildUrl(url, query))
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  postItem (dbName, item, query) {
    const url = dbName

    return this.ajax({
      url: buildUrl(url, query),
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(item)
    })
  }
}
