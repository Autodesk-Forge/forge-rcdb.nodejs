/////////////////////////////////////////////////////////
// Viewing.Extension.ModelTransformer
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import ContentEditable from 'react-contenteditable'
import './Viewing.Extension.ModelTransformer.scss'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import Toolkit from 'Viewer.Toolkit'
import Tooltip from 'Viewer.Tooltip'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

class ModelTransformerExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onDeactivate = this.onDeactivate.bind(this)
    this.onSelection = this.onSelection.bind(this)
    this.renderTitle = this.renderTitle.bind(this)
    this.onTransform = this.onTransform.bind(this)

    this.tooltip = new Tooltip(viewer, {
      stroke: '#00FF00',
      fill: '#00FF00'
    })

    this.tooltip.setContent(`
      <div id="pickTooltipId" class="pick-tooltip">
        <b>Pick position ...</b>
      </div>`,
      '#pickTooltipId')

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'model-transformer'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ModelTransformer'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    const fullTransform = !!this.options.fullTransform

    this.react.setState({

      Tx:'', Ty:'', Tz:'',
      Rx:'', Ry:'', Rz:'',
      Sx:'', Sy:'', Sz:'',

      translate: false,
      selection: null,
      fullTransform,
      rotate: false,
      model: null

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.Transform', {
        hideControls: true
      }).then((transformExtension) => {

        transformExtension.setFullTransform (
          fullTransform)

        transformExtension.on(
          'transform',
          this.onTransform)

        transformExtension.on(
          'deactivate',
          this.onDeactivate)

        this.react.setState({
          transformExtension
        })
      })

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.viewerEvent(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT
    ).then((args) => this.onModelRootLoaded(args))

    console.log(
      'Viewing.Extension.ModelTransformer loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    this.viewer.unloadExtension(
      'Viewing.Extension.Transform')

    this.viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.react.popViewerPanel(this)

    console.log(
      'Viewing.Extension.ModelTransformer unloaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded (args) {

    this.setModel(args[0].model)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setModel (model) {

    const {fullTransform} = this.react.getState()

    model.transform = model.transform || {
      translation: {
        x: 0.0, y: 0.0, z: 0.0
      },
      rotation: {
        x: 0.0, y: 0.0, z: 0.0
      },
      scale: {
        x: 1.0, y: 1.0, z: 1.0
      }
    }

    this.tooltip.deactivate()

    this.react.setState({
      model
    })

    if (fullTransform) {

      this.setTransformState(
        model.transform)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  clearModel () {

    this.tooltip.deactivate()

    return this.react.setState({

      Tx:'', Ty:'', Tz:'',
      Rx:'', Ry:'', Rz:'',
      Sx:'', Sy:'', Sz:'',

      translate: false,
      selection: null,
      rotate: false,
      model: null
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setTransformState (transform) {

    this.react.setState({

      Tx: transform.translation.x,
      Ty: transform.translation.y,
      Tz: transform.translation.z,

      Rx: transform.rotation.x * 180/Math.PI,
      Ry: transform.rotation.y * 180/Math.PI,
      Rz: transform.rotation.z * 180/Math.PI,

      Sx: transform.scale.x,
      Sy: transform.scale.y,
      Sz: transform.scale.z
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  clearTransformState () {

    this.react.setState({

      Tx:'', Ty:'', Tz:'',
      Rx:'', Ry:'', Rz:'',
      Sx:'', Sy:'', Sz:''
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onTransform (data) {

    const {fullTransform} = this.react.getState()

    if (fullTransform) {

      data.model.transform = Object.assign(
        data.model.transform,
        data.transform)

      this.setModel(data.model)

    } else {

      const transform = this.getFragmentTransform (
        data.fragIds[0])

      this.setTransformState (transform)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onDeactivate () {

    this.react.setState({
      translate: false,
      rotate: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getFragmentTransform (fragId) {

    const {model} = this.react.getState()

    const fragProxy =
      this.viewer.impl.getFragmentProxy(
        model, fragId)

    fragProxy.getAnimTransform()

    const quaternion = new THREE.Quaternion(
      fragProxy.quaternion._x,
      fragProxy.quaternion._y,
      fragProxy.quaternion._z,
      fragProxy.quaternion._w)

    const euler = new THREE.Euler()

    euler.setFromQuaternion(quaternion, 'XYZ')

    return {
      translation: {
        x: fragProxy.position.x,
        y: fragProxy.position.y,
        z: fragProxy.position.z
      },
      rotation: {
        x: euler.x,
        y: euler.y,
        z: euler.z
      },
      scale:{
        x: fragProxy.scale.x,
        y: fragProxy.scale.y,
        z: fragProxy.scale.z
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelection (event) {

    const {fullTransform} = this.react.getState()

    const selection = event.selections.length
      ? event.selections[0]
      : null

    this.react.setState({
      selection
    })

    if (!fullTransform) {

      if (selection) {

        const transform = this.getFragmentTransform (
          selection.fragIdsArray[0])

        this.setTransformState (transform)

      } else {

        this.clearTransformState ()
      }
    }
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
  onInputChanged (e, key) {

    const state = this.react.getState()

    const value = parseFloat(e.target.value)

    state[key] = isNaN(value) ? 0 : value

    const transform = this.getTransform()

    switch (key) {

      case 'Tx':
        transform.translation.x = state[key]
        break
      case 'Ty':
        transform.translation.y = state[key]
        break
      case 'Tz':
        transform.translation.z = state[key]
        break

      case 'Rx':
        transform.rotation.x = state[key] * Math.PI/180
        break
      case 'Ry':
        transform.rotation.y = state[key] * Math.PI/180
        break
      case 'Rz':
        transform.rotation.z = state[key] * Math.PI/180
        break

      case 'Sx':
        transform.scale.x = state[key]
        transform.scale.y = state[key]
        transform.scale.z = state[key]
        state.Sx = state[key]
        state.Sy = state[key]
        state.Sz = state[key]
        break
      case 'Sy':
        transform.scale.y = state[key]
        break
      case 'Sz':
        transform.scale.z = state[key]
        break
    }

    this.react.setState(state)

    this.applyTransform (transform)

    state.transformExtension.clearSelection()

    this.viewer.impl.sceneUpdated(true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getTransform () {

    const {fullTransform, model, selection} =
      this.react.getState()

    const fragId = selection.fragIdsArray[0]

    return !fullTransform
      ? this.getFragmentTransform(fragId)
      : model.transform
  }

  /////////////////////////////////////////////////////////
  // Applies transform to specific model
  //
  /////////////////////////////////////////////////////////
  applyTransform (transform, offset = {
      scale: {
        x: 0.0, y: 0.0, z: 0.0
      },
      translation: {
        x: 0.0, y: 0.0, z: 0.0
      },
      rotation: {
        x: 0.0, y: 0.0, z: 0.0
      }
    }) {

    const {fullTransform, model, selection} =
      this.react.getState()

    const euler = new THREE.Euler(
      (transform.rotation.x + offset.rotation.x),
      (transform.rotation.y + offset.rotation.y),
      (transform.rotation.z + offset.rotation.z),
      'XYZ')

    const quaternion = new THREE.Quaternion()

    quaternion.setFromEuler(euler)

    const fragTransform = {
      position: transform.translation,
      scale: transform.scale,
      quaternion
    }

    if (fullTransform) {

      const fragCount = model.getFragmentList().
        fragments.fragId2dbId.length

      //fragIds range from 0 to fragCount-1
      for (var fragId = 0; fragId < fragCount; ++fragId) {

        this.transformFragProxy(
          model, fragId, fragTransform)
      }

    } else {

      selection.fragIdsArray.forEach((fragId) => {

        this.transformFragProxy(
          model, fragId, fragTransform)
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  transformFragProxy (model, fragId, transform) {

    let fragProxy =
      this.viewer.impl.getFragmentProxy(
        model, fragId)

    fragProxy.getAnimTransform()

    if (transform.position) {

      fragProxy.position = transform.position
    }

    if (transform.scale) {

      fragProxy.scale = transform.scale
    }

    if (transform.quaternion) {

      //Not a standard three.js quaternion
      fragProxy.quaternion._x = transform.quaternion.x
      fragProxy.quaternion._y = transform.quaternion.y
      fragProxy.quaternion._z = transform.quaternion.z
      fragProxy.quaternion._w = transform.quaternion.w
    }

    fragProxy.updateAnimTransform()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  translate () {

    const {transformExtension} = this.react.getState()

    transformExtension.translate()

    this.react.setState({
      translate: true,
      rotate: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  rotate () {

    const {transformExtension} = this.react.getState()

    transformExtension.rotate()

    this.react.setState({
      translate: false,
      rotate: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  pickPosition () {

    const {transformExtension} = this.react.getState()

    transformExtension.pickPosition()

    this.tooltip.activate()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = ModelTransformerExtension.ExtensionId

    if (docked) {

      await this.react.popRenderExtension(id)

      await this.react.pushViewerPanel(this, {
        height: 250,
        width: 300
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
  renderTitle (docked) {

    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className="title">
        <label>
          Model Transformer
        </label>
        <div className="model-transformer-controls">
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
  renderControls () {

    const state = this.react.getState()

    const {model, selection} = state

    const disabled = state.fullTransform
      ? !model
      : !selection

    return (
      <div className="controls">

        <div className="row">

          <Label text={'Translation:'}/>

          <ContentEditable
            html={state.Tx.toFixed ? state.Tx.toFixed(2) : ''}
            onChange={(e) => this.onInputChanged(e, 'Tx')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-trans"
            data-placeholder="x"
            disabled={disabled}
          />

          <ContentEditable
            html={state.Ty.toFixed ? state.Ty.toFixed(2) : ''}
            onChange={(e) => this.onInputChanged(e, 'Ty')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-trans"
            data-placeholder="y"
            disabled={disabled}
          />

          <ContentEditable
            html={state.Tz.toFixed ? state.Tz.toFixed(2) : ''}
            onChange={(e) => this.onInputChanged(e, 'Tz')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-trans"
            data-placeholder="z"
            disabled={disabled}
          />

          <button className={state.translate ? 'active':''}
            onClick={() => this.translate()}
            disabled={!model}
            title="Translate">
            <span className="fa fa-arrows-alt"/>
          </button>

        </div>

        <div className="row">

          <Label text={'Rotation:'}/>

          <ContentEditable
            html={state.Rx.toFixed ? state.Rx.toFixed(2) : ''}
            onChange={(e) => this.onInputChanged(e, 'Rx')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-rot"
            data-placeholder="rx"
            disabled={disabled}
          />

          <ContentEditable
            html={state.Ry.toFixed ? state.Ry.toFixed(2) : ''}
            onChange={(e) => this.onInputChanged(e, 'Ry')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-rot"
            data-placeholder="ry"
            disabled={disabled}
          />

          <ContentEditable
            html={state.Rz.toFixed ? state.Rz.toFixed(2) : ''}
            onChange={(e) => this.onInputChanged(e, 'Rz')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-rot"
            data-placeholder="rz"
          />

          <button className={state.rotate ? 'active':''}
            onClick={() => this.rotate()}
            disabled={!model}
            title="Rotate">
            <span className="fa fa-refresh"/>
          </button>

        </div>

        <div className="row">

          <Label text={'Scale:'}/>

          <ContentEditable
            html={state.Sx.toFixed ? state.Sx.toFixed(2) : ''}
            onChange={(e) => this.onInputChanged(e, 'Sx')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-scale"
            data-placeholder="sx"
            disabled={disabled}
          />

          <ContentEditable
            html={state.Sy.toFixed ? state.Sy.toFixed(2) : ''}
            onChange={(e) => this.onInputChanged(e, 'Sy')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-scale"
            data-placeholder="sy"
            disabled={disabled}
          />

          <ContentEditable
            html={state.Sz.toFixed ? state.Sz.toFixed(2) : ''}
            onChange={(e) => this.onInputChanged(e, 'Sz')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="input-scale"
            data-placeholder="sz"
            disabled={disabled}
          />

          <button onClick={() => this.pickPosition() }
            disabled={!(state.translate && selection)}
            title="Pick position">
            <span className="fa fa-times"/>
          </button>

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

        { this.renderControls() }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ModelTransformerExtension.ExtensionId,
  ModelTransformerExtension)
