/// //////////////////////////////////////////////////////
// Viewing.Extension.ModelTransformer
// by Philippe Leefsma, April 2017
//
/// //////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import ContentEditable from 'react-contenteditable'
import './Viewing.Extension.ModelTransformer.scss'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import Toolkit from 'Viewer.Toolkit'
import Tooltip from 'Viewer.Tooltip'
import ReactDOM from 'react-dom'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

class ModelTransformerExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.onDeactivate = this.onDeactivate.bind(this)

    this.renderTitle = this.renderTitle.bind(this)

    this.onTransform = this.onTransform.bind(this)

    this.onTransformSelection =
      this.onTransformSelection.bind(this)

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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  get className () {
    return 'model-transformer'
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.ModelTransformer'
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    const fullTransform = !!this.options.fullTransform

    this.react.setState({

      Tx: '',
      Ty: '',
      Tz: '',
      Rx: '',
      Ry: '',
      Rz: '',
      Sx: '',
      Sy: '',
      Sz: '',

      translate: false,
      selection: null,
      fullTransform,
      rotate: false,
      pick: false,
      model: null

    }).then(() => {
      this.react.pushRenderExtension(this)
    })

    const options = Object.assign({}, {
      hideControls: true
    }, this.options)

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.Transform',
      options).then((transformExtension) => {
      transformExtension.setFullTransform(
        fullTransform)

      transformExtension.on(
        'selection',
        this.onTransformSelection)

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

    console.log(
      'Viewing.Extension.ModelTransformer loaded')

    return true
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log(
      'Viewing.Extension.ModelTransformer unloaded')

    const { transformExtension } = this.react.getState()

    transformExtension.off()

    this.viewer.unloadExtension(
      'Viewing.Extension.Transform')

    this.react.popViewerPanel(this)

    super.unload()

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onModelRootLoaded (event) {
    this.setModel(event.model)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onModelActivated (event) {
    this.setModel(event.model)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onModelUnloaded (event) {
    if (!this.models.length) {
      this.clearModel()
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setModel (model) {
    const { fullTransform } = this.react.getState()

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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  clearModel () {
    this.tooltip.deactivate()

    return this.react.setState({

      Tx: '',
      Ty: '',
      Tz: '',
      Rx: '',
      Ry: '',
      Rz: '',
      Sx: '',
      Sy: '',
      Sz: '',

      translate: false,
      selection: null,
      rotate: false,
      model: null
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  toFixedStr (float, digits = 2) {
    return float.toFixed(digits).toString()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setTransformState (transform) {
    this.react.setState({

      Tx: this.toFixedStr(transform.translation.x),
      Ty: this.toFixedStr(transform.translation.y),
      Tz: this.toFixedStr(transform.translation.z),

      Rx: this.toFixedStr(transform.rotation.x * 180 / Math.PI),
      Ry: this.toFixedStr(transform.rotation.y * 180 / Math.PI),
      Rz: this.toFixedStr(transform.rotation.z * 180 / Math.PI),

      Sx: this.toFixedStr(transform.scale.x),
      Sy: this.toFixedStr(transform.scale.y),
      Sz: this.toFixedStr(transform.scale.z)
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  clearTransformState () {
    this.react.setState({

      Tx: '',
      Ty: '',
      Tz: '',
      Rx: '',
      Ry: '',
      Rz: '',
      Sx: '',
      Sy: '',
      Sz: ''
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onTransform (data) {
    const { fullTransform, pick } = this.react.getState()

    if (pick) {
      this.tooltip.deactivate()

      await this.react.setState({
        pick: false
      })
    }

    if (fullTransform) {
      data.model.transform = Object.assign(
        data.model.transform,
        data.transform)

      this.setModel(data.model)
    } else {
      const transform = this.getFragmentTransform(
        data.fragIds[0])

      this.setTransformState(transform)
    }

    this.emit('transform', data)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onDeactivate () {
    this.tooltip.deactivate()

    this.react.setState({
      translate: false,
      rotate: false,
      pick: false
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getFragmentTransform (fragId) {
    const { model } = this.react.getState()

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
      scale: {
        x: fragProxy.scale.x,
        y: fragProxy.scale.y,
        z: fragProxy.scale.z
      }
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onSelection (event) {
    const { fullTransform } = this.react.getState()

    const selection = event.selections.length
      ? event.selections[0]
      : null

    this.react.setState({
      selection
    })

    if (!fullTransform) {
      if (selection) {
        const transform = this.getFragmentTransform(
          selection.fragIdsArray[0])

        this.setTransformState(transform)
      } else {
        this.clearTransformState()
      }
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onTransformSelection (transformSelection) {
    this.react.setState({
      transformSelection
    })

    this.emit('transformSelection', transformSelection)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onKeyDownNumeric (e) {
    // backspace, ENTER, ->, <-, delete, '.', '-', ',',
    const allowed = [8, 13, 37, 39, 46, 188, 189, 190]

    if (allowed.indexOf(e.keyCode) > -1 ||
      (e.keyCode > 47 && e.keyCode < 58)) {
      return
    }

    e.stopPropagation()
    e.preventDefault()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  toFloat (value) {
    const floatValue = parseFloat(value)

    return isNaN(floatValue) ? 0 : floatValue
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onInputChanged (e, key) {
    const state = this.react.getState()

    state[key] = e.target.value

    const transform = this.getTransform()

    const value = e.target.value

    switch (key) {
      case 'Tx':
        transform.translation.x =
          this.toFloat(value)
        break
      case 'Ty':
        transform.translation.y =
          this.toFloat(value)
        break
      case 'Tz':
        transform.translation.z =
          this.toFloat(value)
        break

      case 'Rx':
        transform.rotation.x =
          this.toFloat(value) * Math.PI / 180
        break
      case 'Ry':
        transform.rotation.y =
          this.toFloat(value) * Math.PI / 180
        break
      case 'Rz':
        transform.rotation.z =
          this.toFloat(value) * Math.PI / 180
        break

      case 'Sx':
        transform.scale.x = this.toFloat(value)
        transform.scale.y = this.toFloat(value)
        transform.scale.z = this.toFloat(value)

        state.Sx = value
        state.Sy = value
        state.Sz = value
        break
      case 'Sy':
        transform.scale.y = this.toFloat(value)
        break
      case 'Sz':
        transform.scale.z = this.toFloat(value)
        break
    }

    await this.react.setState(state)

    this.applyTransform(transform)

    state.transformExtension.clearSelection()

    this.viewer.impl.sceneUpdated(true)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getTransform () {
    const { fullTransform, model, selection } =
      this.react.getState()

    return !fullTransform
      ? this.getFragmentTransform(selection.fragIdsArray[0])
      : model.transform
  }

  /// //////////////////////////////////////////////////////
  // Applies transform to specific model
  //
  /// //////////////////////////////////////////////////////
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
    const { fullTransform, model, selection } =
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
      const fragCount = model.getFragmentList()
        .fragments.fragId2dbId.length

      // fragIds range from 0 to fragCount-1
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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  transformFragProxy (model, fragId, transform) {
    const fragProxy =
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
      // Not a standard three.js quaternion
      fragProxy.quaternion._x = transform.quaternion.x
      fragProxy.quaternion._y = transform.quaternion.y
      fragProxy.quaternion._z = transform.quaternion.z
      fragProxy.quaternion._w = transform.quaternion.w
    }

    fragProxy.updateAnimTransform()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  translate () {
    const { transformExtension, translate } =
      this.react.getState()

    translate
      ? transformExtension.deactivate()
      : transformExtension.translate()

    this.react.setState({
      translate: !translate,
      rotate: false
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  rotate () {
    const { transformExtension, rotate } =
      this.react.getState()

    rotate
      ? transformExtension.deactivate()
      : transformExtension.rotate()

    this.react.setState({
      translate: false,
      rotate: !rotate
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  pickPosition () {
    const { transformExtension } = this.react.getState()

    transformExtension.pickPosition()

    this.tooltip.activate()

    this.react.setState({
      pick: true
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async setDocking (docked) {
    const id = ModelTransformerExtension.ExtensionId

    if (docked) {
      await this.react.popRenderExtension(id)

      await this.react.pushViewerPanel(this, {
        className: this.className,
        height: 250,
        width: 300
      })
    } else {
      await this.react.popViewerPanel(id)

      this.react.pushRenderExtension(this)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onFullModelTransformChecked (fullTransform) {
    const { transformExtension } = this.react.getState()

    this.viewer.clearSelection()

    transformExtension.setFullTransform(
      fullTransform)

    this.react.setState({
      fullTransform
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderTitle (docked) {
    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className='title'>
        <label>
          Model Transformer
        </label>
        <div className='model-transformer-controls'>
          <button
            onClick={() => this.setDocking(docked)}
            title='Toggle docking mode'
          >
            <span className={spanClass} />
          </button>
        </div>
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderControls () {
    const state = this.react.getState()

    const { model, selection } = state

    const disabled = state.fullTransform
      ? !model
      : !selection

    const pickDisabled =
      !selection ||
      !state.translate ||
      !state.transformSelection ||
      state.transformSelection.type !== 'translate'

    return (
      <div className='controls'>

        <div className='row'>

          <Label text='Translation:' />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Tx')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className='input-trans'
            data-placeholder='x'
            disabled={disabled}
            html={state.Tx}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Ty')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className='input-trans'
            data-placeholder='y'
            disabled={disabled}
            html={state.Ty}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Tz')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className='input-trans'
            data-placeholder='z'
            disabled={disabled}
            html={state.Tz}
          />

          <button
            className={state.translate ? 'active' : ''}
            onClick={() => this.translate()}
            disabled={!model}
            title='Translate'
          >
            <span className='fa fa-arrows-alt' />
          </button>

        </div>

        <div className='row'>

          <Label text='Rotation:' />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Rx')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className='input-rot'
            data-placeholder='rx'
            disabled={disabled}
            html={state.Rx}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Ry')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className='input-rot'
            data-placeholder='ry'
            disabled={disabled}
            html={state.Ry}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Rz')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className='input-rot'
            data-placeholder='rz'
            html={state.Rz}
          />

          <button
            className={state.rotate ? 'active' : ''}
            onClick={() => this.rotate()}
            disabled={!model}
            title='Rotate'
          >
            <span className='fa fa-refresh' />
          </button>

        </div>

        <div className='row'>

          <Label text='Scale:' />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Sx')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className='input-scale'
            data-placeholder='sx'
            disabled={disabled}
            html={state.Sx}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Sy')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className='input-scale'
            data-placeholder='sy'
            disabled={disabled}
            html={state.Sy}
          />

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'Sz')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className='input-scale'
            data-placeholder='sz'
            disabled={disabled}
            html={state.Sz}
          />

          <button
            className={state.pick ? 'active' : ''}
            onClick={() => this.pickPosition()}
            disabled={pickDisabled}
            title='Pick position'
          >
            <span className='fa fa-crosshairs' />
          </button>

        </div>

        {
          this.options.showFullModelTransform &&
            <div className='row'>
              <label>
              Full Model Transform:
              </label>
              <Switch onChange={(checked) => {
                this.onFullModelTransformChecked(checked)
              }}
              />
            </div>
        }

      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render (opts) {
    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}
      >

        {this.renderControls()}

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ModelTransformerExtension.ExtensionId,
  ModelTransformerExtension)
