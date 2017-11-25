//////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'
import Stopwatch from 'Stopwatch'
import ReactDOM from 'react-dom'
import easing from 'easing-js'
import React from 'react'
import './Panel.scss'

class Panel extends EventsEmitter {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    maxHeight: Infinity,
    maxWidth: Infinity,
    draggable: true,
    minHeight: 35,
    minWidth: 300,
    className: '',
    style: {},
    document
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super ()

    this.props = Object.assign({},
      Panel.defaultProps, props)

    this.onStartDragging = this.onStartDragging.bind(this)
    this.onStartResizing = this.onStartResizing.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)

    this.renderable = this.props.renderable

    this.container = this.props.container

    this.document = this.props.document

    this.document.addEventListener(
      'touchend', this.onMouseUp)

    this.document.addEventListener(
      'mouseup', this.onMouseUp)

    this.document.addEventListener(
      'mousemove', this.onMouseMove)

    this.document.addEventListener(
      'touchmove', this.onMouseMove)

    this.react = this.props.react

    this.id = this.props.id

    this.react.setState({

      width: props.width || 300,
      left: props.left || 10,
      top: props.top || 10,
      height: 35

    }).then(() => {

      const targetHeight = props.height || 300

      this.runAnimation(
        35, targetHeight, 1.0)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  destroy () {

    this.document.removeEventListener(
      'touchend', this.onMouseUp)

    this.document.removeEventListener(
      'mouseup', this.onMouseUp)

    this.document.removeEventListener(
      'mousemove', this.onMouseMove)

    this.document.removeEventListener(
      'touchmove', this.onMouseMove)

    this.off()

    const state = this.react.getState()

    return this.runAnimation(
      state.height, 35,
      Math.min(state.height / this.props.height, 1.0))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getPointer (event) {

    return event.changedTouches
      ? event.changedTouches[0]
      : event
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getBounds (element) {

    const rect = element.getBoundingClientRect()

    return {
      left: rect.left + window.pageXOffset,
      top: rect.top + window.pageYOffset,
      height: element.offsetHeight,
      width: element.offsetWidth
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMouseMove (event) {

    if (this.dragging) {

      const bounds = this.getBounds (this.container)

      const pointer = this.getPointer (event)

      const state = this.react.getState ()

      const left = state.left +
        pointer.pageX - this.pointer.pageX

      const top = state.top +
        pointer.pageY - this.pointer.pageY

      this.pointer = pointer

      event.stopPropagation()

      event.preventDefault()

      return this.react.setState({

        left: Math.min(
          Math.max(1, left),
          bounds.width - state.width - 1),

        top: Math.min(
          Math.max(1, top),
          bounds.height - state.height - 1)
      })
    }

    if (this.resizing) {

      const bounds = this.getBounds (this.container)

      const pointer = this.getPointer (event)

      const state = this.react.getState ()

      const offsetX = pointer.pageX - this.pointer.pageX

      const offsetY = pointer.pageY - this.pointer.pageY

      const newWidth = state.width +
        (offsetX > 0
          ?  ((pointer.pageX - bounds.left) > (state.left + state.width)
            ? offsetX : 0)
          : offsetX)

      const newHeight = state.height +
        (offsetY > 0
          ?  ((pointer.pageY - bounds.top) > (state.top + state.height)
            ? offsetY : 0)
          : offsetY)

      const width = Math.min(
        newWidth, this.props.maxWidth)

      const height = Math.min(
        newHeight, this.props.maxHeight)

      this.pointer = pointer

      event.stopPropagation()

      event.preventDefault()

      return this.react.setState({

        width: Math.min(
          Math.max(this.props.minWidth, width),
          bounds.width - state.left - 1),

        height: Math.min(
          Math.max(this.props.minHeight, height),
          bounds.height - state.top - 1)

      }).then(() => {

        if (this.renderable.onResize) {

          this.renderable.onResize()
        }
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStartDragging (event) {

    if (this.props.draggable) {

      this.pointer = this.getPointer(event.nativeEvent)

      event.stopPropagation()
      event.preventDefault()

      this.dragging = true
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStartResizing (event) {

    this.pointer = this.getPointer(event.nativeEvent)

    event.stopPropagation()
    event.preventDefault()

    this.resizing = true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMouseUp () {

    if (this.resizing) {

      if (this.renderable.onStopResize) {

        this.renderable.onStopResize()
      }

      this.resizing = false
    }

    this.dragging = false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  animate (period, easing, update) {

    return new Promise((resolve) => {

      const stopwatch = new Stopwatch()

      let elapsed = 0

      const stepFn = () => {

        const dt = stopwatch.getElapsedMs() * 0.001

        elapsed += dt

        if (elapsed < period) {

          const eased = easing(elapsed/period)

          update (eased).then(() => {

            window.requestAnimationFrame(stepFn)
          })

        } else {

          update(1.0)

          resolve()
        }
      }

      stepFn ()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  runAnimation (start, end, animPeriod) {

    const easingFn = (t) => {
      //b: begging value, c: change in value, d: duration
      return easing.easeInOutExpo(t, 0, 1.0, animPeriod * 0.9)
    }

    const update = (eased) => {

      const height =
        (1.0 - eased) * start + eased * end

      return new Promise((resolve) => {

        this.react.setState({
          height
        }).then(() => resolve())
      })
    }

    return this.animate (
      animPeriod, easingFn, update)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    const draggable = this.props.draggable
      ? ' draggable' : ''

    return(
      <div className={"title" + draggable}
        onTouchStart={this.onStartDragging}
        onMouseDown={this.onStartDragging}>
        {
          this.renderable.renderTitle
            ? this.renderable.renderTitle()
            : this.renderable.title
        }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const renderOptions = {
      showTitle: false,
      docked: false
    }

    return(
      <div className="content">
        { this.renderable.render(renderOptions) }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderResizer () {

    return(
      <div className="resizer"
        onTouchStart={this.onStartResizing}
        onMouseDown={this.onStartResizing}>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  // Render component
  //
  /////////////////////////////////////////////////////////
  render () {

    const state = this.react.getState()

    const classNames = [
      'react-panel',
      ...this.props.className.split(' ')
    ]

    const style = Object.assign({
      height: state.height,
      width: state.width,
      left: state.left,
      top: state.top
    }, this.props.style)

    return (
      <div className={classNames.join(' ')}
        style={style}
        key={this.id}>
        { this.renderTitle() }
        { this.renderContent() }
        { this.renderResizer() }
      </div>
    )
  }
}

export default Panel
