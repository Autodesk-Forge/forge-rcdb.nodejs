/////////////////////////////////////////////////////////////////
// ForgeFader signal attenuation calculator Forge viewer extension
// By Jeremy Tammik, Autodesk Inc, 2017-03-28
/////////////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'
import EventTool from 'Viewer.EventTool'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'

const attenuationVertexShader = `
  void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`

const attenuationFragmentShader = `
  uniform vec4 color;
  void main() {
  	gl_FragColor =vec4(0.2, 1.0, 0.5, 1.) ;
  }
`

class FaderExtension extends ExtensionBase
{
  /////////////////////////////////////////////////////////////////
  // Class constructor
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options)
  {
    super (viewer, options)

    this.onGeometryLoaded = this.onGeometryLoaded.bind(this)

    this.onSelection = this.onSelection.bind(this)

    this._lineMaterial = this.createLineMaterial();

    this._vertexMaterial = this.createVertexMaterial();

    this._shaderMaterial = this.createShaderMaterial({
      name: 'fader-material-shader',
      fragmentShader: attenuationFragmentShader,
      vertexShader: attenuationVertexShader
    })

    this._eps = 0.000001;
    this._pointSize = 0.3;
    this._topFaceOffset = 0.01; // offset above floor in imperial feet
    this._rayTraceOffset = 5; // offset above floor in imperial feet
    this._rayTraceGrid = 8; // how many grid points in u and v direction to evaluate: 8*8=64
    this._attenuation_per_m_in_air = 2.8;
    this._attenuation_per_wall = 3.2;
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  /////////////////////////////////////////////////////////////////
  load() {

    this.eventTool = new EventTool(this.viewer)

    this.eventTool.activate()

    this.eventTool.on('singleclick', (event) => {
      this.pointer = event
    })

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.viewer.addEventListener(
      //Autodesk.Viewing.GEOMETRY_LOADED_EVENT, // non-Revit
      Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, // Revit
      () => this.onGeometryLoaded())

    // this.viewer.setProgressiveRendering(true)
    // this.viewer.setQualityLevel(false, true)
    // this.viewer.setGroundReflection(false)
    // this.viewer.setGroundShadow(false)
    // this.viewer.setLightPreset(1)

    console.log('Viewing.Extension.Fader')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  /////////////////////////////////////////////////////////////////
  static get ExtensionId ()
  {
    return 'Viewing.Extension.Fader.Core'
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  /////////////////////////////////////////////////////////////////
  unload ()
  {
    this.viewer.removeEventListener(
      //Autodesk.Viewing.GEOMETRY_LOADED_EVENT, // non-Revit
      Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, // Revit
      this.onGeometryLoaded)

    return true
  }

  /////////////////////////////////////////////////////////////////
  // onGeometryLoaded - retrieve all wall meshes
  /////////////////////////////////////////////////////////////////
  onGeometryLoaded (event)
  {
    const instanceTree = this.viewer.model.getData().instanceTree
    var rootId = instanceTree.getRootId()
    instanceTree.enumNodeChildren(rootId, async(childId) => {
      const nodeName = instanceTree.getNodeName(childId)
      if (nodeName === 'Walls') {

        const fragIds = await Toolkit.getFragIds(
          this.viewer.model, childId)

        this.wallMeshes = fragIds.map((fragId) => {
          return this.getMeshFromRenderProxy(
            this.viewer.impl.getRenderProxy(
              this.viewer.model, fragId ), null, null, null );
        })
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // onSelection
  /////////////////////////////////////////////////////////////////
  onSelection (event)
  {
    if (event.selections && event.selections.length) {

      const selection = event.selections[0]

      const dbIds = selection.dbIdArray

      const data = this.viewer.clientToWorld(
        this.pointer.canvasX, this.pointer.canvasY, true )

      this.attenuationCalculator(data)
    }
  }

  /////////////////////////////////////////////////////////////////
  // getMeshFromRenderProxy - generate a new mesh from render proxy
  //
  // floor_normal: skip all triangles whose normal differs from that
  // top_face_z: use for the face Z coordinates unless null
  // debug_draw: draw lines and points representing edges and vertices
  /////////////////////////////////////////////////////////////////
  getMeshFromRenderProxy( render_proxy, floor_normal, top_face_z, debug_draw )
  {
    var matrix = render_proxy.matrixWorld;
    var geometry = render_proxy.geometry;
    var attributes = geometry.attributes;

    var vA = new THREE.Vector3();
    var vB = new THREE.Vector3();
    var vC = new THREE.Vector3();

    var geo = new THREE.Geometry();
    var iv = 0;

    if (attributes.index !== undefined)
    {
      var indices = attributes.index.array || geometry.ib;
      var positions = geometry.vb ? geometry.vb : attributes.position.array;
      var stride = geometry.vb ? geometry.vbstride : 3;
      var offsets = geometry.offsets;

      if (!offsets || offsets.length === 0) {
        offsets = [{start: 0, count: indices.length, index: 0}];
      }

      for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {

        var start = offsets[oi].start;
        var count = offsets[oi].count;
        var index = offsets[oi].index;

        for (var i = start, il = start + count; i < il; i += 3) {

          var a = index + indices[i];
          var b = index + indices[i + 1];
          var c = index + indices[i + 2];

          vA.fromArray(positions, a * stride);
          vB.fromArray(positions, b * stride);
          vC.fromArray(positions, c * stride);

          vA.applyMatrix4(matrix);
          vB.applyMatrix4(matrix);
          vC.applyMatrix4(matrix);

          var n = THREE.Triangle.normal(vA, vB, vC);

          if( null === floor_normal
            || this.isEqualVectorsWithPrecision( n, floor_normal ))
          {
            if( debug_draw )
            {
              this.drawVertex (vA);
              this.drawVertex (vB);
              this.drawVertex (vC);

              this.drawLine(vA, vB);
              this.drawLine(vB, vC);
              this.drawLine(vC, vA);
            }
            geo.vertices.push(new THREE.Vector3(vA.x, vA.y, null===top_face_z?vA.z:top_face_z));
            geo.vertices.push(new THREE.Vector3(vB.x, vB.y, null===top_face_z?vB.z:top_face_z));
            geo.vertices.push(new THREE.Vector3(vC.x, vC.y, null===top_face_z?vC.z:top_face_z));
            geo.faces.push( new THREE.Face3( iv, iv+1, iv+2 ) );
            iv = iv+3;
          }
        }
      }
    }
    else
    {
      throw 'Is this section of code ever called?'

      var positions = geometry.vb ? geometry.vb : attributes.position.array;
      var stride = geometry.vb ? geometry.vbstride : 3;

      for (var i = 0, il = positions.length; i < il; i += 3) {

        var a = i;
        var b = i + 1;
        var c = i + 2;

        // copy code from above if this `else` clause is ever required
      }
    }
    // var geo = new THREE.Geometry();
    // var holes = [];
    // var triangles = ShapeUtils.triangulateShape( floor_top_vertices, holes );
    // for( var i = 0; i < triangles.length; i++ ){
    //   geo.faces.push( new THREE.Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
    // }

    geo.computeFaceNormals();
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    //geo.computeBoundingSphere();
    var mesh = new THREE.Mesh( geo, this._shaderMaterial );
    return mesh;
  }

  /////////////////////////////////////////////////////////////////
  // attenuationCalculator - given a picked source point on a face
  //
  // determine face shape
  // draw a heat map on it
  // initially, just use distance from source to target point
  // later, add number of walls intersected by ray between them
  /////////////////////////////////////////////////////////////////
  async attenuationCalculator(data)
  {
    //this.drawVertex(data.point)

    var psource = new THREE.Vector3(
      data.point.x, data.point.y,
      data.point.z + this._rayTraceOffset)

    var top_face_z = data.point.z + this._topFaceOffset;

    // from the selected THREE.Face, extract the normal

    var floor_normal = data.face.normal

    // retrieve floor render proxies matching normal

    var instanceTree = this.viewer.model.getData().instanceTree

    const fragIds = await Toolkit.getFragIds(
      this.viewer.model, data.dbId )

    var floor_mesh_fragment = fragIds.map( (fragId) => {
      return this.viewer.impl.getFragmentProxy(
        this.viewer.model, fragId )
    })

    // in Philippe's Autodesk.ADN.Viewing.Extension.MeshData.js
    // function drawMeshData, the fragment proxy is ignored and
    // the render proxy is used instead:

    var floor_mesh_render = fragIds.map((fragId) => {
      return this.viewer.impl.getRenderProxy(this.viewer.model, fragId)
    })

    floor_mesh_render = floor_mesh_render[0]

    var mesh = this.getMeshFromRenderProxy(
      floor_mesh_render, floor_normal, top_face_z, false )

    this.viewer.impl.scene.add(mesh);

    // ray trace to determine wall locations on mesh

    var map_uv_to_color = this.rayTraceToFindWalls(
      mesh, psource)

    //console.log( map_uv_to_color )

    this.viewer.impl.invalidate(true)
  }

  /////////////////////////////////////////////////////////////////
  // ray trace to count walls between source and target points
  /////////////////////////////////////////////////////////////////
  getWallCountBetween( psource, ptarget, max_dist )
  {
    //this.drawLine(psource, ptarget)
    //this.drawVertex(ptarget);

    var vray = new THREE.Vector3( ptarget.x - psource.x,
      ptarget.y - psource.y, ptarget.z - psource.z );

    vray.normalize()

    var ray = new THREE.Raycaster(
      psource, vray, 0, max_dist )

    var intersectResults = ray.intersectObjects(
      this.wallMeshes, true)

    //console.log(intersectResults)

    var nWalls = intersectResults.length

    return nWalls
  }

  /////////////////////////////////////////////////////////////////
  // ray trace to find walls from picked point to mesh extents
  //
  // return 2D array mapping (u,v) to signal attenuation in dB.
  /////////////////////////////////////////////////////////////////
  rayTraceToFindWalls( mesh, psource )
  {
    // set up the result map

    var n = this._rayTraceGrid;
    var map_uv_to_color = new Array(n);
    for (var i = 0; i < n; i++) {
      map_uv_to_color[i] = new Array(n);
    }

    var ptarget, d, nWalls, signal_attenuation;

    var bb = mesh.geometry.boundingBox;

    var vsize = new THREE.Vector3(
      bb.max.x - bb.min.x,
      bb.max.y - bb.min.y,
      bb.max.z - bb.min.z);

    // create a test ray going diagonally across the entire
    // floor top to test the ray tracing functionality:

    var debug_shoot_single_diagonal_ray = false;

    if( debug_shoot_single_diagonal_ray )
    {
      psource = new THREE.Vector3(
        bb.min.x, bb.min.y, psource.z );

      ptarget = new THREE.Vector3(
        bb.max.x, bb.max.y, psource.z );

      nWalls = this.getWallCountBetween(
        psource, ptarget, vsize.length )
    }
    else
    {
      var step = 1.0 / (n-1)

      // for u in [0,1]
      //   fo r v in [0,1]
      //      p target = ??? (u,v)
      //        if p is on the face (skip this, it requires raytrace too, so no saving)
      //          raytrace from source to target

      for (var u = 0.0, i = 0; u < 1.0 + this._eps; u += step, ++i ) {
        for (var v = 0.0, j = 0; v < 1.0 + this._eps; v += step, ++j ) {

          ptarget = new THREE.Vector3(
            bb.min.x + u * vsize.x,
            bb.min.y + v * vsize.y,
            psource.z )

          d = psource.distanceTo( ptarget )

          // determine number of walls between psource and ptarget
          // to generate a colour for each u,v coordinate pair

          nWalls = this.getWallCountBetween(
            psource, ptarget, vsize.length )

          var signal_attenuation
            = d * this._attenuation_per_m_in_air
              + nWalls * this._attenuation_per_wall

          map_uv_to_color[i][j] = signal_attenuation
        }
      }
    }
    return map_uv_to_color
  }

  /////////////////////////////////////////////////////////////////
  // create attenuation shader material
  /////////////////////////////////////////////////////////////////
  createShaderMaterial (data)
  {
    const uniforms = {
      color: {
        value: new THREE.Vector4(0.1, 1.0, 0.5, 0.6),
        type: 'v4'
      },

		// corner: {
		// 	type: 'v2',
		// 	value: new THREE.Vector2(_bounds.min.x, _bounds.min.y)
		// },
		// width: {
		// 	type: 'f',
		// 	value: _bounds.width
		// },
		// height: {
		// 	type: 'f',
		// 	value: _bounds.height
		// },

		//texture: { type: "t", value: data.texture },
    }

    const material = new THREE.ShaderMaterial({
      fragmentShader: data.fragmentShader,
      vertexShader: data.vertexShader,
      //uniforms: uniforms,
		//side: THREE.DoubleSide
    })

    this.viewer.impl.matman().addMaterial(
      data.name, material, true)

    return material
  }

  /////////////////////////////////////////////////////////////////
  // apply material to specific fragments
  /////////////////////////////////////////////////////////////////
  setMaterial(fragIds, material)
  {
    const fragList = this.viewer.model.getFragmentList()

    fragIds.forEach((fragId) => { // removed this.toArray()
      fragList.setMaterial(fragId, material)
    })

    //this.viewer.impl.invalidate(true)
  }

  ///////////////////////////////////////////////////////////////////////////
  // create vertex material
  ///////////////////////////////////////////////////////////////////////////
  createVertexMaterial()
  {
    var material = new THREE.MeshPhongMaterial({
      color: 0xffffff });

    this.viewer.impl.matman().addMaterial(
      'fader-material-vertex', material, true );

    return material;
  }

  ///////////////////////////////////////////////////////////////////////////
  // create line material
  ///////////////////////////////////////////////////////////////////////////
  createLineMaterial()
  {
    var material = new THREE.LineBasicMaterial({
      color: 0xffffff, linewidth: 50 });

    this.viewer.impl.matman().addMaterial(
      'fader-material-line', material, true );

    return material;
  }

	calculateUVs (mesh)
  {
		var bbox =new THREE.Box3 ().setFromObject (mesh.clone ()) ;

		var max =bbox.max, min =bbox.min ;
		var offset =new THREE.Vector2 (0 - min.x, 0 - min.y) ;
		var range =new THREE.Vector2 (max.x - min.x, max.y - min.y) ;

		mesh.faces =mesh.geometry.attributes.index ;
		var faces =mesh.faces ;

		mesh.faceVertexUvs =[] ;
		mesh.faceVertexUvs [0] =[] ;

		var vertices =mesh.geometry.attributes.position ;
		for ( var i =0 ; i < faces.length ; i +=3 ) {
			var v1 =new THREE.Vector3 (
				vertices.array [faces.array [i * faces.itemSize]],
				vertices.array [faces.array [i * faces.itemSize] + 1],
				vertices.array [faces.array [i * faces.itemSize] + 2],
				0.0
			) ;
			var v2 =new THREE.Vector3 (
				vertices.array [faces.array [i * faces.itemSize + 1]],
				vertices.array [faces.array [i * faces.itemSize + 1] + 1],
				vertices.array [faces.array [i * faces.itemSize + 1] + 2],
				0.0
			) ;
			var v3 =new THREE.Vector3 (
				vertices.array [faces.array [i * faces.itemSize + 2]],
				vertices.array [faces.array [i * faces.itemSize + 2] + 1],
				vertices.array [faces.array [i * faces.itemSize + 2] + 2],
				0.0
			) ;

			// mesh.faceVertexUvs [0].push ([
			// 	new THREE.Vector2 ((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
			// 	new THREE.Vector2 ((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
			// 	new THREE.Vector2 ((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
			// ]) ;

			var pt =new THREE.Vector2 ((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y) ;
			mesh.faceVertexUvs [0].push (Math.max (0, pt.x)) ;
			mesh.faceVertexUvs [0].push (Math.max (0, pt.y)) ;
			var pt =new THREE.Vector2 ((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y) ;
			mesh.faceVertexUvs [0].push (Math.max (0, pt.x)) ;
			mesh.faceVertexUvs [0].push (Math.max (0, pt.y)) ;
			var pt =new THREE.Vector2 ((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y) ;
			mesh.faceVertexUvs [0].push (Math.max (0, pt.x)) ;
			mesh.faceVertexUvs [0].push (Math.max (0, pt.y)) ;
		}
		mesh.uvsNeedUpdate =true ;
		mesh.geometry.attributes.uv.array =mesh.faceVertexUvs ;
		//mesh.geometry.attributes.uv.bytesPerItem =2 ;
		mesh.geometry.attributes.uv.isPattern =false ;
		mesh.geometry.attributes.uv.needsUpdate =true ;

		mesh.faceVertexUvs =undefined ;
		mesh.faces =undefined ;
		mesh.uvsNeedUpdate =undefined ;
	}

  ///////////////////////////////////////////////////////////////////////////
  // draw a line
  ///////////////////////////////////////////////////////////////////////////
  drawLine(start, end)
  {
    var geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(
      start.x, start.y, start.z));

    geometry.vertices.push(new THREE.Vector3(
      end.x, end.y, end.z));

    var line = new THREE.Line(geometry, this._lineMaterial);

    this.viewer.impl.scene.add(line);
  }

  ///////////////////////////////////////////////////////////////////////////
  // draw a vertex
  ///////////////////////////////////////////////////////////////////////////
  drawVertex (v)
  {
    var vertex = new THREE.Mesh(
      new THREE.SphereGeometry(this._pointSize, 4, 3),
      this._vertexMaterial);

    vertex.position.set(v.x, v.y, v.z);

    this.viewer.impl.scene.add(vertex);
  }

  isEqualWithPrecision (a, b) {
    return (a < b + this._eps)
      && (a > b - this._eps);
  }

  isEqualVectorsWithPrecision (v, w) {
    return this.isEqualWithPrecision (v.x, w.x)
      && this.isEqualWithPrecision (v.y, w.y)
      && this.isEqualWithPrecision (v.z, w.z);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  FaderExtension.ExtensionId,
  FaderExtension)

module.exports = 'Viewing.Extension.Fader.Core'
