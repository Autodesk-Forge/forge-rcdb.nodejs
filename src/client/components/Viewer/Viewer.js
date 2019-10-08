////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import React from 'react'
import './Viewer.scss'

class Viewer extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    panels: PropTypes.array
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    panels: [],
    style: {}
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()

    this.height = 0

    this.width = 0
  }

  /////////////////////////////////////////////////////////
  // Component has been mounted so this container div is now created
  // in the DOM and viewer can be instantiated
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
      this.viewerContainer)

    this.panelsContainer = document.createElement('div')

    this.viewer.container.appendChild(
      this.panelsContainer)

    if (this.props.onViewerCreated) {

      this.props.onViewerCreated(this.viewer)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    //const panels = props.panels.map((panel) => {
    //
    //  return panel.render()
    //})
    //
    //this.panelsContainer = ReactDOM.render(
    //  <div className="viewer-panels-container">
    //    { panels }
    //  </div>, this.panelsContainer)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidUpdate () {

    if (this.viewer && this.viewer.impl) {

      if (this.viewerContainer.offsetHeight !== this.height ||
          this.viewerContainer.offsetWidth !== this.width) {

        this.height = this.viewerContainer.offsetHeight
        this.width = this.viewerContainer.offsetWidth

        this.viewer.resize()
      }
    }

    this.props.panels.map((panel) => {

      panel.emit('update')
    })
  }

  /////////////////////////////////////////////////////////
  // Component will unmount so we can destroy the viewer to avoid
  // memory leaks
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    if (this.viewer) {

      if(this.viewer.impl.selector) {

        this.viewer.finish()
        this.viewer = null
      }
    }
  }

  /////////////////////////////////////////////////////////
  // Render component, resize the viewer if exists
  //
  /////////////////////////////////////////////////////////
  render() {

    const panels = this.props.panels.map((panel) => {

      return panel.render()
    })

    return (
      <div className="viewer-app-container">

        <div ref={(div) => this.viewerContainer = div}
          className="viewer-container"
          style={this.props.style}
        />

        <div className="viewer-panels-container">
          { panels }
        </div>

      </div>
    )
  }
}

export default Viewer
