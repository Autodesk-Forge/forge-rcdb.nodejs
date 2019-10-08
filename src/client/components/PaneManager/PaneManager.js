import {ReflexContainer, ReflexSplitter} from 'react-reflex'
import PaneElement from './PaneElement'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import './PaneManager.scss'
import React from 'react'

class PaneManager extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    orientation: PropTypes.string.isRequired
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onLockSize = this.onLockSize.bind(this)

    this.state = {
      children: []
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onLockSize (data) {

    this.state[data.paneId] = this.state[data.paneId] || {
      minSizeInit: data.minSize,
      maxSizeInit: data.maxSize
    }

    const locked = !this.state[data.paneId].sizeLocked

    this.state[data.paneId].sizeLocked = locked

    if (locked) {

      this.state[data.paneId].minSize = data.size
      this.state[data.paneId].maxSize = data.size

    } else {

      this.state[data.paneId].minSize =
        this.state[data.paneId].minSizeInit

      this.state[data.paneId].maxSize =
        this.state[data.paneId].maxSizeInit
    }

    this.cloneChildren (this.props.children, this.state)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getDirection (children, childIdx) {

    return (
      childIdx === 0
      ? 1
      : (childIdx < children.length - 1 ? [1, -1] : -1)
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  flatMapChildren (children, fn) {

    return Array.prototype.concat.apply(
      [], React.Children.map(children, fn))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  guid (format = 'xxxxxxxxxxxx') {

    var d = new Date().getTime()

    return format.replace(/[xy]/g, (c) => {
      var r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  componentWillMount () {

    this.cloneChildren (this.props.children, this.state)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    this.cloneChildren (props.children, this.state)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  cloneChildren (children, state) {

    const nextChildren = this.flatMapChildren(
      children, (child, idx) => {

        const childId =
          (state.children.length > 2*idx)
            ? state.children[2*idx].props.id
            : null

        const childState = childId
          ? state[childId]
          : {}

        const newProps = Object.assign({}, child.props, {
          maxSize: child.props.maxSize || Number.MAX_VALUE,
          sizeLocked: child.props.sizeLocked || false,
          direction: this.getDirection(children, idx),
          minSize: child.props.minSize || 39,
          onLockSize: this.onLockSize,
          id: childId || this.guid(),
          title: child.props.title,
          myDiv:null
        }, childState)

        const showSplitter = (idx < children.length - 1)

        const splitterStyle = {
          display: showSplitter ? 'block' : 'none'
        }

        const splitter =
          <ReflexSplitter
            style={splitterStyle} propagate={showSplitter}
          />

        const paneElement =
          <PaneElement {...newProps}>
            { React.cloneElement(child, child.props) }
          </PaneElement>

        return [ paneElement, splitter]
      })

    this.setState(Object.assign({},
      this.state, state, {
        children: nextChildren
      }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <ReflexContainer orientation={this.props.orientation}>
        { this.state.children }
      </ReflexContainer>
    )
  }
}

export default PaneManager
