
import BaseSvc from './BaseSvc'
import Lockr from 'lockr'

export default class StorageSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super (config)

    this.currentStorageVersion = config.storageVersion
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name () {

    return 'StorageSvc'
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  save (key, data) {

    const versionData = Object.assign({}, data, {
      storageVersion: this.currentStorageVersion
    })

    Lockr.set(this._config.storageKey + '.' + key, versionData)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  load (key, defaultValue = {}) {

    const storageKey = this._config.storageKey + '.' + key

    const data = Lockr.get(storageKey) || defaultValue

    if (data.storageVersion) {

      return (this.currentStorageVersion > data.storageVersion)
        ? defaultValue
        : data
    }

    return defaultValue
  }
}
