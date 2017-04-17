import EventsEmitter from 'EventsEmitter'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
export default class RayTreeNode extends EventsEmitter {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (props) {

    super ()

    this.onChecked = this.onChecked.bind(this)

    this.onExpand = this.onExpand.bind(this)

    this.on('expand', this.onExpand)

    this.checked = false
    this.children = []

    this.instanceTree = props.instanceTree
    this.disabled     = props.disabled
    this.parent       = props.parent
    this.group        = props.group
    this.name         = props.name
    this.type         = props.type
    this.id           = props.id
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
  setDisabled (disabled) {

    this.disabled = disabled

    this.reactNode = ReactDOM.render(
      <ReactTreeNode onChecked={this.onChecked}
        disabled={this.disabled}
        name={this.name}/>,
      this.domContainer)

    if (disabled || this.checked) {

      this.children.forEach((child) => {

        child.setDisabled (disabled, true)
      })
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onChecked (checked) {

    this.checked = checked

    this.emit('checked', this)

    this.children.forEach((child) => {

      child.setDisabled (!checked)
    })
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
      <ReactTreeNode onChecked={this.onChecked}
        disabled={this.disabled}
        name={this.name}/>,
      this.domContainer)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  unmount () {

    this.children.forEach((child) => {

      child.unmount()
    })

    ReactDOM.unmountComponentAtNode(this.domContainer)

    this.off()
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

    const childIds = this.getChildIds(this.id)

    this.children = childIds.map((id) => {

      const childNode = new RayTreeNode({
        name: this.instanceTree.getNodeName(id),
        group: this.getChildIds(id).length,
        instanceTree: this.instanceTree,
        disabled: true,
        parent: this,
        type: '',
        id
      })

      childNode.on('checked', (node) => {

        this.emit('checked', node)
      })

      this.addChild(childNode)

      return childNode
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getChildIds (nodeId) {

    const childIds = []

    this.instanceTree.enumNodeChildren(nodeId,
      (childId) => {

        childIds.push(childId)
      })

    return childIds
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
        <Switch onChange={(checked) => this.props.onChecked(checked)}
          disabled={this.props.disabled}
          checked={false}/>
        <Label text={this.props.name}/>
      </div>
    )
  }
}
