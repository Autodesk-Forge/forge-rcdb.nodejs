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
  update (metaProperty) {

    this.props = Object.assign({}, this.props, metaProperty)

    this.reactNode = ReactDOM.render(
      <ReactTreeNode {...this.props}/>,
      this.domContainer)
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
      'node.destroy', this.id)
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
  toMetaProperty (props = this.props) {

    switch (props.metaType) {

      case 'Text':

        return {
          displayCategory: props.displayCategory,
          displayValue: props.displayValue,
          displayName: props.displayName,
          metaType: props.metaType,
          dbId: props.dbId,
          id: props.id
        }

      case 'Link':

        return {
          displayCategory: props.displayCategory,
          displayValue: props.displayValue,
          displayName: props.displayName,
          metaType: props.metaType,
          link: props.link,
          dbId: props.dbId,
          id: props.id
        }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onEdit (props) {

    const newMetaProperty = await this.delegate.emit(
      'property.edit',
      this.toMetaProperty(props))

    if (newMetaProperty) {

      this.delegate.emit(
        'node.update', newMetaProperty)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onDelete (props) {

    const deleted = await this.delegate.emit(
      'property.delete',
      this.toMetaProperty(props))

    if (deleted) {

      this.delegate.emit('node.destroy', props.id)
    }
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
            displayName: category,
            type: 'category',
            id: this.guid(),
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
          this.props.properties.map((prop) => {

            const fullProp = Object.assign({}, prop, {
              delegate: this.delegate,
              onDelete: this.onDelete,
              onEdit: this.onEdit,
              type: 'property',
              parent: this,
              group: false
            })

            const childNode = new MetaTreeNode(fullProp)

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
        <Label className="meta-name"
          text={this.props.displayName}
        />
        <Label className="meta-value"
          text={this.props.displayValue.toString()}
        />
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
        <Label className="meta-name"
          text={this.props.displayName}
        />
        <Label className="meta-value editable"
          text={this.props.displayValue.toString()}
        />
        <span className="fa fa-edit"
          onClick={() => this.props.onEdit(this.props)}
        />
        <span className="fa fa-times"
          onClick={() => this.props.onDelete(this.props)}
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
        <Label className="meta-name"
          text={this.props.displayName}
        />
        <div className="meta-value meta-link editable">
          <a target="_blank" href={this.props.link}
            onClick={() => this.onGoToLink (this.props.link)}>
            {this.props.displayValue}
          </a>
        </div>
        <span className="fa fa-edit"
          onClick={() => this.props.onEdit(this.props)}
        />
        <span className="fa fa-times"
          onClick={() =>this.props.onDelete(this.props)}
        />
      </div>
    )
  }

  onGoToLink (href) {

    let a = document.createElement('a')

    a.target = '_blank'
    a.href = href

    a.click()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderPropertyTreeNode () {

    switch (this.props.metaType) {

      case 'Link':
        return this.renderLinkProperty()

      case 'Text':
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
        <Label text={this.props.displayName}/>
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
