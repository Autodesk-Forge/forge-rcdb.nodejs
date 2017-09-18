import Toolkit from 'Viewer.Toolkit'

export default class SelectSet {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (viewer) {

    this.viewer = viewer

    //debug
    this.material = this.createMaterial('select-set')
  }

  /////////////////////////////////////////////////////////
  // Load model: required to compute the bounding box
  //
  /////////////////////////////////////////////////////////
  async loadModel (model) {

    this.model = model

    const instanceTree = model.getData().instanceTree

    const rootId = instanceTree.getRootId()

    const bbox =
      await this.getComponentBoundingBox(
        model, rootId)

    this.boundingSphere = bbox.getBoundingSphere()
  }

  /////////////////////////////////////////////////////////
  // Returns bounding box as it appears in the viewer
  // (transformations could be applied)
  //
  /////////////////////////////////////////////////////////
  getModifiedWorldBoundingBox (fragIds, fragList) {

    const fragbBox = new THREE.Box3()
    const nodebBox = new THREE.Box3()

    fragIds.forEach(function(fragId) {

      fragList.getWorldBounds(fragId, fragbBox)

      nodebBox.union(fragbBox)
    })

    return nodebBox
  }

  /////////////////////////////////////////////////////////
  // Returns bounding box for aggregated fragments
  //
  /////////////////////////////////////////////////////////
  async getComponentBoundingBox (model, dbId) {

    const fragIds = await Toolkit.getFragIds(
      model, dbId)

    const fragList = model.getFragmentList()

    return this.getModifiedWorldBoundingBox(
      fragIds, fragList)
  }

  /////////////////////////////////////////////////////////
  // Creates Raycaster object from the mouse pointer
  //
  /////////////////////////////////////////////////////////
  pointerToRay (domElement, camera, pointer) {

    const pointerVector = new THREE.Vector3()
    const rayCaster = new THREE.Raycaster()
    const pointerDir = new THREE.Vector3()

    const rect = domElement.getBoundingClientRect()

    const x =  ((pointer.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((pointer.clientY - rect.top) / rect.height) * 2 + 1

    if (camera.isPerspective) {

      pointerVector.set(x, y, 0.5)

      pointerVector.unproject(camera)

      rayCaster.set(camera.position,
        pointerVector.sub(
          camera.position).normalize())

    } else {

      pointerVector.set(x, y, -15)

      pointerVector.unproject(camera)

      pointerDir.set(0, 0, -1)

      rayCaster.set(pointerVector,
        pointerDir.transformDirection(
          camera.matrixWorld))
    }

    return rayCaster.ray
  }

  /////////////////////////////////////////////////////////
  // Runs the main logic of the select set:
  // computes a pyramid shape from the selection window
  // corners and determines enclosed meshes from the model
  //
  /////////////////////////////////////////////////////////
  compute (pointer1, pointer2) {

    const nav = this.viewer.navigation

    const canvas = this.viewer.canvas

    const camera = nav.getCamera()

    // build 4 rays to project the 4 corners
    // of the selection window

    const ray1 = this.pointerToRay(
      canvas, camera, pointer1)

    const ray2 = this.pointerToRay(
      canvas, camera, {
        clientX: pointer2.clientX,
        clientY: pointer1.clientY
      })

    const ray3 = this.pointerToRay(
      canvas, camera, pointer2)

    const ray4 = this.pointerToRay(
      canvas, camera, {
        clientX: pointer1.clientX,
        clientY: pointer2.clientY
      })

    // first we compute the top of the pyramid
    const top = new THREE.Vector3(0,0,0)

    top.add(ray1.origin)
    top.add(ray2.origin)
    top.add(ray3.origin)
    top.add(ray4.origin)

    top.multiplyScalar(0.25)

    // we use the bounding sphere to determine
    // the height of the pyramid
    const {center, radius} = this.boundingSphere

    // compute distance from pyramid top to center
    // of bounding sphere

    const dist = new THREE.Vector3(
      top.x - center.x,
      top.y - center.y,
      top.z - center.z)

    // compute height of the pyramid:
    // to make sure we go far enough,
    // we add the radius of the bounding sphere

    const height = radius + dist.length()

    // compute the length of the side edges

    const angle = ray1.direction.angleTo(
      ray2.direction)

    const length = height / Math.cos(angle * 0.5)

    // compute bottom vertices

    const v1 = new THREE.Vector3(
      ray1.origin.x + ray1.direction.x * length,
      ray1.origin.y + ray1.direction.y * length,
      ray1.origin.z + ray1.direction.z * length)

    const v2 = new THREE.Vector3(
      ray2.origin.x + ray2.direction.x * length,
      ray2.origin.y + ray2.direction.y * length,
      ray2.origin.z + ray2.direction.z * length)

    const v3 = new THREE.Vector3(
      ray3.origin.x + ray3.direction.x * length,
      ray3.origin.y + ray3.direction.y * length,
      ray3.origin.z + ray3.direction.z * length)

    const v4 = new THREE.Vector3(
      ray4.origin.x + ray4.direction.x * length,
      ray4.origin.y + ray4.direction.y * length,
      ray4.origin.z + ray4.direction.z * length)

    var geometry = new THREE.Geometry()

    geometry.vertices = [
      v1, v2, v3, v4, top
    ]

    geometry.faces = [
      new THREE.Face3(0, 1, 2),
      new THREE.Face3(0, 2, 3),
      new THREE.Face3(1, 0, 4),
      new THREE.Face3(2, 1, 4),
      new THREE.Face3(3, 2, 4),
      new THREE.Face3(0, 3, 4)
    ]

    geometry.computeFaceNormals()

    return new THREE.Mesh(geometry, this.material)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createMaterial (name, color = 0xff0000) {

    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      color
    })

    this.viewer.impl.matman().addMaterial(
      name, material, true)

    return material
  }
}
