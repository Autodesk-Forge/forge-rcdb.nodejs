import LeaderNote from './Markup3D/Markup3D'
import './Viewing.Extension.Markup3D.scss'
import EventsEmitter from 'EventsEmitter'

export default class Markup3DTool extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    this.viewer = viewer

    this.active = false

    this.MarkupCollection = {}

    this.onSelectionChangedHandler =
      (e) => this.onSelectionChanged(e)

    this.onExplodeHandler =
      (e) => this.onExplode(e)

    this.onStartDragHandler =
      (e) => this.onStartDrag(e)

    this.onEndDragHandler =
      (e) => this.onEndDrag(e)

    this.onVisibilityHandler =
      (e) => this.onVisibility(e)
  }

  /////////////////////////////////////////////////////////////////
  // Tool names
  //
  /////////////////////////////////////////////////////////////////
  getNames () {

    return ['Viewing.Extension.Markup3D.Tool']
  }

  /////////////////////////////////////////////////////////////////
  // Tool name
  //
  /////////////////////////////////////////////////////////////////
  getName () {

    return 'Viewing.Extension.Markup3D.Tool'
  }

  /////////////////////////////////////////////////////////////////
  // Activate Tool
  //
  /////////////////////////////////////////////////////////////////
  activate () {

    this.active = true

    this.currentMarkup = null

    this.eventHandlers = [
      {
        event: Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        handler: this.onSelectionChangedHandler,
        removeOnDeactivate: true
      },
      {
        event: Autodesk.Viewing.EXPLODE_CHANGE_EVENT,
        handler: this.onExplodeHandler
      },
      {
        event: Autodesk.Viewing.ISOLATE_EVENT,
        handler: this.onVisibilityHandler
      },
      {
        event: Autodesk.Viewing.HIDE_EVENT,
        handler: this.onVisibilityHandler
      },
      {
        event: Autodesk.Viewing.SHOW_EVENT,
        handler: this.onVisibilityHandler
      }
    ]

    this.eventHandlers.forEach((entry) => {

      this.viewer.addEventListener(
        entry.event,
        entry.handler)
    })

    this.emit('activate')
  }

  /////////////////////////////////////////////////////////////////
  // Deactivate tool
  //
  /////////////////////////////////////////////////////////////////
  deactivate () {

    this.active = false

    this.currentMarkup = null

    this.eventHandlers.forEach((entry) => {

      if(entry.removeOnDeactivate) {

        this.viewer.removeEventListener(
          entry.event,
          entry.handler)
      }
    })

    this.eventHandlers = null

    this.emit('deactivate')
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleSingleClick (event, button) {

    this.screenPoint = {
      x: event.clientX,
      y: event.clientY
    }

    console.log('-------------------')
    console.log('Tool:handleSingleClick(event, button)')
    console.log(event)

    var viewport = this.viewer.navigation.getScreenViewport()

    var n = {
      x: (event.clientX - viewport.left) / viewport.width,
      y: (event.clientY - viewport.top) / viewport.height
    }

    var worldPoint = this.viewer.utilities.getHitPoint(
      n.x,
      n.y)

    console.log(worldPoint)

    return false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleMouseMove (event) {

    if (this.currentMarkup) {

      this.currentMarkup.setLeaderEndPoint({
        x: event.clientX,
        y: event.clientY
      })
    }

    return false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleKeyDown (event, keyCode) {

    if (keyCode === 27) { //ESC

      //cancel markup creation
      if (this.currentMarkup &&
        !this.MarkupCollection[this.currentMarkup.id]) {

        this.currentMarkup.off()

        this.currentMarkup.endDrag()

        this.currentMarkup.remove()

        this.currentMarkup = null

      } else { //deactivate tool

        this.deactivate()
      }
    }

    return false
  }

  /////////////////////////////////////////////////////////////////
  // SELECTION_CHANGED_EVENT Handler
  //
  /////////////////////////////////////////////////////////////////
  onSelectionChanged (event) {

    if (event.selections.length) {

      this.viewer.select([])

      if (this.currentMarkup)
        return

      var sel = event.selections[0]

      //TODO CORRECT screenPoint when offset

      var viewport = this.viewer.navigation.getScreenViewport()

      var n = {
        x: (this.screenPoint.x - viewport.left) / viewport.width,
        y: (this.screenPoint.y - viewport.top) / viewport.height
      }

      var worldPoint = this.viewer.utilities.getHitPoint(
        n.x, n.y)

      if (worldPoint) {

        var markup = new LeaderNote(
          this.viewer,
          this.screenPoint,
          sel.dbIdArray[0],
          sel.fragIdsArray[0])

        markup.on('drag.start', (markup) => {
          this.onStartDragHandler (markup)
        })

        markup.on('drag.end',
          this.onEndDragHandler)

        markup.startDrag()

      } else {

        console.log('Invalid screenpoint ...')
        console.log(this.screenPoint)
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // EXPLODE_CHANGE_EVENT Handler
  //
  /////////////////////////////////////////////////////////////////
  onExplode (event) {

    for (var id in this.MarkupCollection) {

      var markup = this.MarkupCollection[id]

      markup.updateFragmentTransform()
    }
  }

  /////////////////////////////////////////////////////////////////
  // ISOLATE_EVENT Handler
  //
  /////////////////////////////////////////////////////////////////
  onVisibility (event) {

    for (var id in this.MarkupCollection) {

      var markup = this.MarkupCollection[id]

      markup.updateVisibilty(event)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onStartDrag (markup) {

    this.currentMarkup = markup
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onEndDrag (markup) {

    if (!this.MarkupCollection[markup.id]) {

      this.MarkupCollection[markup.id] = markup
    }

    this.currentMarkup = null
  }

  /////////////////////////////////////////////////////////////////
  // Inject markups data into state
  //
  /////////////////////////////////////////////////////////////////
  getState (viewerState) {

    viewerState.Markup3D = {

      MarkupCollection: []
    }

    for (var id in this.MarkupCollection) {

      var markup = this.MarkupCollection[id]

      if (markup.bindToState) {

        viewerState.Markup3D.MarkupCollection.push(
          markup.save()
        )
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Restore markup data from state
  //
  /////////////////////////////////////////////////////////////////
  restoreState (viewerState, immediate) {

    for (var id in this.MarkupCollection) {

      var markup = this.MarkupCollection[id]

      if (markup.bindToState) {

        markup.remove()
        delete this.MarkupCollection[id]
      }
    }

    if (viewerState.Markup3D) {

      viewerState.Markup3D.MarkupCollection.forEach((state) => {

        var markup = LeaderNote.load(
          this.viewer, state)

        markup.on('drag.start', (markup) => {
          this.onStartDragHandler (markup)
        })

        markup.on('drag.end',
          this.onEndDragHandler)

        this.MarkupCollection[markup.id] = markup
      })
    }
  }
}
