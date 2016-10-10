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
  //
  //
  ///////////////////////////////////////////////////////////////////
  viewerEvent (event) {
    return new Promise((resolve, reject) => {
      this.viewer.addEventListener(event, () => {
        resolve()
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
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
  //
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
  //
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

      this.viewerSize = this.getSize(this.viewer)

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
  //
  //
  ///////////////////////////////////////////////////////////////////
  componentWillUnmount () {

    if(this.viewer) {

      this.viewer.finish()
      this.viewer = null
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  render() {

    //if (this.viewer && this.viewer.impl) {
    //
    //  this.viewer.resize()
    //
    //  const viewerSize = this.getSize(this.viewer)
    //
    //  if(this.viewerSize.width  !== viewerSize.width ||
    //     this.viewerSize.height !== viewerSize.height) {
    //
    //    this.viewerSize = viewerSize
    //
    //    this.onResize()
    //  }
    //}

    return (
      <div className="viewer" ref={(div)=> this.viewerContainer=div}>
      </div>
    )
  }
}

export default Viewer
