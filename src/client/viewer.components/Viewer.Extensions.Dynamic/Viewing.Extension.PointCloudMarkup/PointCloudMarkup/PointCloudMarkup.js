///////////////////////////////////////////////////////////
// PointCloudMarkup: high-perf markup 3D for Forge Viewer
// by Philippe Leefsma, December 2017
//
///////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'
import throttle from 'lodash/throttle'
import defaultTex from './texture.png'
import Stopwatch from 'Stopwatch'

export default class PointCloudMarkup extends EventsEmitter {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super()

    this.onCameraChanged = this.onCameraChanged.bind(this)

    this.viewer = viewer

    this.dbIds = this.getAllDbIds()

    this.viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)

    // Initialize geometry vertices
    // and shader attribute colors
    this.geometry = new THREE.Geometry()

    const maxPoints = options.maxPoints || 10000

    for (var i = 0; i < maxPoints; ++i) {

      this.geometry.vertices.push(new THREE.Vector3)
    }

    this.shader = this.createShader(options)

    // creates THREE.PointCloud
    this.pointCloud = new THREE.PointCloud(
      this.geometry, this.shader.material)

    // adds to the viewer scene
    this.viewer.impl.sceneAfter.add(this.pointCloud)

    //this.update = throttle(this.update, 10)

    this.options = options

    this.markups = []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createShader (options) {

    // Vertex Shader code
    const vertexShader = options.vertexShader || `
      attribute float pointSize;
      void main() {
        vec4 vPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * vPosition;
        gl_PointSize = pointSize;
      }
    `

    // Fragment Shader code
    const fragmentShader = options.fragmentShader || `
      uniform sampler2D texture;
      void main() {
        vec4 tex = texture2D(texture, gl_PointCoord);
        if (tex.a < 0.2) discard;
        gl_FragColor = vec4(tex.r, tex.g, tex.b, tex.a);
      }
    `

    const texture = options.texture || defaultTex

    // Shader material parameters
    const shaderParams = options.shaderParams || {
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,
        fragmentShader,
        vertexShader,
        opacity: 0.5,
        attributes: {
          pointSize: {
            type: 'f',
            value: []
          }
        },
        uniforms: {
          texture: {
            value: THREE.ImageUtils.loadTexture(texture),
            type: 't'
          }
        }
      }

    // creates shader material
    const material =
      new THREE.ShaderMaterial(
        shaderParams)

    const generateTexture = (size, radius) => {

      const pixels = []

      for (let u = 0; u < size; ++u) {

        for (let v = 0; v < size ; ++v) {

          const dist = Math.sqrt(
            (u/size - 0.5) * (u/size - 0.5) +
            (v/size - 0.5) * (v/size - 0.5))

         if (dist < 0.1) {

           pixels.push(0xff, 0x00, 0x00, 0xff)

         } else if (dist < (radius - 0.05)) {

            pixels.push(0xff, 0x00, 0x00, 0x00)

          } else if (dist < radius) {

            pixels.push(0xff, 0x00, 0x00, 0xff)

          } else {

            pixels.push(0x00, 0x00, 0x00, 0x00)
          }
        }
      }

      const dataTexture = new THREE.DataTexture (
        Uint8Array.from (pixels),
        size, size,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
        THREE.UVMapping
      )

      dataTexture.minFilter = THREE.LinearMipMapLinearFilter
      dataTexture.magFilter = THREE.LinearFilter // THREE.NearestFilter
      dataTexture.needsUpdate = true

      return dataTexture
    }

    const stopwatch = new Stopwatch()

    let radius = 0.0

    return {
      setTexture: (tex) => {

        const {texture} = shaderParams.uniforms

        texture.value = THREE.ImageUtils.loadTexture(tex)

        texture.needsUpdate = true

      },
      update: () => {

        const dt = stopwatch.getElapsedMs() * 0.001

        radius += dt * 0.25

        radius = radius > 0.5 ? 0.0 : radius

        const {texture} = shaderParams.uniforms

        texture.value = generateTexture(96, radius)

        texture.needsUpdate = true

      },
      material
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  stopAnimation () {

    const texture = this.options.texture || defaultTex

    this.shader.setTexture(texture)

    this.viewer.impl.invalidate (true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  update (t) {

    this.shader.update(t)

    this.viewer.impl.invalidate (true)
  }

  /////////////////////////////////////////////////////////
  // Returns markup from markupId
  //
  /////////////////////////////////////////////////////////
  getMarkupById (markupId) {

    const res = this.markups.filter((markup) => {

      return markup.id === markupId
    })

    return res.length ? res[0] : null
  }

  /////////////////////////////////////////////////////////
  // Set markup size
  //
  /////////////////////////////////////////////////////////
  setMarkupSize (markupId, size, override) {

    const {pointSize} = this.pointCloud.material.attributes

    const markup = this.getMarkupById(markupId)

    if (override) {

      pointSize.value[markup.index] = size

    } else if (markup.visible) {

      if (markup.occlusion) {

        if (!this.checkOcclusion(markup)) {

          pointSize.value[markup.index] = size
        }

      } else {

        pointSize.value[markup.index] = size
      }
    }

    markup.size = !override ? size : markup.size

    pointSize.needsUpdate = true

    this.viewer.impl.invalidate (true)
  }

  /////////////////////////////////////////////////////////
  // Adds new markup
  //
  /////////////////////////////////////////////////////////
  addMarkup (markupInfo) {

    const size = markupInfo.size ||
      this.options.markupSize ||
      25.0

    const markup = Object.assign({}, {
      id: this.guid('xxx-xxx-xxx'),
      occlusion: true,
      visible: true,
      size
    }, markupInfo, {
      index: this.markups.length
    })

    const vertex = this.geometry.vertices[markup.index]

    vertex.x = markup.point.x
    vertex.y = markup.point.y
    vertex.z = markup.point.z

    this.geometry.verticesNeedUpdate = true

    this.markups.push(markup)

    this.setMarkupSize (
      markup.id, markup.size)

    this.emit('markup.created', markup)

    return markup
  }

  /////////////////////////////////////////////////////////
  // Removes markup
  //
  /////////////////////////////////////////////////////////
  removeMarkup (markupId) {

    const {pointSize} = this.pointCloud.material.attributes

    this.markups = this.markups.filter((markup) => {

        return (markup.id !== markupId)
    })

    this.markups.forEach((markup, idx) => {

      const vertex = this.geometry.vertices[idx]

      pointSize.value[idx] = markup.size

      vertex.x = markup.point.x
      vertex.y = markup.point.y
      vertex.z = markup.point.z

      markup.index = idx
    })

    for (let idx = this.markups.length;
             idx < this.geometry.vertices.length; ++idx) {

      pointSize.value[idx] = 0.0
    }

    this.geometry.verticesNeedUpdate = true

    pointSize.needsUpdate = true

    this.viewer.impl.invalidate(true)

    this.emit('markup.deleted',
      markupId)
  }

  /////////////////////////////////////////////////////////
  // Clear all markups
  //
  /////////////////////////////////////////////////////////
  clearMarkups () {

    const {pointSize} = this.pointCloud.material.attributes

    const {length} = this.geometry.vertices

    for (let idx = 0; idx < length; ++idx) {

      pointSize.value[idx] = 0.0
    }

    pointSize.needsUpdate = true

    this.viewer.impl.invalidate (true)

    this.markups = []
  }

  /////////////////////////////////////////////////////////
  // Set markup visibility: to hide markup, set size to 0
  //
  /////////////////////////////////////////////////////////
  setMarkupVisibility (markupId, visible) {

    const markup = this.getMarkupById(markupId)

    markup.visible = visible

    this.updateMarkup (markup)
  }

  /////////////////////////////////////////////////////////
  // Set markup occlusion property
  //
  /////////////////////////////////////////////////////////
  setMarkupOcclusion (markupId, occlusion) {

    const markup = this.getMarkupById(markupId)

    markup.occlusion = occlusion

    this.updateMarkup (markup)
  }

  /////////////////////////////////////////////////////////
  // Update markup
  //
  /////////////////////////////////////////////////////////
  updateMarkup (markup) {

    if (markup.visible) {

      if (markup.occlusion) {

        const occluded = this.checkOcclusion(markup)

        this.setMarkupSize (markup.id,
          occluded ? 0.0 : markup.size,
          true)

      } else {

        this.setMarkupSize (markup.id,
          markup.size,
          true)
      }

    } else {

      this.setMarkupSize (markup.id,
        0.0, true)
    }
  }

  /////////////////////////////////////////////////////////
  // Get markups state
  //
  /////////////////////////////////////////////////////////
  getState () {

    return {
      markups: this.markups
    }
  }

  /////////////////////////////////////////////////////////
  // Restore state
  //
  /////////////////////////////////////////////////////////
  restoreState (state = {}) {

    this.clearMarkups()

    if (state.markups) {

      state.markups.forEach((markup) => {

        this.addMarkup(markup)
      })
    }
  }

  /////////////////////////////////////////////////////////
  // Camera Changed event handler
  //
  /////////////////////////////////////////////////////////
  onCameraChanged () {

    this.markups.forEach((markup) => {

      if (markup.visible && markup.occlusion) {

        const occluded = this.checkOcclusion(markup)

        this.setMarkupSize (markup.id,
          occluded ? 0.0 : markup.size,
          true)
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Creates Raycaster object from client point
  //
  /////////////////////////////////////////////////////////
  pointToRaycaster (domElement, camera, point) {

    const pointerVector = new THREE.Vector3()
    const pointerDir = new THREE.Vector3()
    const ray = new THREE.Raycaster()

    const rect = domElement.getBoundingClientRect()

    const x =  ((point.x - rect.left) / rect.width)  * 2 - 1
    const y = -((point.y - rect.top)  / rect.height) * 2 + 1

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
  // Returns array of selected markups for given screenPoint
  //
  /////////////////////////////////////////////////////////
  getSelection (screenPoint, treshold = 0.9) {

    const rayCaster = this.pointToRaycaster(
      this.viewer.impl.canvas,
      this.viewer.impl.camera, {
        x: screenPoint.x,
        y: screenPoint.y
      })

    const res = rayCaster.intersectObjects(
      [this.pointCloud], true)

    if (res.length) {

      return this.markups.filter((markup) => {

        const diff = {
          x: res[0].point.x - markup.point.x,
          y: res[0].point.y - markup.point.y,
          z: res[0].point.z - markup.point.z
        }

        const dist = Math.sqrt(
          diff.x * diff.x +
          diff.y * diff.y +
          diff.z * diff.z)

        return dist < treshold
      })
    }

    return []
  }

  /////////////////////////////////////////////////////////
  // Occlusion check: return true if markup
  // is being occluded
  //
  /////////////////////////////////////////////////////////
  checkOcclusion (markup) {

    const clientPoint = this.viewer.worldToClient(
      markup.point)

    const offset = $(this.viewer.container).offset()

    const rayCaster = this.pointToRaycaster(
      this.viewer.impl.canvas,
      this.viewer.impl.camera, {
        x: clientPoint.x + offset.left,
        y: clientPoint.y + offset.top
      })

    const hitTest = this.viewer.model.rayIntersect(
      rayCaster, true, this.dbIds)

    if (hitTest) {

      if (hitTest.fragId === markup.fragId) {

        const offset = {
          x: hitTest.point.x - markup.point.x,
          y: hitTest.point.y - markup.point.y,
          z: hitTest.point.z - markup.point.z
        }

        const dist = Math.sqrt(
          offset.x * offset.x +
          offset.y * offset.y +
          offset.z * offset.z)

        if (this.options.logOcclusionDist) {

          console.log(dist)
        }

        if (dist < this.options.occlusionDist) {

          return false
        }
      }

      return true
    }
  }

  /////////////////////////////////////////////////////////
  // Get list of all dbIds in the model
  //
  /////////////////////////////////////////////////////////
  getAllDbIds () {

    const {instanceTree} = this.viewer.model.getData()

    const {dbIdToIndex} = instanceTree.nodeAccess

    return Object.keys(dbIdToIndex).map((dbId) => {

      return parseInt(dbId)
    })
  }

  /////////////////////////////////////////////////////////
  // Removes everything
  //
  /////////////////////////////////////////////////////////
  destroy () {

    this.viewer.impl.sceneAfter.remove(this.pointCloud)

    this.viewer.removeEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)

    this.markups = []

    this.off ()
  }
}
