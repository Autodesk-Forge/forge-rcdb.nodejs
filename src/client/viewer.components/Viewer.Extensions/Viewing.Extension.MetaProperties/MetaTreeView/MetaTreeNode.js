import EventsEmitter from 'EventsEmitter'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
export default class MetaTreeNode extends EventsEmitter {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (props) {

    super ()

    this.onExpand = this.onExpand.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onEdit = this.onEdit.bind(this)

    this.on('expand', this.onExpand)

    this.delegate     = props.delegate
    this.parent       = props.parent
    this.group        = props.group
    this.name         = props.name
    this.type         = props.type
    this.id           = props.id

    this.children = []

    this.props = props
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onExpand () {

    this.off('expand', this.onExpand)

    this.loadChildren()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  mount (domContainer) {

    domContainer.className = 'treenode-container'

    this.domContainer = domContainer

    this.reactNode = ReactDOM.render(
      <ReactTreeNode {...this.props}/>,
      this.domContainer)

    this.collapse()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  destroy () {

    if (this.children) {

      this.children.forEach((child) => {

        child.destroy ()
      })
    }

    ReactDOM.unmountComponentAtNode(
      this.domContainer)

    this.delegate.emit(
      'node.destroy', this)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  expand () {

    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('collapsed')
    target.classList.add('expanded')

    this.expanded = true

    this.emit('expand')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  collapse () {

    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('expanded')
    target.classList.add('collapsed')

    this.expanded = false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  propsToMetaProperty (props = this.props) {

    return {
      displayValue: props.value,
      metaType: props.metaType,
      displayName: props.name,
      id: props.id
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onEdit (props) {

    this.delegate.emit('property.edit',
      this.propsToMetaProperty(props))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onDelete (props) {

    this.delegate.emit('property.delete',
      this.propsToMetaProperty(props))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadChildren () {

    switch (this.type) {

      case 'root':

        const categories = _.sortBy(
          Object.keys(this.props.propsMap), (item) => {
            return item
          })

        this.children = categories.map((category) => {

          const childNode = new MetaTreeNode({
            properties: this.props.propsMap[category],
            delegate: this.delegate,
            type: 'category',
            id: this.guid(),
            name: category,
            parent: this,
            group: true
          })

          this.addChild(childNode)

          childNode.expand()

          return childNode
        })

        break

      case 'category':

        this.children =
          this.props.properties.forEach((prop) => {

            const childNode = new MetaTreeNode({
              id: prop.id || this.guid(),
              value: prop.displayValue,
              metaType: prop.metaType,
              delegate: this.delegate,
              onDelete: this.onDelete,
              name: prop.displayName,
              onEdit: this.onEdit,
              type: 'property',
              parent: this,
              group: false
            })

            this.addChild(childNode)

            return childNode
        })
    }
  }
}

class ReactTreeNode extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderNativeProperty () {

    return (
      <div className="treenode">
        <Label text={this.props.name}/>
        <Label text={this.props.value.toString()}/>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTextProperty () {

    return (
      <div className="treenode">
        <Label text={this.props.name}/>
        <Label text={this.props.value.toString()}
          className="meta-value"/>
        <span className="fa fa-edit"
          onClick={() => this.props.onEdit(this.props)}
        />
        <span className="fa fa-times"
          onClick={() =>this.props.onDelete(this.props)}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderLinkProperty () {

    return (
      <div className="treenode">
        <Label text={this.props.name}/>
        <Label text={this.props.value}/>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderPropertyTreeNode () {

    switch (this.props.metaType) {

      case 'link':
        return this.renderLinkProperty()

      case 'text':
        return this.renderTextProperty()

      default:
        return this.renderNativeProperty()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderDefaultTreeNode () {

    return (
      <div className="treenode">
        <Label text={this.props.name}/>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    switch (this.props.type) {

      case 'property':
        return this.renderPropertyTreeNode()

      default:
        return this.renderDefaultTreeNode()
    }
  }
}
