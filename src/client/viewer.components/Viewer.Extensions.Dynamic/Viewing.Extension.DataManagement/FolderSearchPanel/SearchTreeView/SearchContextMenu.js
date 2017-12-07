
import EventsEmitter from 'EventsEmitter'
import ContextMenu from 'ContextMenu'

export default class SearchContextMenu extends
  EventsEmitter.Composer (Autodesk.Viewing.UI.ObjectContextMenu) {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (opts) {

    super (opts)

    this.contextMenu = new ContextMenu(opts)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  buildMenu (event, node) {

    var menu = []

    switch (node.type) {

      case 'folders':

        menu.push({
          title: 'Show details',
          icon: 'fa fa-share',
          target: [{
            title: 'Folder details',
            icon: 'fa fa-folder',
            target: () => {
              this.emit('context.details', {
                event, node, type: 'folders'
              })
            }
          }, {
            title: 'Folder content',
            icon: 'fa fa-folder-open',
            target: () => {
              this.emit('context.details', {
                event, node, type: 'folders.content'
              })
            }
          }]
        })

        //menu.push({
        //  title: 'Create new folder',
        //  icon: 'fa fa-plus',
        //  target: () => {
        //    this.emit('context.folder.create', {
        //      event, node
        //    })
        //  }
        //})

        break

      case 'items':

        menu.push({
          title: 'Show item details',
          icon: 'fa fa-file-text',
          target: () => {
            this.emit('context.details', {
              event, node, type: 'items'
            })
          }
        })

        if (node.viewerUrn) {

          menu.push({
            title: 'Show manifest',
            icon: 'fa fa-cubes',
            target: () => {
              this.emit('context.details', {
                event, node, type: 'manifest'
              })
            }
          })
        }

        break

      case 'versions':

        menu.push({
          title: 'Show version details',
          icon: 'fa fa-file-text',
          target: () => {
            this.emit('context.details', {
              event, node, type: 'versions'
            })
          }
        })

        if (node.viewerUrn) {

          menu.push({
            title: 'Show manifest',
            icon: 'fa fa-cubes',
            target: () => {
              this.emit('context.details', {
                event, node, type: 'manifest'
              })
            }
          })
        }

        break
    }

    return menu
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  show (event, node) {

    var menu = this.buildMenu(event, node)

    if (menu && 0 < menu.length) {

      this.contextMenu.show(event, menu)
    }
  }
}
