import EventsEmitter from 'EventsEmitter'
import './TransformGizmos'

export default class TranslateTool extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    this.active = false

    this.viewer = viewer

    this._hitPoint = null

    this._isDragging = false

    this.fullTransform = false

    this._transformMesh = null

    this._transformControlTx = null

    this._selectedFragProxyMap = {}

    this.onTxChange =
      this.onTxChange.bind(this)

    this.onAggregateSelectionChanged =
      this.onAggregateSelectionChanged.bind(this)

    this.onCameraChanged =
      this.onCameraChanged.bind(this)

    viewer.toolController.registerTool(this)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getNames () {

    return ["Viewing.Tool.Translate"]
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getName () {

    return "Viewing.Tool.Translate"
  }

  ///////////////////////////////////////////////////////////////////////////
  // Creates a dummy mesh to attach control to
  //
  ///////////////////////////////////////////////////////////////////////////
  createTransformMesh() {

    var material = new THREE.MeshPhongMaterial(
      { color: 0xff0000 })

    this.viewer.impl.matman().addMaterial(
      'transform-tool-material',
      material,
      true)

    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.0001, 5),
      material)

    sphere.position.set(0, 0, 0)

    return sphere
  }

  ///////////////////////////////////////////////////////////////////////////
  // on translation change
  //
  ///////////////////////////////////////////////////////////////////////////
  onTxChange() {

    if(this._isDragging && this._transformControlTx.visible) {

      var translation = new THREE.Vector3(
        this._transformMesh.position.x - this._selection.model.offset.x,
        this._transformMesh.position.y - this._selection.model.offset.y,
        this._transformMesh.position.z - this._selection.model.offset.z)

      for(var fragId in this._selectedFragProxyMap) {

        var fragProxy = this._selectedFragProxyMap[fragId]

        var position = new THREE.Vector3(
          this._transformMesh.position.x - fragProxy.offset.x,
          this._transformMesh.position.y - fragProxy.offset.y,
          this._transformMesh.position.z - fragProxy.offset.z)

        fragProxy.position = position

        fragProxy.updateAnimTransform()
      }

      this.emit('transform.translate', {
        fragIds: Object.keys(this._selectedFragProxyMap),
        model: this._selection.model,
        translation: translation
      })
    }

    this.viewer.impl.sceneUpdated(true)
  }

  ///////////////////////////////////////////////////////////////////////////
  // on camera changed
  //
  ///////////////////////////////////////////////////////////////////////////
  onCameraChanged() {

    if(this._transformControlTx) {

      this._transformControlTx.update()
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // item selected callback
  //
  ///////////////////////////////////////////////////////////////////////////
  onAggregateSelectionChanged (event) {

    if (this._hitPoint && event.selections && event.selections.length) {

      this._selection = event.selections[0]

      if (this.fullTransform) {

        this._selection.fragIdsArray = []

        var fragCount = this._selection.model.getFragmentList().
          fragments.fragId2dbId.length

        for (var fragId = 0; fragId < fragCount; ++fragId) {

          this._selection.fragIdsArray.push(fragId)
        }

        this._selection.dbIdArray = []

        var instanceTree =
          this._selection.model.getData().instanceTree

        var rootId = instanceTree.getRootId()

        this._selection.dbIdArray.push(rootId)
      }

      this.emit('transform.modelSelected',
        this._selection)

      this.initializeSelection(
        this._hitPoint)

    } else {

      this.clearSelection()
    }
  }

  initializeSelection (hitPoint) {

    this._selectedFragProxyMap = {}

    var modelTransform = this._selection.model.transform ||
      { translation: { x:0, y:0, z:0 } }

    this._selection.model.offset = {
      x: hitPoint.x - modelTransform.translation.x,
      y: hitPoint.y - modelTransform.translation.y,
      z: hitPoint.z - modelTransform.translation.z
    }

    this._transformControlTx.visible = true

    this._transformControlTx.setPosition(
      hitPoint)

    this._transformControlTx.addEventListener(
      'change', this.onTxChange)

    this.viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)

    this._selection.fragIdsArray.forEach((fragId)=> {

      var fragProxy = this.viewer.impl.getFragmentProxy(
        this._selection.model,
        fragId)

      fragProxy.getAnimTransform()

      fragProxy.offset = {

        x: hitPoint.x - fragProxy.position.x,
        y: hitPoint.y - fragProxy.position.y,
        z: hitPoint.z - fragProxy.position.z
      }

      this._selectedFragProxyMap[fragId] = fragProxy
    })
  }

  clearSelection () {

    if(this.active) {

      this._selection = null

      this._selectedFragProxyMap = {}

      this._transformControlTx.visible = false

      this._transformControlTx.removeEventListener(
        'change', this.onTxChange)

      this.viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged)

      this.viewer.impl.sceneUpdated(true)
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // normalize screen coordinates
  //
  ///////////////////////////////////////////////////////////////////////////
  normalize(screenPoint) {

    var viewport = this.viewer.navigation.getScreenViewport()

    var n = {
      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top) / viewport.height
    }

    return n
  }

  ///////////////////////////////////////////////////////////////////////////
  // get 3d hit point on mesh
  //
  ///////////////////////////////////////////////////////////////////////////
  getHitPoint(event) {

    var screenPoint = {
      x: event.clientX,
      y: event.clientY
    }

    var n = this.normalize(screenPoint)

    var hitPoint = this.viewer.utilities.getHitPoint(n.x, n.y)

    return hitPoint
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  activate() {

    if (!this.active) {

      this.active = true

      this.viewer.toolController.activateTool(
        this.getName())

      this.viewer.select([])

      var bbox = this.viewer.model.getBoundingBox()

      this.viewer.impl.createOverlayScene(
        'TransformToolOverlay')

      this._transformControlTx = new THREE.TransformControls(
        this.viewer.impl.camera,
        this.viewer.impl.canvas,
        "translate")

      this._transformControlTx.setSize(
        bbox.getBoundingSphere().radius * 5)

      this._transformControlTx.visible = false

      this.viewer.impl.addOverlay(
        'TransformToolOverlay',
        this._transformControlTx)

      this._transformMesh = this.createTransformMesh()

      this._transformControlTx.attach(
        this._transformMesh)

      this.viewer.addEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onAggregateSelectionChanged)

      this.emit('activate')
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // deactivate tool
  //
  ///////////////////////////////////////////////////////////////////////////
  deactivate() {

    if(this.active) {

      this.active = false

      this.viewer.toolController.deactivateTool(
        this.getName())

      this.viewer.impl.removeOverlay(
        'TransformToolOverlay',
        this._transformControlTx)

      this._transformControlTx.removeEventListener(
        'change',
        this.onTxChange)

      this.viewer.impl.removeOverlayScene(
        'TransformToolOverlay')

      this.viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged)

      this.viewer.removeEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onAggregateSelectionChanged)

      this.emit('deactivate')
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonDown (event, button) {

    this._hitPoint = this.getHitPoint(event)

    this._isDragging = true

    if (this._transformControlTx.onPointerDown(event))
      return true

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonUp(event, button) {

    this._isDragging = false

    if (this._transformControlTx.onPointerUp(event))
      return true

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleMouseMove(event) {

    if (this._isDragging) {

      if (this._transformControlTx.onPointerMove(event) ) {

        return true
      }

      return false
    }

    if (this._transformControlTx.onPointerHover(event))
      return true

    return false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  handleKeyDown (event, keyCode) {

    if (keyCode === 27) { //ESC

      this.deactivate()
    }

    return false
  }
}
