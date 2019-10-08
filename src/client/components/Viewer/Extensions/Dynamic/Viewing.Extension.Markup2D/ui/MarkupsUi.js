(function () {
  var EXTENSION_NAME = 'Autodesk.MarkupsUi'
  var namespace = AutodeskNamespace('Autodesk.Markups.Ui')

  function MarkupsUi (viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options)

    this.markupsCore = options.markupsCore

    this.options = options

    this.viewer = viewer
  }

  MarkupsUi.prototype = Object.create(Autodesk.Viewing.Extension.prototype)
  MarkupsUi.prototype.constructor = MarkupsUi
  var proto = MarkupsUi.prototype

  var Button = Autodesk.Viewing.UI.Button
  var ACTIVE = Button.State.ACTIVE
  var INACTIVE = Button.State.INACTIVE

  function createMarkupButton () {
    var btn = new Button('toolbar-markupTool')
    btn.setToolTip('Markup')
    btn.setIcon('adsk-icon-markup')
    btn.onClick = function () {
      var state = btn.getState()
      btn.setState(state === INACTIVE ? ACTIVE : INACTIVE)
    }
    return btn
  }

  proto.load = function () {
    // TODO: Even if the toolController is missing, the viewer may create it later and
    // notify consumers (like us) through an event
    if (!this.viewer.toolController) {
      return false
    }

    this.panel = new Autodesk.Markups.Ui.MarkupsPanel(
      this.viewer, this.markupsCore)

    this.viewer.addPanel(this.panel)

    if (this.options.showControl) {
      this.createUI()
    }

    return true
  }

  proto.unload = function () {
    return true
  }

  proto.createUI = function () {
    var viewer = this.viewer

    this.markupToolButton = createMarkupButton()

    var modelTools = viewer
      .getToolbar(true)
      .getControl(Autodesk.Viewing.TOOLBAR.MODELTOOLSID)

    this.panel.addVisibilityListener(function (show) {
      this.markupToolButton.setState(show ? ACTIVE : INACTIVE)
    }.bind(this))

    this.onMarkupButtonStateChange = function (e) {
      this.panel.setVisible(e.state === ACTIVE)
    }

    this.markupToolButton.addEventListener(
      Button.Event.STATE_CHANGED,
      this.onMarkupButtonStateChange)

    modelTools.addControl(this.markupToolButton, { index: 0 })
  }

  Autodesk.Viewing.theExtensionManager.registerExtension(
    EXTENSION_NAME, MarkupsUi)

  namespace.MarkupsUi = MarkupsUi
})()
