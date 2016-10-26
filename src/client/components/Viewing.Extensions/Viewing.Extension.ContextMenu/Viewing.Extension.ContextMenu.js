/////////////////////////////////////////////////////////////////////
// Viewing.Extension.ContextMenu
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import ContextMenuHandler from './Viewing.Extension.ContextMenu.Handler.js'
import ExtensionBase from 'Viewer.ExtensionBase'

class ContextMenuExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, options)

    this.onSelectionChangedHandler = (e) => {

      return this.onSelectionChanged(e)
    }

    this.contextMenuHandler = new ContextMenuHandler(
      viewer, Object.assign({}, options, {
        buildMenu: (menu) => {

          return options.buildMenu ?
            options.buildMenu(menu, this.selectedDbId):
            menu
        }
      }))

    this.selectedDbId = null
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ContextMenu'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    this._viewer.setContextMenu(this.contextMenuHandler)

    this._viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelectionChangedHandler)

    console.log('Viewing.Extension.ContextMenu loaded')

    return true;
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectionChanged (e) {

    if (e.selections && e.selections.length) {

      const selection = e.selections[0]

      this.selectedDbId = selection.dbIdArray[0]

    } else {

      this.selectedDbId = null
    }
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelectionChangedHandler)

    this._viewer.setContextMenu(
      new Autodesk.Viewing.Extensions.ViewerObjectContextMenu(
        this._viewer)
    )

    console.log('Viewing.Extension.ContextMenu unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ContextMenuExtension.ExtensionId,
  ContextMenuExtension)
