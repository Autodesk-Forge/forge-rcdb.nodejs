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
  load() {

    this.contextMenuHandler = new ContextMenuHandler(
      this.viewer, {
        buildMenu: (menu) => {

          const newMenu = this.emit('buildMenu', {
            selectedDbId: this.selectedDbId,
            menu
          })

          if (newMenu) {

            return _.flatten(newMenu)
          }

          return this.options.buildMenu
            ? this.options.buildMenu(menu, this.selectedDbId)
            : menu
        }
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
  onSelection (event) {

    if (event.selections && event.selections.length) {

      const selection = event.selections[0]

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
