/////////////////////////////////////////////////////////////////////
// Viewing.Extension.ContextMenu
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import ContextMenuHandler from './Viewing.Extension.ContextMenu.Handler'
import ExtensionBase from 'Viewer.ExtensionBase'

class ContextMenuExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, options)

    this.onSelection = this.onSelection.bind(this)

    this.selection = null

    this.handlers = []
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
  load() {

    this.contextMenuHandler = new ContextMenuHandler(this.viewer)

    this.contextMenuHandler.on('buildMenu', (menu) => {

      const dbId = this.selection
        ? this.selection.dbIdArray[0]
        : null

      const model = this.selection
        ? this.selection.model
        : null

      const selection = this.selection

      const menuArgs = {
        selection,
        model,
        dbId,
        menu
      }

      const newMenu = this.emit('buildMenu', menuArgs)

      if (newMenu) {

        return newMenu
      }

      this.handlers.forEach((handler) => {

        menu = handler (menuArgs)
      })

      return this.options.buildMenu
        ? this.options.buildMenu(menu, dbId)
        : menu
    })

    this.viewer.setContextMenu(this.contextMenuHandler)

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    console.log('Viewing.Extension.ContextMenu loaded')

    return true;
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  addHandler (handler) {

    this.handlers.push (handler)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelection (event) {

    this.selection = event.selections.length
      ? event.selections[0]
      : null
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this.viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    const menu =
      new Autodesk.Viewing.Extensions.ViewerObjectContextMenu(
        this.viewer)

    this.viewer.setContextMenu(menu)

    console.log('Viewing.Extension.ContextMenu unloaded')

    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ContextMenuExtension.ExtensionId,
  ContextMenuExtension)
