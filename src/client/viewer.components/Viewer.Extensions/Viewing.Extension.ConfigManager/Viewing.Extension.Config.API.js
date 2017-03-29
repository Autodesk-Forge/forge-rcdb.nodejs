////////////////////////////////////////////////////////////////
// ConfigManager API
//
/////////////////////////////////////////////////////////////////
import ClientAPI from 'ClientAPI'

export default class ConfigAPI extends ClientAPI {

  ///////////////////////////////////////////////////////////////
  // Class constructor
  //
  ///////////////////////////////////////////////////////////////
  constructor (apiUrl) {

    super (apiUrl)
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  getSequences () {

    const url = this.apiUrl + `/sequences`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  addSequence (sequence) {

    const payload = {
      sequence
    }

    const url = this.apiUrl + `/sequences`

    return this.ajax({
      url: url,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(payload)
    })
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  updateSequence (sequence) {

    const payload = {
      sequence
    }

    const url = this.apiUrl + `/sequences`

    return this.ajax({
      url: url,
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(payload)
    })
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  deleteSequence (sequenceId) {

    const url = this.apiUrl + `/sequences/${sequenceId}`

    return this.ajax({
      url: url,
      method: 'DELETE'
    })
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  getStates (sequenceId) {

    const url = this.apiUrl + `/sequences/${sequenceId}/states`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  addState (sequenceId, state) {

    const payload = {
      state
    }

    const url = this.apiUrl + `/sequences/${sequenceId}/states`

    return this.ajax({
      url: url,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(payload)
    })
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  deleteState (sequenceId, stateId) {

    const url = this.apiUrl +
      `/sequences/${sequenceId}/states/${stateId}`

    return this.ajax({
      url: url,
      method: 'DELETE'
    })
  }
}
