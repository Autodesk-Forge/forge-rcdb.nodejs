/////////////////////////////////////////////////////////
// Viewing.Extension.Physics
// by Philippe Leefsma, July 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import PhysicsCoreExtensionId from './Viewing.Extension.Physics.Core'
import WidgetContainer from 'WidgetContainer'
import './Viewing.Extension.Physics.scss'
import ScriptLoader from 'ScriptLoader'
import ServiceManager from 'SvcManager'
import { ReactLoader } from 'Loader'
import Toolkit from 'Viewer.Toolkit'
import ReactDOM from 'react-dom'
import FPS from './FPSMeter'
import Label from 'Label'
import React from 'react'

class PhysicsExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onScriptLoaded = this.onScriptLoaded.bind(this)

    this.renderTitle = this.renderTitle.bind(this)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'physics'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Physics'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.viewer.setQualityLevel(false, false)
    this.viewer.setProgressiveRendering(false)
    this.viewer.setGroundReflection(false)
    this.viewer.setGroundShadow(false)

    this.react.setState({

      activateControls: false,
      modelTransformer: null,
      showLoader: true

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.Physics loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Physics unloaded')

    this.react.popViewerPanel(this)

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  // Panel docking mode
  //
  /////////////////////////////////////////////////////////
  createFPS () {

    $(this.viewer.container).append(
      '<div id="physics-fps"> </div>')

    $('#physics-fps').css({
      position: 'absolute',
      left: '10px',
      top: '90px'
    })

    return new FPSMeter(
      document.getElementById('physics-fps'), {
        maxFps:    20, //expected
        smoothing: 10,
        show: 'fps',
        decimals: 1,
        left: '0px',
        top: '-80px',
        theme: 'transparent',
        heat: 1,
        graph: 1,
        toggleOn: null,
        history: 32
      })
  }

  /////////////////////////////////////////////////////////
  // Panel docking mode
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = PhysicsExtension.ExtensionId

    if (docked) {

      await this.react.popRenderExtension(id)

      await this.react.pushViewerPanel(this, {
        height: 250,
        width: 350
      })

    } else {

      await this.react.popViewerPanel(id)

      this.react.pushRenderExtension(this)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onScriptLoaded () {

    this.physicsCore =
      await this.viewer.loadExtension(
        PhysicsCoreExtensionId, {
          fps: this.fps
        })

    await this.physicsCore.loadPhysicModel(
      this.viewer.model)

    this.react.setState({
      showLoader: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded (event) {

    super.onModelRootLoaded()

    this.options.loader.show(false)

    this.viewer.navigation.toPerspective()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onModelCompletedLoad (event) {

    const transformerReactOptions = {
      pushRenderExtension: () => {
        return Promise.resolve()
      },
      popRenderExtension: () => {
        return Promise.resolve()
      }
    }

    const transformerOptions = Object.assign({}, {
      react: transformerReactOptions,
      fullTransform : false,
      hideControls : true
    })

    const modelTransformer =
      await this.viewer.loadDynamicExtension(
        'Viewing.Extension.ModelTransformer',
        transformerOptions)

    modelTransformer.setModel(this.viewer.model)

    this.react.setState({
      activateControls: true,
      modelTransformer
    })

    this.fps = this.createFPS()
  }

  /////////////////////////////////////////////////////////
  // React method - render panel title
  //
  /////////////////////////////////////////////////////////
  renderTitle (docked) {

    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className="title">
        <label>
          Physics
        </label>
        <div className="physics-controls">
          <button onClick={() => this.setDocking(docked)}
            title="Toggle docking mode">
            <span className={spanClass}/>
          </button>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  // React method - render panel controls
  //
  /////////////////////////////////////////////////////////
  renderControls () {

    const {
      activateControls,
      showLoader
    } = this.react.getState()

    return (
      <div>
        <ReactLoader show={showLoader}/>
        {
          activateControls &&
          <ScriptLoader onLoaded={this.onScriptLoaded}
            url={['/resources/libs/ammo/ammo.js']}
          />
        }
        <button onClick={()=> this.physicsCore.toggeAnimation()}/>
        <button onClick={()=> this.physicsCore.reset()}/>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  // React method - render transformer extension UI
  //
  /////////////////////////////////////////////////////////
  renderTransformer () {

    const {modelTransformer} = this.react.getState()

    return modelTransformer
      ? modelTransformer.render({showTitle: false})
      : false
  }

  /////////////////////////////////////////////////////////
  // React method - render extension UI
  //
  /////////////////////////////////////////////////////////
  render (opts) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>
        { this.renderControls() }
        { this.renderTransformer() }
      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  PhysicsExtension.ExtensionId,
  PhysicsExtension)
