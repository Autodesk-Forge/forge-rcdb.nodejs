/////////////////////////////////////////////////////////////////////
// Viewing.Extension.Markup3D
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js'
import Markup3DTool from './Viewing.Extension.Markup3D.Tool'
import ExtensionBase from 'Viewer.ExtensionBase'
import ViewerTooltip from 'Viewer.Tooltip'
import ViewerToolkit from 'Viewer.Toolkit'

class Markup3DExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.markupCollection = {}

    this.markup3DTool = new Markup3DTool(
      viewer,
      this.markupCollection,
      options)

    this.tooltip = new ViewerTooltip(
      viewer)

    this.tooltip.setContent(`
      <div id="markup3D-tooltipId" class="markup3D-tooltip">
        <b>Place new markup (or ESC) ...</b>
      </div>`, '#markup3D-tooltipId')

    this._viewer.toolController.registerTool(
      this.markup3DTool)

    var toolName = this.markup3DTool.getName()

    this._viewer.toolController.activateTool(toolName)

    this.onExplodeHandler =
      (e) => this.onExplode(e)

    this.onVisibilityHandler =
      (e) => this.onVisibility(e)
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

        if (this.markup3DTool.create) {

          this.markup3DTool.stopCreate()

        } else {

          this.markup3DTool.startCreate()
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

    this.markup3DTool.on('startCreate', () => {

      this.tooltip.activate()

      this._control.container.classList.add('active')
    })

    this.markup3DTool.on('pinSelected', () => {

      this.tooltip.deactivate()
    })

    this.markup3DTool.on('markupCreated', () => {

    })

    this.markup3DTool.on('stopCreate', () => {

      this.tooltip.deactivate()

      this._control.container.classList.remove('active')
    })

    this.markup3DTool.on('markupLabel.mouseover', (markup) => {

      this.tooltip.deactivate()
    })

    this.markup3DTool.on('markupLabel.mouseout', (markup) => {

      if (this.markup3DTool.create) {

        const markup = this.markup3DTool.currentMarkup

        if (markup) {

          if(markup.created && !markup.dragging) {

            this.tooltip.activate()
          }

        } else {

          this.tooltip.activate()
        }
      }
    })

    this.eventHandlers = [
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

      this._viewer.addEventListener(
        entry.event,
        entry.handler)
    })

    console.log('Viewing.Extension.Markup3D loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.eventHandlers.forEach((entry) => {

      if(entry.removeOnDeactivate) {

        this._viewer.removeEventListener(
          entry.event,
          entry.handler)
      }
    })

    this.parentControl.removeControl(
      this._control)

    this._viewer.toolController.deactivateTool(
      this.markup3DTool.getName())

    console.log('Viewing.Extension.Markup3D unloaded')

    return true
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

  /////////////////////////////////////////////////////////////////
  // EXPLODE_CHANGE_EVENT Handler
  //
  /////////////////////////////////////////////////////////////////
  onExplode (event) {

    for (var id in this.markupCollection) {

      var markup = this.markupCollection[id]

      markup.updateFragmentTransform()
    }
  }

  /////////////////////////////////////////////////////////////////
  // ISOLATE_EVENT Handler
  //
  /////////////////////////////////////////////////////////////////
  onVisibility (event) {

    for (var id in this.markupCollection) {

      var markup = this.markupCollection[id]

      markup.updateVisibilty(event)
    }
  }

}

Autodesk.Viewing.theExtensionManager.registerExtension(
  Markup3DExtension.ExtensionId,
  Markup3DExtension)
