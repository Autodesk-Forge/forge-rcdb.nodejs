import EventsEmitter from 'EventsEmitter'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

export default class FilterTreeNode extends EventsEmitter {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super ()

    this.setChecked = this.setChecked.bind(this)

    this.onExpand = this.onExpand.bind(this)

    this.on('expand', this.onExpand)

    this.instanceTree = props.instanceTree
    this.delegate     = props.delegate
    this.disabled     = props.disabled
    this.checked      = props.checked
    this.parent       = props.parent
    this.group        = props.group
    this.name         = props.name
    this.type         = props.type
    this.id           = props.id

    this.children = []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onExpand () {

    this.off('expand', this.onExpand)

    this.loadChildren()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setDisabled (disabled) {

    this.disabled = disabled

    this.reactNode = ReactDOM.render(
      <ReactTreeNode onChecked={this.setChecked}
        disabled={this.disabled}
        checked={this.checked}
        name={this.name}/>,
      this.domContainer)

    if (disabled || this.checked) {

      this.children.forEach((child) => {

        child.setDisabled (disabled, true)
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setChecked (checked) {

    this.checked = checked

    this.delegate.emit(
      'node.checked', this)

    this.children.forEach((child) => {

      child.setDisabled (!checked)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  mount (domContainer) {

    this.domContainer = domContainer

    this.collapse()

    this.reactNode = ReactDOM.render(
      <ReactTreeNode onChecked={this.setChecked}
        disabled={this.disabled}
        checked={this.checked}
        name={this.name}/>,
      this.domContainer)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  expand () {

    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('collapsed')
    target.classList.add('expanded')

    this.emit('expand')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  collapse () {

    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('expanded')
    target.classList.add('collapsed')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadChildren () {

    const childIds = this.getChildIds(this.id)

    this.children = childIds.map((id) => {

      const childNode = new FilterTreeNode({
        disabled: this.disabled || !this.checked,
        name: this.instanceTree.getNodeName(id),
        group: this.getChildIds(id).length,
        instanceTree: this.instanceTree,
        delegate: this.delegate,
        checked: true,
        parent: this,
        type: '',
        id
      })

      this.addChild(childNode)

      return childNode
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  destroy () {

    this.children.forEach((child) => {

      child.destroy ()
    })

    ReactDOM.unmountComponentAtNode(
      this.domContainer)

    this.delegate.emit(
      'node.destroy', this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const classNames = [
      'treenode',
      ...this.props.className.split(' ')
    ]

    return (
      <div className={classNames.join(' ')}>
        <Switch onChange={(checked) => this.props.onChecked(checked)}
          disabled={this.props.disabled}
          checked={this.props.checked}
          className="handle-click"/>
        <Label text={this.props.name}/>
      </div>
    )
  }
}
