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

    this.materials = {}
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      texture: {name: 'wood' , img: wood},
      clrActive: false,
      texActive: false,
      color: '#FF0000',
      disabled: true,
      textures: [
        {name: 'brick', img: brick},
        {name: 'steel', img: steel},
        {name: 'wood' , img: wood}
      ]

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu', {
        buildMenu: (menu, dbId) => {

          if (dbId) {

          }

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

    this.eventTool.activate()

    const state = Object.assign({
      clrActive: false,
      texActive: false
    }, {
      [`${active}`]: true
    })

    this.react.setState(state)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  stopSelection() {

    this.eventTool.deactivate()

    this.react.setState({
      clrActive: false,
      texActive: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onSelection (event) {

    if (this.eventTool.active && event.selections.length) {

      const {clrActive, texActive} = this.react.getState()

      const selection = event.selections[0]

      const dbIds = selection.dbIdArray

      const model =
        this.viewer.activeModel ||
        this.viewer.model

      const fragIds = await Toolkit.getFragIds(
        model, dbIds)

      if (clrActive) {

        this.setColorMaterial(model, fragIds)
      }

      if (texActive) {

        this.setTextureMaterial(model, fragIds)
      }

      this.viewer.impl.invalidate(true)

      this.viewer.clearSelection()
    }
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

    tex.repeat.set (0.05, 0.05)

    const material = new THREE.MeshBasicMaterial({
      specular: new THREE.Color(0x111111),
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

    const {color} = this.react.getState()

    const colorHexStr = color.replace('#', '0x')

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
  clearOverrides () {

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
  onColorPicked (color) {

    this.react.setState({
      color: color.hex
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onColorPick (e) {

    const {color} = this.react.getState()

    this.dialogSvc.setState({
      className: 'color-picker-dlg',
      title: 'Select Color ...',
      showCancel: false,
      content:
        <div>
          <ChromePicker
            onChangeComplete={this.onColorPicked}
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
      color,
      clrActive,
      texActive,
      disabled,
      texture
    } = this.react.getState()

    const colorPickerStytle = {
      background: color
    }

    const texPickerStytle = {
      content: `url(${texture.img})`
    }

    return (
      <div className="content">
        <div className={`start-selection ${clrActive ? 'active':''}`}
          onClick={() => this.startSelection('clrActive')}
          disabled={disabled}>
          <div onClick={this.onColorPick}
            style={colorPickerStytle}
            className="picker"
          />
          Color
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
