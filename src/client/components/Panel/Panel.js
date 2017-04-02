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
  constructor (renderable) {

    super ()

    this.id = renderable.id || this.guid()

    this.renderable = renderable
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    if (this.renderable.renderTitle) {

      return(
        <div className="title">
          { this.renderable.renderTitle() }
        </div>
      )
    }

    return (
      <div className="title">
        <label>
          { this.renderable.title }
        </label>
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

    return (
      <div key={this.id} className="react-panel">
        { this.renderTitle() }
        { this.renderContent() }
      </div>
    )
  }
}

export default Panel
