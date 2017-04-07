/////////////////////////////////////////////////////////////////
// ForgeFader signal attenuation calculator Forge viewer extension
// By Jeremy Tammik, Autodesk Inc, 2017-03-28
/////////////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'
import EventTool from 'Viewer.EventTool'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'

const attenuationVertexShader = `
  // See http://threejs.org/docs/api/renderers/webgl/WebGLProgram.html for variables
  // Default uniforms (do not add)
  //uniform mat4 modelMatrix;
  //uniform mat4 modelViewMatrix;
  //uniform mat4 projectionMatrix;
  //uniform mat4 viewMatrix;
  //uniform mat3 normalMatrix;
  //uniform vec3 cameraPosition;

  // Default attributes (do not add)
  //attribute vec3 position;
  //attribute vec3 normal;
  //attribute vec2 uv;
  //attribute vec2 uv2;

  uniform vec3 mycolor;
  uniform float opacity;
  varying vec4 vcolor;

  uniform vec3 strength [4]; // vec4
  varying vec4 worldCoord;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
      vPosition = normalize (position) ;
      vUv = uv;
      vcolor = vec4(mycolor, opacity);
      //vcolor = vec4(uv, 1.0, opacity);

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      worldCoord = modelMatrix * vec4(position, 1.0) ;

      //gl_PointSize =8.0;
      gl_Position = projectionMatrix * mvPosition;
  }
`

const attenuationFragmentShader = `
  // Default uniforms (do not add)
  //uniform mat4 viewMatrix;
  //uniform vec3 cameraPosition;

  #define pi 3.141592653589793238462643383279

  varying vec4 vcolor;

  uniform vec3 strength [4]; // vec4
  varying vec4 worldCoord;
  varying vec2 vUv;

  varying vec3 vPosition;
  vec3 c2 = vec3(1., .2, .2);
  vec4 c24 = vec4(1., .2, .2, .9);


  uniform sampler2D checkerboard;

  void main() {
    //vec3 fragPos = vec3(worldCoord.xyz);

    gl_FragColor = texture2D(checkerboard, vUv);

    //float dist =2.0*distance (vUv.xy, vec2(.5, .5)) ;
    //gl_FragColor = vec4(dist, dist, dist, 1.0);
    //gl_FragColor = mix (c24, vcolor, 10.5);
  }
`

class FaderExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super( viewer, options )

    this.onModelLoaded = this.onModelLoaded.bind(this)
    this.onSelection = this.onSelection.bind(this)

    this._lineMaterial = this.createLineMaterial ()
    this._vertexMaterial = this.createVertexMaterial ()

    this._eps = 0.000001
    this._pointSize = 0.3
    this._topFaceOffset = 0.01 // offset above floor in imperial feet
    this._rayTraceOffset = 5 // offset above floor in imperial feet
    this._rayTraceGrid = 12 // how many grid points in u and v direction to evaluate: 8*8=64
    this._floorTopEdges = [] // objects added to scene, delete in next run
    this._raycastRays = [] // objects added to scene, delete in next run
    this._debug_floor_top_edges = false
    this._debug_raycast_rays = false
    this._attenuation_per_m_in_air = 0.8
    this._attenuation_per_wall = 8
    this._attenuation_max = 0.0
    this._attenuation_min = 0.0
    this._lastFragId = null
    // THREE.LinearFilter takes the four closest texels and bilinearly interpolates among them
    // THREE.NearestFilter uses the value of the closest texel.
    this._texFilter = THREE.LinearFilter // THREE.LinearFilter / THREE.NearestFilter

    this._materials = {}
    this._floorMeshes ={}
    this._wallMeshes = []
    this._overlayName = 'fader-material-shader'
    this.viewer.impl.createOverlayScene( this._overlayName )

    this.onModelLoaded(null)
  }

  /////////////////////////////////////////////////////////////////
  // Accessors - es6 getters and setters
  /////////////////////////////////////////////////////////////////
  get texFilter () {
    return this._texFilter === THREE.NearestFilter
  }

  set texFilter (a) {
    console.log('texFilter: ' + a)
    this._texFilter = a ? THREE.NearestFilter : THREE.LinearFilter
    if ( this._lastFragId !== null ) {
      let mesh =this._floorMeshes [this._lastFragId] ;
      let tex =mesh.material.uniforms.checkerboard.value.clone ()
      tex.magFilter =this._texFilter
      tex.needsUpdate = true
      mesh.material.uniforms.checkerboard.value = tex
      this.viewer.impl.invalidate (true)
    }
  }

  get attenuationPerMeterInAir () {
    return this._attenuation_per_m_in_air
  }

  set attenuationPerMeterInAir (a) {
    console.log('attenuationPerMeterInAir: ' + a)
    this._attenuation_per_m_in_air = a
  }

  get attenuationPerWall () {
    return this._attenuation_per_wall
  }

  set attenuationPerWall (a) {
    console.log('attenuationPerWall: ' + a)
    this._attenuation_per_wall = a
  }

  get gridDensity () {
    return this._rayTraceGrid
  }

  set gridDensity (a) {
    this._rayTraceGrid = a
  }

  set debugFloorTopEdges( a ) {
    let f = a
      ? this.viewer.impl.scene.add
      : this.viewer.impl.scene.remove
    this._floorTopEdges.forEach( (obj) => {
      f.apply(this.viewer.impl.scene, [obj])
    })
    this._debug_floor_top_edges = a
    this.viewer.impl.invalidate (true)
  }

  set debugRaycastRays( a ) {
    let f = a
      ? this.viewer.impl.scene.add
      : this.viewer.impl.scene.remove
    this._raycastRays.forEach( (obj) => {
      f.apply(this.viewer.impl.scene, [obj])
    })
    this._debug_raycast_rays = a
    this.viewer.impl.invalidate (true)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.Fader.Core'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  /////////////////////////////////////////////////////////////////
  load () {

    this.eventTool = new EventTool (this.viewer)
    this.eventTool.activate ()
    this.eventTool.on ('singleclick', (event) => {
      this.pointer = event
    })

    const loadEvents = [
     Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, // Revit
     Autodesk.Viewing.GEOMETRY_LOADED_EVENT // non-Revit
   ]

   const eventResults = loadEvents.map((event) => {
     return this.viewerEvent(event)
   })

   Promise.all(eventResults).then( this.onModelLoaded )

    this.viewer.addEventListener (
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection )

    this.viewer.setGroundReflection (false)
    this.viewer.setGroundShadow (false)

    console.log('Viewing.Extension.Fader.Core loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Async viewer event
  /////////////////////////////////////////////////////////
  viewerEvent( eventName ) {
    return new Promise ((resolve) => {
      const handler = (args) => {
        this.viewer.removeEventListener (
          eventName, handler )
        resolve (args)
      }
      this.viewer.addEventListener (
        eventName, handler )
    })
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  /////////////////////////////////////////////////////////////////
  unload () {

    this.viewer.removeEventListener (
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    Object.keys(this._floorMeshes).forEach((obj) => {
      this.viewer.impl.scene.remove(obj)
    })

    this._raycastRays.forEach((obj) => {
      this.viewer.impl.scene.remove(obj)
    })

    this._floorTopEdges.forEach((obj) => {
      this.viewer.impl.scene.remove(obj)
    })

    this.viewer.impl.invalidate (true)

    this.off()

    return true
  }

  /////////////////////////////////////////////////////////////////
  // getBounds
  /////////////////////////////////////////////////////////////////
  getBounds( id ) {
    let bounds = new THREE.Box3()
      , box = new THREE.Box3()
      , instanceTree = this.viewer.impl.model.getData().instanceTree
      , fragList = this.viewer.impl.model.getFragmentList()

    instanceTree.enumNodeFragments( id, function (fragId) {
      fragList.getWorldBounds( fragId, box )
      bounds.union( box )
    }, true)

    return bounds
  }

  /////////////////////////////////////////////////////////////////
  // onModelLoaded - retrieve all wall meshes
  /////////////////////////////////////////////////////////////////
  onModelLoaded( event ) {
    if (   this.viewer.model === undefined || this.viewer.model === null
        || this.viewer.model.getData() === undefined || this.viewer.model.getData() === null
    )
      return
    const instanceTree = this.viewer.model.getData().instanceTree
    let rootId = instanceTree.getRootId()
    instanceTree.enumNodeChildren( rootId, async (childId ) => {
      const nodeName = instanceTree.getNodeName( childId )
      if( nodeName === 'Walls' ) {
        const fragIds = await Toolkit.getFragIds (
          this.viewer.model, childId )
        this._wallMeshes = fragIds.map( (fragId) => {
          return this.getMeshFromRenderProxy(
            childId,
            this.viewer.impl.getRenderProxy( this.viewer.model, fragId ),
            null, null, null )
        })
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  // onSelection
  /////////////////////////////////////////////////////////////////
  onSelection( event ) {
    if( event.selections && event.selections.length ) {

      let debug_debug_marker_setter = true

      if( debug_debug_marker_setter ) {
        let selection = event.selections[0]
          , dbIds = selection.dbIdArray
          , id = dbIds[0]

        // debug test clicking on specific door
        if( 2850 === id || 2851 === id ) {
          this.debugFloorTopEdges = !this._debug_floor_top_edges
          this.debugRaycastRays = !this._debug_raycast_rays
        }
      }

      const data = this.viewer.clientToWorld (
        this.pointer.canvasX, this.pointer.canvasY, true)

      if ( data.face ) {
        var n = data.face.normal
        if( this.isEqualWithPrecision( n.x, 0 )
          && this.isEqualWithPrecision( n.y, 0 )) {
            this.emit('attenuation.source', data)
            this.attenuationCalculator(data)
        }
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // calculateUVsGeo
  /////////////////////////////////////////////////////////////////
  calculateUVsGeo1( geometry ) {
    geometry.computeBoundingBox ()

    let bbox = geometry.boundingBox
      , max = bbox.max
      , min = bbox.min
      , offset = new THREE.Vector2( 0 - min.x, 0 - min.y )
      , range = new THREE.Vector2( max.x - min.x, max.y - min.y )
      , faces = geometry.faces
      , uvs = geometry.faceVertexUvs[0]
      , vertices = geometry.vertices

    for ( let i = 0 ; i < faces.length ; ++i ) {
      let v1 = vertices [faces [i].a]
      let v2 = vertices [faces [i].b]
      let v3 = vertices [faces [i].c]

      uvs.push ([
        new THREE.Vector2( (v1.x + offset.x) / range.x,
          (v1.y + offset.y) / range.y ),
        new THREE.Vector2( (v2.x + offset.x) / range.x,
          (v2.y + offset.y) / range.y ),
        new THREE.Vector2( (v3.x + offset.x) / range.x,
          (v3.y + offset.y) / range.y )
      ])
    }
    geometry.uvsNeedUpdate = true
  }

  calculateUVsGeo( geometry ) {
    geometry.computeBoundingBox ()

    let bbox = geometry.boundingBox
      , max = bbox.max
      , min = bbox.min
      , offset = new THREE.Vector2( 0 - min.x, 0 - min.y )
      , range = new THREE.Vector2( max.x - min.x, max.y - min.y )
      , faces = geometry.faces
      , uvs = geometry.faceVertexUvs[0]
      , vertices = geometry.vertices
      , offx =range.x / ( 2 * this._rayTraceGrid )
      , offy =range.y / ( 2 * this._rayTraceGrid )
      , incx =range.x / this._rayTraceGrid
      , incy =range.y / this._rayTraceGrid

    uvs.splice( 0, uvs.length )
    for ( let i = 0 ; i < faces.length ; ++i ) {
      let v1 = vertices [faces [i].a]
      let v2 = vertices [faces [i].b]
      let v3 = vertices [faces [i].c]

      uvs.push ([
        new THREE.Vector2(
          Math.abs((offx + v1.x + offset.x - incx) / range.x),
          Math.abs((offy + v1.y + offset.y - incy) / range.y) ),
        new THREE.Vector2(
          Math.abs((offx + v2.x + offset.x - incx) / range.x),
          Math.abs((offy + v2.y + offset.y - incy) / range.y) ),
        new THREE.Vector2(
          Math.abs((offx + v3.x + offset.x - incx) / range.x),
          Math.abs((offy + v3.y + offset.y - incy) / range.y) )
      ])
    }
    geometry.uvsNeedUpdate = true
  }

  /////////////////////////////////////////////////////////////////
  // getMeshFromRenderProxy - generate a new mesh from render proxy
  //
  // floor_normal: skip all triangles whose normal differs from that
  // top_face_z: use for the face Z coordinates unless null
  /////////////////////////////////////////////////////////////////
  getMeshFromRenderProxy( dbId, render_proxy, floor_normal, top_face_z ) {

    let matrix = render_proxy.matrixWorld
    let geometry = render_proxy.geometry
    let attributes = geometry.attributes

    let vA = new THREE.Vector3()
    let vB = new THREE.Vector3()
    let vC = new THREE.Vector3()

    let geo = new THREE.Geometry()
    let iv = 0

    if( attributes.index !== undefined ) {
      let indices = attributes.index.array || geometry.ib
      let positions = geometry.vb ? geometry.vb : attributes.position.array
      let stride = geometry.vb ? geometry.vbstride : 3
      let offsets = geometry.offsets
      if( !offsets || offsets.length === 0 ) {
        offsets =[ { start: 0, count: indices.length, index: 0 } ]
      }
      for( let oi =0, ol = offsets.length ; oi < ol ; ++oi ) {
        let start = offsets[oi].start
        let count = offsets[oi].count
        let index = offsets[oi].index
        for( let i = start, il = start + count ; i < il ; i += 3 ) {
          let a = index + indices [i]
          let b = index + indices [i + 1]
          let c = index + indices [i + 2]

          vA.fromArray( positions, a * stride )
          vB.fromArray( positions, b * stride )
          vC.fromArray( positions, c * stride )

          vA.applyMatrix4( matrix )
          vB.applyMatrix4( matrix )
          vC.applyMatrix4( matrix )

          let n =THREE.Triangle.normal( vA, vB, vC )
          if ( floor_normal === null
            || this.isEqualVectorsWithPrecision( n, floor_normal ) )
          {
            let cache = this._floorTopEdges
              , debug = this._debug_floor_top_edges

            this.drawVertex( vA, cache, debug )
            this.drawVertex( vB, cache, debug )
            this.drawVertex( vC, cache, debug )
            this.drawLine( vA, vB, cache, debug )
            this.drawLine( vB, vC, cache, debug )
            this.drawLine( vC, vA, cache, debug )

            geo.vertices.push( new THREE.Vector3( vA.x, vA.y,
              top_face_z === null ? vA.z : top_face_z ) )
            geo.vertices.push( new THREE.Vector3( vB.x, vB.y,
              top_face_z === null ? vB.z : top_face_z ) )
            geo.vertices.push( new THREE.Vector3( vC.x, vC.y,
              top_face_z === null ? vC.z : top_face_z ) )
            geo.faces.push( new THREE.Face3( iv, iv + 1, iv + 2 ) )
            iv = iv + 3
          }
        }
      }
    }

    this.calculateUVsGeo( geo )
    geo.computeFaceNormals()
    geo.computeVertexNormals()
    geo.computeBoundingBox()

    let mat = new THREE.MeshBasicMaterial( { color: 0xffff00 } )
    let shaderMat = this.createShaderMaterial( dbId )

    let mesh = new THREE.Mesh(geo, top_face_z !== null
      ? shaderMat
      : mat )

    //mesh.matrix.copy (render_proxy.matrixWorld)
    mesh.matrixWorldNeedsUpdate = true
    mesh.matrixAutoUpdate = false
    mesh.frustumCulled = false

    mesh.dbId = render_proxy.dbId
    mesh.fragId = render_proxy.fragId

    return mesh
  }

  /////////////////////////////////////////////////////////////////
  // attenuationCalculator - given a picked source point on a face
  //
  // determine face shape
  // draw a heat map on it
  // initially, just use distance from source to target point
  // later, add number of walls intersected by ray between them
  /////////////////////////////////////////////////////////////////
  async attenuationCalculator( data ) {

    // remove debug markers

    this._floorTopEdges.forEach( (obj) => {
      this.viewer.impl.scene.remove( obj )
    })

    this._raycastRays.forEach( (obj) => {
      this.viewer.impl.scene.remove( obj )
    })

    this._floorTopEdges = []
    this._raycastRays = []

    this.drawVertex( data.point, this._floorTopEdges,
      this._debug_floor_top_edges )

    let psource = new THREE.Vector3 (
      data.point.x, data.point.y,
      data.point.z + this._rayTraceOffset
    )

    let top_face_z = data.point.z + this._topFaceOffset

    // from the selected THREE.Face, extract the normal
    let floor_normal = data.face.normal

    // retrieve floor render proxies matching normal

    const fragIds = await Toolkit.getFragIds(
      this.viewer.model, data.dbId )
    this._lastFragId = fragIds[0]

    // Do not remake the mesh each time, reuse it and just
    // update its texture - the shader will handle it for you
    let mesh ;
    if ( !this._floorMeshes [this._lastFragId] ) {
    let floor_mesh_render = this.viewer.impl.getRenderProxy(
      this.viewer.model, fragIds[0] )
      mesh =this.getMeshFromRenderProxy(data.dbId,
      floor_mesh_render, floor_normal, top_face_z )
      mesh.name =data.dbId + '-' + this._lastFragId + '-FloorMesh' ;
      this._floorMeshes [this._lastFragId] =mesh ;
      this.viewer.impl.scene.add (mesh) ;
    } else {
      mesh =this._floorMeshes [this._lastFragId] ;
      this.calculateUVsGeo( mesh.geometry )
    }

    // ray trace to determine wall locations on mesh
    let map_uv_to_color = this.rayTraceToFindWalls(
      mesh, psource )

    this._attenuation_max = this.array2dMaxW( map_uv_to_color )
    this._attenuation_min = this.array2dMinW( map_uv_to_color )

    this.emit('attenuation.bounds', {
      min: this._attenuation_min,
      max: this._attenuation_max
    })

    let tex = this.createTexture(
      map_uv_to_color,
      this._attenuation_max)

    mesh.material.uniforms.checkerboard.value = tex

    this.viewer.impl.invalidate (true)
  }

  /////////////////////////////////////////////////////////////////
  // ray trace to count walls between source and target points
  /////////////////////////////////////////////////////////////////
  getWallCountBetween( psource, ptarget, max_dist ) {
    this.drawLine( psource, ptarget, this._raycastRays,
      this._debug_raycast_rays )
    this.drawVertex( ptarget, this._raycastRays,
      this._debug_raycast_rays )

    let vray = new THREE.Vector3( ptarget.x - psource.x,
      ptarget.y - psource.y, ptarget.z - psource.z )
    vray.normalize ()
    let ray = new THREE.Raycaster( psource, vray, 0, max_dist )
    let intersectResults = ray.intersectObjects (
      this._wallMeshes, true )
    let nWalls = intersectResults.length
    return nWalls
  }

  /////////////////////////////////////////////////////////////////
  // ray trace to find walls from picked point to mesh extents
  //
  // return 2D array mapping (u,v) to signal attenuation in dB.
  /////////////////////////////////////////////////////////////////
  rayTraceToFindWalls (mesh, psource) {
    // set up the result map
    let n = this._rayTraceGrid
    let map_uv_to_color = new Array (n)
    for ( let i = 0 ; i < n ; ++i )
      map_uv_to_color [i] = new Array (n)

    let ptarget, d, nWalls
      , bb =mesh.geometry.boundingBox
      , vsize = new THREE.Vector3(
          bb.max.x - bb.min.x,
          bb.max.y - bb.min.y,
          bb.max.z - bb.min.z
        )

    let step = 1.0 / (n - 1)
    for ( let u = 0.0, i = 0 ; u < 1.0 + this._eps ; u += step, ++i ) {
      for ( let v = 0.0, j = 0 ; v < 1.0 + this._eps ; v += step, ++j ) {
        ptarget = new THREE.Vector3(
          bb.min.x + u * vsize.x,
          bb.min.y + v * vsize.y,
          psource.z
        )
        d = psource.distanceTo( ptarget )

        // determine number of walls between psource and ptarget
        // to generate a colour for each u,v coordinate pair
        nWalls = this.getWallCountBetween( psource, ptarget, d ) // vsize.length )

        let signal_attenuation =
          d * this._attenuation_per_m_in_air
            + nWalls * this._attenuation_per_wall

        map_uv_to_color[i][j] = new THREE.Vector4(
          ptarget.x, ptarget.y, ptarget.z, signal_attenuation)
      }
    }
    return map_uv_to_color
  }

  /////////////////////////////////////////////////////////////////
  // create attenuation shader material
  /////////////////////////////////////////////////////////////////
  createTexture( data, attenuation_max ) {
    let pixelData = []
    for ( let i = 0 ; i < data.length ; ++i ) {
      for ( let j = 0 ; j < data [i].length ; ++j ) {
        let c = data[j][i].w / attenuation_max
        c = parseInt( c * 0xff )
        pixelData.push( c, 0xff - c, 0, 0xff )
      }
    }

    let dataTexture = new THREE.DataTexture (
      Uint8Array.from (pixelData),
      this._rayTraceGrid, this._rayTraceGrid,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
      THREE.UVMapping
    )
    dataTexture.minFilter = THREE.LinearMipMapLinearFilter // THREE.LinearMipMapLinearFilter
    dataTexture.magFilter = this._texFilter // THREE.LinearFilter // THREE.NearestFilter
    dataTexture.needsUpdate = true
    dataTexture.flipY = false

    return dataTexture
  }

  createShaderMaterial( dbId ) {
    if( this._materials [dbId] !== undefined )
      return this._materials[dbId]

    let uniforms = {
      "time": { "value": 1 },
      "resolution": { "value": 1 },
      "mycolor": {
        "type": "c",
        "value": { "r": 0.2, "g": 1, "b": 0.5 }
      },
      "opacity": { "type": "f", "value": 0.9 },
      // "strength": {
      //   "type": "v3v",
      //   "value": [
      //     [ 0, 0, 1 ], [ 0, 1, 0.5 ],
      //     [ 1, 0, 0.8 ], [ 1, 1, 0.3 ]
      //   ]
      // }
    }

    let pixelData = []
    for ( let i = 0 ; i < this._rayTraceGrid ; ++i )
      for ( let j = 0 ; j < this._rayTraceGrid ; ++j )
        pixelData.push( 0x88, 0x88, 0, 0xff )

    let dataTexture =new THREE.DataTexture(
      Uint8Array.from (pixelData),
      this._rayTraceGrid, this._rayTraceGrid,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
      THREE.UVMapping
    )
    dataTexture.minFilter = THREE.LinearMipMapLinearFilter
    dataTexture.magFilter = this._texFilter
    dataTexture.needsUpdate = true

    uniforms.checkerboard ={
      type: 't',
      value: dataTexture
    }

    let material =new THREE.ShaderMaterial ({
      uniforms: uniforms,
      //attributes: attributes,
      vertexShader: attenuationVertexShader,
      fragmentShader: attenuationFragmentShader,
      side: THREE.DoubleSide
    })

    this.viewer.impl.matman().removeMaterial( 'shaderMaterial' )
    this.viewer.impl.matman().addMaterial( 'shaderMaterial', material, true )
    this._materials [dbId] = material
    return material
  }

  /////////////////////////////////////////////////////////////////
  // apply material to specific fragments
  /////////////////////////////////////////////////////////////////
  setMaterial( fragIds, material ) {
    const fragList = this.viewer.model.getFragmentList()
    fragIds.forEach ((fragId) => {
      fragList.setMaterial( fragId, material )
    })
  }

  ///////////////////////////////////////////////////////////////////////////
  // create vertex material
  ///////////////////////////////////////////////////////////////////////////
  createVertexMaterial () {
    let material = new THREE.MeshPhongMaterial({
      color: 0xffffff
    })
    this.viewer.impl.matman ().addMaterial (
      'fader-material-vertex', material, true )
    return material
  }

  ///////////////////////////////////////////////////////////////////////////
  // create line material
  ///////////////////////////////////////////////////////////////////////////
  createLineMaterial () {
    let material =new THREE.LineBasicMaterial ({
      color: 0xffffff, linewidth: 50
    })
    this.viewer.impl.matman ().addMaterial(
      'fader-material-line', material, true )
    return material
  }

  ///////////////////////////////////////////////////////////////////////////
  // add line or vertex debug marker to scene and specified cache
  ///////////////////////////////////////////////////////////////////////////
  addToScene( obj, cache, addToScene ) {
    if( addToScene ) {
      this.viewer.impl.scene.add( obj )
    }
    cache.push( obj )
  }

  ///////////////////////////////////////////////////////////////////////////
  // draw a line
  ///////////////////////////////////////////////////////////////////////////
  drawLine( start, end, cache, addToScene ) {
    let geometry = new THREE.Geometry ()
    geometry.vertices.push (
      new THREE.Vector3( start.x, start.y, start.z )
    )
    geometry.vertices.push (
      new THREE.Vector3( end.x, end.y, end.z )
    )
    let line = new THREE.Line( geometry, this._lineMaterial )
    this.addToScene( line, cache, addToScene )
  }

  ///////////////////////////////////////////////////////////////////////////
  // draw a vertex
  ///////////////////////////////////////////////////////////////////////////
  drawVertex( v, cache, addToScene ) {
    let vertex = new THREE.Mesh (
      new THREE.SphereGeometry( this._pointSize, 8, 6 ),
      this._vertexMaterial
    )
    vertex.position.set( v.x, v.y, v.z )
    this.addToScene( vertex, cache, addToScene )
  }

  ///////////////////////////////////////////////////////////////////////////
  // real number comparison
  ///////////////////////////////////////////////////////////////////////////
  isEqualWithPrecision (a, b) {
    return (a < b + this._eps)
      && (a > b - this._eps)
  }

  ///////////////////////////////////////////////////////////////////////////
  // vector comparison
  ///////////////////////////////////////////////////////////////////////////
  isEqualVectorsWithPrecision (v, w) {
    return this.isEqualWithPrecision (v.x, w.x)
      && this.isEqualWithPrecision (v.y, w.y)
      && this.isEqualWithPrecision (v.z, w.z)
  }

  ///////////////////////////////////////////////////////////////////////////
  // return min and max W value in 2D array
  ///////////////////////////////////////////////////////////////////////////
  arrayMaxW( arr ) {
    let len = arr.length, max = -Infinity
    while( len-- )
      max = Math.max( max, arr[len].w )
    return max
  }

  array2dMaxW( arr ) {
    let len = arr.length, max = -Infinity
    while( len-- ) {
      max = Math.max( max,
        this.arrayMaxW( arr[len] ) )
    }
    return max
  }

  arrayMinW( arr ) {
    let len = arr.length, min = +Infinity
    while ( len-- )
      min = Math.min( arr[len].w, min )
    return min
  }

  array2dMinW( arr ) {
    let len = arr.length, min = +Infinity
    while ( len-- ) {
      min = Math.min( min,
        this.arrayMinW( arr[len] ) )
    }
    return min
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  FaderExtension.ExtensionId, FaderExtension)

module.exports = 'Viewing.Extension.Fader.Core'
