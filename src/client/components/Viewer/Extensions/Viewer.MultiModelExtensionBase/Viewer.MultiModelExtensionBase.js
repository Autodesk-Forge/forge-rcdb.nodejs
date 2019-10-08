import EventsEmitter from 'EventsEmitter'

export default class MultiModelExtensionBase extends
  EventsEmitter.Composer(Autodesk.Viewing.Extension) {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options = {}, defaultOptions = {}) {
    super(viewer)
    // bindings
    Object.assign(this, options.serviceContext)

    this.onModelCompletedLoad = this.onModelCompletedLoad.bind(this)
    this.onObjectTreeCreated = this.onObjectTreeCreated.bind(this)
    this.onModelRootLoaded = this.onModelRootLoaded.bind(this)
    this.onExtensionLoaded = this.onExtensionLoaded.bind(this)
    this.onModelActivated = this.onModelActivated.bind(this)
    this.onGeometryLoaded = this.onGeometryLoaded.bind(this)
    this.onToolbarCreated = this.onToolbarCreated.bind(this)
    this.onModelBeginLoad = this.onModelBeginLoad.bind(this)
    this.onModelUnloaded = this.onModelUnloaded.bind(this)
    this.onSelection = this.onSelection.bind(this)

    this.__onModelRootLoaded = this.__onModelRootLoaded.bind(this)
    this.__onModelActivated = this.__onModelActivated.bind(this)
    this.__onModelUnloaded = this.__onModelUnloaded.bind(this)
    this.__onModelLoaded = this.__onModelLoaded.bind(this)

    this.defaultOptions = defaultOptions

    this.options = Object.assign({},
      defaultOptions,
      options)

    this.viewer = viewer

    // read the modelQueue to detect currently loaded models
    // when the extension gets loaded
    const models = viewer.impl.modelQueue().getModels()

    this.models = models.map((model) => {
      model.guid = model.guid || this.guid()

      return model
    })

    this.initializeEvents()
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.MultiModelExtensionBase'
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    return true
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    this.viewerEvents.forEach((event) => {
      this.viewer.removeEventListener(
        event.id, this[event.handler])
    })

    if (this.eventSink) {
      this.eventSink.off('model.activated',
        this.__onModelActivated)

      this.eventSink.off('model.unloaded',
        this.__onModelUnloaded)

      this.eventSink.off('model.loaded',
        this.__onModelLoaded)
    }

    this.off()

    return true
  }

  /// //////////////////////////////////////////////////////
  // Reload callback, in case the extension is re-loaded
  // more than once
  //
  /// //////////////////////////////////////////////////////
  reload (options = {}) {
    this.options = Object.assign({},
      this.defaultOptions,
      this.options,
      options)

    return true
  }

  /// //////////////////////////////////////////////////////
  // Invoked when extension gets loaded
  //
  /// //////////////////////////////////////////////////////
  onExtensionLoaded (event) {

    // console.log('MultiModelExtensionBase.onExtensionLoaded')
  }

  /// //////////////////////////////////////////////////////
  // Invoked when the model starts to load
  // The geometry and instanceTree may not be available
  // at this time
  //
  /// //////////////////////////////////////////////////////
  onModelBeginLoad (event) {

    // console.log('MultiModelExtensionBase.onModelBeginLoad')
  }

  /// //////////////////////////////////////////////////////
  // Triggered by ModelLoader extension when a model is
  // selected in a multi-model environment
  //
  /// //////////////////////////////////////////////////////
  onModelActivated (event) {

    // console.log('MultiModelExtensionBase.onModelActivated')
  }

  /// //////////////////////////////////////////////////////
  // Invoked when model root node has been loaded
  // Extensions that do require access to full
  // model geometry or component tree may use that
  // event to know a new model has been loaded
  //
  /// //////////////////////////////////////////////////////
  __onModelRootLoaded (event) {
    this.viewerEvent([

      Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT

    ]).then((args) => {
      this.onModelCompletedLoad(args[0])
    })
  }

  onModelRootLoaded (event) {

    // console.log('MultiModelExtensionBase.onModelRootLoaded')
  }

  /// //////////////////////////////////////////////////////
  // Invoked when object tree is fully loaded.
  // Extensions that are interested in using the
  // instanceTree need to use that event to make sure
  // it is available
  //
  /// /////////////////////////////////////////////////////
  onObjectTreeCreated (event) {

    // console.log('MultiModelExtensionBase.onObjectTreeCreated')
  }

  /// //////////////////////////////////////////////////////
  // Invoked when geometry is fully loaded
  //
  /// //////////////////////////////////////////////////////
  onGeometryLoaded (event) {

    // console.log('MultiModelExtensionBase.onGeometryLoaded')
  }

  /// //////////////////////////////////////////////////////
  // Invoked after onObjectTreeCreated and onGeometryLoaded
  // have both been fired
  //
  /// //////////////////////////////////////////////////////
  onModelCompletedLoad (event) {

    // console.log('MultiModelExtensionBase.onModelCompletedLoad')
  }

  /// //////////////////////////////////////////////////////
  // Invoked once the viewer toolbar has been created
  //
  /// //////////////////////////////////////////////////////
  onToolbarCreated (event) {

    // console.log('MultiModelExtensionBase.onToolbarCreated')
  }

  /// //////////////////////////////////////////////////////
  // Triggered by ModelLoader extension when a model has
  // been unloaded as per user request
  //
  /// //////////////////////////////////////////////////////
  onModelUnloaded (event) {

    // console.log('MultiModelExtensionBase.onModelUnloaded')
  }

  /// //////////////////////////////////////////////////////
  // Invoked when a model is being selected
  //
  /// //////////////////////////////////////////////////////
  onSelection (event) {

    // console.log('MultiModelExtensionBase.onSelection')
  }

  /// //////////////////////////////////////////////////////
  // Sink Events
  //
  /// //////////////////////////////////////////////////////
  __onModelLoaded (event) {
    this.models = [...this.models, event.model]

    this.onModelBeginLoad(event)
  }

  __onModelActivated (event) {
    this.onModelActivated(event)
  }

  __onModelUnloaded (event) {
    this.models = this.models.filter((model) => {
      return model.guid !== event.model.guid
    })

    this.onModelUnloaded(event)
  }

  /// //////////////////////////////////////////////////////
  // Initialize all events for the extension
  // Each event will invoke a predefined handler
  // implemented or not by the derived extension
  //
  /// //////////////////////////////////////////////////////
  initializeEvents () {
    if (this.options.eventSink) {
      // event object passed in options
      this.eventSink = this.options.eventSink

      this.eventSink.on('model.loaded',
        this.__onModelLoaded)

      this.eventSink.on('model.activated',
        this.__onModelActivated)

      this.eventSink.on('model.unloaded',
        this.__onModelUnloaded)
    }

    this.viewerEvents = [
      {
        id: Autodesk.Viewing.EXTENSION_LOADED_EVENT,
        handler: 'onExtensionLoaded'
      },
      {
        id: Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
        handler: 'onObjectTreeCreated'
      },
      {
        id: Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT,
        handler: '__onModelRootLoaded'
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

  /// //////////////////////////////////////////////////////
  // Async viewer event
  //
  /// //////////////////////////////////////////////////////
  viewerEvent (eventId, handler) {
    if (handler) {
      this.viewer.addEventListener(eventId, handler)
      return
    }

    const eventIdArray = Array.isArray(eventId)
      ? eventId : [eventId]

    const eventTasks = eventIdArray.map((id) => {
      return new Promise((resolve) => {
        const __handler = (args) => {
          this.viewer.removeEventListener(id, __handler)
          resolve(args)
        }
        this.viewer.addEventListener(id, __handler)
      })
    })

    return Promise.all(eventTasks)
  }
}
