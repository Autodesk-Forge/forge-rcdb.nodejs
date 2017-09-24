import FilterTreeNode from './FilterTreeNode'
import { TreeDelegate } from 'TreeView'


export default class FilterTreeDelegate extends TreeDelegate {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (model) {

    super ()

    this.instanceTree = model.getData().instanceTree
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createRootNode () {

    const rootId = this.instanceTree.getRootId()

    this.rootNode = new FilterTreeNode({

      name: this.instanceTree.getNodeName(rootId),
      group: this.getChildIds(rootId).length,
      instanceTree: this.instanceTree,
      delegate: this,
      checked: true,
      parent: null,
      type: 'root',
      id: rootId
    })

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
  createTreeNode (node, parentDomElement, options = {}) {

    const container = document.createElement('div')

    parentDomElement.appendChild(container)

    node.mount(container)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  nodeClickSelector (event) {

    const targetCls = event.target.parentNode.className
    const parentCls = event.target.className

    if (parentCls.indexOf('handle-click') > -1 ||
        targetCls.indexOf('handle-click') > -1) {

      return false
    }

    return true
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
  getChildIds (nodeId) {

    const childIds = []

    this.instanceTree.enumNodeChildren(nodeId,
      (childId) => {

        childIds.push(childId)
      })

    return childIds
  }
}
