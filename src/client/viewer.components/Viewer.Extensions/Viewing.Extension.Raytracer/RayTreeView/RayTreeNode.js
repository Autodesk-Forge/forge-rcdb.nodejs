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
export default class TreeNode extends EventsEmitter {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (props) {

    super ()

    this.onChecked = this.onChecked.bind(this)

    this.parent = props.parent
    this.group  = props.group
    this.name   = props.name
    this.type   = props.type
    this.id     = props.id
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onChecked (checked) {

    this.emit('checked', checked)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  connect (domContainer) {

    this.domContainer = domContainer

    this.domContainer.className = 'treenode-container'

    ReactDOM.render(
      <ReactTreeNode onChecked={this.onChecked}/>,
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
}


class ReactTreeNode extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    className: PropTypes.string,
    showTitle: PropTypes.bool
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    showTitle: true,
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
          checked={true}/>
        <Label text={'Node'}/>
      </div>
    )
  }
}
