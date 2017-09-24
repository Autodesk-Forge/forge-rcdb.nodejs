import SelectionTreeNode from './SelectionTreeNode'
import { TreeDelegate } from 'TreeView'

export default class SelectionTreeDelegate extends TreeDelegate {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createRootNode (selection) {

    this.selection = selection || {}

    this.instanceTree = this.selection.model
      ? selection.model.getData().instanceTree
      : null

    const childIds = this.selection.dbIds || []

    const rootId = this.instanceTree
      ? this.instanceTree.getRootId()
      : 'root'

    this.rootNode = new SelectionTreeNode({
      name: `Your Selection [${childIds.length} Components]`,
      instanceTree: this.instanceTree,
      model: this.selection.model,
      delegate: this,
      parent: null,
      type: 'root',
      group: true,
      id: rootId,
      level: 0,
      childIds
    })

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

    parentDomElement.style.width =
      `calc(100% - ${node.level * 25 + 5}px)`

    parentDomElement.classList.add(
      'click-trigger')

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
  onTreeNodeClick (tree, node, event) {

    if (this.nodeClickSelector(event)) {

      clearTimeout(this.clickTimeout)

      this.clickTimeout = setTimeout(() => {

        this.emit('node.click', node)

      }, 200)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  forEachChild (node, addChild) {

    node.addChild = addChild
  }
}
