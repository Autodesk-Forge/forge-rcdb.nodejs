import ContextMenu from './SearchContextMenu'
import SearchTreeNode from './SearchTreeNode'
import { TreeDelegate } from 'TreeView'

export default class SearchTreeDelegate extends TreeDelegate {

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

      case 'items':
        this.showPayload(
          `${this.dmAPI.apiUrl}/projects/` +
          `${data.node.props.projectId}/items/` +
          `${data.node.props.itemId}`)
        break

      case 'versions':
        this.showPayload(
          `${this.dmAPI.apiUrl}/projects/` +
          `${data.node.props.projectId}/versions/` +
          `${encodeURIComponent(data.node.props.versionId)}`)
        break

      case 'manifest':
        this.showPayload(
          `${this.derivativesAPI.apiUrl}/manifest/` +
          `${data.node.viewerUrn}`)
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
  createNode (props) {

    const node = new SearchTreeNode(
      Object.assign({}, props, {
        delegate: this,
        group: true
      }))

    if (props.id === 'root') {

      this.rootNode = node
    }

    return node
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
}
