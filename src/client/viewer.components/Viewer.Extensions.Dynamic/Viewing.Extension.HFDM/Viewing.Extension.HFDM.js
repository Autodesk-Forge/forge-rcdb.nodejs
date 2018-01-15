/////////////////////////////////////////////////////////
// Viewing.Extension.ModelLoader
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import HFDMCoreExtensionId from './Viewing.Extension.HFDM.Core'
import Clipboard from 'react-copy-to-clipboard'
import { browserHistory } from 'react-router'
import WidgetContainer from 'WidgetContainer'
import ScriptLoader from 'ScriptLoader'
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

    this.dialogSvc =
      ServiceManager.getService(
        'DialogSvc')

    this.forgeSvc =
      ServiceManager.getService(
        'ForgeSvc')

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

      user: this.options.appState.user,
      colaborateURL: null,
      inspectorURL: null

    }).then (() => {

      this.react.pushRenderExtension(this)

      if (!this.options.appState.user) {

        this.forgeSvc.getUser().then((user) => {

          this.react.setState({
            user
          })

        }, (err) => {

          this.showLogin()
        })
      }
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
  getToken (callback) {

    $.get('/api/forge/token/3legged', (res) => {

      callback(null, res.access_token)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  showLogin () {

    const onClose = (result) => {

      this.dialogSvc.off('dialog.close', onClose)

      if (result === 'OK') {

        this.forgeSvc.login()
        return
      }

      browserHistory.push('/configurator')
    }

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      onRequestClose: () => {},
      className: 'login-dlg',
      title: 'Forge Login required ...',
      content:
        <div>
          Press OK to login ...
        </div>,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onScriptLoaded () {

    while (!(window.Forge &&
             window.Forge.HFDM &&
             window.Forge.AppFramework)) {

      await this.sleep(100)
    }

    const HFDMCoreExtension =
      await this.viewer.loadExtension(
        HFDMCoreExtensionId, {
          serverUrl: 'https://developer.api.autodesk.com/hfdm/v1',
          branchUrn: this.options.location.query.branchUrn,
          HFDMAppFramework: window.Forge.AppFramework,
          HFDM_SDK: window.Forge.HFDM,
          getToken: this.getToken
        })

    HFDMCoreExtension.on('colaborateURL', (colaborateURL) => {

      console.log('------- colaborateURL -------')
      console.log(colaborateURL)

      this.react.setState({
        colaborateURL
      })
    })

    HFDMCoreExtension.on('inspectorURL', (inspectorURL) => {

      console.log('------- inspectorURL -------')
      console.log(inspectorURL)
    })

    this.options.loader.show(false)
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

    const {colaborateURL, inspectorURL} =
      this.react.getState()

    const showLoader = !colaborateURL

    return (
      <div>
        <ReactLoader show={showLoader}/>
        <ScriptLoader onLoaded={this.onScriptLoaded}
          url={[
            "/resources/libs/hfdm/forge-entity-manager.js",
            "/resources/libs/hfdm/forge-hfdm.js"
          ]}/>
        <br/>
        {
          colaborateURL &&
          <div>
            <a href={colaborateURL} target='_blank'>
              Collaborate URL
            </a>
            <Clipboard
              text={colaborateURL}>
              <button className="clipboard-btn"
                title="Copy to clipboard">
              <span className="fa fa-clipboard"/>
              </button>
            </Clipboard>
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

    const {user} = this.react.getState()

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>
        {
          user && this.renderControls()
        }
      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  HFDMExtension.ExtensionId,
  HFDMExtension)
