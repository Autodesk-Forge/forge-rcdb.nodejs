import ContextMenu from './DataContextMenu'
import DataTreeNode from './DataTreeNode'
import { TreeDelegate } from 'TreeView'


export default class DataTreeDelegate extends TreeDelegate {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super ()

    this.onContextDetails = this.onContextDetails.bind(this)

    this.contextMenu = new ContextMenu({
      container: props.menuContainer
    })

    this.contextMenu.on(
      'context.details',
      this.onContextDetails)

    this.on('node.dblClick', (node) => {

      //console.log(node)
    })

    this.derivativesAPI = props.derivativesAPI

    this.dmAPI = props.dmAPI
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onContextDetails (data) {

    switch (data.type) {

      case 'hubs':
        this.showPayload(
          `${this.dmAPI.apiUrl}/hubs/` +
          `${data.node.props.hubId}`)
        break

      case 'hubs.projects':
        this.showPayload(
          `${this.dmAPI.apiUrl}/hubs/` +
          `${data.node.props.hubId}/projects`)
        break

      case 'projects':
        this.showPayload(
          `${this.dmAPI.apiUrl}/hubs/` +
          `${data.node.props.hubId}/projects/` +
          `${data.node.props.projectId}`)
        break

      case 'top.folders.content':
        this.showPayload(
          `${this.dmAPI.apiUrl}/hubs/` +
          `${data.node.props.hubId}/projects/` +
          `${data.node.props.projectId}/topFolders`)
        break

      case 'folders':
        this.showPayload(
          `${this.dmAPI.apiUrl}/projects/` +
          `${data.node.props.projectId}/folders/` +
          `${data.node.props.folderId}`)
        break

      case 'folders.content':
        this.showPayload(
          `${this.dmAPI.apiUrl}/projects/` +
          `${data.node.props.projectId}/folders/` +
          `${data.node.props.folderId}/content`)
        break

      case 'items':
        this.showPayload(
          `${this.dmAPI.apiUrl}/projects/` +
          `${data.node.props.projectId}/items/` +
          `${data.node.props.itemId}`)
        break

      case 'items.manifest':
        this.showPayload(
          `${this.derivativesAPI.apiUrl}/manifest/` +
          `${data.node.viewerUrn}`)
        break

      case 'versions':
        this.showPayload(
          `${this.dmAPI.apiUrl}/projects/` +
          `${data.node.props.projectId}/items/` +
          `${data.node.props.itemId}/versions`)
          break
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  showPayload (uri, target = '_blank') {

    const link = document.createElement('a')

    document.body.appendChild(link)

    link.target = target
    link.href = uri
    link.click()

    document.body.removeChild(link)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createRootNode (props) {

    this.rootNode = new DataTreeNode(props)

    return this.rootNode
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  destroy () {

    this.rootNode.destroy()

    this.off()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createTreeNode (node, parentDomElement) {

    const container = document.createElement('div')

    parentDomElement.appendChild(container)

    node.type.split('.').forEach((cls) => {

      parentDomElement.classList.add(cls)
    })

    parentDomElement.classList.add('click-trigger')

    parentDomElement.style.width =
      `calc(100% - ${node.level * 25}px)`

    node.parentDomElement = parentDomElement

    node.mount(container)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  nodeClickSelector (event) {

    const className = event.target.className

    return (
      className.toLowerCase().indexOf('click-trigger') > -1
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  forEachChild (node, addChild) {

    node.addChild = addChild
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  filterNodes (filter, node = this.rootNode) {

    const name = node.name.toLowerCase()

    let visibleItems = 0

    if (node.children) {

      node.children.forEach((child) => {

        visibleItems += this.filterNodes(filter, child)
      })

      if (visibleItems) {

        node.parentDomElement.style.display ='inline-block'

      } else {

        node.parentDomElement.style.display =
          name.indexOf(filter) < 0
            ? 'none'
            : 'inline-block'
      }

    } else {

      if (name.indexOf(filter) < 0) {

        node.parentDomElement.style.display = 'none'

      } else {

        node.parentDomElement.style.display ='inline-block'

        ++visibleItems
      }
    }

    return visibleItems
  }
}
