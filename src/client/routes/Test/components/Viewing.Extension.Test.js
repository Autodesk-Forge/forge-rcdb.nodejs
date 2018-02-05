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

export default class TextExtension
extends Autodesk.Viewing.Extension {

  /////////////////////////////////////////////////////////
  // Adds a color material to the viewer
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super()

    this.viewer = viewer
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

    this.viewer.impl.scene.add(text)

    this.viewer.impl.sceneUpdated(true)

    return text
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Viewing.Extension.Text', TextExtension)
