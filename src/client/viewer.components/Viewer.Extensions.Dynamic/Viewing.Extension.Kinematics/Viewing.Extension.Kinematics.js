/////////////////////////////////////////////////////////
// Viewing.Extension.Kinematics
// by Philippe Leefsma, July 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import './Viewing.Extension.Kinematics.scss'
import WidgetContainer from 'WidgetContainer'
import EventTool from 'Viewer.EventTool'
import 'rc-tooltip/assets/bootstrap.css'
import ScriptLoader from 'ScriptLoader'
import ServiceManager from 'SvcManager'
import { ReactLoader } from 'Loader'
import Toolkit from 'Viewer.Toolkit'
import 'rc-slider/assets/index.css'
import ReactDOM from 'react-dom'
import Tooltip from 'rc-tooltip'
import Slider from 'rc-slider'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

const root = {
  children: [{
    centreInit: new THREE.Vector3(
      -1531.7778454323443,
      -3066.921560568636,
      103.18552620987555),
    axisInit: new THREE.Vector3(0, 1, 0),
    angle: 0,
    dbId: 12,
    children: [{
      centreInit: new THREE.Vector3(
        -275.46734299564633,
        -1282.0783844528128,
        695.3209230147719),
      axisInit: new THREE.Vector3(0, 0, -1),
      angle: 0,
      dbId: 13,
      children: [{
        centreInit: new THREE.Vector3(
          -274.28775776026066,
          2544.220316276206,
          354.98556647844083),
        axisInit: new THREE.Vector3(0, 0, -1),
        angle: 0,
        dbId: 9,
        children: [{
          centreInit: new THREE.Vector3(
            -966.5434561316943,
            3330.847986354103,
            79.66191503637081),
          axisInit: new THREE.Vector3(1, 0, 0),
          angle: 0,
          dbId: 14,
          children: [{
            centreInit: new THREE.Vector3(
              3217.6120336721715,
              3330.9245884187817,
              335.48933959375506),
            axisInit: new THREE.Vector3(0, 0, -1),
            angle: 0,
            dbId: 15,
            children: [{
              centreInit: new THREE.Vector3(
                3956.6543579385616,
                3330.6703223388813,
                79.81803179126203),
              axisInit: new THREE.Vector3(1, 0, 0),
              angle: 0,
              dbId: 16
            }]
          }]
        }]
      }]
    }]
  }]
}


class KinematicsExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onScriptLoaded = this.onScriptLoaded.bind(this)
    this.renderTitle = this.renderTitle.bind(this)

    this.eventTool = new EventTool(this.viewer)

    this.react = options.react

    this.p = []
    this.c = 0
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'kinematics'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Kinematics'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.viewer.setQualityLevel(false, false)
    this.viewer.setGroundReflection(true)
    this.viewer.setGroundShadow(true)

    this.react.setState({

      activateControls: false,
      physicsCore: null,
      showLoader: true

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    this.eventTool.on ('singleclick', (event) => {

      const hitTest = this.viewer.clientToWorld(
        event.canvasX, event.canvasY, true)

      if (hitTest) {

        console.log(hitTest)
      }
    })

    //this.eventTool.activate()

    console.log('Viewing.Extension.Kinematics loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getComponent (dbId, parent = root) {

    if (parent.children) {

      for (let component of parent.children) {

        if (component.dbId === dbId) {

          return component
        }

        const res = this.getComponent(dbId, component)

        if (res) {

          return res
        }
      }
    }

    return null
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Kinematics unloaded')

    this.react.popViewerPanel(this)

    super.unload ()

    return true
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
  onModelRootLoaded (event) {

    super.onModelRootLoaded()

    this.options.loader.show(false)

    const nav = this.viewer.navigation

    nav.toPerspective()

    this.viewer.autocam.setHomeViewFrom(
      nav.getCamera())
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelCompletedLoad (event) {

    this.react.setState({
      activateControls: true
    })

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onScriptLoaded () {

    const physicsCore =
      await this.viewer.loadDynamicExtension(
      'Viewing.Extension.Physics.Core',
      this.options)

    this.react.setState({
      showLoader: false,
      physicsCore
    })

    this.options.loader.show(false)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onSelection (event) {

    this.component = null

    if (event.selections.length) {

      const dbId =
        event.selections[0].dbIdArray[0]

      this.component = this.getComponent(dbId)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getNodeTransform (model, dbId) {

    const fragIds = Toolkit.getLeafFragIds(model, dbId)

    const fragProxy =
      this.viewer.impl.getFragmentProxy(
        model, fragIds[0])

    fragProxy.getAnimTransform()

    return {
      quaternion: fragProxy.quaternion.clone(),
      position: fragProxy.position.clone(),
      scale: fragProxy.scale.clone()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  rotatePoint (p, transform) {

    const matrix = new THREE.Matrix4()

    matrix.makeRotationAxis(
      transform.axis,
      transform.angle)

    const offset = new THREE.Vector3(
      p.x - transform.centre.x,
      p.y - transform.centre.y,
      p.z - transform.centre.z)

    offset.applyMatrix4(matrix)

    p.x = transform.centre.x + offset.x
    p.y = transform.centre.y + offset.y
    p.z = transform.centre.z + offset.z
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  rotateAxis (a, transform) {

    const matrix = new THREE.Matrix4()

    matrix.makeRotationAxis(
      transform.axis,
      transform.angle)

    a.applyMatrix4(matrix)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  rotateNode (model, dbId, transform,
              posRef = new THREE.Vector3,
              qRef = new THREE.Quaternion) {

    const quaternion = new THREE.Quaternion()

    quaternion.setFromAxisAngle(
      transform.axis,
      transform.angle)

    const fragIds = Toolkit.getLeafFragIds(model, dbId)

    fragIds.forEach((fragId) => {

      const fragProxy =
        this.viewer.impl.getFragmentProxy(
          model, fragId)

      fragProxy.getAnimTransform()

      fragProxy.quaternion.multiplyQuaternions(
        quaternion, qRef)

      const position = new THREE.Vector3(
        posRef.x - transform.centre.x,
        posRef.y - transform.centre.y,
        posRef.z - transform.centre.z)

      position.applyQuaternion(fragProxy.quaternion)

      position.add(transform.centre)

      fragProxy.position = position

      fragProxy.updateAnimTransform()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  rotateComponent (component, transforms) {

    transforms.forEach((transform) => {

      this.rotateNode (
        this.viewer.model,
        component.dbId,
        transform)

      //this.rotatePoint(
      //  component.centre,
      //  transform.axis,
      //  transform.angle,
      //  transform.centre)
      //
      //this.rotateAxis(
      //  component.axis,
      //  transform.axis,
      //  transform.angle)
    })


    if (component.children) {

      component.children.forEach((child) => {

        transforms.forEach((transform) => {

        })

        this.rotateComponent(
          child, [...transforms])
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSliderChanged (props, dbId) {

    const { value, dragging, offset } = props

    const component = this.getComponent(dbId)

    const angle = value * Math.PI / 180

    const centre =
      component.centre ||
      component.centreInit

    const axis =
      component.axis ||
      component.axisInit

    this.rotateComponent(component, [{
      centre,
      angle,
      axis
    }])

    component.angle = value

    this.viewer.impl.sceneUpdated(true)

    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        visible={dragging}
        overlay={value}
        placement="top">
        <Slider.Handle className="rc-slider-handle"
          offset={offset}/>
      </Tooltip>
    )
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
        <div className="kinematics-controls">
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
      physicsCore,
      showLoader
    } = this.react.getState()

    return (
      <div style={{overflow: 'scroll', height: '100%'}}>
        <ReactLoader show={showLoader}/>
        {
          activateControls &&
          <ScriptLoader onLoaded={this.onScriptLoaded}
            url={['/resources/libs/ammo/ammo.js']}
          />
        }
        {
          physicsCore &&
          <div className="controls">
            <div className="control-element">
              <label>
                Test:
              </label>

              <Slider
                handle={(props) => this.onSliderChanged(props, 16)}
                defaultValue={0.0}
                step={0.1}
                min={-180}
                max={180}
              />
              <br/>
              <Slider
                handle={(props) => this.onSliderChanged(props, 15)}
                defaultValue={0.0}
                step={0.1}
                min={-130}
                max={130}
              />
              <br/>
              <Slider
                handle={(props) => this.onSliderChanged(props, 14)}
                defaultValue={0.0}
                step={0.1}
                min={-180}
                max={180}
              />
              <br/>
              <Slider
                handle={(props) => this.onSliderChanged(props, 9)}
                defaultValue={0.0}
                step={0.1}
                min={-180}
                max={80}
              />
              <br/>
              <Slider
                handle={(props) => this.onSliderChanged(props, 13)}
                defaultValue={0.0}
                step={0.1}
                min={-90}
                max={90}
              />
              <br/>
              <Slider
                handle={(props) => this.onSliderChanged(props, 12)}
                defaultValue={0.0}
                step={0.1}
                min={-175}
                max={170}
              />
            </div>

          </div>
        }

      </div>
    )
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
        {this.renderControls()}
      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  KinematicsExtension.ExtensionId,
  KinematicsExtension)
