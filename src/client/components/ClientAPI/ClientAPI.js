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
  // fetch wrapper
  //
  /////////////////////////////////////////////////////////////
  fetch(url, params) {

    return fetch(url, params).then(response => {

      return response.json().then(json => {

        return response.ok ? json : Promise.reject(json);
      })
    })
  }

  /////////////////////////////////////////////////////////////
  // $.ajax wrapper
  //
  /////////////////////////////////////////////////////////////
  ajax(paramsOrUrl) {

    var params = {
      url: paramsOrUrl,
      type: 'GET',
      data: null
    }

    if (typeof paramsOrUrl === 'object') {

      Object.assign(params, paramsOrUrl)
    }

    return new Promise((resolve, reject) => {

      Object.assign(params, {
        success: (response) => {

          resolve(response)
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

      const req = superAgent.post(url)

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
