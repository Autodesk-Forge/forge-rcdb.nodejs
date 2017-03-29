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

  constructor (renderable) {

    super ()

    this.id = renderable.id || this.guid()

    this.renderable = renderable
  }

  /////////////////////////////////////////////////////////
  // Render component
  //
  /////////////////////////////////////////////////////////
  render () {

    const renderOptions = {
      showTitle: true,
      docked: false
    }

    return (
      <div key={this.id} className="react-panel">

        <div className="title">
        </div>

        <div className="content">
          { this.renderable.render(renderOptions) }
        </div>

      </div>
    )
  }
}

export default Panel
