/// //////////////////////////////////////////////////////
// Viewing.Extension.ConstrainedPlacement
// by Philippe Leefsma, November 2017
//
/// //////////////////////////////////////////////////////
(function () {
  'use strict'

  AutodeskNamespace('Viewing.Extension.ConstrainedPlacement')

  function ConstrainedPlacementExtension (viewer, options) {
    this.events = new Viewing.Extension.ConstrainedPlacement.EventsEmitter()

    Autodesk.Viewing.Extension.call(this, viewer, options)

    this.options = options

    this.viewer = viewer

    this.createUI()

    this.snapper =
      new Viewing.Extension.ConstrainedPlacement.SnapperTool(
        viewer)

    this.snapper.setDetectRadius(0.15)
  }

  ConstrainedPlacementExtension.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype)

  ConstrainedPlacementExtension.prototype.constructor =
    ConstrainedPlacementExtension

  var proto = ConstrainedPlacementExtension.prototype

  proto.load = function () {
    console.log('Viewing.Extension.ConstrainedPlacement loaded')

    return true
  }

  proto.unload = function () {
    console.log('Viewing.Extension.ConstrainedPlacement unloaded')

    this.parentControl.removeControl(this.control)

    if (this.panel) {
      this.panel.setVisible(false)
    }

    return true
  }

  proto.onToolbarCreated = function () {
    var controlId = 'toolbar-constrained-placement'

    var button =
      new Autodesk.Viewing.UI.Button(
        controlId)

    button.icon.style.fontSize = '24px'

    button.icon.className = 'fa fa-crosshairs'

    button.setToolTip('Constrained Placement')

    button.onClick = this.onButtonClicked.bind(this)

    var viewerToolbar = this.viewer.getToolbar(true)

    this.parentControl = viewerToolbar.getControl(
      this.options.parentControl)

    this.parentControl.addControl(button)

    this.control = button
  }

  proto.createPanel = function () {
    var panel = new Viewing.Extension.ConstrainedPlacement.Panel(
      this.viewer, {
        snapper: this.snapper
      })

    var _events = this.events

    panel.events.on('complete', function (args) {
      _events.emit('complete', args)

      console.log(args)
    })

    return panel
  }

  proto.onButtonClicked = function () {
    this.panel = this.panel || this.createPanel()

    this.panel.setVisible(true)
  }

  Autodesk.Viewing.theExtensionManager.registerExtension(
    'Viewing.Extension.ConstrainedPlacement',
    ConstrainedPlacementExtension)
})()
