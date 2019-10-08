
import EventsEmitter from 'EventsEmitter'
import ContextMenu from 'ContextMenu'

export default class MetaContextMenu extends
  EventsEmitter.Composer(Autodesk.Viewing.UI.ObjectContextMenu) {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (opts) {
    super(opts)

    this.contextMenu = new ContextMenu(opts)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  buildMenu (event, node) {
    const menu = [{
      title: 'Edit property ...',
      icon: 'fa fa-edit',
      target: () => {
        this.emit('context.property.edit', node)
      }
    }, {
      title: 'Delete property',
      icon: 'fa fa-times',
      target: () => {
        this.emit('context.property.delete', node)
      }
    }]

    return menu
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  show (event, node) {
    const menu = this.buildMenu(event, node)

    if (menu && menu.length > 0) {
      this.contextMenu.show(event, menu)
    }
  }
}
