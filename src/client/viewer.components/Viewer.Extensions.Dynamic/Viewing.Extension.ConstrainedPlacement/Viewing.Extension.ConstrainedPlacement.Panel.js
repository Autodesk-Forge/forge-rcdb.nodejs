/////////////////////////////////////////////////////////
// Viewing.Extension.ConstrainedPlacement
// by Philippe Leefsma, November 2017
//
/////////////////////////////////////////////////////////
(function(){

  'use strict';

  AutodeskNamespace('Viewing.Extension.ConstrainedPlacement')

  function ConstrainedPlacementPanel(viewer, options) {

    this.events = new Viewing.Extension.ConstrainedPlacement.EventsEmitter

    Autodesk.Viewing.UI.DockingPanel.call(
      this, viewer.container,
      'constrained-placement-panel',
      'Constrained Placement')

    this.container.classList.add(
      'constrained-placement')

    this.snapper = options.snapper

    this.snapper.events.on('activate',
      this.onSnapperActivated.bind(this))

    this.snapper.events.on('deactivate',
      this.onSnapperDeactivated.bind(this))

    this.snapper.events.on('edge.snapped',
      this.onEdgeSnapped.bind(this))

    this.snapper.events.on('geometry.selected',
      this.onGeometrySelected.bind(this))

    this.viewer = viewer

    var content = document.createElement('div')

    content.className = 'content'

    this.selectXBtn = document.createElement('button')
    this.selectYBtn = document.createElement('button')
    this.selectPtBtn = document.createElement('button')
    this.OKBtn = document.createElement('button')

    this.selectXBtn.innerHTML = 'Select X Axis'
    this.selectYBtn.innerHTML = 'Select Y Axis'
    this.selectPtBtn.innerHTML = 'Select Origin'
    this.OKBtn.innerHTML = 'OK'

    this.selectXBtn.onclick = this.onSelectXAxis.bind(this)
    this.selectYBtn.onclick = this.onSelectYAxis.bind(this)
    this.selectPtBtn.onclick = this.onSelectOrigin.bind(this)
    this.OKBtn.onclick = this.onOK.bind(this)

    this.OKBtn.className = 'ok'

    this.xInput = document.createElement('input')
    this.yInput = document.createElement('input')

    this.xInput.setAttribute("type", "text")
    this.yInput.setAttribute("type", "text")

    content.appendChild(this.selectXBtn)
    content.appendChild(this.xInput)
    content.appendChild(document.createElement('hr'))
    content.appendChild(this.selectYBtn)
    content.appendChild(this.yInput)
    content.appendChild(document.createElement('hr'))
    content.appendChild(this.selectPtBtn)
    content.appendChild(this.OKBtn)

    this.container.appendChild(content)

    this.xInput.oninput = this.onDistXChanged.bind(this)
    this.yInput.oninput = this.onDistYChanged.bind(this)
  }

  ConstrainedPlacementPanel.prototype =
    Object.create(Autodesk.Viewing.UI.DockingPanel.prototype)

  ConstrainedPlacementPanel.prototype.constructor =
    ConstrainedPlacementPanel

  var proto = ConstrainedPlacementPanel.prototype

  proto.onSelectXAxis = function () {

    this.snapper.clearSelectionFilter()
    this.snapper.addSelectionFilter('edge')
    this.snapper.activate()

    this.snapper.showTooltip(true, 'Select X Axis')

    this.mode = 'SELECT_X_AXIS'
  }

  proto.onSelectYAxis = function () {

    this.snapper.clearSelectionFilter()
    this.snapper.addSelectionFilter('edge')
    this.snapper.activate()

    this.snapper.showTooltip(true, 'Select Y Axis')

    this.mode = 'SELECT_Y_AXIS'
  }

  proto.onSelectOrigin = function () {

    this.snapper.clearSelectionFilter()
    this.snapper.addSelectionFilter('vertex')
    this.snapper.activate()

    this.snapper.showTooltip(true, 'Select Origin')

    this.mode = 'SELECT_ORIGIN'
  }

  proto.onSnapperActivated = function () {


  }

  proto.onSnapperDeactivated = function () {


  }

  proto.onEdgeSnapped = function (edge) {

    switch (this.mode) {

      case 'SELECT_X_AXIS':
        var xAxis = edgeToUnitVector (edge)
        break

      case 'SELECT_Y_AXIS':
        var yAxis =  edgeToUnitVector (edge)

        if (this.xAxis) {

          var angle = Math.abs(yAxis.angleTo(this.xAxis))

          return !(Math.abs(angle - Math.PI/2) < 0.01)
        }

        break
    }
  }

  function edgeToUnitVector (edge) {

    var v = new THREE.Vector3()

    v.subVectors (edge.vertices[1], edge.vertices[0])

    v.normalize()

    return v
  }

  proto.onGeometrySelected = function (args) {

    if (args.geometry) {

      switch (this.mode) {

        case 'SELECT_X_AXIS':
          this.xAxis =  edgeToUnitVector (args.geometry)
          break

        case 'SELECT_Y_AXIS':
          this.yAxis =  edgeToUnitVector (args.geometry)
          break

        case 'SELECT_ORIGIN':
          this.origin = args.geometry
          break
      }

      this.snapper.deactivate()
    }
  }

  proto.onSelection = function (event) {

    if (event.selections.length) {

      this.viewer.clearSelection()
    }
  }

  proto.onDistXChanged = function(event) {

    this.xDist = event.target.value
  }

  proto.onDistYChanged = function(event) {

    this.yDist = event.target.value
  }

  proto.onOK = function () {

    this.events.emit('complete', {
      origin: this.origin,
      xAxis: this.xAxis,
      yAxis: this.yAxis,
      xDist: this.xDist,
      yDist: this.yDist
    })

    this.setVisible(false)
  }

  proto.setVisible = function (show) {

    Autodesk.Viewing.UI.DockingPanel.prototype.setVisible.call(this, show)

    if (!show && this.snapper) {

      this.viewer.removeEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onSelection.bind(this))

      this.viewer.disableHighlight(false)

      this.snapper.deactivate()
    }

    if (show) {

      this.viewer.addEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onSelection.bind(this))

      this.viewer.disableHighlight(true)
    }
  }

  Viewing.Extension.ConstrainedPlacement.Panel = ConstrainedPlacementPanel

})()

