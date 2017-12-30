/////////////////////////////////////////////////////////////////
// ForgeFader signal attenuation calculator Forge viewer extension
// By Jeremy Tammik, Autodesk Inc, 2017-03-28
/////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import Toolkit from 'Viewer.Toolkit'

const attenuationVertexShader = `
  // See http://threejs.org/docs/api/renderers/webgl/WebGLProgram.html for variables
  // Default uniforms (do not add)
  //uniform mat4 projectionMatrix;
  //uniform mat4 modelViewMatrix;
  //uniform vec3 cameraPosition;
  //uniform mat3 normalMatrix;
  //uniform mat4 modelMatrix;
  //uniform mat4 viewMatrix;

  // Default attributes (do not add)
  //attribute vec3 position;
  //attribute vec3 normal;
  //attribute vec2 uv2;
  //attribute vec2 uv;

  varying vec2 vUv;

  void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
  }
`

const attenuationFragmentShader = `
  // Default uniforms (do not add)
  //uniform vec3 cameraPosition;
  //uniform mat4 viewMatrix;

  uniform sampler2D checkerboard;
  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(checkerboard, vUv);
  }
`

class FaderExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super( viewer, options )

    this._lineMaterial = this.createLineMaterial ()
    this._vertexMaterial = this.createVertexMaterial ()

    this._eps = 0.000001
    this._pointSize = 0.3
    this._topFaceOffset = 0.01 // offset above floor in imperial feet
    this._rayTraceOffset = 1 // offset above floor in imperial feet
    this._rayTraceGrid = 12 // how many grid points in u and v direction to evaluate: 8*8=64
    this._floorTopEdges = [] // objects added to scene, delete in next run
    this._raycastRays = [] // objects added to scene, delete in next run
    this._debug_floor_top_edges = false
    this._debug_raycast_rays = false
    this._attenuation_per_m_in_air = 0.8
    this._attenuation_per_wall = 8
    this.selectedDbId = null

    // THREE.LinearFilter takes the four closest texels and bilinearly interpolates among them
    // THREE.NearestFilter uses the value of the closest texel.
    this._texFilter = THREE.LinearFilter // THREE.LinearFilter / THREE.NearestFilter

    this._materials = {}
    this._floorMeshes ={}
    this._wallMeshes = []
  }

  /////////////////////////////////////////////////////////////////
  // Accessors - es6 getters and setters
  /////////////////////////////////////////////////////////////////
  get texFilter () {
    return this._texFilter === THREE.NearestFilter
  }

  set texFilter (a) {

    this._texFilter = a ? THREE.LinearFilter : THREE.NearestFilter

    if (this.selectedDbId !== null ) {

      let mesh = this._floorMeshes[this.selectedDbId]
      let tex = mesh.material.uniforms.checkerboard.value.clone ()
      tex.magFilter = this._texFilter
      tex.needsUpdate = true
      mesh.material.uniforms.checkerboard.value = tex
      this.viewer.impl.invalidate (true)
    }
  }

  get attenuationPerMeterInAir () {
    return this._attenuation_per_m_in_air
  }

  set attenuationPerMeterInAir (a) {
    this._attenuation_per_m_in_air = a
  }

  get attenuationPerWall () {
    return this._attenuation_per_wall
  }

  set attenuationPerWall (a) {
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

  set debugRaycastRays(show) {

    this._raycastRays.forEach((obj) => {

      show
        ? this.viewer.impl.scene.add(obj)
        : this.viewer.impl.scene.remove(obj)
    })

    this._debug_raycast_rays = show

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

    console.log('Viewing.Extension.Fader.Core loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  /////////////////////////////////////////////////////////////////
  unload () {

    Object.keys(this._floorMeshes).forEach((obj) => {
      this.viewer.impl.scene.remove(this._floorMeshes [obj])
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
  // onModelLoaded - retrieve all wall meshes
  /////////////////////////////////////////////////////////////////
  async onModelCompletedLoad (event) {

    const model = this.viewer.model

    const wallIds =
      await Toolkit.getComponentsByParentName(
        'Walls', model)

    this._wallMeshes = wallIds.map((dbId) => {

      return Toolkit.buildComponentMesh(
        this.viewer, model, dbId)
    })

    this.floorIds =
      await Toolkit.getComponentsByParentName(
        'Floors', model)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  update (dynamic) {

    if (!this.hitTest) {
      return null
    }

    const dbId = this.hitTest.dbId

    if (!this.floorIds.includes(dbId)) {

      return null
    }

    if (!dynamic || dbId === this.selectedDbId) {

      const normal = this.hitTest.face.normal

      const zAxis = {x: 0, y: 0, z: 1}

      if (this.isEqualVectorsWithPrecision(normal, zAxis)) {

        this.emit('attenuation.source', this.hitTest)

        return this.computeAttenuation(this.hitTest)
      }
    }

    return null
  }

  /////////////////////////////////////////////////////////////////
  // calculateUVsGeo
  /////////////////////////////////////////////////////////////////
  calculateUVsGeo (geometry) {

    geometry.computeBoundingBox()

    const bbox = geometry.boundingBox
    const max = bbox.max
    const min = bbox.min
    const offset = new THREE.Vector2( 0 - min.x, 0 - min.y)
    const range = new THREE.Vector2(max.x - min.x, max.y - min.y)
    const faces = geometry.faces
    const uvs = geometry.faceVertexUvs[0]
    const vertices = geometry.vertices
    const offx = range.x / (2 * this._rayTraceGrid)
    const offy = range.y / (2 * this._rayTraceGrid)
    const incx = range.x / this._rayTraceGrid
    const incy = range.y / this._rayTraceGrid

    uvs.splice(0, uvs.length)

    for (let i = 0; i < faces.length ; ++i) {

      const v1 = vertices[faces[i].a]
      const v2 = vertices[faces[i].b]
      const v3 = vertices[faces[i].c]

      uvs.push ([
        new THREE.Vector2(
          Math.abs((offx + v1.x + offset.x - incx) / range.x),
          Math.abs((offy + v1.y + offset.y - incy) / range.y)),
        new THREE.Vector2(
          Math.abs((offx + v2.x + offset.x - incx) / range.x),
          Math.abs((offy + v2.y + offset.y - incy) / range.y)),
        new THREE.Vector2(
          Math.abs((offx + v3.x + offset.x - incx) / range.x),
          Math.abs((offy + v3.y + offset.y - incy) / range.y))
      ])
    }

    geometry.uvsNeedUpdate = true
  }

  /////////////////////////////////////////////////////////////////
  // Generate a new mesh from render proxy
  //
  // floor_normal: skip all triangles whose normal differs from that
  // top_face_z: use for the face Z coordinates unless null
  /////////////////////////////////////////////////////////////////
  buildFloorMesh (dbId, floorNormal) {

    const faceFilter = (vA, vB, vC) => {

      const faceNormal = THREE.Triangle.normal(vA, vB, vC)

      return this.isEqualVectorsWithPrecision(
        faceNormal, floorNormal)
    }

    const shaderMat = this.createShaderMaterial(dbId)

    const mesh = Toolkit.buildComponentMesh(
      this.viewer, this.viewer.model,
      dbId, faceFilter, shaderMat)

    this.calculateUVsGeo(mesh.geometry)

    const matrix = new THREE.Matrix4()

    matrix.makeTranslation(0,0,0.01)

    mesh.applyMatrix(matrix)

    return mesh
  }

  /////////////////////////////////////////////////////////////////
  // computeAttenuation - given a picked source point on a face
  //
  // determine face shape
  // draw a heat map on it
  // initially, just use distance from source to target point
  // later, add number of walls intersected by ray between them
  /////////////////////////////////////////////////////////////////
  computeAttenuation (hitTest) {

    this._floorTopEdges.forEach( (obj) => {
      this.viewer.impl.scene.remove( obj )
    })

    this._raycastRays.forEach( (obj) => {
      this.viewer.impl.scene.remove( obj )
    })

    this._floorTopEdges = []
    this._raycastRays = []

    this.drawVertex(hitTest.point, this._floorTopEdges,
      this._debug_floor_top_edges)

    this.selectedDbId = hitTest.dbId

    // Do not remake the mesh each time, reuse it and just
    // update its texture - the shader will handle it for you
    let mesh;

    if (!this._floorMeshes[this.selectedDbId]) {

      mesh = this.buildFloorMesh(
        hitTest.dbId,
        hitTest.face.normal)

      this._floorMeshes[hitTest.dbId] = mesh

      this.viewer.impl.scene.add(mesh)

    } else {

      mesh = this._floorMeshes[this.selectedDbId]
    }

    // ray trace to determine wall locations on mesh

    const psource = new THREE.Vector3 (
      hitTest.point.x,
      hitTest.point.y,
      hitTest.point.z + this._rayTraceOffset)

    const map_uv_to_color = this.rayTraceToFindWalls(
      mesh, psource)

    const attenuationMax = this.array2dMaxW(map_uv_to_color)
    const attenuationMin = this.array2dMinW(map_uv_to_color)

    const tex = this.createTexture(
      map_uv_to_color, attenuationMax)

    mesh.material.uniforms.checkerboard.value = tex

    this.viewer.impl.invalidate (true)

    return {
      min: attenuationMin,
      max: attenuationMax
    }
  }

  /////////////////////////////////////////////////////////////////
  // ray trace to count walls between source and target points
  /////////////////////////////////////////////////////////////////
  getWallCountBetween(psource, ptarget, max_dist) {

    this.drawLine( psource, ptarget, this._raycastRays,
      this._debug_raycast_rays )

    this.drawVertex( ptarget, this._raycastRays,
      this._debug_raycast_rays )

    let vray = new THREE.Vector3( ptarget.x - psource.x,
      ptarget.y - psource.y, ptarget.z - psource.z )

    vray.normalize ()

    let ray = new THREE.Raycaster(psource, vray, 0, max_dist)

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
      THREE.UVMapping)

    dataTexture.minFilter = THREE.LinearMipMapLinearFilter // THREE.LinearMipMapLinearFilter
    dataTexture.magFilter = this._texFilter // THREE.LinearFilter // THREE.NearestFilter
    dataTexture.needsUpdate = true
    dataTexture.flipY = false

    return dataTexture
  }

  /////////////////////////////////////////////////////////
  // create shader material
  //
  /////////////////////////////////////////////////////////
  createShaderMaterial( dbId ) {

    if (this._materials [dbId]) {

      return this._materials[dbId]
    }

    const uniforms = {
      resolution: {
        value: 1
      }
    }

    const pixelData = []

    for (let i = 0; i < this._rayTraceGrid ; ++i) {

      for (let j = 0; j < this._rayTraceGrid ; ++j) {

        pixelData.push(0x88, 0x88, 0, 0xff)
      }
    }

    const dataTexture = new THREE.DataTexture(
      Uint8Array.from (pixelData),
      this._rayTraceGrid, this._rayTraceGrid,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
      THREE.UVMapping)

    dataTexture.minFilter = THREE.LinearMipMapLinearFilter
    dataTexture.magFilter = this._texFilter
    dataTexture.needsUpdate = true

    uniforms.checkerboard = {
      type: 't',
      value: dataTexture
    }

    const material = new THREE.ShaderMaterial ({
      fragmentShader: attenuationFragmentShader,
      vertexShader: attenuationVertexShader,
      side: THREE.DoubleSide,
      uniforms: uniforms
    })

    this.viewer.impl.matman().removeMaterial(
      'shaderMaterial')

    this.viewer.impl.matman().addMaterial(
      'shaderMaterial', material, true)

    this._materials[dbId] = material

    return material
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

    return Math.abs(a-b) < this._eps
  }

  ///////////////////////////////////////////////////////////////////////////
  // vector comparison
  ///////////////////////////////////////////////////////////////////////////
  isEqualVectorsWithPrecision (v1, v2) {

    return (
      this.isEqualWithPrecision (v1.x, v2.x) &&
      this.isEqualWithPrecision (v1.y, v2.y) &&
      this.isEqualWithPrecision (v1.z, v2.z)
    )
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
