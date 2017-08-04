import ContextMenu from './DataContextMenu'
import DataTreeNode from './DataTreeNode'
import { TreeDelegate } from 'TreeView'


export default class DataTreeDelegate extends TreeDelegate {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (menuContainer) {

    super ()

    this.contextMenu = new ContextMenu({
      container: menuContainer
    })

    this.on('node.dblClick', (node) => {

      console.log(node)
    })
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
      `calc(100% - ${node.level * 25 + 5}px)`

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
  onTreeNodeRightClick (tree, node, event) {

    if (node.type === 'property') {

      if (node.props.metaType !== undefined) {

        this.contextMenu.show(event, node)
      }
    }
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
