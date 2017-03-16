import { IndexLink, Link } from 'react-router'
import ViewerToolkit from 'Viewer.Toolkit'
import ServiceManager from 'SvcManager'
import Viewer from 'Viewer'
import React from 'react'

class ViewerTestView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.modelSvc = ServiceManager.getService('ModelSvc')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (data) {

    try {

      const { viewer, initialize, loadDocument } = data

      if(!this.props.appState.viewerEnv) {

        const viewerEnv = await initialize({
          env: 'AutodeskProduction',
          useConsolidation: true
        })

        this.props.setViewerEnv(viewerEnv)

        //2.13
        Autodesk.Viewing.setApiEndpoint(
          window.location.origin + '/lmv-proxy')

        //2.14
        //Autodesk.Viewing.setEndpointAndApi(
        //  window.location.origin + '/lmv-proxy', 'modelDerivativeV2')

        Autodesk.Viewing.Private.forceMemoryOptimizedModeOnSvfLoading = true
        Autodesk.Viewing.Private.memoryOptimizedSvfLoading = true

        //Autodesk.Viewing.Private.logger.setLevel(0)
      }

      viewer.start()

      const urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bGVlZnNtcC1mb3JnZS9lbmdpbmUuZHdm'

      const doc = await loadDocument('urn:' + urn)

      const path = ViewerToolkit.getDefaultViewablePath(doc)

      viewer.loadModel(path)

      this.viewer = viewer

    } catch(ex) {

      console.log('Viewer Initialization Error: ')
      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onModelLoaded (viewer) {

    try {

      viewer.resize()

    } catch(ex) {

      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return (
      <div className="viewer-test">
        <Viewer
          onModelLoaded={(viewer) => this.onModelLoaded(viewer)}
          onViewerCreated={(data) => this.onViewerCreated(data)}
          style={{height:"calc(100vh - 65px)"}}/>
      </div>
    )
  }
}

export default ViewerTestView
























































