import THREELib from 'three-js'
const THREEJS = THREELib()

export default class SoftBody {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  processGeometry (buffGeometry) {
    const geometry =
      new THREEJS.Geometry().fromBufferGeometry(
        buffGeometry)

    geometry.mergeVertices()

    const indexedBufferGeom =
      this.createIndexedBufferGeometryFromGeometry(geometry)

    this.mapIndices(buffGeometry, indexedBufferGeom)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createIndexedBufferGeometryFromGeometry (geometry) {
    var numVertices = geometry.vertices.length

    var numFaces = geometry.faces.length

    var bufferGeom = new THREEJS.BufferGeometry()

    var vertices = new Float32Array(numVertices * 3)

    var indices = new (numFaces * 3 > 65535
      ? Uint32Array
      : Uint16Array)(numFaces * 3)

    for (var i = 0; i < numVertices; i++) {
      var p = geometry.vertices[i]

      var i3 = i * 3

      vertices[i3] = p.x
      vertices[i3 + 1] = p.y
      vertices[i3 + 2] = p.z
    }

    for (var i = 0; i < numFaces; i++) {
      var f = geometry.faces[i]

      var i3 = i * 3

      indices[i3] = f.a
      indices[i3 + 1] = f.b
      indices[i3 + 2] = f.c
    }

    bufferGeom.setIndex(
      new THREEJS.BufferAttribute(indices, 1))

    bufferGeom.addAttribute(
      'position',
      new THREEJS.BufferAttribute(vertices, 3))

    return bufferGeom
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  isEqual (x1, y1, z1, x2, y2, z2) {
    const delta = 0.000001

    return (
      Math.abs(x2 - x1) < delta &&
      Math.abs(y2 - y1) < delta &&
      Math.abs(z2 - z1) < delta
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  mapIndices (buffGeometry, indexedBufferGeom) {
    var idxVertices = indexedBufferGeom.attributes.position.array
    var vertices = buffGeometry.attributes.position.array
    var indices = indexedBufferGeom.index.array

    var numIdxVertices = idxVertices.length / 3
    var numVertices = vertices.length / 3

    buffGeometry.ammoVertices = idxVertices
    buffGeometry.ammoIndexAssociation = []
    buffGeometry.ammoIndices = indices

    for (var i = 0; i < numIdxVertices; i++) {
      var association = []

      buffGeometry.ammoIndexAssociation.push(association)

      var i3 = i * 3

      for (var j = 0; j < numVertices; j++) {
        var j3 = j * 3

        if (this.isEqual(
          idxVertices[i3],
          idxVertices[i3 + 1],
          idxVertices[i3 + 2],
          vertices[j3],
          vertices[j3 + 1],
          vertices[j3 + 2])) {
          association.push(j3)
        }
      }
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (geometry,
    worldInfo,
    softBodyHelpers,
    params) {
    this.processGeometry(geometry)

    this.mesh = new THREE.Mesh(
      geometry, new THREE.MeshPhongMaterial({
        color: 0xFFFFFF
      }))

    this.mesh.frustumCulled = false
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true

    // textureLoader.load( "../textures/colors.png", function( texture ) {
    //  volume.material.map = texture;
    //  volume.material.needsUpdate = true;
    // } );

    this.body = softBodyHelpers.CreateFromTriMesh(
      worldInfo,
      geometry.ammoVertices,
      geometry.ammoIndices,
      geometry.ammoIndices.length / 3,
      true)

    var sbConfig = this.body.get_m_cfg()

    sbConfig.set_viterations(40)
    sbConfig.set_piterations(40)

    // Soft-soft and soft-rigid collisions
    sbConfig.set_collisions(0x11)

    // Friction
    sbConfig.set_kDF(0.1)

    // Damping
    sbConfig.set_kDP(0.01)

    // Pressure
    sbConfig.set_kPR(params.pressure)

    // Stiffness
    this.body.get_m_materials().at(0).set_m_kLST(0.9)
    this.body.get_m_materials().at(0).set_m_kAST(0.9)

    this.body.setTotalMass(params.mass, false)

    const shape = Ammo.castObject(
      this.body,
      Ammo.btCollisionObject).getCollisionShape()

    shape.setMargin(params.margin)

    this.mesh.userData.physicsBody = this.body

    // Disable deactivation
    this.body.setActivationState(4)
  }
}
