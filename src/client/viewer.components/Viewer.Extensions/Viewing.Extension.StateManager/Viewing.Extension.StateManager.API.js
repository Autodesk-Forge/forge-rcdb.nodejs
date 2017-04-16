////////////////////////////////////////////////////////////////
// StateManager API
//
/////////////////////////////////////////////////////////////////
import ClientAPI from 'ClientAPI'

export default class StatesAPI extends ClientAPI {

  ///////////////////////////////////////////////////////////////
  // Class constructor
  //
  ///////////////////////////////////////////////////////////////
  constructor (apiUrl) {

    super(apiUrl)
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  async getSequence(modelId) {

  var url = this.apiUrl + `/${modelId}/states/sequence`

  return this.ajax(url)
}

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  getStates(modelId) {

    var url = this.apiUrl + `/${modelId}/states`

    return this.ajax(url)
  }

  ///////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////
  saveSequence(modelId, sequence) {

    var payload = {
      sequence: sequence
    }

    var url = this.apiUrl + `/${modelId}/states/sequence`

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
  addState(modelId, state) {

    var payload = {
      state: state
    }

    var url = this.apiUrl + `/${modelId}/states`

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
  removeState(modelId, stateId) {

    var url = this.apiUrl + `/${modelId}/states/${stateId}`

    return this.ajax({
      url: url,
      method: 'DELETE'
    })
  }
}
