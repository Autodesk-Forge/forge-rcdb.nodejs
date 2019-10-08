/////////////////////////////////////////////////////////////////
// Camera Tween Viewer Extension
// By Philippe Leefsma, Autodesk Inc, October 2017
//
/////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import ContentEditable from 'react-contenteditable'
import WidgetContainer from 'WidgetContainer'
import './Viewing.Extension.CameraTween.scss'
import Tween from '@tweenjs/tween.js'
import Toolkit from 'Viewer.Toolkit'
import { ReactLoader } from 'Loader'
import React from 'react'
import Label from 'Label'

class CameraTweenExtension extends MultiModelExtensionBase {

  static EASINGS = [
    {
      id: Tween.Easing.Linear.None,
      name: 'Linear'
    },

    {
      id: Tween.Easing.Quadratic.In,
      name: 'Quadratic.In'
    },
    {
      id: Tween.Easing.Quadratic.Out,
      name: 'Quadratic.Out'
    },
    {
      id: Tween.Easing.Quadratic.InOut,
      name: 'Quadratic.InOut'
    },

    {
      id: Tween.Easing.Cubic.In,
      name: 'Cubic.In'
    },
    {
      id: Tween.Easing.Cubic.Out,
      name: 'Cubic.Out'
    },
    {
      id: Tween.Easing.Cubic.InOut,
      name: 'Cubic.InOut'
    },


    {
      id: Tween.Easing.Quartic.In,
      name: 'Quartic.In'
    },
    {
      id: Tween.Easing.Quartic.Out,
      name: 'Quartic.Out'
    },
    {
      id: Tween.Easing.Quartic.InOut,
      name: 'Quartic.InOut'
    },

    {
      id: Tween.Easing.Quintic.In,
      name: 'Quintic.In'
    },
    {
      id: Tween.Easing.Quintic.Out,
      name: 'Quintic.Out'
    },
    {
      id: Tween.Easing.Quintic.InOut,
      name: 'Quintic.InOut'
    },

    {
      id: Tween.Easing.Exponential.In,
      name: 'Exponential.In'
    },
    {
      id: Tween.Easing.Exponential.Out,
      name: 'Exponential.Out'
    },
    {
      id: Tween.Easing.Exponential.InOut,
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

    this.loadConfigManager()

    this.navigation = this.viewer.navigation

    this.camera = this.navigation.getCamera()

    console.log('Viewing.Extension.CameraTween loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadConfigManager () {

    this.react.setState({

      targetTweenDuration: 2500,
        posTweenDuration: 2500,
        upTweenDuration: 2500,

        targetTweenEasing: {
          id: Tween.Easing.Linear.None,
          name: 'Linear'
        },
        posTweenEasing: {
          id: Tween.Easing.Linear.None,
          name: 'Linear'
        },
        upTweenEasing: {
          id: Tween.Easing.Linear.None,
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
        },
        // setState: (configMngState) => {
        //   return this.react.setState({
        //     configMngState
        //   })
        // },
        // getState: () => {
        //   const {configMngState} = this.react.getState()
        //   return configMngState || {}
        // }
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

      await this.react.setState({
        showLoader: false,
        configManager
      })

      await this.react.pushRenderExtension(this)
    })
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

      new Tween.Tween(params.object)
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
  tweenCameraTo (state, immediate) {

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
      duration: immediate ? 0 : targetTweenDuration,
      object: target,
      to: targetEnd
    })

    const posTween = this.createTween({
      easing: posTweenEasing.id,
      onUpdate: (v) => {
        nav.setPosition(v)
      },
      duration: immediate ? 0 : posTweenDuration,
      object: pos,
      to: posEnd
    })

    const upTween = this.createTween({
      easing: upTweenEasing.id,
      onUpdate: (v) => {
        nav.setCameraUpVector(v)
      },
      duration: immediate ? 0 : upTweenDuration,
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

      Tween.update()
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
  restoreState (viewerState, immediate) {

    if (viewerState.cameraTween) {

      this.tweenCameraTo(
        viewerState.cameraTween,
        immediate)
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
              html={upTweenDuration+''}
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
              html={posTweenDuration+''}
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
              html={targetTweenDuration+''}
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
