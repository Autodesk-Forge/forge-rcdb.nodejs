/////////////////////////////////////////////////////////////////
// PointTracker: Tracks a 3D point in world coordinates
// and returns 2D screen coordinates
// By Philippe Leefsma, April 2016
/////////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'

export default class PointTracker extends EventsEmitter {

  constructor(viewer) {

    super();

    this._viewer = viewer;

    this.worldPoint = new THREE.Vector3();

    //used to bind 'this' inside event hander
    this.cameraChangedHandler = (event)=>
      this.onCameraChanged(event);
  }

  /////////////////////////////////////////////////////////////////
  // Set screenpoint
  //
  /////////////////////////////////////////////////////////////////
  setScreenPoint (screenPoint) {

    var n = this.normalize(screenPoint);

    this.worldPoint = this._viewer.utilities.getHitPoint(
      n.x, n.y);
  }

  /////////////////////////////////////////////////////////////////
  // Get ScreenPoint
  //
  /////////////////////////////////////////////////////////////////
  getScreenPoint() {

    var screenPoint = this.worldToScreen(
      this.worldPoint,
      this._viewer.navigation.getCamera());

    return screenPoint;
  }

  /////////////////////////////////////////////////////////////////
  // Set worldpoint
  //
  /////////////////////////////////////////////////////////////////
  setWorldPoint(worldPoint) {

    this.worldPoint = worldPoint;

    var screenPoint = this.worldToScreen(
      this.worldPoint,
      this._viewer.navigation.getCamera());

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

    this._viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.cameraChangedHandler);
  }

  /////////////////////////////////////////////////////////////////
  // Deactivate tracking
  //
  /////////////////////////////////////////////////////////////////
  deactivate() {

    this._viewer.removeEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.cameraChangedHandler);
  }

  /////////////////////////////////////////////////////////////////
  // camera change callback
  //
  /////////////////////////////////////////////////////////////////
  onCameraChanged(event) {

    var screenPoint = this.worldToScreen(
      this.worldPoint,
      this._viewer.navigation.getCamera());

    this.emit('modified', screenPoint);
  }

  ///////////////////////////////////////////////////////////////////////////
  // Normalize screen coordinates
  //
  ///////////////////////////////////////////////////////////////////////////
  normalize (screenPoint) {

    var viewport = this._viewer.navigation.getScreenViewport()

    return {

      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top) / viewport.height
    }
  }

  ///////////////////////////////////////////////////////////////////////////
  // world -> screen coords conversion
  //
  ///////////////////////////////////////////////////////////////////////////
  worldToScreen (worldPoint, camera) {

    var p = new THREE.Vector4()

    p.x = worldPoint.x
    p.y = worldPoint.y
    p.z = worldPoint.z
    p.w = 1

    p.applyMatrix4(camera.matrixWorldInverse)
    p.applyMatrix4(camera.projectionMatrix)

    // Don't want to mirror values with negative z (behind camera)
    // if camera is inside the bounding box,
    // better to throw markers to the screen sides.
    if (p.w > 0) {

      p.x /= p.w;
      p.y /= p.w;
      p.z /= p.w;
    }

    // This one is multiplying by width/2 and height/2,
    // and offsetting by canvas location
    var point = this._viewer.impl.viewportToClient(p.x, p.y);

    // snap to the center of the pixel
    point.x = Math.floor(point.x) + 0.5;
    point.y = Math.floor(point.y) + 0.5;

    return point;
  }
}