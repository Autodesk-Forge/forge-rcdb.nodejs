import EventsEmitter from 'EventsEmitter'
import Spinner from 'react-spinkit'
import PropTypes from 'prop-types'
import sortBy from 'lodash/sortBy'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

export default class MetaTreeNode extends EventsEmitter {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super()

    this.onModelDelete = this.onModelDelete.bind(this)
    this.onModelEdit = this.onModelEdit.bind(this)
    this.onExpand = this.onExpand.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onEdit = this.onEdit.bind(this)

    this.on('expand', this.onExpand)

    this.externalId = props.externalId
    this.component = props.component
    this.delegate = props.delegate
    this.parent = props.parent
    this.group = props.group
    this.type = props.type
    this.dbId = props.dbId
    this.id = props.id

    this.children = []

    this.props = props
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onExpand () {
    this.off('expand', this.onExpand)

    this.loadChildren()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  mount (domContainer) {
    domContainer.className = 'treenode-container'

    this.domContainer = domContainer

    this.reactNode = ReactDOM.render(
      <ReactTreeNode {...this.props} />,
      this.domContainer)

    this.collapse()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  update (metaProperty) {
    this.props = Object.assign({},
      this.props, metaProperty)

    this.reactNode = ReactDOM.render(
      <ReactTreeNode {...this.props} />,
      this.domContainer)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  destroy () {
    if (this.children) {
      this.children.forEach((child) => {
        child.destroy()
      })
    }

    ReactDOM.unmountComponentAtNode(
      this.domContainer)

    this.delegate.emit(
      'node.destroy', this.id)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  expand () {
    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('collapsed')
    target.classList.add('expanded')

    this.expanded = true

    this.emit('expand')
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  collapse () {
    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('expanded')
    target.classList.add('collapsed')

    this.expanded = false
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  toMetaProperty (props = this.props) {
    const baseProperty = Object.assign({
      displayCategory: props.displayCategory,
      displayValue: props.displayValue,
      displayName: props.displayName,
      externalId: props.externalId,
      component: props.component,
      metaType: props.metaType,
      dbId: props.dbId,
      id: props.id
    }, props.isOverride ? {
      isOverride: true
    } : {})

    switch (props.metaType) {
      case 'Link':

        return Object.assign({}, baseProperty, {
          link: props.link
        })

      case 'File':

        return Object.assign({}, baseProperty, {
          filelink: props.filelink,
          filename: props.filename,
          filesize: props.filesize,
          fileId: props.fileId
        })

      case 'Double':
      case 'Text':
      case 'Int':

        return baseProperty

      default:

        return Object.assign({}, baseProperty, {
          displayCategory:
            props.displayCategory || 'Other',
          isOverride: true,
          metaType: 'Text'
        })
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onModelEdit (props) {
    const metaProperty = await this.delegate.emit(
      'property.edit',
      this.toMetaProperty(props), true)

    if (metaProperty) {
      this.delegate.emit(
        'node.update',
        metaProperty)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onModelDelete (props) {
    const metaProperty = await this.delegate.emit(
      'property.delete',
      this.toMetaProperty(props), true)

    if (metaProperty) {
      this.delegate.emit(
        'node.destroy',
        metaProperty.id)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onEdit (props) {
    const metaProperty = await this.delegate.emit(
      'property.edit',
      this.toMetaProperty(props))

    if (metaProperty) {
      this.delegate.emit(
        'node.update',
        metaProperty)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onDelete (props) {
    const metaProperty = await this.delegate.emit(
      'property.delete',
      this.toMetaProperty(props))

    if (metaProperty) {
      this.delegate.emit(
        'node.destroy',
        metaProperty.id)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  loadChildren () {
    switch (this.type) {
      case 'root':

        const categories = sortBy(
          Object.keys(this.props.propsMap), (item) => {
            return item
          })

        this.children = categories.map((category) => {
          const childNode = new MetaTreeNode({
            properties: this.props.propsMap[category],
            externalId: this.externalId,
            component: this.component,
            delegate: this.delegate,
            displayName: category,
            type: 'category',
            dbId: this.dbId,
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
              onModelDelete: this.onModelDelete,
              onModelEdit: this.onModelEdit,
              externalId: this.externalId,
              id: prop.id || this.guid(),
              component: this.component,
              delegate: this.delegate,
              onDelete: this.onDelete,
              onEdit: this.onEdit,
              type: 'property',
              dbId: this.dbId,
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
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderModelProperty () {
    return (
      <div className='treenode'>
        <Label
          className='meta-name click-trigger'
          text={this.props.displayName}
        />

        <div className='separator' />

        <Label
          className='meta-value editable'
          text={this.props.displayValue.toString()}
        />
        <span
          className='fa fa-edit'
          onClick={() => {
            this.props.onModelEdit(this.props)
          }}
        />
        <span
          className='fa fa-times'
          onClick={() => {
            this.props.onModelDelete(this.props)
          }}
        />
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderTextProperty () {
    return (
      <div className='treenode'>
        <Label
          className='meta-name click-trigger'
          text={this.props.displayName}
        />

        <div className='separator' />

        <Label
          className='meta-value editable'
          text={this.props.displayValue.toString()}
        />
        <span
          className='fa fa-edit'
          onClick={() => this.props.onEdit(this.props)}
        />
        <span
          className='fa fa-times'
          onClick={() => this.props.onDelete(this.props)}
        />
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderLinkProperty () {
    return (
      <div className='treenode'>
        <Label
          className='meta-name click-trigger'
          text={this.props.displayName}
        />

        <div className='separator' />

        <div className='meta-value meta-link editable'>
          <a
            target='_blank' href={this.props.link}
            onClick={() => this.onGoToLink(this.props.link)}
          >
            {this.props.displayValue}
          </a>
        </div>
        <span
          className='fa fa-edit'
          onClick={() => this.props.onEdit(this.props)}
        />
        <span
          className='fa fa-times'
          onClick={() => this.props.onDelete(this.props)}
        />
      </div>
    )
  }

  onGoToLink (href) {
    const a = document.createElement('a')

    a.target = '_blank'
    a.href = href

    a.click()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderFileProperty () {
    const displayLink = this.props.displayCategory +
      '/' + this.props.displayName +
      '/' + this.props.displayValue +
      '/' + this.props.filename

    const spinnerStyle = {
      display: 'none'
    }

    return (
      <div className='treenode'>
        <Label
          className='meta-name click-trigger'
          text={this.props.displayName}
        />

        <div className='separator' />

        <div className='meta-value meta-file editable'>
          <Spinner
            spinnerName='cube-grid'
            style={spinnerStyle}
          />
          <a
            target='_blank' href={displayLink}
            onClick={() => this.onDownloadFile(
              this.props.filename,
              this.props.filelink)}
          >
            {this.props.displayValue}
          </a>
        </div>
        <span
          className='fa fa-edit'
          onClick={() => this.props.onEdit(this.props)}
        />
        <span
          className='fa fa-times'
          onClick={() => this.props.onDelete(this.props)}
        />
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onDownloadFile (filename, href) {
    const a = document.createElement('a')

    a.download = filename
    a.href = href

    a.click()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderPropertyTreeNode () {
    switch (this.props.metaType) {
      case 'File':
        return this.renderFileProperty()

      case 'Link':
        return this.renderLinkProperty()

      case 'Double':
      case 'Text':
      case 'Int':
        return this.renderTextProperty()

      default:
        return this.renderModelProperty()
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderDefaultTreeNode () {
    return (
      <div className='treenode'>
        <Label text={this.props.displayName} />
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    switch (this.props.type) {
      case 'property':
        return this.renderPropertyTreeNode()

      default:
        return this.renderDefaultTreeNode()
    }
  }
}
