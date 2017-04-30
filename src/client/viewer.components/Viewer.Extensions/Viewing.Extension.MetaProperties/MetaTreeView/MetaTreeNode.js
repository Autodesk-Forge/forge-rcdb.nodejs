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

    this.collapse()

    this.reactNode = ReactDOM.render(
      <ReactTreeNode name={this.name}/>,
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

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
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
              delegate: this.delegate,
              name: prop.displayName,
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
  static propTypes = {
    className: PropTypes.string
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    className: ''
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  render() {

    const classNames = [
      'treenode',
      ...this.props.className.split(' ')
    ]

    return (
      <div className={classNames.join(' ')}>
        <Label text={this.props.name}/>
      </div>
    )
  }
}
