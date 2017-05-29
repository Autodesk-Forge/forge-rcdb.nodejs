/////////////////////////////////////////////////////////
// Viewing.Extension.WallAnalyzer
// by Philippe Leefsma, May 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import MeshPropertyPanel from './MeshPropertyPanel'
import Worker from 'worker-loader!./worker.js'
import './Viewing.Extension.WallAnalyzer.scss'
import WidgetContainer from 'WidgetContainer'
import EventTool from 'Viewer.EventTool'
import Toolkit from 'Viewer.Toolkit'
import { ReactLoader } from 'Loader'
import Switch from 'Switch'
import React from 'react'
import d3 from 'd3'


class WallAnalyzerExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onLevelWallsClicked = this.onLevelWallsClicked.bind(this)
    this.onLevelFloorClicked = this.onLevelFloorClicked.bind(this)
    this.onEnableWireFrame = this.onEnableWireFrame.bind(this)
    this.onDownloadReport = this.onDownloadReport.bind(this)
    this.onWorkerMessage = this.onWorkerMessage.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.renderTitle = this.renderTitle.bind(this)
    this.onClick = this.onClick.bind(this)

    this.eventTool = new EventTool(this.viewer)

    this.react = this.options.react

    this.worker = new Worker()

    this.visibleFloorIds = []

    this.intersectMeshes = []

    this.nbMeshesLoaded = 0

    this.wireframe = false

    this.report = {
      levels: []
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'wall-analyzer'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.WallAnalyzer'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      analyzeComplete: false,
      loader: true,
      levels: []

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.WallAnalyzer loaded')

    this.eventTool.on ('mousemove', this.onMouseMove)

    this.eventTool.on ('singleclick', this.onClick)

    this.lineMaterial = this.createLineMaterial()

    this.worker.addEventListener(
      'message',
      this.onWorkerMessage)

    this.notification = this.options.notify.add({
      message: 'Loading geometry, please wait ...',
      title: 'Wall Analyzer',
      dismissible: false,
      status: 'loading',
      dismissAfter: 0,
      position: 'tl'
    })

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.WallAnalyzer unloaded')

    this.eventTool.off()

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onWorkerMessage (msg) {

    const state = this.react.getState()

    const data = msg.data

    const mesh = this.buildMesh(data)

    const levelIdx = data.levelCount - data.level - 1

    const level = state.levels[levelIdx] || {
        strokeColor: this.levelColors[data.level],
        fillColor: this.levelColors[data.level],
        walls: {
          name: `Walls [Level #${data.level+1}]`,
          active: false,
          meshes: []
        },
        floor: {
          name: `Floor [Level #${data.level+1}]`,
          dbIds: data.floorDbIds,
          active: false,
          paths: []
        }
    }

    state.levels[levelIdx] = level

    level.walls.meshes.push(mesh)

    const lines = data.pathEdges.map((edge) => {

      const geometry = new THREE.Geometry()

      edge.start.z += 0.05
      edge.end.z += 0.05

      geometry.vertices.push(
        new THREE.Vector3(
          edge.start.x,
          edge.start.y,
          edge.start.z))

      geometry.vertices.push(
        new THREE.Vector3(
          edge.end.x,
          edge.end.y,
          edge.end.z))

      geometry.computeLineDistances()

      return new THREE.Line(geometry, this.lineMaterial)
    })

    level.floor.paths.push({
      lines
    })

    const reportLevel = this.report.levels[levelIdx] || {
        name: `Level #${data.level+1}`,
        walls: []
    }

    reportLevel.walls.push({
      path: data.pathEdges,
      dbId: mesh.dbId
    })

    this.report.levels[levelIdx] = reportLevel

    const progress =
      (++this.nbMeshesLoaded) * 100 /
      (data.levelCount * data.wallCount)

    if (progress === 100) {

      this.notification.dismissAfter = 2000
      this.notification.status = 'success'

      this.react.setState({
        analyzeComplete: true
      })
    }

    this.notification.message =
      `Processing Meshes `+
      `- Progress: ${progress.toFixed(2)}%`

    this.options.notify.update(this.notification)

    this.react.setState({
      levels: state.levels
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getComponentBoundingBox (dbId) {

    const model = this.viewer.model

    const fragIds = Toolkit.getLeafFragIds(
      model, dbId)

    const fragList = model.getFragmentList()

    return this.getModifiedWorldBoundingBox(
      fragIds, fragList)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onToolbarCreated (event) {

    this.panel = new MeshPropertyPanel(this.viewer)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelCompletedLoad (event) {

    const model = this.viewer.model

    this.postModelInfo ()

    this.getComponentsByParentName(
      'Floors', model).then((floorsIds) => {

        const nbFloors = floorsIds.length

        const colors = d3.scale.linear()
          .domain([0, nbFloors * .33, nbFloors * .66, nbFloors])
          .range(['#FCB843', '#C2149F', '#0CC4BD', '#0270E9'])

          this.levelMaterials = []
          this.levelColors = []

          floorsIds.forEach((dbId, idx) => {

            const levelMaterial = new THREE.MeshPhongMaterial({
              side: THREE.DoubleSide,
              color: colors(idx)
            })

            this.viewer.impl.matman().addMaterial(
              this.guid(),
              levelMaterial,
              true)

            this.levelMaterials.push(levelMaterial)

            this.levelColors.push(colors(idx))

            this.postComponent (
              dbId, 'Floors', floorsIds.length)
          })
      })

    this.getComponentsByParentName(
      'Walls', model).then((wallIds) => {

        wallIds.forEach((dbId) => {

          return this.postComponent (
            dbId, 'Walls', wallIds.length)
        })
    })

    this.react.setState({
      loader: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async postModelInfo () {

    const model = this.viewer.model

    const instanceTree = model.getData().instanceTree

    this.rootId = instanceTree.getRootId()

    const fragIds = await Toolkit.getFragIds(
      model, this.rootId)

    const fragList = model.getFragmentList()

    const boundingBox =
      this.getModifiedWorldBoundingBox(
        fragIds, fragList)

    const msg = {
      msgId: 'MSG_ID_MODEL_INFO',
      boundingBox
    }

    this.worker.postMessage(msg)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  postComponent (dbId, category, count) {

    const geometry = this.getComponentGeometry(dbId)

    const msg = {
      boundingBox: this.getComponentBoundingBox(dbId),
      matrixWorld: geometry.matrixWorld,
      nbMeshes: geometry.meshes.length,
      msgId: 'MSG_ID_COMPONENT',
      category,
      count,
      dbId
    }

    geometry.meshes.forEach((mesh, idx) => {

      msg['positions' + idx] = mesh.positions
      msg['indices' + idx] = mesh.indices
      msg['stride' + idx] = mesh.stride
    })

    this.worker.postMessage(msg)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  buildMesh (data) {

    const geometry = new THREE.Geometry()

    data.vertices.forEach((vertex) => {

      geometry.vertices.push(
        new THREE.Vector3(
          vertex.x,
          vertex.y,
          vertex.z))
    })

    data.faces.forEach((face) => {

      geometry.faces.push(
        new THREE.Face3(
          face.a,
          face.b,
          face.c))
    })

    geometry.computeFaceNormals()

    //geometry.computeVertexNormals()

    const matrixWorld = new THREE.Matrix4()

    matrixWorld.fromArray(data.matrixWorld)

    const mesh = new THREE.Mesh(
      geometry, this.levelMaterials[data.level])

    mesh.applyMatrix(matrixWorld)

    mesh.dbId = data.dbId

    return mesh
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getComponentsByParentName (name, model) {

    const instanceTree = model.getData().instanceTree

    const rootId = instanceTree.getRootId()

    let parentId = 0

    instanceTree.enumNodeChildren(rootId,
      (childId) => {

        const nodeName = instanceTree.getNodeName(childId)

        if (nodeName == name) {

          parentId = childId
        }
      })

    return Toolkit.getLeafNodes(model, parentId)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getComponentGeometry (dbId) {

    const fragIds = Toolkit.getLeafFragIds(
      this.viewer.model, dbId)

    let matrixWorld = null

    const meshes = fragIds.map((fragId) => {

      const renderProxy = this.viewer.impl.getRenderProxy(
        this.viewer.model,
        fragId)

      const geometry = renderProxy.geometry

      const attributes = geometry.attributes

      const positions = geometry.vb
        ? geometry.vb
        : attributes.position.array

      const indices = attributes.index.array || geometry.ib

      const stride = geometry.vb ? geometry.vbstride : 3

      const offsets = geometry.offsets

      matrixWorld = matrixWorld ||
      renderProxy.matrixWorld.elements

      return {
        positions,
        indices,
        offsets,
        stride
      }
    })

    return {
      matrixWorld,
      meshes
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createLineMaterial() {

    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
      linewidth: 2
    });

    this.viewer.impl.matman().addMaterial(
      'forge-line-material',
      material,
      true)

    return material
  }

  /////////////////////////////////////////////////////////
  //returns bounding box as it appears in the viewer
  // (transformations could be applied)
  //
  /////////////////////////////////////////////////////////
  getModifiedWorldBoundingBox (fragIds, fragList) {

    var fragbBox = new THREE.Box3()
    var nodebBox = new THREE.Box3()

    fragIds.forEach(function(fragId) {

      fragList.getWorldBounds(fragId, fragbBox)

      nodebBox.union(fragbBox)
    })

    return nodebBox
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  hexToRgbA (hex, alpha) {

    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {

      var c = hex.substring(1).split('')

      if (c.length == 3) {

        c = [c[0], c[0], c[1], c[1], c[2], c[2]]
      }

      c = '0x' + c.join('')

      return `rgba(${(c>>16)&255},${(c>>8)&255},${c&255},${alpha})`
    }

    throw new Error('Bad Hex Number: ' + hex)
  }

  /////////////////////////////////////////////////////////
  // Creates Raycatser object from the pointer
  //
  /////////////////////////////////////////////////////////
  pointerToRaycaster (domElement, camera, pointer) {

    const pointerVector = new THREE.Vector3()
    const pointerDir = new THREE.Vector3()
    const ray = new THREE.Raycaster()

    const rect = domElement.getBoundingClientRect()

    const x = ((pointer.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((pointer.clientY - rect.top) / rect.height) * 2 + 1

    if (camera.isPerspective) {

      pointerVector.set(x, y, 0.5)

      pointerVector.unproject(camera)

      ray.set(camera.position,
        pointerVector.sub(
          camera.position).normalize())

    } else {

      pointerVector.set(x, y, -1)

      pointerVector.unproject(camera)

      pointerDir.set(0, 0, -1)

      ray.set(pointerVector,
        pointerDir.transformDirection(
          camera.matrixWorld))
    }

    return ray
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMouseMove (event) {

    const pointer = event.pointers
      ? event.pointers[0]
      : event

    const rayCaster = this.pointerToRaycaster(
      this.viewer.impl.canvas,
      this.viewer.impl.camera,
      pointer)

    const intersectResults = rayCaster.intersectObjects(
      this.intersectMeshes, true)

    //console.log(intersectResults)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onSelection (event) {

    if (event.selections.length) {

      const dbId = event.selections[0].dbIdArray[0]
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onClick (event) {

    const pointer = event.pointers
      ? event.pointers[0]
      : event

    const rayCaster = this.pointerToRaycaster(
      this.viewer.impl.canvas,
      this.viewer.impl.camera,
      pointer)

    const intersectResults = rayCaster.intersectObjects(
      this.intersectMeshes, true)

    if (intersectResults.length) {

      const mesh = intersectResults[0].object

      this.panel.setVisible(false)

      this.panel.setNodeProperties(mesh.dbId)

      this.panel.setVisible(true)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onLevelWallsClicked (level) {

    const state = this.react.getState()

    level.walls.active = !level.walls.active

    this.react.setState({
      levels: state.levels
    })

    const meshes = level.walls.meshes

    meshes.forEach((mesh) => {

      if (level.walls.active) {

        this.viewer.impl.sceneUpdated(true)

        this.viewer.impl.scene.add(mesh)
        this.intersectMeshes.push(mesh)

      } else {

        this.viewer.impl.scene.remove(mesh)
      }
    })

    if (!level.walls.active) {

      const meshIds = meshes.map((mesh) => {
        return mesh.id
      })

      this.intersectMeshes =
        this.intersectMeshes.filter((mesh) => {

          return !meshIds.includes(mesh.id)
        })
    }

    const nbActiveWalls = state.levels.filter((level) => {
      return level.walls.active
    })

    const nbActiveFloors = state.levels.filter((level) => {
      return level.floor.active
    })

    if ((nbActiveWalls.length + nbActiveFloors.length)) {

      Toolkit.hide(this.viewer, this.rootId)
      Toolkit.show(this.viewer, this.visibleFloorIds)
      this.eventTool.activate()

    } else {

      Toolkit.show(this.viewer, this.rootId)
      this.eventTool.deactivate()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onLevelFloorClicked (level) {

    const state = this.react.getState()

    level.floor.active = !level.floor.active

    this.react.setState({
      levels: state.levels
    })

    if (level.floor.active) {

      level.floor.paths.forEach((path) => {

        path.lines.forEach((line) => {

          this.viewer.impl.scene.add(line)
        })
      })

      level.floor.dbIds.forEach((dbId) => {
        this.visibleFloorIds.push(dbId)
      })

    } else {

      level.floor.paths.forEach((path) => {

        path.lines.forEach((line) => {

          this.viewer.impl.scene.remove(line)
        })
      })

      this.visibleFloorIds =
        this.visibleFloorIds.filter((dbId) => {
          return !level.floor.dbIds.includes(dbId)
        })
    }

    const viewerState = this.viewer.getState({viewport: true})

    this.viewer.restoreState(viewerState)


    const nbActiveWalls = state.levels.filter((level) => {
      return level.walls.active
    })

    const nbActiveFloors = state.levels.filter((level) => {
      return level.floor.active
    })

    if ((nbActiveWalls.length + nbActiveFloors.length)) {

      Toolkit.hide(this.viewer, this.rootId)
      Toolkit.show(this.viewer, this.visibleFloorIds)

    } else {

      Toolkit.show(this.viewer, this.rootId)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onEnableWireFrame (checked) {

    this.wireframe = checked

    this.levelMaterials.forEach((material) => {

      material.wireframe = checked
    })

    this.viewer.impl.sceneUpdated(true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = WallAnalyzerExtension.ExtensionId

    if (docked) {

    await this.react.popRenderExtension(id)

      this.react.pushViewerPanel(this, {
        height: 250,
        width: 350
      })

    } else {

    await this.react.popViewerPanel(id)

      this.react.pushRenderExtension(this)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onDownloadReport () {

    const data = "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(this.report, null, 2))

    const a = document.createElement('a')
    a.setAttribute("download", "report.json")
    a.setAttribute("href", data)
    a.click()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const state = this.react.getState()

    let hasActiveItem = false

    const levels = state.levels

    const wallItems = levels.map((level) => {

      hasActiveItem = hasActiveItem || level.walls.active

      const active = level.walls.active ? ' active' : ''

      const style = {
        backgroundColor: this.hexToRgbA(level.fillColor, 0.3),
        border: `2px solid ${level.strokeColor}`
      }

      return (
        <div key={level.walls.name}
          className={'list-item ' + active}
          onClick={() => this.onLevelWallsClicked(level)}>
          <div className="item-color" style={style}>
          </div>
          <label>
            {level.walls.name}
          </label>
        </div>
      )
    })

    const floorItems = levels.map((level) => {

      hasActiveItem = hasActiveItem || level.floor.active

      const active = level.floor.active ? ' active' : ''

      const style = {
        backgroundColor: this.hexToRgbA(level.fillColor, 0.3),
        border: `2px solid ${level.strokeColor}`
      }

      return (
        <div key={level.floor.name}
          className={'list-item ' + active}
          onClick={() => this.onLevelFloorClicked(level)}>
          <div className="item-color" style={style}>
          </div>
          <label>
            {level.floor.name}
          </label>
        </div>
      )
    })

    const reportText = 'Analysis Reports' +
      (state.analyzeComplete
        ? ':'
        : ' (in progress ...)')

    return (
      <div className="content">

        <ReactLoader show={state.loader}/>

        <div className="row">
          Select an item to isolate walls on this level:
        </div>
        <div className="item-list-container">
            {wallItems}
        </div>

        <div className="row">
          Select an item to isolate floor on this level:
        </div>
        <div className="item-list-container">
            {floorItems}
        </div>

        {
          hasActiveItem &&
          <div className="row">
            Enable wireframe:
          </div>
        }

        {
          hasActiveItem &&
          <div className="row">
            <Switch className="control-element"
              onChange={this.onEnableWireFrame}
              checked={this.wireframe}/>
          </div>
        }

        <div className="row">
          {reportText}
        </div>
        {
          state.analyzeComplete &&
          <div className="row report" onClick={this.onDownloadReport}>
            <span className="fa fa-cloud-download"/>
            Download Report.json
          </div>
        }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle (docked) {

    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className="title">
        <label>
          Wall Analyzer
        </label>
        <div className="wall-analyzer-controls">
          <button onClick={() => this.setDocking(docked)}
            title="Toggle docking mode">
            <span className={spanClass}/>
          </button>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>

        { this.renderContent () }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  WallAnalyzerExtension.ExtensionId,
  WallAnalyzerExtension)
