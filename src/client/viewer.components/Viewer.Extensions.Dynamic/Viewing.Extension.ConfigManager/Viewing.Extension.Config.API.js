////////////////////////////////////////////////////////////////
// ConfigManager API
//
/////////////////////////////////////////////////////////////////
import sortBy from 'lodash/sortBy'
import ClientAPI from 'ClientAPI'

export default class ConfigAPI extends ClientAPI {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (apiUrl) {

    super (apiUrl)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getSequences (opts) {

    return new Promise ((resolve, reject) => {

      const url = '/sequences'

      this.ajax(url).then ((sequences) => {

        const result = opts.sortByName
          ? sortBy(sequences, (seq) => { return seq.name })
          : sequences

        resolve (result)

      }, (error) => reject(error))
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  addSequence (sequence) {

    const payload = {
      sequence
    }

    const url = '/sequences'

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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateSequence (sequence) {

    const payload = {
      sequence
    }

    const url = '/sequences'

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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  deleteSequence (sequenceId) {

    const url = `/sequences/${sequenceId}`

    return this.ajax({
      url: url,
      method: 'DELETE'
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async getStates (sequenceId) {

    try {

      const url = `/sequences/${sequenceId}/states`

      const res = await this.ajax(url)

      return res

    } catch (ex) {

      return []
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  addState (sequenceId, state) {

    const payload = {
      state
    }

    const url = `/sequences/${sequenceId}/states`

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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  deleteState (sequenceId, stateId) {

    const url = `/sequences/${sequenceId}/states/${stateId}`

    return this.ajax({
      url: url,
      method: 'DELETE'
    })
  }
}
