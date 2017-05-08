import EventsEmitter from 'EventsEmitter'

export default class ExtensionBase extends
  EventsEmitter.Composer (Autodesk.Viewing.Extension) {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super(viewer, options)

    this._viewer = viewer
    this.viewer = viewer

    this._options = options
    this.options = options
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Base'
  }

  ///////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////
  static guid(format = 'xxxxxxxxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load() {

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload() {

    return true
  }

  /////////////////////////////////////////////////////////
  // Reload callback
  //
  /////////////////////////////////////////////////////////
  reload (options) {

    return true
  }

  /////////////////////////////////////////////////////////
  // Async viewer event
  //
  /////////////////////////////////////////////////////////
  viewerEvent (eventId) {

    const eventIdArray = Array.isArray(eventId)
      ? eventId : [eventId]

    const eventTasks = eventIdArray.map((id) => {
      return new Promise ((resolve) => {
        const handler = (args) => {
          this.viewer.removeEventListener (
            id, handler)
          resolve (args)
        }
        this.viewer.addEventListener (
          id, handler)
      })
    })

    return Promise.all(eventTasks)
  }
}

