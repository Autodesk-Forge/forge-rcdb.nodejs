/////////////////////////////////////////////////////////////////////
// Viewing.Extension.Markup3D
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js'
import Markup3DTool from './Viewing.Extension.Markup3D.Tool'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class Markup3DExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super(viewer, options)

    this.markup3DTool = new Markup3DTool(viewer)

    this._viewer.toolController.registerTool(
      this.markup3DTool)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.Markup3D'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load () {

    this._control = ViewerToolkit.createButton(
      'toolbar-markup3D',
      'glyphicon glyphicon-check',
      'Markup 3D', () => {

        var toolName = this.markup3DTool.getName()

        if (this.markup3DTool.active) {

          this._viewer.toolController.deactivateTool(toolName)
          this._control.container.classList.remove('active')

        } else {

          this._viewer.toolController.activateTool(toolName)
          this._control.container.classList.add('active')
        }
      })

    this.parentControl = this._options.parentControl

    if (!this.parentControl) {

      var viewerToolbar = this._viewer.getToolbar(true)

      this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
        'markup')

      viewerToolbar.addControl(this.parentControl)
    }

    this.parentControl.addControl(
      this._control)

    console.log('Viewing.Extension.Markup3D loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.parentControl.removeControl(
      this._control)

    this._viewer.toolController.deactivateTool(
      this.markup3DTool.getName())

    console.log('Viewing.Extension.Markup3D unloaded')
  }

  /////////////////////////////////////////////////////////////////
  //
  //  From viewer.getState:
  //  Allow extensions to inject their state data
  //
  //  for (var extensionName in viewer.loadedExtensions) {
  //    viewer.loadedExtensions[extensionName].getState(
  //      viewerState);
  //  }
  /////////////////////////////////////////////////////////////////
  getState (viewerState) {

    this.markup3DTool.getState(viewerState)
  }

  /////////////////////////////////////////////////////////////////
  //
  //    From viewer.restoreState:
  //    Allow extensions to restore their data
  //
  //    for (var extensionName in viewer.loadedExtensions) {
  //      viewer.loadedExtensions[extensionName].restoreState(
  //        viewerState, immediate);
  //    }
  /////////////////////////////////////////////////////////////////
  restoreState (viewerState, immediate) {

    this.markup3DTool.restoreState(
      viewerState, immediate)
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  Markup3DExtension.ExtensionId,
  Markup3DExtension)
