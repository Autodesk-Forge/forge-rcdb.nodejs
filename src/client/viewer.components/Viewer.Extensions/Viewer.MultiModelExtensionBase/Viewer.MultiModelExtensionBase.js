import EventsEmitter from 'EventsEmitter'

export default class MultiModelExtensionBase extends
  EventsEmitter.Composer (Autodesk.Viewing.Extension) {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options = {}, defaultOptions = {}) {

    super (viewer)

    // bindings
    this.onModelCompletedLoad = this.onModelCompletedLoad.bind(this)
    this.onObjectTreeCreated  = this.onObjectTreeCreated.bind(this)
    this.onModelRootLoaded    = this.onModelRootLoaded.bind(this)
    this.onModelActivated     = this.onModelActivated.bind(this)
    this.onGeometryLoaded     = this.onGeometryLoaded.bind(this)
    this.onToolbarCreated     = this.onToolbarCreated.bind(this)
    this.onModelBeginLoad     = this.onModelBeginLoad.bind(this)
    this.onModelUnloaded      = this.onModelUnloaded.bind(this)
    this.onSelection          = this.onSelection.bind(this)

    this.options = Object.assign({},
      defaultOptions,
      options)

    this.viewer = viewer

    const models = viewer.impl.modelQueue().getModels()

    this.models = models.map((model) => {

      model.guid = model.guid || this.guid()

      return model
    })

    this.eventSink = this.options.eventSink

    this.eventSink.on('model.loaded', (event) => {

      this.models = [...this.models, event.model]

      this.viewerEvent([

        Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT

      ]).then((args) => {

        this.onModelCompletedLoad (args[0])
      })

      this.onModelBeginLoad (event)
    })

    this.eventSink.on('model.activated', (event) => {

      this.onModelActivated (event)
    })

    this.eventSink.on('model.unloaded', (event) => {

      this.models = this.models.filter((model) => {

        return model.guid !== event.model.guid
      })

      this.onModelUnloaded(event)
    })

    this.initializeEvents ()
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.MultiModelExtensionBase'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    this.viewerEvents.forEach((event) => {

      this.viewer.removeEventListener(
        event.id, this[event.handler])
    })

    return true
  }

  /////////////////////////////////////////////////////////
  // Reload callback
  //
  /////////////////////////////////////////////////////////
  reload (options = {}) {

    this.options = Object.assign({},
      defaultOptions,
      this.options,
      options)

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelBeginLoad (event) {

    //console.log('MultiModelExtensionBase.onModelBeginLoad')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelActivated (event) {

    //console.log('MultiModelExtensionBase.onModelActivated')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded (event) {

    //console.log('MultiModelExtensionBase.onModelRootLoaded')

    if (this.options.loader) {

      this.options.loader.hide()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////
  onObjectTreeCreated (event) {

    //console.log('MultiModelExtensionBase.onObjectTreeCreated')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onGeometryLoaded (event) {

    //console.log('MultiModelExtensionBase.onGeometryLoaded')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelCompletedLoad (event) {

    //console.log('MultiModelExtensionBase.onModelCompletedLoad')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onToolbarCreated (event) {

    //console.log('MultiModelExtensionBase.onToolbarCreated')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelUnloaded (event) {

    //console.log('MultiModelExtensionBase.onModelUnloaded')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelection (event) {

    //console.log('MultiModelExtensionBase.onSelection')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  initializeEvents () {

    this.viewerEvents = [
      {
        id: Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
        handler: 'onObjectTreeCreated'
      },
      {
        id: Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT,
        handler: 'onModelRootLoaded'
      },
      {
        id: Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        handler: 'onGeometryLoaded'
      },
      {
        id: Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        handler: 'onToolbarCreated'
      },
      {
        id: Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        handler: 'onSelection'
      }
    ]

    this.viewerEvents.forEach((event) => {

      this.viewerEvent(event.id, this[event.handler])
    })
  }

  /////////////////////////////////////////////////////////
  // Async viewer event
  //
  /////////////////////////////////////////////////////////
  viewerEvent (eventId, handler) {

    if (handler) {

      this.viewer.addEventListener (eventId, handler)
      return
    }

    const eventIdArray = Array.isArray(eventId)
      ? eventId : [eventId]

    const eventTasks = eventIdArray.map((id) => {
      return new Promise ((resolve) => {
        const __handler = (args) => {
          resolve (args)
        }
        this.viewer.addEventListener (id, __handler)
      })
    })

    return Promise.all (eventTasks)
  }
}

