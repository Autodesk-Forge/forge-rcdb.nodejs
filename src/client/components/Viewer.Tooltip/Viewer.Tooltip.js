import EventsEmitter from 'EventsEmitter'
import './Viewer.Tooltip.scss'

export default class ViewerTooltip extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    viewer.toolController.registerTool(this)

    this.viewer = viewer

    this.active = false
  }

  /////////////////////////////////////////////////////////////////
  // Tool names
  //
  /////////////////////////////////////////////////////////////////
  getNames () {

    return ['Viewer.Tooltip.Tool']
  }

  /////////////////////////////////////////////////////////////////
  // Tool name
  //
  /////////////////////////////////////////////////////////////////
  getName () {

    return 'Viewer.Tooltip.Tool'
  }

  /////////////////////////////////////////////////////////////////
  // Activate Tool
  //
  /////////////////////////////////////////////////////////////////
  activate () {

    this.viewer.toolController.activateTool(
      this.getName())

    this.active = true

    this.eventHandlers = [
      {
        event: Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        handler: this.onSelectionChangedHandler,
        removeOnDeactivate: true
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

    this.viewer.toolController.deactivateTool(
      this.getName())

    this.active = false

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

    return false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleKeyDown (event, keyCode) {

    if (keyCode === 27) { //ESC

      this.deactivate()
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
}
