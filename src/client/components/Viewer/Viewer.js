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
import React from 'react'
import './Viewer.scss'

class Viewer extends React.Component {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getSize (viewer) {
    return {
      height: $(viewer.container).height(),
      width: $(viewer.container).width()
    }
  }

  ///////////////////////////////////////////////////////////////////
  // Async viewer event: returns a promise that resolves when the
  // specified event is fired.
  // Removes event handler automatically
  //
  ///////////////////////////////////////////////////////////////////
  viewerEvent (event) {

    return new Promise((resolve, reject) => {

      const handler = (e) => {
        this.viewer.removeEventListener(event, handler)
        resolve(e)
      }

      this.viewer.addEventListener(event, handler)
    })
  }

  ///////////////////////////////////////////////////////////////////
  // Initialize viewer environment
  //
  ///////////////////////////////////////////////////////////////////
  initialize (env, tokenUrl) {

    return new Promise((resolve, reject) => {

      const options = {
        env: env,
        getAccessToken: (callback) => {
          $.get(tokenUrl, (tokenResponse) => {
            callback(
              tokenResponse.access_token,
              tokenResponse.expires_in)
          })
        }
      }

      Autodesk.Viewing.Initializer (options, () => {
        resolve()
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  // Load a document from its URN
  //
  ///////////////////////////////////////////////////////////////////
  loadDocument (urn) {

    return new Promise((resolve, reject) => {

      Autodesk.Viewing.Document.load(urn, (doc) => {
          resolve (doc)

        },(errCode) => {

          reject (errCode)
        })
    })
  }

  ///////////////////////////////////////////////////////////////////
  // Component has been mounted so this container div is now created
  // in the DOM and viewer can be instantiated
  //
  ///////////////////////////////////////////////////////////////////
  componentDidMount () {

    try {

      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
        this.viewerContainer)

      this.props.onViewerCreated({
        loadDocument: this.loadDocument,
        initialize: this.initialize,
        viewer: this.viewer
      })

      //this.viewerSize = this.getSize(this.viewer)

      const events = [
        this.viewerEvent(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT),
        this.viewerEvent(Autodesk.Viewing.GEOMETRY_LOADED_EVENT)
      ]

      Promise.all(events).then(() => {

        this.props.onModelLoaded(this.viewer)
      })

    } catch (ex) {

      console.log('Viewer Initialization Error: ')
      console.log(ex)
    }
  }

  ///////////////////////////////////////////////////////////////////
  // Component will unmount so we can destroy the viewer to avoid
  // memory leaks
  //
  ///////////////////////////////////////////////////////////////////
  componentWillUnmount () {

    if(this.viewer) {

      this.viewer.finish()
      this.viewer = null
    }
  }

  ///////////////////////////////////////////////////////////////////
  // Render component, resize the viewer if exists
  //
  ///////////////////////////////////////////////////////////////////
  render() {

    if (this.viewer && this.viewer.impl) {

      this.viewer.resize()

      //const viewerSize = this.getSize(this.viewer)
      //
      //if(this.viewerSize.width  !== viewerSize.width ||
      //   this.viewerSize.height !== viewerSize.height) {
      //
      //  this.viewerSize = viewerSize
      //
      //  this.onResize()
      //}
    }

    return (
      <div className="viewer" ref={(div)=> this.viewerContainer=div}>
      </div>
    )
  }
}

export default Viewer
