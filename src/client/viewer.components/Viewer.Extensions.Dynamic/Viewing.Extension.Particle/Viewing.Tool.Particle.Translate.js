import EventsEmitter from 'EventsEmitter'
import './TransformGizmos'

export default class TransformTool extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    viewer.toolController.registerTool(this)

    this.viewer = viewer

    this._dbIds = []

    this._hitPoint = null

    this._selectSet = null

    this._isDragging = false

    this._transformMesh = null

    this._modifiedFragIdMap = {}

    this._transformControlTx = null

    this._selectedFragProxyMap = {}

    this.onTxChange =
      this.onTxChange.bind(this)

    this.onAggregateSelectionChanged =
      this.onAggregateSelectionChanged.bind(this)

    this.onCameraChanged =
      this.onCameraChanged.bind(this)

    this.handleSelectionChanged =
      this.handleSelectionChanged.bind(this)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getNames() {

    return ["Viewing.Transform.Tool"]
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getName() {

    return "Viewing.Transform.Tool"
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

    for(var fragId in this._selectedFragProxyMap) {

      var fragProxy = this._selectedFragProxyMap[fragId]

      var position = new THREE.Vector3(
        this._transformMesh.position.x - fragProxy.offset.x,
        this._transformMesh.position.y - fragProxy.offset.y,
        this._transformMesh.position.z - fragProxy.offset.z)

      fragProxy.position = position

      fragProxy.updateAnimTransform()
    }

    this.viewer.impl.sceneUpdated(true)

    this.emit('transform.TxChange', {
      dbIds: this._dbIds,
      fragIds: Object.keys(this._selectedFragProxyMap)
    })
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
  onAggregateSelectionChanged(event) {

    var dbIdArray = []
    var fragIdsArray = []

    if(event.selections && event.selections.length) {

      var selection = event.selections[0]

      dbIdArray = selection.dbIdArray

      fragIdsArray = selection.fragIdsArray
    }

    this.handleSelectionChanged(dbIdArray, fragIdsArray)
  }

  handleSelectionChanged(dbIdArray, fragIdsArray) {

    this._selectedFragProxyMap = {}

    this._dbIds = dbIdArray

    //component unselected

    if(!fragIdsArray.length) {

      this._hitPoint = null

      this._transformControlTx.visible = false

      this._transformControlTx.removeEventListener(
        'change', this.onTxChange)

      this.viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged)

      this.emit('transform.select', {
        dbIds: this._dbIds
      })

      return
    }

    if (this._hitPoint) {

      this._selectSet = this.emit('transform.select', {
        dbIds: this._dbIds
      })

      if (this._selectSet) {

        if (!this._selectSet.selectable) {
          this._hitPoint = null
          this.viewer.select([])
          return
        }

        if (!this._selectSet.transformable) {
          this._hitPoint = null
          return
        }
      }

      this._transformControlTx.visible = true

      this._transformControlTx.setPosition(
        this._hitPoint)

      this._transformControlTx.addEventListener(
        'change', this.onTxChange)

      this.viewer.addEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged)

      fragIdsArray.forEach((fragId)=> {

        var fragProxy = this.viewer.impl.getFragmentProxy(
          this.viewer.model,
          fragId)

        fragProxy.getAnimTransform()

        var offset = {

          x: this._hitPoint.x - fragProxy.position.x,
          y: this._hitPoint.y - fragProxy.position.y,
          z: this._hitPoint.z - fragProxy.position.z
        }

        fragProxy.offset = offset

        this._selectedFragProxyMap[fragId] = fragProxy

        this._modifiedFragIdMap[fragId] = {}
      })

      this._hitPoint = null
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

      console.log(this.getName() + ' activated')

      this.active = true

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

      this.viewer.toolController.activateTool(
        this.getName())

      this.emit('activate')
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // deactivate tool
  //
  ///////////////////////////////////////////////////////////////////////////
  deactivate() {

    if (this.active) {

      this.active = false

      this.viewer.toolController.deactivateTool(
        this.getName())

      this.viewer.impl.removeOverlay(
        'TransformToolOverlay',
        this._transformControlTx)

      this._transformControlTx.removeEventListener(
        'change',
        this.onTxChange)

      this._transformControlTx = null

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
  handleButtonDown(event, button) {

    this._hitPoint = this.getHitPoint(event)

    this._isDragging = true

    if (this._transformControlTx.onPointerDown(event))
      return true

    //return _transRotControl.onPointerDown(event)
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

    //return _transRotControl.onPointerUp(event)
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

    //return _transRotControl.onPointerHover(event)
    return false
  }
}
