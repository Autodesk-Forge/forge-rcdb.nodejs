//
//export default class TestExtension
//  extends Autodesk.Viewing.Extension {
//
//  constructor (viewer, options) {
//
//    super()
//
//    this.viewer = viewer
//  }
//
//  load () {
//
//    return true
//  }
//
//  unload () {
//
//    return true
//  }
//}
//
//Autodesk.Viewing.theExtensionManager.registerExtension(
//  'Viewing.Extension.Test', TestExtension)
//


import { Font, Geometry, TextGeometry } from 'threejs-full-es6'
import FontJson from './helvetiker_bold.typeface.json'
import EventTool from 'Viewer.EventTool'


export default class TextExtension
  extends Autodesk.Viewing.Extension {

  /////////////////////////////////////////////////////////
  // Adds a color material to the viewer
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super()

    this.onClick = this.onClick.bind(this)

    this.viewer = viewer

    this.intersectMeshes = []

    this.eventTool = new EventTool(this.viewer)

    this.eventTool.on (
      'singleclick',
      this.onClick)

    this.eventTool.activate()
  }

  load () {

    return true
  }

  unload () {

    return true
  }

  /////////////////////////////////////////////////////////
  // Adds a color material to the viewer
  //
  /////////////////////////////////////////////////////////
  createColorMaterial (color) {

    const material = new THREE.MeshPhongMaterial({
      specular: new THREE.Color(color),
      side: THREE.DoubleSide,
      reflectivity: 0.0,
      color
    })

    const materials = this.viewer.impl.getMaterials()

    materials.addMaterial(
      color.toString(),
      material,
      true)

    return material
  }

  /////////////////////////////////////////////////////////
  // Wraps TextGeometry object and adds a new mesh to
  // the scene
  /////////////////////////////////////////////////////////
  createText (params) {

    const textGeometry = new TextGeometry(params.text,
      Object.assign({}, {
        font: new Font(FontJson),
        params
      }))

    const geometry = new THREE.BufferGeometry

    geometry.fromGeometry(textGeometry)

    const material = this.createColorMaterial(
      params.color)

    const text = new THREE.Mesh(
      geometry , material)

    text.position.set(
      params.position.x,
      params.position.y,
      params.position.z)

    this.intersectMeshes.push(text)

    this.viewer.impl.scene.add(text)

    this.viewer.impl.sceneUpdated(true)

    return text
  }

  /////////////////////////////////////////////////////////
  // Creates Raycaster object from the pointer
  //
  /////////////////////////////////////////////////////////
  pointerToRaycaster (domElement, camera, pointer) {

    const pointerVector = new THREE.Vector3()
    const pointerDir = new THREE.Vector3()
    const ray = new THREE.Raycaster()

    const rect = domElement.getBoundingClientRect()

    const x = ((pointer.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((pointer.clientY - rect.top) / rect.height) * 2 + 1

    if (camera.isPerspective) {

      pointerVector.set(x, y, 0.5)

      pointerVector.unproject(camera)

      ray.set(camera.position,
        pointerVector.sub(
          camera.position).normalize())

    } else {

      pointerVector.set(x, y, -1)

      pointerVector.unproject(camera)

      pointerDir.set(0, 0, -1)

      ray.set(pointerVector,
        pointerDir.transformDirection(
          camera.matrixWorld))
    }

    return ray
  }

  /////////////////////////////////////////////////////////
  // Click handler
  //
  /////////////////////////////////////////////////////////
  onClick (event) {

    const pointer = event.pointers
      ? event.pointers[0]
      : event

    const rayCaster = this.pointerToRaycaster(
      this.viewer.impl.canvas,
      this.viewer.impl.camera,
      pointer)

    const intersectResults = rayCaster.intersectObjects(
      this.intersectMeshes, true)

    console.log(intersectResults)

    return false
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Viewing.Extension.Text', TextExtension)
