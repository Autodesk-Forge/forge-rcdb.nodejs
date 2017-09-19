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

    //viewer.loadExtension('Autodesk.Viewing.ZoomWindow')

    //this.onSelectionChanged = this.onSelectionChanged.bind(this)
    //
    //viewer.addEventListener(
    //  Autodesk.Viewing.SELECTION_CHANGED_EVENT,
    //  this.onSelectionChanged)
    //
    ////this.material = this.addColorMaterial('clr', 0xf571d6)
    //this.material = this.addTexMaterial('tex', '/resources/img/textures/heatmap.png')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  addColorMaterial (name, color) {

    const material = new THREE.MeshPhongMaterial({
      color: color
    })

    this.viewer.impl.matman().addMaterial(
      name, material, true)

    return material
  }

  addTexMaterial(name, texture) {

    const tex = THREE.ImageUtils.loadTexture(texture)

    tex.wrapS  = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1, 1)

    const material = new THREE.MeshBasicMaterial({
      map: tex
    })

    tex.needsUpdate = true

    this.viewer.impl.matman().addMaterial(
      name, material, true)

    return material
  }

  setMaterialOverlay(renderProxy, materialName) {

    const meshProxy = new THREE.Mesh(
      renderProxy.geometry,
      renderProxy.material)

    meshProxy.matrix.copy(renderProxy.matrixWorld)
    meshProxy.matrixWorldNeedsUpdate = true
    meshProxy.matrixAutoUpdate = false
    meshProxy.frustumCulled = false

    this.viewer.impl.addOverlay(materialName, meshProxy)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectionChanged (event) {

    return console.log(event)

    if (event.dbIdArray.length) {

      const dbId = event.dbIdArray[0]

      const mesh = this.buildComponentMesh(
        dbId, this.material)

      this.viewer.impl.scene.add(mesh)
    }

    //console.log(event)
    //
    //event.fragIdsArray.forEach((fragId) => {
    //
    //  const renderProxy = this.viewer.impl.getRenderProxy(
    //    this.viewer.model, fragId)
    //
    //  renderProxy.material = this.material
    //
    //  //this.setMaterialOverlay(renderProxy, 'tex')
    //})

    this.viewer.impl.invalidate(true)
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
  render() {

    return (
      <Viewer onViewerCreated={(data) => this.onViewerCreated(data)}
        style={{height:"calc(100vh - 65px)"}}/>
    )
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  //render() {
  //
  //  const viewStyle = {
  //    height: 'calc(100vh - 65px)'
  //  }
  //
  //  return (
  //    <div className="test" style={viewStyle}>
  //      <ViewingApp
  //        onViewingApplicationCreated={this.onViewingApplicationCreated}
  //        onViewerCreated={this.onViewerCreated}
  //        urn={this.state.urn}
  //      />
  //    </div>
  //  )
  //}
}

export default TestView
























































