/// //////////////////////////////////////////////////////
// ShaderMaterial Extension
// By Philippe Leefsma, February 2016
//
/// //////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import Toolkit from 'Viewer.Toolkit'
import texture from './texture.png'
import Stopwatch from 'Stopwatch'

class ShaderMaterialExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.update = this.update.bind(this)

    this.stopwatch = new Stopwatch()
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.ShaderMaterial'
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform sampler2D texture;
      //uniform float param;
      varying vec2 vUv;
      void main() {
        vec4 tex = texture2D(texture, vUv);
        //float r = cos(param);
        //float g = sin(param);
        //float b = cos(param) * sin(param);
        //gl_FragColor = vec4(vUv.x, 0, 0, 1.0);
        //gl_FragColor = vec4(1.0, 0.0, 0.0 , 1.0);
        gl_FragColor = tex;
      }
    `

    const shaderParams = {
      side: THREE.DoubleSide,
      fragmentShader,
      vertexShader,
      attributes: {

      },
      uniforms: {
        // resolution: {
        //  value: 1
        // },
        texture: {
          value: this.generateTexture(12),
          type: 't'
        }
        // param: {
        //  value: Math.PI,
        //  type: 'f'
        // }
      }
    }

    this.material = this.createShaderMaterial(
      Object.assign({}, shaderParams, {
        name: 'shader-material'
      }))

    this.updateActive = true

    // this.update ()

    console.log('Viewing.Extension.ShaderMaterial loaded')

    return true
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.ShaderMaterial unloaded')

    this.updateActive = false

    super.unload()

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createShaderMaterial (shader) {
    const material = new THREE.ShaderMaterial(shader)

    const materials = this.viewer.impl.getMaterials()

    materials.addMaterial(
      shader.name,
      material,
      true)

    return material
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  generateTexture (size) {
    const pixels = []

    for (let i = 0; i < size; ++i) {
      for (let j = 0; j < size; ++j) {
        const color = Math.random()
        const pixel = parseInt(color * 0xff)
        pixels.push(pixel, 0xff - pixel, 0, 0xff)
      }
    }

    const dataTexture = new THREE.DataTexture(
      Uint8Array.from(pixels),
      size, size,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
      THREE.UVMapping
    )

    dataTexture.minFilter = THREE.LinearMipMapLinearFilter
    dataTexture.magFilter = THREE.LinearFilter // THREE.LinearFilter // THREE.NearestFilter
    dataTexture.needsUpdate = true

    return dataTexture
  }

  calculateUVsGeo (geometry, size) {
    geometry.computeBoundingBox()

    const { min, max } = geometry.boundingBox

    const range = new THREE.Vector2(
      max.x - min.x,
      max.y - min.y)

    const offset = new THREE.Vector2(
      0 - min.x,
      0 - min.y)

    const uvs = geometry.faceVertexUvs[0]

    const offX = range.x / (2 * size)
    const offY = range.y / (2 * size)
    const incX = range.x / size
    const incY = range.y / size

    uvs.splice(0, uvs.length)

    geometry.faces.forEach((face) => {
      const v1 = geometry.vertices[face.a]
      const v2 = geometry.vertices[face.b]
      const v3 = geometry.vertices[face.c]

      uvs.push([
        new THREE.Vector2(
          Math.abs((offX + v1.x + offset.x - incX) / range.x),
          Math.abs((offY + v1.y + offset.y - incY) / range.y)),
        new THREE.Vector2(
          Math.abs((offX + v2.x + offset.x - incX) / range.x),
          Math.abs((offY + v2.y + offset.y - incY) / range.y)),
        new THREE.Vector2(
          Math.abs((offX + v3.x + offset.x - incX) / range.x),
          Math.abs((offY + v3.y + offset.y - incY) / range.y))
      ])
    })

    geometry.uvsNeedUpdate = true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onSelection (event) {
    if (event.selections && event.selections.length) {
      const selection = event.selections[0]

      const dbId = selection.dbIdArray[0]

      const model = this.viewer.model

      // const material = new THREE.MeshPhongMaterial({
      //  specular: new THREE.Color(0xff0000),
      //  color: new THREE.Color(0xff0000),
      //  side: THREE.DoubleSide
      // })
      //
      // const materials = this.viewer.impl.getMaterials()
      //
      // materials.addMaterial(
      //  'test-material',
      //  material,
      //  true)

      const mesh = Toolkit.buildComponentMesh(
        this.viewer, model, dbId, null,
        this.material)

      this.calculateUVsGeo(mesh.geometry, 12)

      // const fragIds = await Toolkit.getFragIds (
      //  selection.model, dbId)
      //
      // this.setMaterial(selection.model,
      //  fragIds, this.material)

      Toolkit.hide(this.viewer, dbId, model)

      this.viewer.impl.scene.add(mesh)

      this.viewer.impl.sceneUpdated(true)

      this.viewer.clearSelection()
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setMaterial (model, fragIds, material) {
    const fragList = model.getFragmentList()

    fragIds.forEach((fragId) => {
      fragList.setMaterial(fragId, material)
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  update () {
    if (this.updateActive) {
      requestAnimationFrame(this.update)

      const dt = this.stopwatch.getElapsedMs() * 0.001

      const param = this.material.uniforms.param

      param.value = (param.value + dt) % (2 * Math.PI)

      param.needsUpdate = true

      this.viewer.impl.invalidate(true)
    }
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ShaderMaterialExtension.ExtensionId,
  ShaderMaterialExtension)
