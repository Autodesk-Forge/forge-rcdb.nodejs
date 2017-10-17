import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'
import './TransformGizmos'

export default class TranslateTool extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer) {

    super()

    this._dbIds = []

    this.active = false

    this._viewer = viewer

    this._isDragging = false

    this.fullTransform = false

    this._transformMesh = null

    this._selectedFragProxyMap = {}

    this._transformControlTx = null

    this._hitPoint = new THREE.Vector3()

    this.onTxChange =
      this.onTxChange.bind(this)

    this.onAggregateSelectionChanged =
      this.onAggregateSelectionChanged.bind(this)

    this.onCameraChanged =
      this.onCameraChanged.bind(this)

    this._selectionMode = 'SELECTION_MODE_TRANSFORM'

    viewer.toolController.registerTool(this)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getNames () {

    return ['Viewing.Tool.Translate']
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getName () {

    return 'Viewing.Tool.Translate'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setFullTransform (fullTransform) {

    this.fullTransform = fullTransform

    this.clearSelection()
  }

  /////////////////////////////////////////////////////////
  // Creates a dummy mesh to attach control to
  //
  /////////////////////////////////////////////////////////
  createTransformMesh() {

    var material = new THREE.MeshPhongMaterial(
      { color: 0xff0000 })

    this._viewer.impl.matman().addMaterial(
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

      this.emit('translate', {
        fragIds: Object.keys(this._selectedFragProxyMap),
        model: this._selection.model,
        translation: translation
      })
    }

    this._viewer.impl.sceneUpdated(true)
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

    switch (this._selectionMode) {

      case 'SELECTION_MODE_TRANSFORM':

        if (this._selection && this.pointerDown) {

          this._selectionMode = 'SELECTION_MODE_RESUME_TRANSFORM'

          this._viewer.clearSelection()

          if (this._selection.model.selector) {

            this._selection.model.selector.setSelection(
              this._dbIds)
          }

          return
        }

        if (event.selections.length) {

          var selection = event.selections[0]

          this.setSelection(selection)

        } else {

          this.clearSelection()
        }

        break;

      case 'SELECTION_MODE_PICK':

        if(event.selections && event.selections.length) {

          this._selectionMode = 'SELECTION_MODE_RESUME_TRANSFORM'

          this._viewer.clearSelection()

          if (this._selection.model.selector) {

            this._selection.model.selector.setSelection(
              this._dbIds)
          }

          this.setPosition(this._hitPoint)
        }

      case 'SELECTION_MODE_RESUME_TRANSFORM':

        setTimeout(() => {

          this._selectionMode = 'SELECTION_MODE_TRANSFORM'
        }, 300)

        break;
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  setSelection (selection) {

    this._selection = selection

    this._dbIds = this._selection.dbIdArray

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

    this.initializeSelection(
      this._hitPoint)

    this.emit('selection', selection)
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  async initializeSelection (hitPoint) {

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

    this._viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)

    const dbIds = this._selection.dbIdArray

    const model = this._selection.model

    const fragIds = !this._selection.fragIdsArray.length
      ? await Toolkit.getFragIds(model, dbIds)
      : this._selection.fragIdsArray

    fragIds.forEach((fragId) => {

      var fragProxy = this._viewer.impl.getFragmentProxy(
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

    this._viewer.impl.sceneUpdated(true)
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  clearSelection () {

    if (this.active) {

      this._transformControlTx.visible = false

      this._selectedFragProxyMap = {}

      this._selection = null

      this._dbIds = []

      this._transformControlTx.removeEventListener(
        'change', this.onTxChange)

      this._viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged)

      this._viewer.impl.sceneUpdated(true)

      this.emit('selection', null)
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  setPosition (position) {

    this._transformControlTx.setPosition(position)

    for (var fragId in this._selectedFragProxyMap) {

      var fragProxy = this._selectedFragProxyMap[fragId]

      var fragPosition = new THREE.Vector3(
        position.x - fragProxy.offset.x,
        position.y - fragProxy.offset.y,
        position.z - fragProxy.offset.z)

      fragProxy.position = fragPosition

      fragProxy.updateAnimTransform()
    }

    var translation = new THREE.Vector3(
      this._transformMesh.position.x - this._selection.model.offset.x,
      this._transformMesh.position.y - this._selection.model.offset.y,
      this._transformMesh.position.z - this._selection.model.offset.z)

    this.emit('translate', {
      fragIds: Object.keys(this._selectedFragProxyMap),
      model: this._selection.model,
      translation: translation,
      dbIds: this._dbIds
    })

    this._viewer.impl.sceneUpdated(true)
  }

  ///////////////////////////////////////////////////////////////////////////
  // normalize screen coordinates
  //
  ///////////////////////////////////////////////////////////////////////////
  normalize (screenPoint) {

    var viewport = this._viewer.navigation.getScreenViewport()

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
  getHitPoint (event) {

    var screenPoint = {
      x: event.clientX,
      y: event.clientY
    }

    var n = this.normalize(screenPoint)

    var hitPoint = this._viewer.utilities.getHitPoint(n.x, n.y)

    return hitPoint
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  hitPoint () {

    return this._transformControlTx.position
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  setHitPoint (hitPoint) {

    this._hitPoint.x = hitPoint.x
    this._hitPoint.y = hitPoint.y
    this._hitPoint.z = hitPoint.z
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  activate () {

    if(!this.active) {

      this.active = true

      this._viewer.toolController.activateTool(this.getName())

      var bbox = this._viewer.model.getBoundingBox()

      this._viewer.impl.createOverlayScene(
        'TranslateToolOverlay')

      this._transformControlTx = new THREE.TransformControls(
        this._viewer.impl.camera,
        this._viewer.impl.canvas,
        "translate")

      this._transformControlTx.setSize(
        bbox.getBoundingSphere().radius * 5)

      this._transformControlTx.visible = false

      this._viewer.impl.addOverlay(
        'TranslateToolOverlay',
        this._transformControlTx)

      this._transformMesh = this.createTransformMesh()

      this._transformControlTx.attach(
        this._transformMesh)

      this._viewer.addEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onAggregateSelectionChanged)

      this.emit('activate')
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // deactivate tool
  //
  ///////////////////////////////////////////////////////////////////////////
  deactivate () {

    if (this.active) {

      this.active = false

      this._viewer.toolController.deactivateTool(this.getName())

      this._viewer.impl.removeOverlay(
        'TranslateToolOverlay',
        this._transformControlTx)

      this._transformControlTx.removeEventListener(
        'change', this.onTxChange)

      this._viewer.impl.removeOverlayScene(
        'TranslateToolOverlay')

      this._viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.onCameraChanged)

      this._viewer.removeEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        this.onAggregateSelectionChanged)

      this.emit('deactivate')
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onPick () {

    if (this.active) {

      this._selectionMode = 'SELECTION_MODE_PICK'
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonDown(event, button) {

    this._isDragging = true

    this.pointerDown = this._transformControlTx.onPointerDown(event)

    if (this.pointerDown && this._selection)
      return true

    var hitPoint = this.getHitPoint(event)

    if (hitPoint) {

      this._hitPoint.copy(hitPoint)
    }

    return false
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  handleButtonUp (event) {

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

      this._viewer.clearSelection()
      this.deactivate()
    }

    return false
  }
}
