/////////////////////////////////////////////////////////////////////
// Viewing.Extension.Showcase
// by Philippe Leefsma, July 2017
//
/////////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import EventTool from 'Viewer.EventTool'
import Skybox from './Viewer.Skybox'
import Stopwatch from 'Stopwatch'

import xpos from './img/bridge/skybox-xpos.png'
import xneg from './img/bridge/skybox-xneg.png'
import ypos from './img/bridge/skybox-ypos.png'
import yneg from './img/bridge/skybox-yneg.png'
import zpos from './img/bridge/skybox-zpos.png'
import zneg from './img/bridge/skybox-zneg.png'

class ShowcaseExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onCameraChanged =
      this.onCameraChanged.bind(this)

    this.runAnimation =
      this.runAnimation.bind(this)

    this.eventTool = new EventTool(viewer)

    const imageList = [
      xpos, xneg,
      ypos, yneg,
      zpos, zneg
    ]

    const size = new THREE.Vector3()

    size.fromArray(options.size || [10000, 10000, 10000])

    this.skybox = new Skybox(viewer, {
      imageList,
      size
    })

    this.stopwatch = new Stopwatch()
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Showcase'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load() {

    console.log('Viewing.Extension.Showcase loaded')

    this.eventTool.on('mousewheel', (e) => {

      window.clearTimeout(this.timeoutId)

      this.timeoutId = window.setTimeout(() => {
        this.stopwatch.getElapsedMs()
        this.userInteraction = false
        this.runAnimation()
      }, 3500)

      this.userInteraction = true

      return false
    })

    this.eventTool.on('buttondown', (e) => {

      window.clearTimeout(this.timeoutId)

      this.userInteraction = true

      return false
    })

    this.eventTool.on('buttonup', (e) => {

      this.timeoutId = window.setTimeout(() => {
        this.stopwatch.getElapsedMs()
        this.runAnimation()
      }, 3500)

      this.userInteraction = false

      return false
    })

    this.viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)

    return true
  }

  /////////////////////////////////////////////////////////
  // Setup navigation
  //
  /////////////////////////////////////////////////////////
  configureNavigation () {

    const nav = this.viewer.navigation

    nav.setLockSettings({
      pan: true
    })

    this.bounds = new THREE.Box3(
      new THREE.Vector3(-100, -100, -100),
      new THREE.Vector3(100, 100, 100))

    nav.fitBounds(true, this.bounds)

    this.viewer.setViewCube('front')

    nav.toPerspective()

    setTimeout(() => {
      this.viewer.autocam.setHomeViewFrom(
        nav.getCamera())
      this.options.loader.show(false)
    }, 2000)
  }

  /////////////////////////////////////////////////////////
  // Model completed load callback
  //
  /////////////////////////////////////////////////////////
  onModelCompletedLoad (event) {

    if (event.model.dbModelId) {

      const urn = this.options.containerURN

      this.loadContainer(urn).then(() => {

        this.configureNavigation()
      })

      this.stopwatch.getElapsedMs()

      this.eventTool.activate()

      this.runAnimation()
    }
  }

  /////////////////////////////////////////////////////////
  // Load container model
  //
  /////////////////////////////////////////////////////////
  loadContainer (urn) {

    return new Promise(async(resolve) => {

      const doc = await this.options.loadDocument(urn)

      const path = this.options.getViewablePath(doc)

      this.viewer.loadModel(path, {}, (model) => {

        resolve (model)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.Showcase unloaded')

    window.cancelAnimationFrame(this.animId)

    this.viewer.removeEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)

    this.userInteraction = true

    this.eventTool.off()
  }

  /////////////////////////////////////////////////////////
  // Clamp vector length, not avail in three.js version
  // used by the viewer
  //
  /////////////////////////////////////////////////////////
  clampLength (vector, min, max ) {

    const length = vector.length()

    vector.divideScalar(length || 1)

    vector.multiplyScalar(
      Math.max(min, Math.min(max, length)))
  }

  /////////////////////////////////////////////////////////
  // Camera changed event
  //
  /////////////////////////////////////////////////////////
  onCameraChanged () {

    const nav = this.viewer.navigation

    const pos = nav.getPosition()

    if (pos.length() > 700.0 || pos.length() < 100.0) {

      this.clampLength(pos, 100.0, 700.0)

      nav.fitBounds(true, this.bounds)

      nav.setView(pos, new THREE.Vector3(0,0,0))
    }
  }

  /////////////////////////////////////////////////////////
  // Rotate camera around axis
  //
  /////////////////////////////////////////////////////////
  rotateCamera (axis, speed, dt) {

    const nav = this.viewer.navigation

    const up = nav.getCameraUpVector()

    const pos = nav.getPosition()

    const matrix = new THREE.Matrix4().makeRotationAxis(
      axis, speed * dt);

    pos.applyMatrix4(matrix)
    up.applyMatrix4(matrix)

    nav.setView(pos, new THREE.Vector3(0,0,0))
    nav.setCameraUpVector(up)
  }

  /////////////////////////////////////////////////////////
  // starts animation
  //
  /////////////////////////////////////////////////////////
  runAnimation () {

    if (!this.userInteraction) {

      const dt = this.stopwatch.getElapsedMs() * 0.001

      const axis = new THREE.Vector3(0,1,0)

      this.rotateCamera(axis, 10.0 * Math.PI/180, dt)

      this.animId = window.requestAnimationFrame(
        this.runAnimation)
    }
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ShowcaseExtension.ExtensionId,
  ShowcaseExtension)
