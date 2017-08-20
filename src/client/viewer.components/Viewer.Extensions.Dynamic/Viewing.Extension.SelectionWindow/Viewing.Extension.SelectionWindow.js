/////////////////////////////////////////////////////////////////
// SelectionWindow Viewer Extension
// By Philippe Leefsma, Autodesk Inc, August 2017
//
/////////////////////////////////////////////////////////////////
import SelectionWindowTool from './Viewing.Extension.SelectionWindow.Tool'
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import WidgetContainer from 'WidgetContainer'
import { ReactLoader } from 'Loader'
import ReactDOM from 'react-dom'
import React from 'react'

class SelectionWindowExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.renderTitle = this.renderTitle.bind(this)

    this.selectionWindowTool =
      new SelectionWindowTool(viewer)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({


    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    this.viewer.toolController.registerTool(
      this.selectionWindowTool)

    console.log('Viewing.Extension.SelectionWindow loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'selection-window'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.SelectionWindow'
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.SelectionWindow unloaded')

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelCompletedLoad (event) {

    this.viewer.setActiveNavigationTool(
      'selectionWindowTool')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelUnloaded (event) {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = SelectionWindowExtension.ExtensionId

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
          Selection Window
        </label>
        <div className="selection-window-controls">
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

    return (
      <div className="content">
        <ReactLoader show={true}/>
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
  SelectionWindowExtension.ExtensionId,
  SelectionWindowExtension)

export default 'Viewing.Extension.SelectionWindow'

