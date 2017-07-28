import ContextMenu from './MetaContextMenu'
import MetaTreeNode from './MetaTreeNode'
import { TreeDelegate } from 'TreeView'

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
export default class MetaTreeDelegate extends TreeDelegate {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (menuContainer) {

    super ()

    this.contextMenu = new ContextMenu({
      container: menuContainer
    })

    this.contextMenu.on(
      'context.property.edit',
      async (metaProperty, isModelOverride) => {

        const newMetaProperty = await this.emit(
          'property.edit',
          metaProperty, isModelOverride)

        if (newMetaProperty) {

          this.emit('node.update',
            newMetaProperty)
        }
      })

    this.contextMenu.on(
      'context.property.delete',
      async (metaProperty, isModelOverride) => {

        const deleted = await this.emit(
          'property.delete',
          metaProperty, isModelOverride)

        if (deleted) {

          this.emit('node.destroy',
            metaProperty.id)
        }
      })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createRootNode (data) {

    this.rootNode = new MetaTreeNode({
      displayName: data.displayName,
      externalId: data.externalId,
      dbId: data.dbId.toString(),
      component: data.component,
      propsMap: data.propsMap,
      delegate: this,
      parent: null,
      type: 'root',
      group: true,
      id: 'root'
    })

    return this.rootNode
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  destroy () {

    this.rootNode.destroy()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createTreeNode (node, parentDomElement) {

    const container = document.createElement('div')

    parentDomElement.appendChild(container)

    node.type.split('.').forEach((cls) => {

      parentDomElement.classList.add(cls)
    })

    node.mount(container)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  nodeClickSelector (event) {

    const selector = ['HEADER', 'LABEL']

    return (selector.indexOf(event.target.nodeName) > -1)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onTreeNodeRightClick (tree, node, event) {

    if (node.type === 'property') {

      this.contextMenu.show(event, node)
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  forEachChild (node, addChild) {

    node.addChild = addChild
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  mapPropsByCategory (properties) {

    const propsMap = {}

    properties.forEach((prop) => {

      const category = !!prop.displayCategory
        ? prop.displayCategory
        : 'Other'

      if (category.indexOf('__') !== 0) {

        propsMap[category] = propsMap[category] || []

        propsMap[category].push(prop)
      }
    })

    // sort props by displayName in each category

    for (let category in propsMap) {

      propsMap[category] = _.sortBy(
        propsMap[category], (prop) => {
          return prop.displayName
        })
    }

    return propsMap
  }
}
