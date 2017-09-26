import EventsEmitter from 'EventsEmitter'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
export default class SelectionTreeNode extends EventsEmitter {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (props) {

    super ()

    this.onExpand = this.onExpand.bind(this)

    this.on('expand', this.onExpand)

    this.instanceTree = props.instanceTree
    this.delegate     = props.delegate
    this.parent       = props.parent
    this.level        = props.level
    this.group        = props.group
    this.model        = props.model
    this.name         = props.name
    this.type         = props.type
    this.id           = props.id
    this.props        = props

    this.children     = []
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

    domContainer.className =
      'treenode-container click-trigger'

    this.domContainer = domContainer

    this.collapse()

    this.reactNode = ReactDOM.render(
      <ReactTreeNode
        className={this.type}
        name={this.name}
      />,
      this.domContainer)
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
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  loadChildren () {

    switch (this.type) {

      case 'root':

        this.children = this.props.childIds.map((id) => {

          const childNode = new SelectionTreeNode({
            name: this.instanceTree.getNodeName(id),
            instanceTree: this.instanceTree,
            delegate: this.delegate,
            level: this.level + 1,
            type: 'component',
            model: this.model,
            parent: this,
            group: true,
            id
          })

          this.addChild(childNode)

          return childNode
        })

        break
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  destroy () {

    this.children.forEach((child) => {

      child.destroy ()
    })

    ReactDOM.unmountComponentAtNode(
      this.domContainer)

    this.delegate.emit(
      'node.destroy', this)
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
