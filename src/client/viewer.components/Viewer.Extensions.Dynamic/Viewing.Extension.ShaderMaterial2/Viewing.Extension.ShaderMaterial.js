/////////////////////////////////////////////////////////////////
// ShaderMaterial Extension - Part 2
// By Philippe Leefsma, February 2016
//
/////////////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'
import Toolkit from 'Viewer.Toolkit'

//const vertexShader = `
//
//  varying vec2 vUv;
//
//  void main() {
//      vUv = uv;
//      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
//  }
//`
//
//const fragmentShader = `
//
//  uniform vec4 color;
//
//  varying vec2 vUv;
//
//  void main() {
//      gl_FragColor = color;
//  }
//`

class ShaderMaterialExtension2 extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ShaderMaterial2'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this.selectionHandler = this.selectionHandler.bind(this)

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.selectionHandler)

    const shader = THREE.ShaderLib.lambert

    this.material = this.createShaderMaterial(
      Object.assign({}, shader, {
        name: 'shader-material'
      }))

    this.randomUpdate ()

    console.log('Viewing.Extension.ShaderMaterial2 loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.ShaderMaterial2 unloaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createShaderMaterial (data) {

    const material = new THREE.ShaderMaterial(data)

    this._viewer.impl.matman().addMaterial(
      data.name, material, true)

    return material
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async selectionHandler (event) {

    if (event.selections && event.selections.length) {

      const selection = event.selections[0]

      const dbId = selection.dbIdArray[0]

      const fragIds = await Toolkit.getFragIds (
        this._viewer.model, dbId)

      const fragList = this._viewer.model.getFragmentList()

      fragIds.forEach((fragId) => {

        const material = fragList.getMaterial (fragId)

        console.log(material)
      })

      //this.setMaterial(fragIds, this.material)

      this._viewer.clearSelection()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setMaterial(fragIds, material) {

    const fragList = this._viewer.model.getFragmentList()

    this.toArray(fragIds).forEach((fragId) => {

      fragList.setMaterial(fragId, material)
    })

    this._viewer.impl.invalidate(true)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  randomUpdate() {

    const color = new THREE.Color(
      Math.random(),
      Math.random(),
      Math.random())

    //this.material.uniforms.specular.value = color
    //this.material.uniforms.diffuse.value = color

    this.material.uniforms.emissive.value = color

    this.material.needsUpdate = true

    this._viewer.impl.sceneUpdated(true)

    window.setTimeout(() => this.randomUpdate(), 2000)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  toArray (obj) {

    return obj ? (Array.isArray(obj) ? obj : [obj]) : []
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  //loadTexture (base64) {
  //
  //  return new Promise ((resolve) => {
  //
  //    const dataURI = "data:image/jpeg;base64," + base64
  //
  //    var texture = new THREE.Texture()
  //
  //    var image = new Image()
  //
  //    image.onload = () => {
  //      texture.image = image
  //      texture.needsUpdate = true
  //      resolve()
  //    }
  //
  //    image.src = dataURI
  //  })
  //}
  //
  ///////////////////////////////////////////////////////////////////
  ////
  ////
  ///////////////////////////////////////////////////////////////////
  //loadTextureAsync (url, mapping) {
  //
  //  return new Promise ((resolve, reject) => {
  //
  //    const onLoad = (texture) => resolve (texture)
  //
  //    const onError = (event) => reject (event)
  //
  //    THREE.ImageUtils.loadTexture(
  //      url, mapping, onLoad, onError)
  //  })
  //}
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ShaderMaterialExtension2.ExtensionId,
  ShaderMaterialExtension2)
