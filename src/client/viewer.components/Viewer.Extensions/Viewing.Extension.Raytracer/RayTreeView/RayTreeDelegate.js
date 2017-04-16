import { TreeDelegate } from 'TreeView'
import RayTreeNode from './RayTreeNode'

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
export default class RayTreeDelegate extends TreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (model) {

    super ()

    this.instanceTree = model.getData().instanceTree
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  buildNode (data) {

    return new RayTreeNode({
      name: this.instanceTree.getNodeName(data.id),
      group: this.getNodeChildIds(data.id).length,
      parent: data.parent,
      type: data.type,
      id: data.id
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parentDomElement, options = {}) {

    const container = document.createElement('div')

    parentDomElement.appendChild(container)

    node.connect(container)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChildCallback) {

    const childIds = this.getNodeChildIds(node.id)

    childIds.forEach((id) => {

      const childNode = this.buildNode({
        parent: node,
        type: '',
        id
      })

      addChildCallback(childNode)

      childNode.collapse()
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getNodeChildIds (nodeId) {

    const childIds = []

    this.instanceTree.enumNodeChildren(nodeId,
      (childId) => {

        childIds.push(childId)
      })

    return childIds
  }
}
