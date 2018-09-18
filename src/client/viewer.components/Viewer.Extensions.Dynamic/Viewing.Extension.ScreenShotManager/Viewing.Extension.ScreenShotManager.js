/////////////////////////////////////////////////////////
// Viewing.Extension.ScreenShotManager
// by Philippe Leefsma, March 2017
//
/////////////////////////////////////////////////////////
import './Viewing.Extension.ScreenShotManager.scss'
import ContentEditable from 'react-contenteditable'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import Toolkit from 'Viewer.Toolkit'
import Label from 'Label'
import React from 'react'

class ScreenShotManagerExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onItemClicked = this.onItemClicked.bind(this)

    this.deleteItem = this.deleteItem.bind(this)

    this.addItem = this.addItem.bind(this)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'screenshot-manager'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ScreenShotManager'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (e) => {

        if(this.options.loader){
          this.options.loader.show(false)
        }
      })

    this.react.setState({

      screenshotHeight: this.viewer.container.clientHeight,
      screenshotWidth: this.viewer.container.clientWidth,
      items: []

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.ScreenShotManager loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.ScreenShotManager unloaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  floor (value) {

    const floatValue = parseFloat(value)

    return Math.floor(isNaN(floatValue) ? 0 : floatValue)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  addItem () {

    const state = this.react.getState()

    const screenshotHeight = this.floor (state.screenshotHeight)

    const screenshotWidth = this.floor (state.screenshotWidth)

    this.viewer.getScreenShot(
      screenshotWidth, screenshotHeight, (blob) => {

        const state = this.react.getState()

        const screenshot = {
          name:  new Date().toString('d/M/yyyy H:mm:ss'),
          id: this.guid(),
          screenshotHeight,
          screenshotWidth,
          blob
        }

        this.react.setState({
          items: [...state.items, screenshot]
        })
      })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onItemClicked (item) {

    this.saveAs(item.blob, item.name + '.png')
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  saveAs (blob, filename) {

    const link = document.createElement('a')

    link.setAttribute('download', filename)
    link.setAttribute('href', blob)

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteItem (id) {

    const state = this.react.getState()

    this.react.setState({
      items: state.items.filter((item) => {
        return item.id !== id
      })
    })
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
  async onInputChanged (e, key) {

    const state = this.react.getState()

    state[key] = e.target.value

    this.react.setState(state)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onResize () {

    if (this.viewer.container) {

      this.react.setState({
        screenshotHeight: this.viewer.container.clientHeight,
        screenshotWidth: this.viewer.container.clientWidth
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = ScreenShotManagerExtension.ExtensionId

    if (docked) {

      this.react.popRenderExtension(id).then(() => {

        this.react.pushViewerPanel(this, {
          height: 250,
          width: 350
        })
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
          Screenshot Manager
        </label>
        <div className="screenshot-manager-controls">
          <button onClick={() => this.setDocking(docked)}
            title="Toggle docking mode">
            <span className={spanClass}>
            </span>
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

    return (
      <div className="controls">

        <div className="row">

          <button onClick={this.addItem}
            title="Take Screenshot">
            <span className="fa fa-camera">
            </span>
          </button>

          <Label text={'Width (px):'}/>

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'screenshotWidth')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="size-input"
            html={`${state.screenshotWidth}`}/>

          <Label text={'x Height (px):'}/>

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'screenshotHeight')}
            onKeyDown={(e) => this.onKeyDownNumeric(e)}
            className="size-input"
            html={`${state.screenshotHeight}`}/>

        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItems () {

    const state = this.react.getState()

    const items = state.items.map((item) => {

      const text =
        `${item.name} [${item.screenshotWidth} x ${item.screenshotHeight}]`

      return (
        <div key={item.id} className="item" onClick={
            () => this.onItemClicked (item)
          }>

          <div className="preview" style={{
            content: `url(${item.blob})`
          }}>
          </div>

          <div>
            <Label text={text}/>
          </div>

          <button onClick={(e) => {
            this.deleteItem(item.id)
            e.stopPropagation()
            e.preventDefault()
            }}
            title="Delete Screenshot">
            <span className="fa fa-times">
            </span>
          </button>
        </div>
      )
    })

    return (
      <div className="items">
        { items }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts = {showTitle: true}) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>
        { this.renderControls() }
        { this.renderItems() }
      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ScreenShotManagerExtension.ExtensionId,
  ScreenShotManagerExtension)
