/////////////////////////////////////////////////////////////////
// PointTracker: Tracks a 3D point in world coordinates
// and returns 2D screen coordinates
// By Philippe Leefsma, April 2016
/////////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'

export default class PointTracker extends EventsEmitter {

  constructor (viewer) {

    super ()

    this.worldPoint = new THREE.Vector3()

    this.viewer = viewer

    //used to bind 'this' inside event hander
    this.cameraChangedHandler = (event)=>
      this.onCameraChanged(event);
  }

  /////////////////////////////////////////////////////////////////
  // Set screenpoint
  //
  /////////////////////////////////////////////////////////////////
  setScreenPoint (screenPoint) {

    var n = this.normalize(screenPoint)

    this.worldPoint =
      this.viewer.utilities.getHitPoint(n.x, n.y);
  }

  /////////////////////////////////////////////////////////////////
  // Get ScreenPoint
  //
  /////////////////////////////////////////////////////////////////
  getScreenPoint() {

    var screenPoint = this.viewer.worldToClient(
      this.worldPoint)

    return screenPoint;
  }

  /////////////////////////////////////////////////////////////////
  // Set worldpoint
  //
  /////////////////////////////////////////////////////////////////
  setWorldPoint(worldPoint) {

    this.worldPoint = worldPoint

    var screenPoint = this.viewer.worldToClient(
      this.worldPoint)

    this.emit('modified', screenPoint);
  }

  /////////////////////////////////////////////////////////////////
  // Get World Point
  //
  /////////////////////////////////////////////////////////////////
  getWorldPoint() {

    return this.worldPoint;
  }

  /////////////////////////////////////////////////////////////////
  // Activate tracking
  //
  /////////////////////////////////////////////////////////////////
  activate() {

    this.viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.cameraChangedHandler);
  }

  /////////////////////////////////////////////////////////////////
  // Deactivate tracking
  //
  /////////////////////////////////////////////////////////////////
  deactivate() {

    this.viewer.removeEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.cameraChangedHandler);
  }

  /////////////////////////////////////////////////////////////////
  // camera change callback
  //
  /////////////////////////////////////////////////////////////////
  onCameraChanged(event) {

    //var screenPoint = this.worldToScreen(
    //  this.worldPoint,
    //  this.viewer.navigation.getCamera());

    var screenPoint = this.viewer.worldToClient(
      this.worldPoint)

    this.emit('modified', screenPoint);
  }

  ///////////////////////////////////////////////////////////////////////////
  // Normalize screen coordinates
  //
  ///////////////////////////////////////////////////////////////////////////
  normalize (screenPoint) {

    var viewport = this.viewer.navigation.getScreenViewport()

    return {

      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top) / viewport.height
    }
  }
}
