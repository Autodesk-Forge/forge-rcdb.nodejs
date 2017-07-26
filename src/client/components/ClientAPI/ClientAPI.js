import superAgent from 'superagent'

export default class ClientAPI {

  /////////////////////////////////////////////////////////////
  // constructor
  //
  /////////////////////////////////////////////////////////////
  constructor (apiUrl) {

    this.apiUrl = apiUrl
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  buildURL (url = '') {

    return this.apiUrl +
      (url.indexOf('/') === 0 ? url:`/${url}`)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  buildParams (params) {

    const defaultParams = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      type: 'GET',
      data: null
    }

    return Object.assign({}, defaultParams,
      params, {
        url: this.buildURL(params.url)
      })
  }

  /////////////////////////////////////////////////////////////
  // fetch wrapper
  //
  /////////////////////////////////////////////////////////////
  fetch (url, params) {

    return fetch(this.buildURL(url), params).then(response => {

      return response.json().then(json => {

        return response.ok ? json : Promise.reject(json);
      })
    })
  }

  /////////////////////////////////////////////////////////////
  // $.ajax wrapper
  //
  /////////////////////////////////////////////////////////////
  ajax (paramsOrUrl) {

    const params = (typeof paramsOrUrl === 'object')
      ? this.buildParams(paramsOrUrl)
      : {
        url: this.buildURL(paramsOrUrl),
        type: 'GET',
        data: null
      }

    return new Promise((resolve, reject) => {

      Object.assign(params, {
        success: (response) => {

          return (params.rawBody && response.body)
            ? resolve (response.body)
            : resolve(response)
        },
        error: function (error) {

          reject(error)
        }
      })

      $.ajax(params)
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  upload (url, file, opts = {}) {

    return new Promise ((resolve, reject) => {

      const req = superAgent.post(this.buildURL(url))

      req.on('progress', (e) => {

        if (opts.progress) {

          opts.progress(e.percent)
        }
      })

      req.attach(opts.tag || 'file', file)

      if (opts.data) {

        for (var key in opts.data) {

          req.field(key, opts.data[key])
        }
      }

      req.end((err, response) => {

        if (err) {

          return reject (err)
        }

        resolve (response)
      })
    })
  }
}
