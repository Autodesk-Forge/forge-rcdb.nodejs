import ContextMenu from './MetaContextMenu'
import MetaTreeNode from './MetaTreeNode'
import { TreeDelegate } from 'TreeView'
import sortBy from 'lodash/sortBy'

export default class MetaTreeDelegate extends TreeDelegate {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (menuContainer) {
    super()

    this.contextMenu = new ContextMenu({
      container: menuContainer
    })

    this.contextMenu.on(
      'context.property.delete', (node) => {
        this.onDeleteProperty(node)
      })

    this.contextMenu.on(
      'context.property.edit', (node) => {
        this.onEditProperty(node)
      })

    this.on('node.dblClick', (node) => {
      this.onEditProperty(node)
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onEditProperty (node) {
    const isModelOverride = !node.props.metaType

    const newMetaProperty = await this.emit(
      'property.edit',
      node.toMetaProperty(),
      isModelOverride)

    if (newMetaProperty) {
      this.emit('node.update',
        newMetaProperty)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onDeleteProperty (node) {
    const isModelOverride = !node.props.metaType

    const deleted = await this.emit(
      'property.delete',
      node.toMetaProperty(), isModelOverride)

    if (deleted) {
      this.emit('node.destroy',
        node.id)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
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

  /// //////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////
  destroy () {
    this.rootNode.destroy()
  }

  /// //////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////
  createTreeNode (node, parentDomElement) {
    const container = document.createElement('div')

    parentDomElement.appendChild(container)

    node.type.split('.').forEach((cls) => {
      parentDomElement.classList.add(cls)
    })

    parentDomElement.classList.add(
      'click-trigger')

    node.mount(container)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  nodeClickSelector (event) {
    const className = event.target.className

    return (
      className.toLowerCase().indexOf('click-trigger') > -1
    )
  }

  /// ////////////////////////////////////////////////////////////////
  //
  //
  /// ////////////////////////////////////////////////////////////////
  onTreeNodeRightClick (tree, node, event) {
    if (node.type === 'property') {
      this.contextMenu.show(event, node)
    }
  }

  /// //////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////
  forEachChild (node, addChild) {
    node.addChild = addChild
  }

  /// //////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////
  mapPropsByCategory (properties) {
    const propsMap = {}

    properties.forEach((prop) => {
      const category = prop.displayCategory
        ? prop.displayCategory
        : 'Other'

      if (category.indexOf('__') !== 0) {
        propsMap[category] = propsMap[category] || []

        propsMap[category].push(prop)
      }
    })

    // sort props by displayName in each category

    for (const category in propsMap) {
      propsMap[category] = sortBy(
        propsMap[category], (prop) => {
          return prop.displayName
        })
    }

    return propsMap
  }
}
