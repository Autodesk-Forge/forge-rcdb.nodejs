
import EventsEmitter from 'EventsEmitter'
import ContextMenu from 'ContextMenu'

export default class MetaContextMenu extends
  EventsEmitter.Composer (Autodesk.Viewing.UI.ObjectContextMenu) {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (opts) {

    super (opts)

    this.contextMenu = new ContextMenu(opts)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  nodeToMeta (node) {

    const metaProperty = {
      displayValue: node.props.value,
      metaType: node.props.metaType,
      displayName: node.props.name,
      id: node.props.id
    }

    return metaProperty
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  buildMenu (event, node) {

    const menu = [{
      title: 'Edit property ...',
      className: 'fa fa-edit',
      target: () => {
        this.emit('context.property.edit',
          node.propsToMetaProperty())
      }
    },{
      title: 'Delete property',
      className: 'fa fa-times',
      target: () => {
        this.emit('context.property.delete',
          node.propsToMetaProperty())
      }
    }]

    return menu
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  show (event, node) {

    const menu = this.buildMenu(event, node)

    if (menu && 0 < menu.length) {

      this.contextMenu.show(event, menu)
    }
  }
}
