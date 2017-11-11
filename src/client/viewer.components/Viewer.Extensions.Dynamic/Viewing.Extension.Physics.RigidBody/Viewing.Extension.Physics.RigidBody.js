/////////////////////////////////////////////////////////
// Viewing.Extension.Physics
// by Philippe Leefsma, July 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import ContentEditable from 'react-contenteditable'
import './Viewing.Extension.Physics.RigidBody.scss'
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
import FPS from './FPSMeter'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

class PhysicsExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onTransformSelection = this.onTransformSelection.bind(this)
    this.onSimulationStep = this.onSimulationStep.bind(this)
    this.onEnablePhysics = this.onEnablePhysics.bind(this)
    this.onScriptLoaded = this.onScriptLoaded.bind(this)
    this.renderTitle = this.renderTitle.bind(this)
    this.onTransform = this.onTransform.bind(this)
    this.onReset = this.onReset.bind(this)

    this.projectileMaterial = this.createMaterial()

    this.eventTool = new EventTool(this.viewer)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'physics-rigid'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Physics.RigidBody'
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
      unSelectedBody: null,
      selectedBody: null,
      physicsCore: null,
      showLoader: true,
      transform: null,

      Vx:'', Vy:'', Vz:'',
      Ax:'', Ay:'', Az:''

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    this.eventTool.on ('mousemove', (event) => {

      this.mouseEvent = event
    })

    this.eventTool.on ('keydown', (event) => {

      if (event.keyCode === 32) { //SPACE

        const pointer = this.mouseEvent.pointers
          ? this.mouseEvent.pointers[0]
          : this.mouseEvent

        const rayCaster = this.pointerToRaycaster(
          this.viewer.impl.canvas,
          this.viewer.impl.camera,
          pointer)

        this.createProjectile (rayCaster.ray)
      }
    })

    console.log('Viewing.Extension.Physics.RigidBody loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createMaterial (color = 0xFF9800) {

    const material = new THREE.MeshPhongMaterial({
      color
    })

    this.viewer.impl.matman().addMaterial(
      this.guid(), material, true)

    return material
  }

  /////////////////////////////////////////////////////////
  // Creates Raycatser object from the pointer
  //
  /////////////////////////////////////////////////////////
  pointerToRaycaster (domElement, camera, pointer) {

    const pointerVector = new THREE.Vector3()
    const pointerDir = new THREE.Vector3()
    const ray = new THREE.Raycaster()

    const rect = domElement.getBoundingClientRect()

    const px = pointer.clientX
    const py = pointer.clientY

    const x = ((px - rect.left) / rect.width) * 2 - 1
    const y = -((py - rect.top) / rect.height) * 2 + 1

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
  //
  //
  /////////////////////////////////////////////////////////
  createProjectile (ray) {

    const { physicsCore } = this.react.getState()

    const radius = 8
    const mass = 0.25

    const geometry = new THREE.SphereGeometry(
      radius, 18, 16)

    geometry.computeFaceNormals()

    const mesh = new THREE.Mesh(
      geometry, this.projectileMaterial)

    mesh.position.copy(ray.origin)
    mesh.receiveShadow = true
    mesh.castShadow = true

    const shape = new Ammo.btSphereShape(radius)

    //shape.setMargin(0.05)

    const inertia = new Ammo.btVector3(0, 0, 0)

    shape.calculateLocalInertia(mass, inertia)

    const transform = new Ammo.btTransform

    transform.setIdentity()

    transform.setOrigin(
      new Ammo.btVector3(
        ray.origin.x,
        ray.origin.y,
        ray.origin.z))

    const motionState =
      new Ammo.btDefaultMotionState(
        transform)

    const rbInfo =
      new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        shape,
        inertia)

    const body = new Ammo.btRigidBody(rbInfo)

    body.setLinearVelocity(
      new Ammo.btVector3(
        ray.direction.x * 200,
        ray.direction.y * 200,
        ray.direction.z * 200))

    body.setFriction(0.8)

    body.type = 'MESH'

    body.mesh = mesh

    physicsCore.addRigidBody(body)

    this.viewer.impl.scene.add(mesh)
    this.viewer.impl.sceneUpdated(true)
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Physics.RigidBody unloaded')

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

    const physicsCore =
      await this.viewer.loadDynamicExtension(
      'Viewing.Extension.Physics.Core',
        this.options)

    await physicsCore.loadPhysicModel(
      this.viewer.model)

    physicsCore.on('simulation.step',
      this.onSimulationStep)

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
  onModelRootLoaded (event) {

    super.onModelRootLoaded()

    const nav = this.viewer.navigation

    nav.toPerspective()

    this.viewer.autocam.setHomeViewFrom(
      nav.getCamera())
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

    this.bounds =
      await Toolkit.getWorldBoundingBox(
        this.viewer.model)

    this.react.setState({
      activateControls: true,
      modelTransformer
    })

    this.fps = this.createFPS()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onExtensionLoaded (event) {

    const transformExtensionId =
      'Viewing.Extension.Transform'

    if (event.extensionId === transformExtensionId) {

      const transform = this.viewer.getExtension(
        transformExtensionId)

      transform.on('selection',
        this.onTransformSelection)

      transform.on('transform',
        this.onTransform)

      this.react.setState({
        transform
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onTransformSelection () {

    const { physicsCore, selectedBody, unSelectedBody } =
      this.react.getState()

    if (selectedBody) {

      physicsCore.groundRigidBody(
        selectedBody, true)

      selectedBody.setActivationState(4)
    }

    if (unSelectedBody) {

      physicsCore.groundRigidBody(
        unSelectedBody, false)

      unSelectedBody.setActivationState(4)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onTransform (data) {

    const { physicsCore, selectedBody } =
      this.react.getState()

    const transform =
      physicsCore.getFragmentTransform(
        data.fragIds[0])

    physicsCore.setRigidBodyTransform(
      selectedBody, transform)

    physicsCore.activateAllRigidBodies()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setSelectedBody (body) {

    const { physicsCore, selectedBody } =
      this.react.getState()

    if (!body) {

      return this.react.setState({

        Ax: '', Ay: '', Az: '',
        Vx: '', Vy: '', Vz: '',

        unSelectedBody: selectedBody,
        selectedBody: null
      })
    }

    const velocity = physicsCore.getRigidBodyVelocity(body)

    this.react.setState({

      Ax: this.toFixedStr(velocity.angular.x * 180/Math.PI),
      Ay: this.toFixedStr(velocity.angular.y * 180/Math.PI),
      Az: this.toFixedStr(velocity.angular.z * 180/Math.PI),

      Vx: this.toFixedStr(velocity.linear.x),
      Vy: this.toFixedStr(velocity.linear.y),
      Vz: this.toFixedStr(velocity.linear.z),

      unSelectedBody: selectedBody,
      selectedBody: body
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelection (event) {

    const { physicsCore } = this.react.getState()

    if (!event.selections.length) {

      return this.setSelectedBody(null)
    }

    const selection = event.selections[0]

    const body = physicsCore.getRigidBody(
      selection.dbIdArray[0])

    this.setSelectedBody(body)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onEnablePhysics (run) {

    const { physicsCore } = this.react.getState()

    physicsCore.runAnimation(run)

    run
      ? this.eventTool.activate()
      : this.eventTool.deactivate()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onReset () {

    const { physicsCore, selectedBody} =
      this.react.getState()

    physicsCore.reset ()

    this.setSelectedBody(
      selectedBody)

    const nav = this.viewer.navigation

    nav.fitBounds(true, this.bounds)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSimulationStep () {

    const { modelTransformer, selectedBody } =
      this.react.getState()

    if (selectedBody) {

      this.setSelectedBody(
        selectedBody)

      const transform =
        modelTransformer.getFragmentTransform (
          selectedBody.initialState.fragIds[0])

      modelTransformer.setTransformState (transform)
    }

    this.fps.tick()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onGravitySliderChanged (props) {

    const { value, dragging, offset } = props

    const { physicsCore } = this.react.getState()

    physicsCore.setGravity(value)

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
  //
  //
  /////////////////////////////////////////////////////////
  onTimeSkewSliderChanged (props) {

    const { value, dragging, offset } = props

    const { physicsCore } = this.react.getState()

    physicsCore.setTimeSkew(value/500)

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
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDownNumeric (e) {

    //backspace, ENTER, ->, <-, delete, '.', '-', ',',
    const allowed = [8, 13, 37, 39, 46, 188, 189, 190]

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
  toFloat (value) {

    const floatValue = parseFloat(value)

    return isNaN(floatValue) ? 0 : floatValue
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  toFixedStr (float, digits = 2) {

    return float.toFixed(digits).toString()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setVelocityByKey (key, value, velocity) {

    switch (key) {

      case 'Vx':
        velocity.linear.x = this.toFloat(value)
        break
      case 'Vy':
        velocity.linear.y = this.toFloat(value)
        break
      case 'Vz':
        velocity.linear.z = this.toFloat(value)
        break

      case 'Ax':
        velocity.angular.x =
          this.toFloat(value) * Math.PI/180
        break
      case 'Ay':
        velocity.angular.y =
          this.toFloat(value) * Math.PI/180
        break
      case 'Az':
        velocity.angular.z =
          this.toFloat(value) * Math.PI/180
        break
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInputChanged (e, key) {

    const state = this.react.getState()

    const value = e.target.value

    state[key] = value

    const velocity =
      state.physicsCore.getRigidBodyVelocity(
        state.selectedBody)

    this.setVelocityByKey(
      key, value, velocity)

    state.physicsCore.setRigidBodyVelocity(
      state.selectedBody,
      velocity)

    this.react.setState(state)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  clearVelocity (keys) {

    const state = this.react.getState()

    const velocity =
      state.physicsCore.getRigidBodyVelocity(
        state.selectedBody)

    keys.forEach((key) => {

      state[key] = this.toFixedStr(0)

      this.setVelocityByKey(
        key, 0.0, velocity)
    })

    state.physicsCore.setRigidBodyVelocity(
      state.selectedBody,
      velocity)

    this.react.setState(state)
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
  //
  //
  /////////////////////////////////////////////////////////
  renderVelocity () {

    const state = this.react.getState()

    const disabled = !state.selectedBody

    return (
      <div className="velocity">

        <div className="row">

          <Label text={'Angular:'}/>

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Ax')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-vel"
            data-placeholder="Ax"
            disabled={disabled}
            html={state.Ax}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Ay')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-vel"
            data-placeholder="Ay"
            disabled={disabled}
            html={state.Ay}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Az')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-vel"
            data-placeholder="Az"
            html={state.Az}
          />

          <button className={state.rotate ? 'active':''}
            onClick={() => this.clearVelocity(['Ax','Ay','Az'])}
            disabled={disabled}
            title="Clear">
            <span className="fa fa-times"/>
          </button>

        </div>

        <div className="row">

          <Label text={'Linear:'}/>

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Vx')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-vel"
            data-placeholder="Vx"
            disabled={disabled}
            html={state.Vx}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Vy')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-vel"
            data-placeholder="Vy"
            disabled={disabled}
            html={state.Vy}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Vz')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-vel"
            data-placeholder="Vz"
            disabled={disabled}
            html={state.Vz}
          />

          <button className={state.translate ? 'active':''}
            onClick={() => this.clearVelocity(['Vx','Vy','Vz'])}
            disabled={disabled}
            title="Clear">
            <span className="fa fa-times"/>
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
                Simulation controls:
              </label>
              <div>
                <Switch
                  onChange={this.onEnablePhysics}
                  checked={false}
                />
                <label>
                  Run
                </label>
                <button className="reset"
                  onClick={this.onReset}>
                  <span className="fa fa-refresh"/>
                  <label>
                    Reset
                  </label>
                </button>
              </div>
            </div>

            <br/><hr/>

            <div className="control-element">
              <label>
                Gravity:
              </label>

              <Slider
                handle={(props) => this.onGravitySliderChanged(props)}
                defaultValue={physicsCore.gravity}
                step={0.01}
                min={-9.8}
                max={0.0}
              />
            </div>

            <br/><hr/>

            <div className="control-element">
              <label>
                Time Skew: <br/> (Runs simulation slower > faster)
              </label>

              <Slider
                handle={(props) => this.onTimeSkewSliderChanged(props)}
                defaultValue={physicsCore.timeSkew * 500}
                max={1000}
                step={1}
                min={1}
              />
            </div>

            <br/><hr/>

            <div className="control-element">

              <label>
                Component velocity:
              </label>

              { this.renderVelocity() }
            </div>

            <br/><hr/>

            <div className="control-element" style={{height:'120px'}}>

              <label>
                Component transform:
              </label>

              { this.renderTransformer() }
            </div>

          </div>
        }

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
        {this.renderControls()}
      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  PhysicsExtension.ExtensionId,
  PhysicsExtension)
