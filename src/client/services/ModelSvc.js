
import ClientAPI from 'ClientAPI'
import BaseSvc from './BaseSvc'

export default class ModelSvc extends BaseSvc {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (opts) {
    super(opts)

    this.api = new ClientAPI(this._config.apiUrl)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  name () {
    return 'ModelSvc'
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getCount (dbName, opts = {}) {
    const url = `${dbName}/count`

    const query = `?search=${opts.search || ''}`

    return this.api.ajax(url + query)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getModels (dbName, opts = {}) {
    const url = dbName

    const query =
      `?limit=${opts.limit || 100}` +
      `&offset=${opts.offset || 0}` +
      `&search=${opts.search || ''}`

    return this.api.ajax(url + query)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getRecentModels (dbName) {
    const url = `/${dbName}/recents`

    return this.api.ajax(url)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getModel (dbName, modelId) {
    const url = `/${dbName}/${modelId}`

    return this.api.ajax(url)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getThumbnailUrl (dbName, modelId, size = 200) {
    const url = this.api.apiUrl +
      `/${dbName}/${modelId}/thumbnail` +
      `?size=${size}`

    return url
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getThumbnails (dbName, modelIds) {
    const url = `/${dbName}/thumbnails`

    return this.api.ajax({
      url: url,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(modelIds)
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  upload (dbName, file, opts = {}) {
    const url = dbName

    const options = Object.assign({}, {
      tag: 'model'
    }, opts)

    return this.api.upload(url, file, options)
  }
}
