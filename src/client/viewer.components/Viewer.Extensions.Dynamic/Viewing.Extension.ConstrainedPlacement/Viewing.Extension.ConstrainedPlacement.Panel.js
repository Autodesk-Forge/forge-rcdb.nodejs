/////////////////////////////////////////////////////////
// Viewing.Extension.ConstrainedPlacement
// by Philippe Leefsma, November 2017
//
/////////////////////////////////////////////////////////
(function(){

  'use strict';

  AutodeskNamespace('Viewing.Extension.ConstrainedPlacement')

  function ConstrainedPlacementPanel(viewer, options) {

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

    this.viewer = viewer

    this.selectXBtn = document.createElement('button')
    this.selectYBtn = document.createElement('button')

    this.selectXBtn.className = 'select-axis-btn'
    this.selectYBtn.className = 'select-axis-btn'

    this.selectXBtn.onclick = this.onSelectXAxis.bind(this)
    this.selectYBtn.onclick = this.onSelectYAxis.bind(this)

    this.container.appendChild(this.selectXBtn)
    this.container.appendChild(this.selectYBtn)
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
  }

  proto.onSelectYAxis = function () {

    this.snapper.clearSelectionFilter()
    this.snapper.addSelectionFilter('edge')
    this.snapper.activate()

    this.snapper.showTooltip(true, 'Select Y Axis')
  }

  proto.onSnapperActivated = function () {

    this.viewer.disableHighlight(true)
  }

  proto.onSnapperDeactivated = function () {

    this.viewer.disableHighlight(false)
  }

  Viewing.Extension.ConstrainedPlacement.Panel = ConstrainedPlacementPanel

})()

