import LabelMarker from './Viewing.Extension.Markup3D.LabelMarker'
import PinMarker from './Viewing.Extension.Markup3D.PinMarker'
import Leader from './Viewing.Extension.Markup3D.Leader'
import EventsEmitter from 'EventsEmitter'

export default class LeaderNote extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, screenPoint, dbId, fragId, worldPoint = null) {

    super()

    this.id = this.guid()

    this.bindToState = true

    this.occlusion = true

    this.viewer = viewer

    this.fragId = fragId

    this.visible = true

    this.dbId = dbId

    this.initialMeshPos = this.meshPosition(
      this.fragId)

    this.initialWorldPoint = worldPoint || this.screenToWorld(
      screenPoint)

    this.pinMarker = new PinMarker(
      viewer,
      this.initialWorldPoint)

    this.trackerModifiedHandler =
      (screenPoint) => this.onTrackerModified(
        screenPoint)

    this.pinMarker.on('tracker.modified',
      this.trackerModifiedHandler)

    // creates single container for all Leader objects
    // if doesnt exist
    if ($('.leader-container').length === 0) {

      $(viewer.container).append(
        '<svg class="markup3D leader-container"></svg>')
    }

    this.leaderContainer =
      $('.leader-container')[0]

    this.onMouseUpHandler = (event)=>
      this.onMouseUp(event)

    $(viewer.container).on(
      'mouseup',
      this.onMouseUpHandler)

    var offset = $(viewer.container).offset()

    this.offset = {
      x: offset.left,
      y: offset.top
    }

    this.startPoint = {
      x: screenPoint.x - this.offset.x,
      y: screenPoint.y - this.offset.y
    }

    this.endPoint = {
      x: screenPoint.x - this.offset.x,
      y: screenPoint.y - this.offset.y
    }

    this.leader = new Leader(
      this.leaderContainer,
      this.startPoint)

    this.labelMarker = new LabelMarker(
      this,
      this.viewer,
      this.dbId,
      this.startPoint)

