/////////////////////////////////////////////////////////
// Viewing.Extension.ModelLoader
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import HFDMCoreExtension from './Viewing.Extension.HFDM.Core'
import WidgetContainer from 'WidgetContainer'
import ScriptLoader from './ScriptLoader'
import ServiceManager from 'SvcManager'
import './Viewing.Extension.HFDM.scss'
import { ReactLoader } from 'Loader'
import Toolkit from 'Viewer.Toolkit'
import DOMPurify from 'dompurify'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'
import {
  DropdownButton,
  MenuItem
} from 'react-bootstrap'

class HFDMExtension extends MultiModelExtensionBase {

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

    return 'hfdm'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.HFDM'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({


    }).then (() => {

      //this.onScriptLoaded()

      this.react.pushRenderExtension(this)

      this.options.setNavbarState({
        links: {
          login: true
        }
      })
    })

    console.log('Viewing.Extension.HFDM loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.HFDM unloaded')

    this.react.popViewerPanel(this)

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  // Panel docking mode
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = HFDMExtension.ExtensionId

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
  sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(() => resolve (), ms)
    })
  }

  /////////////////////////////////////////////////////////
  // callback: function (error, bearerToken)
  //
  /////////////////////////////////////////////////////////
  getBearerToken (callback) {

    $.get('/api/forge/token/3legged', (res) => {

      callback(null, res.access_token)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onScriptLoaded () {

    while (!(window.Forge && window.Forge.HFDM)) {

      await this.sleep(100)
    }

    this.viewer.loadExtension(HFDMCoreExtension, {
      serverUrl: 'https://developer-stg.api.autodesk.com/lynx/v1/pss',
      hfdmURN: this.options.location.query.hfdmURN,
      getBearerToken: this.getBearerToken,
      HFDM_SDK: window.Forge.HFDM
    })
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
          HFDM
        </label>
        <div className="hfdm-controls">
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

    return false
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

        <ScriptLoader onLoaded={this.onScriptLoaded}
          url={[
            //"/resources/libs/hfdm/forge-entity-manager.js",
            "/resources/libs/hfdm/forge-hfdm.js"
          ]}/>

        { this.renderControls() }

      </WidgetContainer>
    )
  }
}



Autodesk.Viewing.theExtensionManager.registerExtension(
  HFDMExtension.ExtensionId,
  HFDMExtension)
