
import ClientAPI from 'ClientAPI'
import BaseSvc from './BaseSvc'

export default class ForgeSvc extends BaseSvc {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (config) {
    super(config)

    this.api = new ClientAPI(config.apiUrl)

    this.api.ajax('/clientId').then(
      (res) => {
        this._clientId = res.clientId
      })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  name () {
    return 'ForgeSvc'
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  get clientId () {
    return this._clientId
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async login () {
    try {
      const user = await this.getUser()

      return user
    } catch (ex) {
      const url = await this.getLoginURL()

      window.location.assign(url)

      return null
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  logout () {
    const url = '/logout'

    return this.api.ajax({
      contentType: 'application/json',
      dataType: 'json',
      type: 'POST',
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getUser () {
    return new Promise((resolve, reject) => {
      this.api.ajax('/user').then((user) => {
        resolve(user)
      }, (error) => {
        reject(error)
      })
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getLoginURL () {
    const url = '/login'

    const payload = {
      origin: window.location.href
    }

    return this.api.ajax({
      contentType: 'application/json',
      data: JSON.stringify(payload),
      dataType: 'json',
      type: 'POST',
      url
    })
  }
}