    this.setLeaderEndPoint(screenPoint)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  startDrag () {

    this.labelMarker.startDrag()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  endDrag () {

    this.labelMarker.endDrag()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setVisible (show) {

    //update only if it's a toggle

    if (show === this.visible) {

      return
    }

    this.visible = show

    this.labelMarker.setVisible(show)
    this.pinMarker.setVisible(show)
    this.leader.setVisible(show)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setLabelItem (item) {

    this.labelMarker.item = item

    this.labelMarker.updateLabel(
      item.name,
      item.value)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  normalize (screenPoint) {

    var viewport = this.viewer.navigation.getScreenViewport()

    var n = {
      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top) / viewport.height
    }

    return n
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  screenToWorld (screenPoint) {

    var n = this.normalize(screenPoint)

    var worldPoint = this.viewer.utilities.getHitPoint(
      n.x, n.y)

    return worldPoint
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  worldToScreen (screenPoint) {

    var n = this.normalize(screenPoint)

    var worldPoint = this.viewer.utilities.getHitPoint(
      n.x, n.y)

    return worldPoint
  }

  /////////////////////////////////////////////////////////////////
  // Return hit data
  // {
  //  dbId: nb
  //  face: THREE.Face3
  //  fragId: nb
  //  intersectPoint: THREE.Vector3
  //  model: RenderModel
  // }
  /////////////////////////////////////////////////////////////////
  getHitData(x, y) {

    y = 1.0 - y

    x = x * 2.0 - 1.0
    y = y * 2.0 - 1.0

    var vpVec = new THREE.Vector3(x, y, 1)

    var result = this.viewer.impl.hitTestViewport(
      vpVec, false)

    return result ? result : null
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  direction() {

    var dir = {
      x: this.endPoint.x - this.startPoint.x,
      y: this.endPoint.y - this.startPoint.y
    }

    return dir
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setLeaderEndPoint (endPoint) {

    this.endPoint = {
      x: endPoint.x - this.offset.x,
      y: endPoint.y - this.offset.y
    }

    this.update()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onTrackerModified (screenPoint) {

    this.startPoint = screenPoint

    if (this.occlusion && this.checkOcclusion()) {

      this.setVisible(false)

    } else {

      this.update()
      this.setVisible(true)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  checkOcclusion () {

    var n = this.normalize({
      x: this.startPoint.x + this.offset.x,
      y: this.startPoint.y + this.offset.y
    })

    var hitData = this.getHitData(
      n.x, n.y)

    if (hitData) {

      if(hitData.dbId != this.dbId) {

        return true
      }

      var worldPoint = this.pinMarker.getWorldPoint()

      var dist = {
        x: hitData.intersectPoint.x - worldPoint.x,
        y: hitData.intersectPoint.y - worldPoint.y,
        z: hitData.intersectPoint.z - worldPoint.z
      }

      var d =
        dist.x * dist.x +
        dist.y * dist.y +
        dist.z * dist.z

     if(d > 25.0){

       return true
     }
    }

   return false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  update(){

    var dir = this.direction()

    var norm = Math.sqrt(dir.x * dir.x + dir.y * dir.y)

    if(norm > 0) {
      dir.x = dir.x / norm
      dir.y = dir.y / norm
    }

    var leaderEndPoint = {
      x: this.startPoint.x + dir.x * Math.max(50, norm - 50),
      y: this.startPoint.y + dir.y * Math.max(50, norm - 50)
    }

    this.leader.update({
        x: this.startPoint.x + dir.x * 20,
        y: this.startPoint.y + dir.y * 20
      },
      leaderEndPoint)

    this.labelMarker.setScreenPoint({
      x: leaderEndPoint.x + (dir.x > 0 ? -dir.x * 50 : dir.x * 50),
      y: leaderEndPoint.y + (dir.y > 0 ? 20 : -30)
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  updateFragmentTransform(){

    var pos = this.meshPosition(
      this.fragId)

    var meshTranslation = {

      x: pos.x - this.initialMeshPos.x,
      y: pos.y - this.initialMeshPos.y,
      z: pos.z - this.initialMeshPos.z
    }

    var worldPoint = {

      x: this.initialWorldPoint.x + meshTranslation.x,
      y: this.initialWorldPoint.y + meshTranslation.y,
      z: this.initialWorldPoint.z + meshTranslation.z
    }

    this.pinMarker.setWorldPoint(worldPoint)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  meshPosition(fragId) {

    var mesh = this.viewer.impl.getRenderProxy(
      this.viewer.model,
      fragId)

    var pos = new THREE.Vector3()

    pos.setFromMatrixPosition(mesh.matrixWorld)

    return pos
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onMouseUp(event) {

    if (this.dragging) {

      this.labelMarker.endDrag()

      this.emit('drag.end', this)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  remove() {

    this.pinMarker.remove()
    this.leader.remove()
    this.labelMarker.remove()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  save() {

    var screenPoint = {
      x: this.startPoint.x + this.offset.x,
      y: this.startPoint.y + this.offset.y
    }

    var state = {
      worldPoint: this.initialWorldPoint,
      bindToState: this.bindToState,
      item: this.labelMarker.item,
      occlusion: this.occlusion,
      screenPoint: screenPoint,
      endPoint: this.endPoint,
      fragId: this.fragId,
      dbId: this.dbId
    }

    return state
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  static load(viewer, state) {

    var leaderNote = new LeaderNote(
      viewer,
      state.screenPoint,
      state.dbId,
      state.fragId,
      state.worldPoint)

    leaderNote.bindToState =
      state.bindToState

    leaderNote.occlusion =
      state.occlusion

    leaderNote.endPoint =
      state.endPoint

    leaderNote.setLabelItem(
      state.item)

    leaderNote.update()

    return leaderNote
  }
}