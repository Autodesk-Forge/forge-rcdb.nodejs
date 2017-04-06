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
import ReactDOM from 'react-dom'
import React from 'react'
import './Panel.scss'

class Panel extends EventsEmitter {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
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
      props, Panel.defaultProps)

    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp   = this.onMouseUp.bind(this)

    this.renderable = this.props.renderable

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
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMouseMove (event) {

    if (this.dragging) {

      event.stopPropagation()
      event.preventDefault()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMouseDown (event) {

    this.pointer = event.changedTouches
      ? event.changedTouches[0]
      : event

    this.dragging = true

    event.stopPropagation()
    event.preventDefault()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMouseUp (event) {

    this.dragging = false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return(
      <div className="title"
        onTouchStart={this.onMouseDown}
        onMouseDown={this.onMouseDown}>
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
  // Render component
  //
  /////////////////////////////////////////////////////////
  render () {

    const classNames = [
      'react-panel',
      ...this.props.className.split(' ')
    ]

    const style = Object.assign({}, this.props.style)

    return (
      <div key={this.id} className={classNames.join(' ')}
        style={style}>
        { this.renderTitle() }
        { this.renderContent() }
      </div>
    )
  }
}

export default Panel
