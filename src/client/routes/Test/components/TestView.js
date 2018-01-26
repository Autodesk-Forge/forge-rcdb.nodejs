import ViewingApp from 'Viewer.ViewingApplication'
import Toolkit from 'Viewer.Toolkit'
import Viewer from 'Viewer'
import React from 'react'

class TestView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onViewingApplicationCreated =
      this.onViewingApplicationCreated.bind(this)

    this.onViewerCreated =
      this.onViewerCreated.bind(this)

    this.state = {
      urn: null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  assignState (state) {

    return new Promise((resolve) => {

      const newState = Object.assign(
        {}, this.state, state)

      this.setState(newState, () => {
        resolve()
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Initialize viewer environment
  //
  /////////////////////////////////////////////////////////
  initialize (options) {

    return new Promise((resolve, reject) => {

      Autodesk.Viewing.Initializer (options, () => {

        resolve ()

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Load a document from URN
  //
  /////////////////////////////////////////////////////////
  loadDocument (urn) {

    return new Promise((resolve, reject) => {

      const paramUrn = !urn.startsWith('urn:')
        ? 'urn:' + urn
        : urn

      Autodesk.Viewing.Document.load(paramUrn, (doc) => {

        resolve (doc)

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getViewablePath (doc, pathIdx = 0, roles = ['3d', '2d']) {

    const toArray = (obj) => {

      return obj ? (Array.isArray(obj) ? obj : [obj]) : []
    }

    const rootItem = doc.getRootItem()

    let items = []

    toArray(roles).forEach((role) => {

      items = [ ...items,
        ...Autodesk.Viewing.Document.getSubItemsWithProperties(
          rootItem, { type: 'geometry', role }, true) ]
    })

    if (!items.length || pathIdx > items.length-1) {

      return null
    }

    return doc.getViewablePath(items[pathIdx])
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentDidMount () {

    //this.assignState({
    //  urn: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LWRldi9vZmZpY2UucnZ0'
    //})
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (viewer) {

    const viewerEnv = await this.initialize({
      env: 'AutodeskProduction'
    })

    this.props.setViewerEnv (viewerEnv)

    this.viewer = viewer

    const lmvProxy = 'lmv-proxy-2legged'

    Autodesk.Viewing.endpoint.setEndpointAndApi(
      `${window.location.origin}/${lmvProxy}`,
      'modelDerivativeV2')

    const urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LWRldi9vZmZpY2UucnZ0'

    //const doc = await this.loadDocument(urn)

    //const path = this.getViewablePath(doc)

    viewer.start()

    const path = 'resources/models/dev/office/Resource/3D_View/3D/office.svf'

    viewer.loadModel(path)

    viewer.disableHighlight(true)

    //viewer.loadExtension('Autodesk.Viewing.ZoomWindow')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectionChanged (event) {

    return console.log(event)
  }

  ////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onViewingApplicationCreated (viewingApp) {

    const lmvProxy = 'lmv-proxy-2legged'

    Autodesk.Viewing.endpoint.setEndpointAndApi(
      `${window.location.origin}/${lmvProxy}`,
      'modelDerivativeV2')

    this.assignState({
      urn: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LWRldi9vZmZpY2UucnZ0'
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  renderViewer() {

    return (
      <Viewer
        onViewerCreated={(data) => this.onViewerCreated(data)}
        style={{height:"calc(100vh - 65px)"}}
      />
    )
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  renderViewingApp() {

    const viewStyle = {
      height: 'calc(100vh - 65px)'
    }

    return (
      <div className="test" style={viewStyle}>
        <ViewingApp
          onViewingApplicationCreated={this.onViewingApplicationCreated}
          onViewerCreated={this.onViewerCreated}
          urn={this.state.urn}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return this.renderViewer()
  }
}

export default TestView
























































