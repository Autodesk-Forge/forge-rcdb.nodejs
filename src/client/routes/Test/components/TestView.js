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
  async componentWillMount () {

    const viewerEnv = await this.initialize({
      env: 'AutodeskProduction'
    })

    this.props.setViewerEnv (viewerEnv)

    //this.assignState({
    //  urn: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LWRldi9vZmZpY2UucnZ0'
    //})
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (viewer) {

    this.viewer = viewer

    const lmvProxy = 'lmv-proxy-2legged'

    Autodesk.Viewing.setEndpointAndApi(
      `${window.location.origin}/${lmvProxy}`,
      'modelDerivativeV2')

    const urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LWRldi9vZmZpY2UucnZ0'

    const doc = await this.loadDocument(urn)

    const path = this.getViewablePath(doc)

    viewer.start()

    viewer.loadModel(path)

    this.onSelectionChanged = this.onSelectionChanged.bind(this)

    viewer.addEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      this.onSelectionChanged)

    //this.material = this.addColorMaterial('clr', 0xf571d6)
    this.material = this.addTexMaterial('tex', '/resources/img/textures/heatmap.png')
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

  buildComponentMesh (dbId, material) {

    const vertexArray = []

    const fragIds = Toolkit.getLeafFragIds(
      this.viewer.model, dbId)

    let matrixWorld = null

    fragIds.forEach((fragId) => {

      const renderProxy = this.viewer.impl.getRenderProxy(
        this.viewer.model,
        fragId)

      matrixWorld = matrixWorld ||
      renderProxy.matrixWorld

      const geometry = renderProxy.geometry

      console.log(geometry)

      const attributes = geometry.attributes

      const positions = geometry.vb
        ? geometry.vb
        : attributes.position.array

      const indices = attributes.index.array || geometry.ib

      const stride = geometry.vb ? geometry.vbstride : 3

      const offsets = [{
        count: indices.length,
        index: 0,
        start: 0
      }]

      for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {

        var start = offsets[oi].start
        var count = offsets[oi].count
        var index = offsets[oi].index

        for (var i = start, il = start + count; i < il; i += 3) {

          const a = index + indices[i]
          const b = index + indices[i + 1]
          const c = index + indices[i + 2]

          const vA = new THREE.Vector3()
          const vB = new THREE.Vector3()
          const vC = new THREE.Vector3()

          vA.fromArray(positions, a * stride)
          vB.fromArray(positions, b * stride)
          vC.fromArray(positions, c * stride)

          vertexArray.push(vA)
          vertexArray.push(vB)
          vertexArray.push(vC)
        }
      }
    })

    const geometry = new THREE.Geometry()

    for (var i = 0; i < vertexArray.length; i += 3) {

      geometry.vertices.push(vertexArray[i])
      geometry.vertices.push(vertexArray[i + 1])
      geometry.vertices.push(vertexArray[i + 2])

      const face = new THREE.Face3(i, i + 1, i + 2)

      geometry.faces.push(face)
    }

    geometry.applyMatrix(matrixWorld)

    geometry.computeFaceNormals()
    geometry.computeVertexNormals()

    const mesh = new THREE.Mesh(
      geometry, material)

    mesh.matrixWorld = matrixWorld

    mesh.dbId = dbId

    return mesh
  }

  ////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onViewingApplicationCreated (viewingApp) {


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
























































