/////////////////////////////////////////////////////////////////
// Camera Path Viewer Extension
// By Philippe Leefsma, Autodesk Inc, October 2017
//
/////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import WidgetContainer from 'WidgetContainer'
import './Viewing.Extension.CameraPath.scss'
import TWEEN from '@tweenjs/tween.js'
import Toolkit from 'Viewer.Toolkit'
import { ReactLoader } from 'Loader'
import ReactDOM from 'react-dom'
import React from 'react'

class CameraPathExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.runAnimation = this.runAnimation.bind(this)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      configManager: null,
      showLoader: true

    }).then (async() => {

      const configManagerReactOptions = {
        pushRenderExtension: () => {
          return Promise.resolve()
        },
        popRenderExtension: () => {
          return Promise.resolve()
        }
      }

      const configManager =
        await this.viewer.loadDynamicExtension(
          'Viewing.Extension.ConfigManager', {
            react: configManagerReactOptions,
            restoreFilter: {
              renderOptions: true,
              objectSet: true,
              viewport: false
            }
          })

      this.react.setState({
        showLoader: false,
        configManager
      })

      this.react.pushRenderExtension(this)
    })

    this.navigation = this.viewer.navigation

    this.camera = this.navigation.getCamera()

    console.log('Viewing.Extension.CameraPath loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className () {

    return 'camera-path'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.CameraPath'
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.CameraPath unloaded')

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded () {

    this.options.loader.show (false)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createTween (params) {

    return new Promise ((resolve) => {

      new TWEEN.Tween(params.object)
        .to(params.to, params.duration)
        .onComplete(() => resolve())
        .onUpdate(params.onUpdate)
        .easing(params.easing)
        .start()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  tweenCameraTo (state) {

    const targetEnd = new THREE.Vector3(
      state.viewport.target[0],
      state.viewport.target[1],
      state.viewport.target[2])

    const posEnd = new THREE.Vector3(
      state.viewport.eye[0],
      state.viewport.eye[1],
      state.viewport.eye[2])

    const upEnd = new THREE.Vector3(
      state.viewport.up[0],
      state.viewport.up[1],
      state.viewport.up[2])

    const nav = this.navigation

    const target = new THREE.Vector3().copy(
      nav.getTarget())

    const pos = new THREE.Vector3().copy(
      nav.getPosition())

    const up = new THREE.Vector3().copy(
      nav.getCameraUpVector())


    const targetTween = this.createTween({
      easing: TWEEN.Easing.Exponential.Out,
      onUpdate: (v) => {
        nav.setTarget(v)
      },
      duration: 1500,
      object: target,
      to: targetEnd
    })

    const posTween = this.createTween({
      easing: TWEEN.Easing.Exponential.Out,
      onUpdate: (v) => {
        nav.setPosition(v)
      },
      duration: 1500,
      object: pos,
      to: posEnd
    })

    const upTween = this.createTween({
      easing: TWEEN.Easing.Exponential.Out,
      onUpdate: (v) => {
        nav.setCameraUpVector(v)
      },
      duration: 1500,
      object: up,
      to: upEnd
    })

    Promise.all([
      targetTween,
      posTween,
      upTween]).then(() => {

      this.animate = false
    })

    this.runAnimation(true)
  }

  /////////////////////////////////////////////////////////
  // starts animation
  //
  /////////////////////////////////////////////////////////
  runAnimation (start) {

    if (start || this.animate) {

      this.animId = window.requestAnimationFrame(
        this.runAnimation)

      TWEEN.update()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  saveState () {

    this.viewerState = this.viewer.getState({
      viewport: true
    })
  }

  /////////////////////////////////////////////////////////
  // React method - render panel title
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Camera Path
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {configManager, showLoader} =
      this.react.getState()

    const opts = {
      showTitle: false
    }

    return (
      <div className="content">
        <ReactLoader show={showLoader}/>

        <button onClick={() => this.tweenCameraTo(this.viewerState)}/>
        <button onClick={() => this.saveState()}/>

        { configManager && configManager.render(opts) }

      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>

        { this.renderContent () }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  CameraPathExtension.ExtensionId,
  CameraPathExtension)

export default 'Viewing.Extension.CameraPath'








