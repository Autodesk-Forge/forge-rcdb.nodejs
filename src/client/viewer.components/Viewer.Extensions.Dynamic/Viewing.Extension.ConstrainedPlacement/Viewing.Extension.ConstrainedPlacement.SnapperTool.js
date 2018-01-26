(function(){

  AutodeskNamespace("Viewing.Extension.ConstrainedPlacement")

  function SnapperTool(viewer) {

    var _events = this.events = new Viewing.Extension.ConstrainedPlacement.EventsEmitter

    var _tooltip = null

    var _snappedGeometry = null;
    var _snappedGeometryType = null;

    var _detectRadius = 0.1;

    var _onSelectionCancelled = null;

    var SNAP_PRECISION = 0.001

    var _tool = this;

    var _viewer = viewer;

    var _names = ["snapper-tool"];
    var _active = false;

    var _vertexOverlayName = 'MeasureTool-snapper-vertex'
    var _faceOverlayName = 'MeasureTool-snapper-face'
    var _edgeOverlayName = 'MeasureTool-snapper-edge'

    var _radius = 0.05;
    var _distanceToEdge = null;
    var _distanceToVertex = null;

    var _geomFace = null;
    var _geomEdge = null;
    var _geomVertex = null;
    var _snapNode = null;

    var _geomHighlighted = null; //  {"VERTEX": 0, "EDGE": 1, "FACE": 2}

    var _intersectPoint = null;
    var _faceNormal = null;

    var _isDragging = false;

    var _snappingNode = null;

    var _isSnapped = false;

    var _selectionFilter = [];

    this.getNames = function() {
      return _names;
    };

    this.getName = function() {
      return _names[0];
    };

    this.activate = function() {

      if (!_active) {

        _isDragging = false

        _active = true

        viewer.toolController.activateTool(
          'snapper-tool')

        _events.emit('activate')
      }
    }

    this.deactivate = function() {

      if (_active) {

        _active = false

        this.destroy()

        viewer.toolController.deactivateTool(
          'snapper-tool')

        _events.emit('deactivate')
      }
    }

    this.getFace = function() {
      return _geomFace;
    };

    this.getEdge = function() {
      return _geomEdge;
    };

    this.getVertex = function() {
      return _geomVertex;
    };

    this.getSnapNode = function() {
      return _snapNode;
    }

    this.getHighlightGeometry = function() {
      return _geomHighlighted;
    };

    this.getIntersectPoint = function() {
      return _intersectPoint;
    };

    this.getFaceNormal = function() {
      return _faceNormal;
    };

    this.getEndPointsInEdge = function(edge) {

      var vertices = edge.vertices;
      var endPoints = [];

      for (var i = 0; i < vertices.length; ++i) {

        var duplicate = false;

        for (var j = 0; j < vertices.length; ++j) {

          if (j !== i && vertices[j].equals(vertices[i])) {

            duplicate = true;
            break;
          }
        }

        if (!duplicate) {

          endPoints.push(vertices[i]);

        }
      }

      return endPoints;
    };

    this.isSnapped = function() {
      return _isSnapped;
    };

    this.isEqualWithPrecision = function(a, b) {

      if (a <= b + SNAP_PRECISION && a >= b - SNAP_PRECISION) {
        return true;
      }

      return false;
    };

    this.isEqualVectorsWithPrecision = function(v1, v2) {

      if (v1.x <= v2.x + SNAP_PRECISION && v1.x >= v2.x - SNAP_PRECISION && v1.y <= v2.y + SNAP_PRECISION && v1.y >= v2.y - SNAP_PRECISION
        && v1.z <= v2.z + SNAP_PRECISION && v1.z >= v2.z - SNAP_PRECISION) {

        return true;
      }

      return false;
    };

    this.isInverseVectorsWithPrecision = function(v1, v2) {

      if (v1.x <= -v2.x + SNAP_PRECISION && v1.x >= -v2.x - SNAP_PRECISION && v1.y <= -v2.y + SNAP_PRECISION && v1.y >= -v2.y - SNAP_PRECISION
        && v1.z <= -v2.z + SNAP_PRECISION && v1.z >= -v2.z - SNAP_PRECISION) {

        return true;
      }

      return false;
    };

    /**
     * 3D Snapping
     * @param result -Result of Hit Test.
     */
    this.snapping3D = function(result) {

      _snapNode = result.dbId;

      var face = result.face;
      var intersectPoint = result.intersectPoint;
      var fragIds;

      if (result.fragId.length === undefined) {
        fragIds = [result.fragId];
      } else {
        fragIds = result.fragId;
      }

      for (var fi = 0; fi < fragIds.length; ++fi) {

        var fragId = fragIds[fi];
        var mesh = _viewer.impl.getRenderProxy(_viewer.model, fragId);
        var geometry = mesh.geometry;

        _geomFace = this.faceSnapping(face, geometry);

        if (_geomFace) {

          _geomEdge = this.edgeSnapping(_geomFace, intersectPoint, mesh);

          _geomVertex = this.vertexSnapping(_geomEdge, intersectPoint);

          _geomFace.applyMatrix(mesh.matrixWorld);
          _geomEdge.applyMatrix(mesh.matrixWorld);
          _geomVertex.applyMatrix4(mesh.matrixWorld);

          _intersectPoint = intersectPoint.applyMatrix4(mesh.matrixWorld);

          var normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
          _faceNormal = face.normal.applyMatrix3(normalMatrix).normalize();

          // Determine which one should be drawn: face , edge or vertex
          //_radius = this.getDetectRadius(_intersectPoint);

          _isSnapped = true;

          if (_distanceToVertex < _detectRadius) {

            if(vertexSnap(_geomVertex))
              return;
          }

          if (_distanceToEdge < _detectRadius) {

            if(edgeSnap(_geomEdge))
              return;
          }

          faceSnap(_geomFace);

          break;
        }
      }
    };

    this.setDetectRadius = function(radius) {

      _detectRadius = radius;
    }

    this.addSelectionFilter = function (filter){

      if(Array.isArray(filter)){

        _selectionFilter = filter;
      }
      else {

        _selectionFilter.push(filter);
      }
    }

    this.removeSelectionFilter = function (filter) {

      if(Array.isArray(filter)){

        _selectionFilter = _.filter(
          _selectionFilter, function(item){
            return filter.indexOf(item) < 0;
          });
      }
      else {

        _selectionFilter = _.filter(
          _selectionFilter, function(item){
            return item != filter;
          });
      }
    }

    this.clearSelectionFilter = function () {

      _selectionFilter = [];
    }

    this.onVertexSnapped = function(callback) {

      _onVertexSnapped = callback;
    }

    this.onEdgeSnapped = function(callback) {

      _onEdgeSnapped = callback;
    }

    this.onFaceSnapped = function(callback) {

      _onFaceSnapped = callback;
    }

    this.onGeometrySelected = function(callback) {

      _onGeometrySelected = callback;
    }

    this.onSelectionCancelled = function(callback) {

      _onSelectionCancelled = callback;
    }

    function vertexSnap(geometry) {

      if(!_selectionFilter.length || _selectionFilter.indexOf('vertex') > -1) {

        _snappedGeometry = geometry

        _snappedGeometryType = 'vertex'

        if (_events.emit('vertex.snapped', geometry)){

          return false
        }

        _tool.drawPoint(geometry)

        return true
      }

      return false
    }

    function edgeSnap(geometry) {

      if(!_selectionFilter.length || _selectionFilter.indexOf('edge') > -1) {

        _snappedGeometry = geometry;

        _snappedGeometryType = 'edge';

        if (_events.emit('edge.snapped', geometry)){

          return false
        }

        _tool.drawLine(geometry)

        return true
      }

      return false
    }

    function faceSnap(geometry) {

      if(!_selectionFilter.length || _selectionFilter.indexOf('face') > -1) {

        _snappedGeometry = geometry;

        _snappedGeometryType = 'face';

        if (_events.emit('face.snapped', geometry)){

          return false
        }

        _tool.drawFace(geometry);

        return true;
      }

      return false;
    }

    function createTooltip() {

      _tooltip = document.createElement('div')

      _tooltip.className = 'snapper-tooltip'

      viewer.container.appendChild(_tooltip)
    }

    this.showTooltip = function(show, text) {

      _tooltip.style.visibility = show
        ? 'visible'
        : 'hidden'

      _tooltip.innerHTML = text
    }

    /////////////////////////////////////////////////////////
    // Generates random guid
    //
    /////////////////////////////////////////////////////////
    function guid() {

      var d = new Date().getTime();

      var guid = 'xxxx-xxxx-xxxx'.replace(
        /[xy]/g,
        function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });

      return guid;
    }

    /**
     * Find the closest face next to the cast ray
     * @param face - the intersect triangle of Hit Test.
     * @param geometry - the geometry of mesh
     */
    this.faceSnapping = function(face, geometry) {

      var vA = new THREE.Vector3();
      var vB = new THREE.Vector3();
      var vC = new THREE.Vector3();

      var geom = new THREE.Geometry();  //Geometry which includes all the triangles on the same plane.

      var attributes = geometry.attributes;

      if (attributes.index !== undefined) {

        var indices = attributes.index.array || geometry.ib;
        var positions = geometry.vb ? geometry.vb : attributes.position.array;
        var stride = geometry.vb ? geometry.vbstride : 3;
        var offsets = geometry.offsets;

        if ( !offsets || offsets.length === 0) {

          offsets = [{start: 0, count: indices.length, index: 0}];

        }

        for (var oi = 0; oi < offsets.length; ++oi) {

          var start = offsets[oi].start;
          var count = offsets[oi].count;
          var index = offsets[oi].index;

          for (var i = start; i < start + count; i += 3) {

            var a = index + indices[i];
            var b = index + indices[i + 1];
            var c = index + indices[i + 2];

            vA.set(
              positions[a * stride],
              positions[a * stride + 1],
              positions[a * stride + 2]
            );
            vB.set(
              positions[b * stride],
              positions[b * stride + 1],
              positions[b * stride + 2]
            );
            vC.set(
              positions[c * stride],
              positions[c * stride + 1],
              positions[c * stride + 2]
            );

            var faceNormal = THREE.Triangle.normal(vA, vB, vC);

            var va = new THREE.Vector3();
            va.set(
              positions[ face.a * stride ],
              positions[ face.a * stride + 1 ],
              positions[ face.a * stride + 2 ]
            );

            if (this.isEqualVectorsWithPrecision(faceNormal, face.normal) && this.isEqualWithPrecision(faceNormal.dot(vA), face.normal.dot(va)))
            {

              var vIndex = geom.vertices.length;

              geom.vertices.push(vA.clone());
              geom.vertices.push(vB.clone());
              geom.vertices.push(vC.clone());

              geom.faces.push(new THREE.Face3(vIndex, vIndex + 1, vIndex + 2));
            }
          }
        }
      }

      if (geom.vertices.length > 0) {

        return this.getTrianglesOnSameFace(geom, face, positions, stride);
      }
      else {

        return null;
      }
    };

    /**
     * Find triangles on the same face with the triangle intersected with the cast ray
     * @param geom -Geometry which includes all the triangles on the same plane.
     * @param face -Triangle which intersects with the cast ray.
     * @param positions -Positions of all vertices.
     * @param stride -Stride for the interleaved buffer.
     */
    this.getTrianglesOnSameFace = function(geom, face, positions, stride) {

      var isIncludeFace = false; // Check if the intersect face is in the mesh
      var vertexIndices = geom.vertices.slice();

      var va = new THREE.Vector3();
      va.set(
        positions[ face.a * stride ],
        positions[ face.a * stride + 1 ],
        positions[ face.a * stride + 2 ]
      );
      var vb = new THREE.Vector3();
      vb.set(
        positions[ face.b * stride ],
        positions[ face.b * stride + 1 ],
        positions[ face.b * stride + 2 ]
      );
      var vc = new THREE.Vector3();
      vc.set(
        positions[ face.c * stride ],
        positions[ face.c * stride + 1 ],
        positions[ face.c * stride + 2 ]
      );
      var intersectFace = new THREE.Geometry();
      intersectFace.vertices.push(va);
      intersectFace.vertices.push(vb);
      intersectFace.vertices.push(vc);
      intersectFace.faces.push(new THREE.Face3(0, 1, 2));

      var vCount = [];

      do {

        vCount = [];

        for (var j = 0; j < vertexIndices.length; j += 3) {

          // The triangle which is intersected with the ray
          if (vertexIndices[j].equals(va) && vertexIndices[j + 1].equals(vb) && vertexIndices[j + 2].equals(vc)) {

            isIncludeFace = true;
            vCount.push(j);
            continue;
          }

          for (var k = 0; k < intersectFace.vertices.length; k += 3) {

            // The triangles which are on the same face with the intersected triangle
            if (this.trianglesSharedEdge(vertexIndices[j], vertexIndices[j + 1], vertexIndices[j + 2],
                intersectFace.vertices[k], intersectFace.vertices[k + 1], intersectFace.vertices[k + 2])) {

              var vIndex = intersectFace.vertices.length;
              intersectFace.vertices.push(vertexIndices[j].clone());
              intersectFace.vertices.push(vertexIndices[j + 1].clone());
              intersectFace.vertices.push(vertexIndices[j + 2].clone());
              intersectFace.faces.push(new THREE.Face3(vIndex, vIndex + 1, vIndex + 2));

              vCount.push(j);
              break;
            }
          }
        }

        for (var ci = vCount.length - 1; ci >= 0; --ci) {

          vertexIndices.splice(vCount[ci], 3);

        }

      } while (vCount.length > 0);

      if (isIncludeFace) {
        return intersectFace;
      }
      else {
        return null;
      }

    };

    /**
     * Check if the two triangle share edge, the inputs are their vertices
     */
    this.trianglesSharedEdge = function(a1, a2, a3, b1, b2, b3) {

      var c1 = false;
      var c2 = false;
      var c3 = false;

      if (a1.equals(b1) || a1.equals(b2) || a1.equals(b3)) {
        c1 = true;
      }
      if (a2.equals(b1) || a2.equals(b2) || a2.equals(b3)) {
        c2 = true;
      }
      if (a3.equals(b1) || a3.equals(b2) || a3.equals(b3)) {
        c3 = true;
      }

      if (c1 & c2 || c1 & c3 || c2 & c3) {
        return true;
      }

      return false;
    };

    /**
     * Find the closest edge next to the intersect point
     * @param face -Face which is found by faceSnapping.
     * @param intersectPoint -IntersectPoint between cast ray and face.
     * @param mesh -The whole mesh of one fragment.
     */
    this.edgeSnapping = function(face, intersectPoint, mesh) {

      var lineGeom = new THREE.Geometry();
      var isEdge_12 = true;
      var isEdge_13 = true;
      var isEdge_23 = true;

      for (var i = 0; i < face.vertices.length; i += 3) {

        for (var j = 0; j < face.vertices.length; j += 3) {

          if ( i !== j ) {
            // Check edge 12
            if ((face.vertices[i].equals(face.vertices[j]) || face.vertices[i].equals(face.vertices[j + 1])
              || face.vertices[i].equals(face.vertices[j + 2]))
              && (face.vertices[i + 1].equals(face.vertices[j]) || face.vertices[i + 1].equals(face.vertices[j + 1])
              || face.vertices[i + 1].equals(face.vertices[j + 2]))) {

              isEdge_12 = false;

            }
            // Check edge 13
            if ((face.vertices[i].equals(face.vertices[j]) || face.vertices[i].equals(face.vertices[j + 1])
              || face.vertices[i].equals(face.vertices[j + 2]))
              && (face.vertices[i + 2].equals(face.vertices[j]) || face.vertices[i + 2].equals(face.vertices[j + 1])
              || face.vertices[i + 2].equals(face.vertices[j + 2]))) {

              isEdge_13 = false;

            }
            // Check edge 23
            if ((face.vertices[i + 1].equals(face.vertices[j]) || face.vertices[i + 1].equals(face.vertices[j + 1])
              || face.vertices[i + 1].equals(face.vertices[j + 2]))
              && (face.vertices[i + 2].equals(face.vertices[j]) || face.vertices[i + 2].equals(face.vertices[j + 1])
              || face.vertices[i + 2].equals(face.vertices[j + 2]))) {

              isEdge_23 = false;

            }
          }
        }

        if (isEdge_12) {

          lineGeom.vertices.push(face.vertices[i].clone());
          lineGeom.vertices.push(face.vertices[i + 1].clone());

        }
        if (isEdge_13) {

          lineGeom.vertices.push(face.vertices[i].clone());
          lineGeom.vertices.push(face.vertices[i + 2].clone());

        }
        if (isEdge_23) {

          lineGeom.vertices.push(face.vertices[i + 1].clone());
          lineGeom.vertices.push(face.vertices[i + 2].clone());

        }

        isEdge_12 = true;
        isEdge_13 = true;
        isEdge_23 = true;

      }

      //return lineGeom;

      var edgeGeom = new THREE.Geometry();
      var minDistIndex;
      var minDist = Number.MAX_VALUE;
      var matrix = new THREE.Matrix4();
      matrix.getInverse(mesh.matrixWorld);
      intersectPoint.applyMatrix4(matrix);

      for (var k = 0; k < lineGeom.vertices.length; k += 2) {

        var dist = this.distancePointToLine(intersectPoint, lineGeom.vertices[k], lineGeom.vertices[k + 1]);

        if (dist < minDist) {
          minDist = dist;
          minDistIndex = k;
        }

      }

      edgeGeom.vertices.push(lineGeom.vertices[ minDistIndex ].clone());
      edgeGeom.vertices.push(lineGeom.vertices[ minDistIndex + 1 ].clone());

      edgeGeom.vertices = this.getConnectedLineSegmentsOnSameLine(lineGeom, edgeGeom.vertices);

      _distanceToEdge = minDist;

      return edgeGeom;

    };

    this.distancePointToLine = function (point, lineStart, lineEnd) {

      var X0 = new THREE.Vector3();
      var X1 = new THREE.Vector3();
      var distance;
      var param;

      X0.subVectors(lineStart, point);
      X1.subVectors(lineEnd, lineStart);
      param = X0.dot(X1);
      X0.subVectors(lineEnd, lineStart);
      param = -param / X0.dot(X0);

      if (param < 0) {
        distance = point.distanceTo(lineStart);
      }
      else if (param > 1) {
        distance = point.distanceTo(lineEnd);
      }
      else {
        X0.subVectors(point, lineStart);
        X1.subVectors(point, lineEnd);
        X0.cross(X1);
        X1.subVectors(lineEnd, lineStart);

        distance = Math.sqrt(X0.dot(X0)) / Math.sqrt(X1.dot(X1));
      }

      return distance;
    };

    this.getConnectedLineSegmentsOnSameLine = function(lineGeom, edgeVertices) {

      var vertices = lineGeom.vertices.slice();
      var va = edgeVertices[0];
      var vb = edgeVertices[1];

      var vCount = [];

      do {

        vCount = [];

        for (var j = 0; j < vertices.length; j += 2) {

          // The line which has min distance to intersection point
          if (vertices[j].equals(va) && vertices[j + 1].equals(vb)) {

            continue;
          }

          for (var k = 0; k < edgeVertices.length; k += 2) {

            // The line segments which are connected on the same line
            if (vertices[j].equals(edgeVertices[k]) || vertices[j + 1].equals(edgeVertices[k]) ||
              vertices[j].equals(edgeVertices[k + 1]) || vertices[j + 1].equals(edgeVertices[k + 1])) {

              var V0 = new THREE.Vector3();
              var V1 = new THREE.Vector3();

              V0.subVectors(edgeVertices[k],  edgeVertices[k + 1]);
              V0.normalize();
              V1.subVectors(vertices[j],vertices[j + 1]);
              V1.normalize();

              //if (V0.equals(V1) || V0.equals(V1.negate())) {
              if (this.isEqualVectorsWithPrecision(V0, V1) || this.isInverseVectorsWithPrecision(V0, V1))
              {

                vCount.push(j);
                break;

              }
            }
          }
        }

        for (var ci = vCount.length - 1; ci >= 0; --ci) {

          edgeVertices.push(vertices[ vCount[ci] ]);
          edgeVertices.push(vertices[ vCount[ci] + 1 ]);
          vertices.splice(vCount[ci], 2);

        }

      } while (vCount.length > 0);

      return edgeVertices;

    };

    /**
     * Find the closest vertex next to the intersect point
     * @param edge -Edge which is found by edgeSnapping.
     * @param intersectPoint -IntersectPoint between cast ray and face.
     */
    this.vertexSnapping = function(edge, intersectPoint) {

      var minDist = Number.MAX_VALUE;
      var point;

      for (var i = 0; i < edge.vertices.length; ++i) {

        var dist = intersectPoint.distanceTo(edge.vertices[i]);

        if (dist < minDist - SNAP_PRECISION) {

          minDist = dist;
          point = edge.vertices[i].clone();

        }
      }

      _distanceToVertex = minDist;

      return point;
    };

    this.angleVector2 = function(vector) {

      if (vector.x > 0 && vector.y >= 0) {
        return Math.atan(vector.y / vector.x);
      }
      else if (vector.x >= 0 && vector.y < 0) {
        return Math.atan(vector.y / vector.x) + Math.PI * 2;
      }
      else if (vector.x < 0 && vector.y <= 0) {
        return Math.atan(vector.y / vector.x) + Math.PI;
      }
      else if (vector.x <= 0 && vector.y > 0) {
        return Math.atan(vector.y / vector.x) + Math.PI;
      }
      else{ // x = 0, y = 0
        return null;
      }
    };

    function GeometryCallback(viewer, snapper) {
      this.viewer = viewer;
      this.snapper = snapper;

      this.lineGeom = new THREE.Geometry();
      this.circularArc = null;
      this.circularArcCenter;
      this.ellipticalArc = null;

      this.minDist = Number.MAX_VALUE;
    }

    GeometryCallback.prototype.onLineSegment = function(x1, y1, x2, y2) {
      //stderr("line segment");
      var vertices = this.lineGeom.vertices;
      var v1 = new THREE.Vector3(x1, y1, 0);
      var v2 = new THREE.Vector3(x2, y2, 0);

      var intersectPoint = this.snapper.getIntersectPoint();
      var dist = this.snapper.distancePointToLine(intersectPoint, v1, v2);
      if (dist < this.minDist) {

        vertices.splice(0, 2, v1, v2);
        this.minDist = dist;
      }
    };

    GeometryCallback.prototype.onCircularArc = function(cx, cy, start, end, radius) {
      //stderr("circular arc");
      var intersectPoint = this.snapper.getIntersectPoint();
      var point = new THREE.Vector2(intersectPoint.x, intersectPoint.y);

      var center = new THREE.Vector2(cx, cy);
      var dist = point.distanceTo(center);
      point.sub(center);

      var angle = this.snapper.angleVector2(point);

      if (dist <= radius + 0.1 && dist >= radius - 0.1) {

        if (end > start && angle >= start && angle <= end) {
          var arc = new THREE.CircleGeometry(radius, 100, start, end - start);
        }
        else if (end < start && (angle >= start || angle <= end)) {
          var arc = new THREE.CircleGeometry(radius, 100, start, Math.PI * 2 - start + end);
        }
        else {
          return;
        }
        arc.vertices.splice(0, 1);
        this.circularArc = arc;
        this.circularArcCenter = new THREE.Vector3(cx, cy, 0);
      }
    };

    GeometryCallback.prototype.onEllipticalArc = function(cx, cy, start, end, major, minor, tilt) {
      //stderr("elliptical arc");
      //console.log("cx " + cx + " cy " + cy + " major " + major + " minor " + minor + " start " + start + " end " + end + " tilt " + tilt);
      var intersectPoint = this.snapper.getIntersectPoint();
      var point = new THREE.Vector2(intersectPoint.x, intersectPoint.y);

      var equation = (point.x - cx) * (point.x - cx) / (major * major) + (point.y - cy) * (point.y - cy) / (minor * minor);

      var center = new THREE.Vector2(cx, cy);
      point.sub(center);
      point.x *= minor;
      point.y *= major;
      var angle = this.snapper.angleVector2(point);

      if (end > Math.PI * 2) {
        end = Math.PI * 2;
      }

      if (equation <= 1 + 0.1 && equation >= 1 - 0.1) {

        if ((end > start && angle >= start && angle <= end) || (end < start && (angle >= start || angle <= end))){
          var curve = new THREE.EllipseCurve(cx, cy, major, minor, start, end, false);
          var path = new THREE.Path(curve.getPoints(50));
          var arc = path.createPointsGeometry(50);

          if (!this.isEqualWithPrecision(end - start, Math.PI * 2))
          {
            arc.vertices.pop();
          }
          this.ellipticalArc = arc;
        }
      }
    };


    this.snapping2D = function(result) {

      if (!result) {
        return;
      }

      var intersectPoint = result.intersectPoint;
      var fragIds = result.fragId;

      if (typeof fragIds === "undefined") {
        return;
      }
      else if (!Array.isArray(fragIds)) {
        fragIds = [fragIds];
      }

      _intersectPoint = intersectPoint;

      var gc = new GeometryCallback(_viewer, this);

      for (var fi = 0; fi < fragIds.length; ++fi) {

        var mesh = _viewer.impl.getRenderProxy(_viewer.model, fragIds[fi]);

        var vbr = new Autodesk.Viewing.Private.VertexBufferReader(mesh.geometry);
        vbr.enumGeomsForObject(result.dbId, gc);
      }

      if (gc.circularArc) {

        this.drawArc(gc.circularArc, gc.circularArcCenter);
        gc.circularArc = null;

        _geomVertex = gc.circularArcCenter;

        _geomHighlighted = SNAP_VERTEX;

        _isSnapped = true;
      }
      else if (gc.ellipticalArc) {

        this.drawArc(gc.ellipticalArc);
        gc.ellipticalArc = null;
      }
      else if (gc.lineGeom.vertices.length) {

        // Determine which one should be drawn: line segment or point
        _radius = this.getDetectRadius(intersectPoint);

        if (intersectPoint.distanceTo(gc.lineGeom.vertices[0]) < _radius) {

          _geomVertex = gc.lineGeom.vertices[0];
          this.drawPoint(_geomVertex);
          _geomHighlighted = SNAP_VERTEX;
        }
        else if (intersectPoint.distanceTo(gc.lineGeom.vertices[1]) < _radius) {

          _geomVertex = gc.lineGeom.vertices[1];
          this.drawPoint(_geomVertex);
          _geomHighlighted = SNAP_VERTEX;
        }
        else {

          _geomEdge = gc.lineGeom;
          this.drawLine(_geomEdge);
          _geomHighlighted = SNAP_EDGE;
        }

        _isSnapped = true;
      }
    };

    this.createOverlay = function(overlayName) {

      _viewer.impl.createOverlayScene(overlayName);
    };

    this.addOverlay = function(overlayName, mesh) {

      _viewer.impl.addOverlay(overlayName, mesh);
    };

    this.clearOverlay = function() {

      if (_viewer.impl.overlayScenes[_faceOverlayName]) {
        _viewer.impl.clearOverlay(_faceOverlayName);
      }

      if (_viewer.impl.overlayScenes[_vertexOverlayName]) {
        _viewer.impl.clearOverlay(_vertexOverlayName);
      }

      if (_viewer.impl.overlayScenes[_edgeOverlayName]) {
        _viewer.impl.clearOverlay(_edgeOverlayName);
      }
    };

    /**
     * Draw the planar face
     * @param geom -Geometry which needs to be draw.
     * @param mesh -Mesh which is loaded.
     */
    this.drawFace = function(geom) {

      this.createOverlay(_faceOverlayName);

      var planeColor = 0x00CC00;
      var planeOpacity = 0.5;

      var material = new THREE.MeshPhongMaterial({
        color: planeColor,
        ambient: planeColor,
        opacity: planeOpacity,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      //geom.attributes.index.array = new geom.attributes.index.array.constructor(indicesNew);
      var snapperPlane = new THREE.Mesh(geom, material, true);
      //snapperPlane.matrixWorld = mesh.matrixWorld;

      this.addOverlay(_faceOverlayName, snapperPlane);
    };

    this.drawLine = function(geom) {

      this.createOverlay(_edgeOverlayName);

      var material = new THREE.LineBasicMaterial({
        color: 0x00CC00,
        opacity: 0.5,
        linewidth: 10,
        depthTest: false,
        depthWrite: false
      });

      var line = new THREE.Line(geom, material, THREE.LinePieces);
      //line.applyMatrix(mesh.matrixWorld);

      this.addOverlay(_edgeOverlayName, line);
    };

    this.drawArc = function(geom, center) {

      this.createOverlay(_edgeOverlayName);

      var material = new THREE.LineBasicMaterial({
        color: 0x00CC00,
        opacity: 0.5,
        linewidth: 10,
        depthTest: false,
        depthWrite: false
      });

      var arc = new THREE.Line(geom, material);
      if (center) {
        arc.position.set(center.x, center.y, center.z);
      }

      this.addOverlay(_edgeOverlayName, arc);
    };

    this.drawPoint = function(point) {

      this.createOverlay(_vertexOverlayName);

      var planeColor = 0x00CC00;
      var planeOpacity = 0.5;

      var material = new THREE.MeshPhongMaterial({
        color: planeColor,
        ambient: planeColor,
        opacity: planeOpacity,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });

      var pointMesh = new THREE.Mesh(new THREE.SphereGeometry(2.0), material);
      //point.applyMatrix4(mesh.matrixWorld);
      pointMesh.position.set(point.x, point.y, point.z);

      this.setPointScale(pointMesh);

      this.addOverlay(_vertexOverlayName, pointMesh);

    };

    this.setPointScale = function (pointMesh) {

      var pixelSize = 5;

      var navapi = _viewer.navigation;
      var camera = navapi.getCamera();

      var view = navapi.getEyeVector();
      var position = navapi.getPosition();

      var point = pointMesh.position.clone();

      var distance = camera.isPerspective ? point.sub(position).dot(view.normalize())
        : navapi.getEyeVector().length();

      var fov = navapi.getVerticalFov();
      var worldHeight = 2.0 * distance * Math.tan(THREE.Math.degToRad(fov * 0.5));

      var viewport = navapi.getScreenViewport();
      var devicePixelRatio = window.devicePixelRatio || 1;
      var scale = pixelSize * worldHeight / (viewport.height * devicePixelRatio);

      pointMesh.scale.x = scale;
      pointMesh.scale.y = scale;
      pointMesh.scale.z = scale;
    };

    this.updatePointScale = function() {

      var overlay = _viewer.impl.overlayScenes[_vertexOverlayName];
      if (overlay) {
        var scene = overlay.scene;

        for (var i = 0; i < scene.children.length; i++) {
          var pointMesh = scene.children[i];
          if (pointMesh) {

            this.setPointScale(pointMesh);
          }
        }
      }
    };

    this.getDetectRadius = function(point) {

      var pixelSize = 1.5;

      var navapi = _viewer.navigation;
      var camera = navapi.getCamera();

      var view = navapi.getEyeVector();
      var position = navapi.getPosition();

      var p = point.clone();

      var distance = camera.isPerspective ? p.sub(position).dot(view.normalize())
        : navapi.getEyeVector().length();

      var fov = navapi.getVerticalFov();
      var worldHeight = 2.0 * distance * Math.tan(THREE.Math.degToRad(fov * 0.5));

      var viewport = navapi.getScreenViewport();
      var devicePixelRatio = window.devicePixelRatio || 1;
      var radius = pixelSize * worldHeight / (viewport.height * devicePixelRatio);

      if (_viewer.impl.is2d) {
        radius *= 10;
      }

      return radius;
    };

    this.drawIntersectFace = function(face, positions, stride, mesh) {

      this.createOverlay();

      var va = new THREE.Vector3();
      va.set(
        positions[ face.a * stride ],
        positions[ face.a * stride + 1 ],
        positions[ face.a * stride + 2 ]
      );
      var vb = new THREE.Vector3();
      vb.set(
        positions[ face.b * stride ],
        positions[ face.b * stride + 1 ],
        positions[ face.b * stride + 2 ]
      );
      var vc = new THREE.Vector3();
      vc.set(
        positions[ face.c * stride ],
        positions[ face.c * stride + 1 ],
        positions[ face.c * stride + 2 ]
      );

      var intersectFace = new THREE.Geometry();
      intersectFace.vertices.push(va);
      intersectFace.vertices.push(vb);
      intersectFace.vertices.push(vc);
      intersectFace.faces.push(new THREE.Face3(0, 1, 2));

      var faceMesh = new THREE.Mesh(intersectFace, mesh.material, true);
      faceMesh.matrixWorld = mesh.matrixWorld;

      this.addOverlay(faceMesh);
    };

    this.handleWheelInput = function (delta) {
      this.updatePointScale();
      return false;
    };

    this.handleButtonDown = function (event, button) {

      _isDragging = true

      _events.emit('geometry.selected', {
        geometry: _snappedGeometry,
        type: _snappedGeometryType
      })

      return false
    };

    this.handleButtonUp = function (event, button) {

      _isDragging = false;
      return false;
    };

    this.handleMouseMove = function (event) {

      _tooltip.style.top = event.canvasY - 30 + 'px'
      _tooltip.style.left = event.canvasX + 'px'

      if (!_isDragging) {

        if (_snappingNode) {

          _viewer.impl.matman().highlightObject2D(_snappingNode.dbId, false);
        }

        _snappedGeometry = null;

        this.clearOverlay();

        _geomFace = null;
        _geomEdge = null;
        _geomVertex = null;

        _isSnapped = false;

        //var result = _viewer.impl.snappingHitTest(event.canvasX, event.canvasY, false)

        var result = _viewer.impl.hitTest(event.canvasX, event.canvasY, false);

        if (result && result.intersectPoint) {

          // 3D Snapping
          if (result.face) {

            this.snapping3D(result);
          }
          // 2D Snapping
          else {

            this.snapping2D(result);
          }
        }
      }
      return false;
    };

    this.handleKeyDown = function(event, keyCode) {

      //ESCAPE
      if(keyCode == 27) {

        if(_onSelectionCancelled) {
          _onSelectionCancelled();
          _onSelectionCancelled = null;
        }

        return true;
      }

      return false;
    };

    this.destroy = function() {

      this.clearOverlay();

      _viewer.impl.removeOverlayScene(_faceOverlayName);
      _viewer.impl.removeOverlayScene(_vertexOverlayName);
      _viewer.impl.removeOverlayScene(_edgeOverlayName);

      _tooltip.style.visibility = 'hidden'
    }

    viewer.toolController.registerTool(this)

    createTooltip()
  }

  Viewing.Extension.ConstrainedPlacement.SnapperTool = SnapperTool

})()
