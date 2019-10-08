import ClientAPI from 'ClientAPI'

export default class WebHooksAPI extends ClientAPI {
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
  getHooks () {
    const url = '/'

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getSystemHooks (systemId) {
    const url = `/systems/${systemId}`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getEventHooks (systemId, eventId) {
    const url = `/systems/${systemId}/events/${eventId}`

    return this.ajax({
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createSystemHook (systemId, scope) {
    const url = `/systems/${systemId}`

    const payload = {
      scope
    }

    return this.ajax({
      data: JSON.stringify(payload),
      method: 'POST',
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createEventHook (systemId, eventId, scope) {
    const url = `/systems/${systemId}/events/${eventId}`

    const payload = {
      scope
    }

    return this.ajax({
      data: JSON.stringify(payload),
      method: 'POST',
      rawBody: true,
      url
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  removeHook (systemId, eventId, hookId) {
    const url = `/systems/${systemId}/events/${eventId}/${hookId}`

    return this.ajax({
      method: 'DELETE',
      rawBody: true,
      url
    })
  }
}
