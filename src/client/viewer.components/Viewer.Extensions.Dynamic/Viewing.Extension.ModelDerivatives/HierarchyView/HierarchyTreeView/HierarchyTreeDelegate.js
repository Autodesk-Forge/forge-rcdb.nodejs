import HierarchyTreeNode from './HierarchyTreeNode'
import { TreeDelegate } from 'TreeView'

export default class HierarchyTreeDelegate extends TreeDelegate {

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
  createRootNode (hierarchy) {

    const rootId = hierarchy.objectid

    this.rootNode = new HierarchyTreeNode({
      hierarchy: hierarchy.objects,
      group: !!hierarchy.objects,
      name: hierarchy.name,
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
}
