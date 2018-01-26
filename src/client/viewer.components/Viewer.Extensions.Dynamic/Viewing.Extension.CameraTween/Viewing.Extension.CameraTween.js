/////////////////////////////////////////////////////////////////
// Camera Tween Viewer Extension
// By Philippe Leefsma, Autodesk Inc, October 2017
//
/////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import ContentEditable from 'react-contenteditable'
import WidgetContainer from 'WidgetContainer'
import './Viewing.Extension.CameraTween.scss'
import TWEEN from '@tweenjs/tween.js'
import Toolkit from 'Viewer.Toolkit'
import { ReactLoader } from 'Loader'
import ReactDOM from 'react-dom'
import React from 'react'
import Label from 'Label'
import {
  DropdownButton,
  MenuItem
} from 'react-bootstrap'


class CameraTweenExtension extends MultiModelExtensionBase {

  static EASINGS = [
    {
      id: TWEEN.Easing.Linear.None,
      name: 'Linear'
    },

    {
      id: TWEEN.Easing.Quadratic.In,
      name: 'Quadratic.In'
    },
    {
      id: TWEEN.Easing.Quadratic.Out,
      name: 'Quadratic.Out'
    },
    {
      id: TWEEN.Easing.Quadratic.InOut,
      name: 'Quadratic.InOut'
    },

    {
      id: TWEEN.Easing.Cubic.In,
      name: 'Cubic.In'
    },
    {
      id: TWEEN.Easing.Cubic.Out,
      name: 'Cubic.Out'
    },
    {
      id: TWEEN.Easing.Cubic.InOut,
      name: 'Cubic.InOut'
    },


    {
      id: TWEEN.Easing.Quartic.In,
      name: 'Quartic.In'
    },
    {
      id: TWEEN.Easing.Quartic.Out,
      name: 'Quartic.Out'
    },
    {
      id: TWEEN.Easing.Quartic.InOut,
      name: 'Quartic.InOut'
    },

    {
      id: TWEEN.Easing.Quintic.In,
      name: 'Quintic.In'
    },
    {
      id: TWEEN.Easing.Quintic.Out,
      name: 'Quintic.Out'
    },
    {
      id: TWEEN.Easing.Quintic.InOut,
      name: 'Quintic.InOut'
    },

    {
      id: TWEEN.Easing.Exponential.In,
      name: 'Exponential.In'
    },
    {
      id: TWEEN.Easing.Exponential.Out,
      name: 'Exponential.Out'
    },
    {
      id: TWEEN.Easing.Exponential.InOut,
      name: 'Exponential.InOut'
    }
  ]

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

      targetTweenDuration: 2500,
      posTweenDuration: 2500,
      upTweenDuration: 2500,

