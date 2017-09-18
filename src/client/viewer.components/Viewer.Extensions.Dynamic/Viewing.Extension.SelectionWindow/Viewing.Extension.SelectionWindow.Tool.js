import cursors from './cursors'

var _CROSS_MAX_WIDTH = 20;

export default class SelectionWindowTool {

  constructor(viewer) {

    this.mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(0xFF0000),
      transparent: true,
      depthWrite: false,
      depthTest: true,
      linewidth: 10,
      opacity: 1.0
    })

    viewer.impl.createOverlayScene (
      'test', this.mat)

    this.onResize = this.onResize.bind(this)

    this.camera = viewer.navigation.getCamera()
    this.mouseStart = new THREE.Vector3(0,0,-10)
    this.mouseEnd = new THREE.Vector3(0,0,-10)
    this.materialLine = null
    this.isDragging = false
    this.crossGeomX = null
    this.crossGeomY = null
    this.isActive = false
    this.rectGroup = null
    this.lineGeom = null
    this.viewer = viewer
  }

  getNames () {

    return ["selectionWindowTool"]
  }

  getName () {

    return "selectionWindowTool"
  }

  onResize () {

    this.rectGroup = null;
    var canvas = this.viewer.canvas;
    var canvasWidth = canvas.clientWidth;
    var canvasHeight = canvas.clientHeight;
    var camera = new THREE.OrthographicCamera(0,canvasWidth,0,canvasHeight,1,1000);
    this.viewer.impl.overlayScenes["selectionWindowOverlay"].camera = camera;
  }

  activate (name) {

    this.materialLine = new THREE.LineBasicMaterial({
      color: new THREE.Color(0x0000FF),
      linewidth: 0.5,
      opacity: .6
    })

    var canvas = this.viewer.canvas
    var canvasWidth = canvas.clientWidth
    var canvasHeight = canvas.clientHeight

    var camera = new THREE.OrthographicCamera(
      0,canvasWidth,0,canvasHeight,1,1000)

    this.viewer.impl.createOverlayScene(
      "selectionWindowOverlay",
      this.materialLine,
      this.materialLine,
      camera)

    this.viewer.impl.api.addEventListener(
      Autodesk.Viewing.VIEWER_RESIZE_EVENT,
      this.onResize)

    var tool = this.viewer.toolController.getTool("dolly")

    tool.activate("orbit")

    this.isActive = true
  }

  deactivate () {

    this.mouseStart.set(0,0,-10)
    this.mouseEnd.set(0,0,-10)

    this.isDragging = false
    this.isActive = false
    this.rectGroup = null

    this.viewer.impl.api.removeEventListener(
      Autodesk.Viewing.VIEWER_RESIZE_EVENT,
      this.onResize)

    var tool = this.viewer.toolController.getTool("dolly")

    tool.deactivate("orbit")
  }

  getCursor () {

    var tool = this.viewer.toolController.getTool("dolly")
    var mode = tool.getTriggeredMode()

    switch (mode) {

      case "dolly":
        return cursors.dolly

      case "pan":
        return cursors.pan
    }

    return cursors.window
  }

  handleGesture (event) {

    return true;
  }

  handleSingleClick (event, button) {

    return true;
  }

  startDrag (event) {

    if (this.isDragging === false) {

      // begin dragging
      this.isDragging = true;
      this.mouseStart.x = event.canvasX;
      this.mouseStart.y = event.canvasY;
      this.mouseEnd.x = event.canvasX;
      this.mouseEnd.y = event.canvasY;

      if(this.rectGroup === null) {

        this.lineGeom = new THREE.Geometry();

        // rectangle of zoom window
        this.lineGeom.vertices.push(
          this.mouseStart.clone(),
          this.mouseStart.clone(),
          this.mouseStart.clone(),
          this.mouseStart.clone(),
          this.mouseStart.clone());

        // cross for identify zoom window center.
        this.crossGeomX = new THREE.Geometry();

        this.crossGeomX.vertices.push(
          this.mouseStart.clone(),
          this.mouseStart.clone());

        this.crossGeomY = new THREE.Geometry();

        this.crossGeomY.vertices.push(
          this.mouseStart.clone(),
          this.mouseStart.clone());

        // add geom to group
        var line_mesh = new THREE.Line(this.lineGeom, this.materialLine, THREE.LineStrip);
        var line_cross_x = new THREE.Line(this.crossGeomX,this.materialLine, THREE.LineStrip);
        var line_cross_y = new THREE.Line(this.crossGeomY,this.materialLine, THREE.LineStrip);

        this.rectGroup = new THREE.Group();
        this.rectGroup.add(line_mesh);
        this.rectGroup.add(line_cross_x);
        this.rectGroup.add(line_cross_y);

      } else {

        this.lineGeom.vertices[0] = this.mouseStart.clone();
        this.lineGeom.vertices[1] = this.mouseStart.clone();
        this.lineGeom.vertices[2] = this.mouseStart.clone();
        this.lineGeom.vertices[3] = this.mouseStart.clone();
        this.lineGeom.vertices[4] = this.mouseStart.clone();

        this.crossGeomX.vertices[0] = this.mouseStart.clone();
        this.crossGeomX.vertices[1] = this.mouseStart.clone();
        this.crossGeomY.vertices[0] = this.mouseStart.clone();
        this.crossGeomY.vertices[1] = this.mouseStart.clone();

        this.crossGeomX.verticesNeedUpdate = true;
        this.crossGeomY.verticesNeedUpdate = true;
        this.lineGeom.verticesNeedUpdate = true;
      }
      this.viewer.impl.addOverlay("selectionWindowOverlay",this.rectGroup);
    }
  }

  handleButtonDown (event, button) {

    //left button down
    if(button === 0) {
      this.startDrag(event)
      return true
    }
    return false
  }

  handleMouseMove (event) {

    if(this.lineGeom && this.isDragging) {
      this.mouseEnd.x = event.canvasX
      this.mouseEnd.y = event.canvasY
      return true
    }

    return false
  }

  endDrag (event) {

    if(this.isDragging === true) {

      this.viewer.impl.removeOverlay(
        "selectionWindowOverlay", this.rectGroup)

      this.isDragging = false;
    }
  }

  handleButtonUp (event, button) {

    if(button === 0) {

      this.endDrag()
      return true
    }
    return false
  }

  update () {

    if(!this.isActive)
      return;

    if(this.lineGeom && this.isDragging) {

      // draw rectangle
      this.lineGeom.vertices[1].x = this.mouseStart.x;
      this.lineGeom.vertices[1].y = this.mouseEnd .y;
      this.lineGeom.vertices[2] = this.mouseEnd .clone();
      this.lineGeom.vertices[3].x = this.mouseEnd .x;
      this.lineGeom.vertices[3].y = this.mouseStart.y;
      this.lineGeom.vertices[4] = this.lineGeom.vertices[0];

      // draw cross
      var width = Math.abs(this.mouseEnd .x - this.mouseStart.x);
      var height = Math.abs(this.mouseEnd .y - this.mouseStart.y);
      var length = width>height ? height : width;

      if(length > _CROSS_MAX_WIDTH) {
        length = _CROSS_MAX_WIDTH;
      }

      var half_length = length*0.5;

      var cross_center = [(this.mouseEnd .x + this.mouseStart.x)*0.5,
        (this.mouseEnd .y + this.mouseStart.y)*0.5];

      this.crossGeomX.vertices[0].x = cross_center[0] - half_length;
      this.crossGeomX.vertices[0].y = cross_center[1];
      this.crossGeomX.vertices[1].x = cross_center[0] + half_length;
      this.crossGeomX.vertices[1].y = cross_center[1];

      this.crossGeomY.vertices[0].x = cross_center[0];
      this.crossGeomY.vertices[0].y = cross_center[1] - half_length;
      this.crossGeomY.vertices[1].x = cross_center[0];
      this.crossGeomY.vertices[1].y = cross_center[1] + half_length;

      this.crossGeomX.verticesNeedUpdate = true;
      this.crossGeomY.verticesNeedUpdate = true;
      this.lineGeom.verticesNeedUpdate = true;
      // only redraw overlay
      this.viewer.impl.invalidate(false, false, true)

    } else {

      return this.zoomWindow()
    }

    return false
  }

  getPivot (mouseX, mouseY, screenWidth, screenHeight, camera) {

    // Convert mouse coordinates to clip space (-1 to 1)
    mouseX = 2 * mouseX / screenWidth - 1;
    mouseY = 1 - 2 * mouseY / screenHeight;

    // Get the ray through mouseX, mouseY
    var start = new THREE.Vector3(mouseX, mouseY, -1);
    var dir = new THREE.Vector3(mouseX, mouseY, 1);
    start.unproject(camera);
    dir.unproject(camera);
    dir.sub(start);

    // Now project the ray onto the plane perpendicular to the view direction
    // that contains the camera target. To do this we solve these equations:
    // viewDir.dot(pivot) == viewDir.dot(target), because the pivot is in the plane of the target
    // pivot = start + t * dir for some t, because pivot is on the ray through mouseX, mouseY
    // The solution goes like this:
    // Substitute pivot from the second equation to the first
    // viewDir.dot(start + t * dir) == viewDir.dot(target)
    // Distribut dot()
    // viewDir.dot(start) + t * viewDir.dot(dir) == view.dot(target)
    // t = (viewDir.dot(target) - viewDir.dot(start)) / view.dot(dir)
    var eye = camera.position;
    var target = camera.target;
    var viewDir = target.clone().sub(eye).normalize();
    var t = (viewDir.dot(target) - viewDir.dot(start)) / viewDir.dot(dir);
    start.add(dir.multiplyScalar(t));
    return start;
  }

  queryMouseRaySceneIntersection (centerX, centerY) {

    if(this.viewer == null)
      return null

    if(this.viewer.model == null)
      return null

    if(this.viewer.model.is2d()) {
      return null
    }

    var result = this.viewer.impl.hitTest(centerX,centerY,false)

    return result ? result.intersectPoint : null
  }

  zoomWindow () {

    var camera = this.camera;
    var canvasWidth = this.viewer.canvas.clientWidth;
    var canvasHeight = this.viewer.canvas.clientHeight;
    var rectMinX = this.mouseStart.x;
    var rectMinY = this.mouseStart.y;
    var rectMaxX = this.mouseEnd .x;
    var rectMaxY = this.mouseEnd .y;

    var rectWidth = Math.abs(rectMaxX - rectMinX);
    var rectHeight = Math.abs(rectMaxY - rectMinY)

    if(rectWidth === 0 || rectHeight ===0) {

      return false;
    }

    this.mouseEnd.copy(this.mouseStart);

    if (this.viewer.navigation.getIs2D()) {

      var vpVec = {
        x:(rectMinX + rectMaxX)*0.5,
        y:(rectMinY + rectMaxY)*0.5
      };

      // Pan to the center of the zoom window first.
      var distance = this.viewer.navigation.getEyeVector().length();
      var delta = this.viewer.impl.clientToViewport(vpVec.x, vpVec.y);
      var on = this.viewer.impl.clientToViewport(canvasWidth/2, canvasHeight/2);
      delta.subVectors(delta, on);
      this.viewer.navigation.panRelative(delta.x/2, delta.y/2, distance);

      // Get scale
      var scaleX = rectWidth/canvasWidth;
      var scaleY = rectHeight/canvasHeight;
      var scale = scaleX > scaleY?scaleX:scaleY;

      // Dolly
      distance = this.viewer.navigation.getEyeVector().length();
      var dollyTarget = this.viewer.navigation.getWorldPoint(0.5, 0.5);
      this.viewer.navigation.dollyFromPoint(distance*(scale-1), dollyTarget);

      this.deactivate()
      return true;
    }

    // ??? Should pick with rect first but currently LMV doesn't support rectangle selection
    // ??? So, do hit test only
    var hit = false;
    var pivot = null;

    // if pick up nothing, try ray pick
    if(!hit) {

      var centerX = (rectMinX + rectMaxX) * 0.5
      var centerY = (rectMinY + rectMaxY) * 0.5

      pivot = this.queryMouseRaySceneIntersection(centerX,centerY);
      // if pick up nothing, set pivot as intersection point from screen ray to project plane.
      if(pivot === null) {
        pivot = this.getPivot(centerX, centerY, canvasWidth, canvasHeight, this.camera);
      }
    }

    const geometry = new THREE.Geometry()

    console.log(pivot)

    geometry.vertices.push(pivot)
    geometry.vertices.push(camera.position)

    const lines = new THREE.Line(geometry,
      this.mat, THREE.LinePieces)

    this.viewer.impl.addOverlay('test', lines)

    this.viewer.impl.invalidate(
      true, true, true)



    // calculate the basis vectors for the camera frame
    var eye = camera.position;
    var viewDir = camera.target.clone().sub(eye);
    viewDir.normalize();

    // calculate z camera translation for pan and zoom
    var scaleFactor = Math.min(canvasWidth/rectWidth, canvasHeight/rectHeight);
    var distEye2Pivot = pivot.distanceTo(eye);
    var zoomDist = distEye2Pivot * 1/scaleFactor;

    // Calculate the new eye. The pivot is the new target.
    viewDir.multiplyScalar(-zoomDist);
    viewDir.add(pivot);

    camera.position.set(viewDir.x,viewDir.y,viewDir.z);
    camera.target.set(pivot.x,pivot.y,pivot.z);
    camera.dirty = true;

    this.deactivate()
    return true;
  }
}


var _getCameraPlane = function(pos, nor) {
  var planeNor = nor || pos.clone().sub(_camera.position).normalize();
  return new THREE.Plane(
    planeNor, -planeNor.x*pos.x - planeNor.y*pos.y - planeNor.z*pos.z
  );
};

var _centerPivot = function() {
  // find distance pivot to camera plane
  // set new pivot to be that distance along eye vector
  var eyeVec = _camera.target.clone().sub(_camera.position).normalize();
  var plane = _getCameraPlane(_camera.position, eyeVec);
  var dist = plane.distanceToPoint(_camera.pivot);
  _camera.pivot.copy(eyeVec).multiplyScalar(dist).add(_camera.position);
};
