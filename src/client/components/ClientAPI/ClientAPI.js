
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
}
