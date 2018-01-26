/////////////////////////////////////////////////////////////////
// Material Viewer Extension
// By Philippe Leefsma, Autodesk Inc, October 2017
//
/////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import WidgetContainer from 'WidgetContainer'
import { ChromePicker } from 'react-color'
import EventTool from 'Viewer.EventTool'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

import brick from './textures/brick.jpg'
import steel from './textures/steel.jpg'
import wood from './textures/wood.jpg'

class MaterialExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onColorPicked = this.onColorPicked.bind(this)
    this.onTexturePick = this.onTexturePick.bind(this)
    this.onColorPick = this.onColorPick.bind(this)
    this.renderTitle = this.renderTitle.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)

    this.dialogSvc =
      ServiceManager.getService('DialogSvc')

    this.react = options.react

    this.overrides = {}

    this.materials = {}
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      texture: {name: 'wood' , img: wood},
      disabled: !this.models.length,
      materialClrActive: false,
      themingClrActive: false,
      texActive: false,
      materialColor: '#D02D2D',
      themingColor: '#41C638',
      textures: [
        {name: 'brick', img: brick},
        {name: 'steel', img: steel},
        {name: 'wood' , img: wood}
      ]

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    if (this.viewer.model) {

      this.eventTool = new EventTool(this.viewer)

      this.eventTool.on('keydown', this.onKeyDown)
    }

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu', {
        buildMenu: (menu, dbId) => {

          menu.push({
            title: 'Clear All Material Overrides',
            target: () => {
              this.clearOverrides()
            }
          })

          return menu
        }
      })

    console.log('Viewing.Extension.Material loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'material'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.Material'
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Material unloaded')

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded () {

    if (!this.eventTool) {

      this.eventTool = new EventTool(this.viewer)

      this.eventTool.on('keydown', this.onKeyDown)
    }

    this.react.setState({
      disabled: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  startSelection (active) {

    const {disabled} = this.react.getState()

    if (!disabled) {

      this.eventTool.activate()

      const state = Object.assign({
        materialClrActive: false,
        themingClrActive: false,
        texActive: false
      }, {
        [`${active}`]: true
      })

      this.react.setState(state)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  stopSelection() {

    this.eventTool.deactivate()

    this.react.setState({
      materialClrActive: false,
      texActive: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onSelection (event) {

    if (this.eventTool.active && event.selections.length) {

      const {
        materialClrActive,
        themingClrActive,
        texActive
      } = this.react.getState()

      const selection = event.selections[0]

      const dbIds = selection.dbIdArray

      const model = selection.model

      this.saveDefaultMaterial (model, dbIds)

      const fragIds =
        await Toolkit.getFragIds(
          model, dbIds)

      if (materialClrActive) {

        this.setColorMaterial(model, fragIds)
      }

      if (themingClrActive) {

        this.setThemingColor(model, dbIds)
      }

      if (texActive) {

        this.setTextureMaterial(model, fragIds)
      }

      this.viewer.impl.sceneUpdated(true)

      this.viewer.clearSelection()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  saveDefaultMaterial (model, dbIds) {

    dbIds.forEach((dbId) => {

      if (!this.overrides[model.guid + dbId]) {

        Toolkit.getFragIds(model, dbId).then(
          (fragIds) => {

            const renderProxy =
              this.viewer.impl.getRenderProxy(
                model, fragIds[0])

            this.overrides[model.guid + dbId] = {
              material: renderProxy.material,
              model,
              dbId
            }
          })
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getMaterial (colorOrStr) {

    if (!this.materials[colorOrStr]) {

      if (typeof colorOrStr === 'string') {

        this.materials[colorOrStr] =
          this.createTexMaterial(colorOrStr)

      } else {

        this.materials[colorOrStr] =
          this.createColorMaterial(colorOrStr)
      }
    }

    return this.materials[colorOrStr]
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createColorMaterial (color) {

    const material = new THREE.MeshPhongMaterial({
      specular: new THREE.Color(color),
      side: THREE.DoubleSide,
      reflectivity: 0.0,
      color
    })

    const materials = this.viewer.impl.getMaterials()

    materials.addMaterial(
      this.guid(),
      material,
      true)

    return material
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createTexMaterial (texture) {

    const tex = THREE.ImageUtils.loadTexture(texture)

    tex.wrapS  = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping

    tex.repeat.set (0.1, 0.1)

    const material = new THREE.MeshBasicMaterial({
      specular: new THREE.Color(0x111111),
      side: THREE.DoubleSide,
      reflectivity: 0.0,
      map: tex
    })

    const materials = this.viewer.impl.getMaterials()

    materials.addMaterial(
      this.guid(),
      material,
      true)

    material.name = texture

    return material
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setColorMaterial (model, fragIds) {

    const {materialColor} = this.react.getState()

    const colorHexStr = materialColor.replace('#', '0x')

    const colorInt = parseInt(colorHexStr, 16)

    const material = this.getMaterial(colorInt)

    fragIds.forEach((fragId) => {

      model.getFragmentList().setMaterial(
        fragId, material)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setThemingColor (model, dbIds) {

    const {themingColor} = this.react.getState()

    const colorHexStr = themingColor.replace('#', '0x')

    const colorInt = parseInt(colorHexStr, 16)

    const clr = new THREE.Color(colorInt)

    dbIds.forEach((dbId) => {

      model.setThemingColor(dbId,
        new THREE.Vector4(
        clr.r, clr.g, clr.b, clr.a))
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setTextureMaterial (model, fragIds) {

    const {texture} = this.react.getState()

    const material = this.getMaterial(texture.img)

    fragIds.forEach((fragId) => {

      model.getFragmentList().setMaterial(
        fragId, material)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async clearOverrides () {

    for (let key in this.overrides) {

      const {model, dbId, material} = this.overrides[key]

      const fragIds = await Toolkit.getFragIds(
        model, dbId)

      fragIds.forEach((fragId) => {

        model.getFragmentList().setMaterial(
          fragId, material)
      })
    }

    this.overrides = {}

    this.viewer.impl.sceneUpdated(true)

    this.models.forEach((model) => {

      model.clearThemingColors()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (event, keyCode) {

    if (keyCode === 27) {

      this.stopSelection()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onColorPicked (field, color) {

    this.react.setState({
      [field]: color.hex
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onColorPick (field, e) {

    const state = this.react.getState()

    const color = state[field]

    this.dialogSvc.setState({
      className: 'color-picker-dlg',
      title: 'Select Color ...',
      showCancel: false,
      content:
        <div>
          <ChromePicker
            onChangeComplete={(c) => this.onColorPicked(field, c)}
            color={color}
          />
        </div>,
      open: true
    })

    e.stopPropagation()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onTexturePick (e) {

    const {textures} = this.react.getState()

    const items = textures.map((texture) => {

      const style = {
        content: `url(${texture.img})`
      }

      return (
        <div key={texture.name} className="tex-item"
          onClick={() => {

            this.dialogSvc.setState({
              open: false
            })

            this.react.setState({
              texture
            })
        }}>
          <div className="img" style={style}/>
          { texture.name }
        </div>
      )
    })

    this.dialogSvc.setState({
      className: 'texture-picker-dlg',
      title: 'Select Texture ...',
      showCancel: false,
      showOK: false,
      content:
        <div>
          {items}
        </div>,
      open: true
    })

    e.stopPropagation()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = MaterialExtension.ExtensionId

    if (docked) {

      await this.react.popRenderExtension(id)

      this.react.pushViewerPanel(this, {
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
  renderTitle (docked) {

    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className="title">
        <label>
          Material
        </label>
        <div className="material-controls">
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
  renderContent () {

    const {
      materialClrActive,
      themingClrActive,
      texActive,
      disabled,
      texture,
      materialColor,
      themingColor
    } = this.react.getState()

    const materialPicker = {
      background: materialColor
    }

    const themingPicker = {
      background: themingColor
    }

    const texPickerStytle = {
      content: `url(${texture.img})`
    }

    return (
      <div className="content">
        <div className={`start-selection ${themingClrActive ? 'active':''}`}
          onClick={() => this.startSelection('themingClrActive')}
          disabled={disabled}>
          <div onClick={(e) => this.onColorPick('themingColor', e)}
            style={themingPicker}
            className="picker"
          />
          Theming Color
        </div>
        <div className={`start-selection ${materialClrActive ? 'active':''}`}
          onClick={() => this.startSelection('materialClrActive')}
          disabled={disabled}>
          <div onClick={(e) => this.onColorPick('materialColor', e)}
            style={materialPicker}
            className="picker"
          />
          Material Color
        </div>
        <div className={`start-selection ${texActive ? 'active':''}`}
          onClick={() => this.startSelection('texActive')}
          disabled={disabled}>
          <div onClick={this.onTexturePick}
            style={texPickerStytle}
            className="picker"
          />
          Texture
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
  MaterialExtension.ExtensionId,
  MaterialExtension)

export default 'Viewing.Extension.Material'