      targetTweenEasing: {
        id: TWEEN.Easing.Linear.None,
        name: 'Linear'
      },
      posTweenEasing: {
        id: TWEEN.Easing.Linear.None,
        name: 'Linear'
      },
      upTweenEasing: {
        id: TWEEN.Easing.Linear.None,
        name: 'Linear'
      },

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
              cameraTween: true,
              objectSet: true,
              viewport: false
            },
            playPeriod: 2500
          })

      this.react.setState({
        showLoader: false,
        configManager
      })

      this.react.pushRenderExtension(this)
    })

    this.navigation = this.viewer.navigation

    this.camera = this.navigation.getCamera()

    console.log('Viewing.Extension.CameraTween loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className () {

    return 'camera-tween'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.CameraTween'
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.CameraTween unloaded')

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

    const {

      targetTweenDuration,
      posTweenDuration,
      upTweenDuration,

      targetTweenEasing,
      posTweenEasing,
      upTweenEasing

    } = this.react.getState()

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
      easing: targetTweenEasing.id,
      onUpdate: (v) => {
        nav.setTarget(v)
      },
      duration: targetTweenDuration,
      object: target,
      to: targetEnd
    })

    const posTween = this.createTween({
      easing: posTweenEasing.id,
      onUpdate: (v) => {
        nav.setPosition(v)
      },
      duration: posTweenDuration,
      object: pos,
      to: posEnd
    })

    const upTween = this.createTween({
      easing: upTweenEasing.id,
      onUpdate: (v) => {
        nav.setCameraUpVector(v)
      },
      duration: upTweenDuration,
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
  getState (viewerState) {

    const viewport = Object.assign({},
      viewerState.viewport, {

      })

    viewerState.cameraTween = {
      viewport
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  restoreState (viewerState) {

    if (viewerState.cameraTween) {

      this.tweenCameraTo(viewerState.cameraTween)
    }
  }

  /////////////////////////////////////////////////////////
  // React method - render panel title
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Camera Tween
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInputChanged (e, key) {

    const state = this.react.getState()

    state[key] = e.target.value

    state.configManager.playPeriod = Math.max(
      Math.max(
        parseFloat(state.targetTweenDuration || 2500),
        parseFloat(state.posTweenDuration || 2500),
        parseFloat(state.upTweenDuration || 2500),
      200))

    this.react.setState(state)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDownNumeric (e) {

    //backspace, ENTER, ->, <-, delete, '.', ',',
    const allowed = [8, 13, 37, 39, 46, 188, 190]

    if (allowed.indexOf(e.keyCode) > -1 ||
       (e.keyCode > 47 && e.keyCode < 58)) {

      return
    }

    e.stopPropagation()
    e.preventDefault()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderEasing (field) {

    const state = this.react.getState()

    const currentEasing = state[`${field}TweenEasing`]

    const items = CameraTweenExtension.EASINGS.map(
      (easing) => {

      const id = field + easing.id

      return (
        <MenuItem eventKey={id} key={id}
          onClick={() => {
            this.react.setState({
              [`${field}TweenEasing`]: easing
            })
          }}>
          { easing.name }
        </MenuItem>
      )
    })

    return (
      <DropdownButton
        title={"Easing: " + currentEasing.name}
        key={`${field}-easing-dropdown`}
        id={`${field}-easing-dropdown`}
      >
       { items }
      </DropdownButton>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {
      configManager,
      showLoader,

      targetTweenDuration,
      posTweenDuration,
      upTweenDuration

    } = this.react.getState()

    const opts = {
      showTitle: false
    }

    return (
      <div className="content">
        <ReactLoader show={showLoader}/>

        <div className="tween">

          <div className="row">
            <Label text={'Tween Parameters:'}/>
          </div>

          <div className="row">
            <Label className="name" text={'Up Vector:'}/>
            <Label className="separator" text={'| '}/>
            <Label className="field" text={'Duration (ms): '}/>
            <ContentEditable
              onChange={(e) => this.onInputChanged(e, 'upTweenDuration')}
              onKeyDown={(e) => this.onKeyDownNumeric(e)}
              className="input-duration"
              html={upTweenDuration}
              data-placeholder="2500 ms"
            />
            { this.renderEasing('up')}
          </div>

          <div className="row">
            <Label className="name" text={'Position:'}/>
            <Label className="separator" text={'| '}/>
            <Label className="field" text={'Duration (ms): '}/>
            <ContentEditable
              onChange={(e) => this.onInputChanged(e, 'posTweenDuration')}
              onKeyDown={(e) => this.onKeyDownNumeric(e)}
              className="input-duration"
              html={posTweenDuration}
              data-placeholder="2500 ms"
            />
            { this.renderEasing('pos')}
          </div>

          <div className="row">
            <Label className="name" text={'Target:'}/>
            <Label className="separator" text={'| '}/>
            <Label className="field" text={'Duration (ms): '}/>
            <ContentEditable
              onChange={(e) => this.onInputChanged(e, 'targetTweenDuration')}
              onKeyDown={(e) => this.onKeyDownNumeric(e)}
              className="input-duration"
              html={targetTweenDuration}
              data-placeholder="2500 ms"
            />
            { this.renderEasing('target')}
          </div>
        </div>

        <div className="config-manager-container">
          { configManager && configManager.render(opts) }
        </div>
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
  CameraTweenExtension.ExtensionId,
  CameraTweenExtension)

export default 'Viewing.Extension.CameraTween'








