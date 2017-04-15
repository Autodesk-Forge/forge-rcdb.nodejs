import { BaseTreeDelegate } from 'TreeView'
import TreeNode from './TreeNode'

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
export default class TreeDelegate extends BaseTreeDelegate {

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
  createTreeNode (node, parentDOMElement, options = {}) {

    const container = document.createElement('div')

    parentDOMElement.appendChild(container)

    const nodeLabel = this.getTreeNodeLabel(node)



    node.expand = () => {
      $(parentDOMElement).parent().removeClass('collapsed')
      $(parentDOMElement).parent().addClass('expanded')
    }

    node.collapse = () => {
      $(parentDOMElement).parent().removeClass('expanded')
      $(parentDOMElement).parent().addClass('collapsed')
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChildCallback) {

    const childIds = this.getNodeChildIds(node.id)

    childIds.forEach((id) => {

      const childNode = new TreeNode({
        name: this.instanceTree.getNodeName(id),
        group: this.getNodeChildIds(id).length,
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
