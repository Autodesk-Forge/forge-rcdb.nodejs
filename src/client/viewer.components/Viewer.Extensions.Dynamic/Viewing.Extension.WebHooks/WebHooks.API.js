import ClientAPI from 'ClientAPI'

export default class WebHooksAPI extends ClientAPI {

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
  getHooks () {

    const url = `/`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getSystemHooks (systemId) {

    const url = `/systems/${systemId}`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getEventHooks (systemId, eventId) {

    const url = `/systems/${systemId}/events/${eventId}`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createSystemHook (systemId, callbackUrl, scope) {

    const url = `/systems/${systemId}`

    const payload = {
      callbackUrl,
      scope
    }

    return this.ajax({
      data: JSON.stringify(payload),
      method: 'POST',
      rawBody: true,
      url
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createEventHook (systemId, eventId, callbackUrl, scope) {

    const url = `/systems/${systemId}/events/${eventId}`

    const payload = {
      callbackUrl,
      scope
    }

    return this.ajax({
      data: JSON.stringify(payload),
      method: 'POST',
      rawBody: true,
      url
    })
  }
}
