import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js'
import EventsEmitter from 'EventsEmitter'
import './Viewer.Tooltip.scss'

export default class ViewerTooltip extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    this.markerId = this.guid()

    this.svgId = this.guid()

    const htmlMarker = `
      <div id="${this.markerId}" class="tooltip-marker">
        <svg id="${this.svgId}"></svg>
      </div>`

    viewer.toolController.registerTool(this)

    $(viewer.container).append(htmlMarker)

    this.$marker = $(`#${this.markerId}`)

    this.pointer = this.createPointer(
      $(`#${this.svgId}`)[0])

    this.viewer = viewer

    this.active = false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createPointer (element) {

    const snap = Snap(element)

    let circle = snap.paper.circle(
      25, 25, 0)

    circle.attr({
      stroke: '#FF0000',
      fillOpacity: 0.4,
      fill: '#FF0000',
      strokeWidth: 2,
      opacity: 1
    })

    return circle
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  animatePointer (id) {

    if(this.animateId === id) {

      this.pointer.attr({
        fillOpacity: 0.8,
        opacity: 1,
        r: 0
      })

      this.pointer.animate({
          fillOpacity: 0.2,
          opacity: 0.4,
          r: 16
        },
        2000,
        mina.easein, () => {

          if (this.pointerVisible) {

            this.animatePointer(id)
          }
        })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setContent (html, selector) {

    this.tooltipSelector = selector

    $(this.viewer.container).append(html)
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

    if(!this.active) {

      this.active = true

      this.viewer.toolController.activateTool(
        this.getName())

      $(this.tooltipSelector).css({
        display: 'block'
      })

      this.emit('activate')
    }
  }

  /////////////////////////////////////////////////////////////////
  // Deactivate tool
  //
  /////////////////////////////////////////////////////////////////
  deactivate () {

    if (this.active) {

      this.active = false

      this.viewer.toolController.deactivateTool(
        this.getName())

      $(this.tooltipSelector).css({
        display: 'none'
      })

      this.pointerVisible = false

      this.$marker.css({
        display: 'none'
      })

      this.emit('deactivate')
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleSingleClick (event, button) {

    return false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleMouseMove (event) {

    const $offset = $(this.viewer.container).offset()

    $(this.tooltipSelector).css({
      top  : event.clientY - $offset.top - 30 + 'px',
      left : event.clientX - $offset.left + 'px'
    })

    const screenPoint = {
      x: event.clientX,
      y: event.clientY
    }

    const worldPoint = this.screenToWorld(screenPoint)

    if (worldPoint && this.active) {

      //console.log(worldPoint)

      const offset = $(this.viewer.container).offset()

      this.$marker.css({
        left: screenPoint.x - offset.left - this.$marker.width()/2,
        top: screenPoint.y - offset.top - this.$marker.height()/2,
        display: 'block'
      })

      if (!this.pointerVisible) {

        this.pointerVisible = true

        this.animateId = this.guid()

        this.animatePointer(
          this.animateId)
      }

    } else {

      this.pointerVisible = false

      this.$marker.css({
        display: 'none'
      })

      this.pointer.attr({
        r: 0
      })
    }

    return false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  screenToWorld (screenPoint) {

    var viewport = this.viewer.navigation.getScreenViewport()

    var n = {
      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top ) / viewport.height
    }

    return this.viewer.utilities.getHitPoint(n.x, n.y)
  }

  ///////////////////////////////////////////////////////////////////////////
  // world -> screen coords conversion
  //
  ///////////////////////////////////////////////////////////////////////////
  worldToScreen (worldPoint, camera) {

    var p = new THREE.Vector4()

    p.x = worldPoint.x
    p.y = worldPoint.y
    p.z = worldPoint.z
    p.w = 1

    p.applyMatrix4(camera.matrixWorldInverse)
    p.applyMatrix4(camera.projectionMatrix)

    // Don't want to mirror values with negative z (behind camera)
    // if camera is inside the bounding box,
    // better to throw markers to the screen sides.
    if (p.w > 0) {

      p.x /= p.w;
      p.y /= p.w;
      p.z /= p.w;
    }

    // This one is multiplying by width/2 and height/2,
    // and offsetting by canvas location
    var point = this._viewer.impl.viewportToClient(p.x, p.y);

    // snap to the center of the pixel
    point.x = Math.floor(point.x) + 0.5;
    point.y = Math.floor(point.y) + 0.5;

    return point;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleKeyDown (event, keyCode) {

    return false
  }
}
