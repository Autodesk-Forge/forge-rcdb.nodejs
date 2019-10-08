import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js'
import EventsEmitter from 'EventsEmitter'
import velocity from 'velocity-animate'
import './Viewer.Tooltip.scss'

export default class ViewerTooltip extends EventsEmitter {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, opts = {}) {
    super()

    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)

    this.markerId = this.guid()

    this.svgId = this.guid()

    this.name = this.guid()

    this.viewer = viewer

    this.active = false

    this.options = opts

    const htmlMarker = `
      <div id="${this.markerId}" class="tooltip-marker">
        <svg id="${this.svgId}"></svg>
      </div>`

    viewer.toolController.registerTool(this)

    $(viewer.container).append(htmlMarker)

    this.$marker = $(`#${this.markerId}`)

    this.pointer = this.createPointer(
      $(`#${this.svgId}`)[0])

    this.timeout = null
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createPointer (element) {
    const snap = Snap(element)

    const circle = snap.paper.circle(25, 25, 0)

    circle.attr({
      fillOpacity: this.options.fillOpacity || 0.4,
      strokeWidth: this.options.strokeWidth || 2,
      stroke: this.options.stroke || '#FF0000',
      fill: this.options.fill || '#FF0000',
      opacity: this.options.opacity || 1
    })

    return circle
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  animatePointer (id) {
    if (this.animateId === id) {
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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setContent (html, selector) {
    this.tooltipSelector = selector

    $(this.viewer.container).append(html)
  }

  /// //////////////////////////////////////////////////////
  // Tool names
  //
  /// //////////////////////////////////////////////////////
  getNames () {
    return [this.name]
  }

  /// //////////////////////////////////////////////////////
  // Tool name
  //
  /// //////////////////////////////////////////////////////
  getName () {
    return this.name
  }

  /// //////////////////////////////////////////////////////
  // Activate Tool
  //
  /// //////////////////////////////////////////////////////
  activate () {
    if (!this.active || this.timeout) {
      this.viewer.container.addEventListener(
        'mouseenter', this.onMouseEnter)

      this.viewer.container.addEventListener(
        'mouseleave', this.onMouseLeave)

      clearTimeout(this.timeout)

      this.timeout = null

      this.active = true

      this.viewer.toolController.activateTool(
        this.getName())

      $(this.tooltipSelector).css({
        display: 'block'
      })

      $(this.tooltipSelector).velocity({
        opacity: 1.0
      })

      this.emit('activate')
    }
  }

  /// //////////////////////////////////////////////////////
  // Deactivate tool
  //
  /// //////////////////////////////////////////////////////
  deactivate (delay = 0) {
    if (this.active && !this.timeout) {
      this.viewer.container.removeEventListener(
        'mouseenter', this.onMouseEnter)

      this.viewer.container.removeEventListener(
        'mouseleave', this.onMouseLeave)

      this.timeout = setTimeout(() => {
        if (this.viewer.toolController) {
          this.viewer.toolController.deactivateTool(
            this.getName())
        }

        $(this.tooltipSelector).css({
          display: 'none',
          opacity: 0.0
        })

        this.active = false
      }, delay)

      this.pointerVisible = false

      this.$marker.css({
        display: 'none'
      })

      this.emit('deactivate')
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onMouseEnter () {
    $(this.tooltipSelector).css({
      display: 'block'
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onMouseLeave () {
    $(this.tooltipSelector).css({
      display: 'none'
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  handleSingleClick (event, button) {
    return false
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  handleMouseMove (event) {
    const $offset = $(this.viewer.container).offset()

    $(this.tooltipSelector).css({
      top: event.clientY - $offset.top - 35 + 'px',
      left: event.clientX - $offset.left + 'px'
    })

    const screenPoint = {
      x: event.clientX,
      y: event.clientY
    }

    const worldPoint = this.screenToWorld(screenPoint)

    if (worldPoint && this.active) {
      const offset = $(this.viewer.container).offset()

      this.$marker.css({
        left: screenPoint.x - offset.left - this.$marker.width() / 2,
        top: screenPoint.y - offset.top - this.$marker.height() / 2,
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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  screenToWorld (screenPoint) {
    var viewport = this.viewer.navigation.getScreenViewport()

    var n = {
      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top) / viewport.height
    }

    return this.viewer.utilities.getHitPoint(n.x, n.y)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  handleKeyDown (event, keyCode) {
    return false
  }
}
