import EventEmitter from 'events'

class SvcManager extends EventEmitter {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor() {

    super()

    this._services = {}
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  registerService(svc) {

    this._services[svc.name()] = svc

    this.emit(svc.name(), svc)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getService(name) {

    if(this._services[name]){

      return this._services[name]
    }

    return null
  }
}

var TheSvcManager = new SvcManager()

export default TheSvcManager
