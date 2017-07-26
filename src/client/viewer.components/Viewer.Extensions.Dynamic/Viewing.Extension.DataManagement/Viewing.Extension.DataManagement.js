///////////////////////////////////////////////////////////
// DataManagement Viewer Extension
// By Philippe Leefsma, Autodesk Inc, July 2017
//
///////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import DMAPI from './Viewing.Extension.DataManagement.API'
import WidgetContainer from 'WidgetContainer'
import { browserHistory } from 'react-router'
import { Tabs, Tab } from 'react-bootstrap'
import DataTreeView from './DataTreeView'
import ServiceManager from 'SvcManager'
import { ReactLoader } from 'Loader'
import DOMPurify from 'dompurify'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

class DataManagementExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
	// Class constructor
  //
  /////////////////////////////////////////////////////////
	constructor (viewer, options) {

		super (viewer, options)

    this.onTabSelected = this.onTabSelected.bind(this)

    this.dialogSvc =
      ServiceManager.getService(
        'DialogSvc')

    this.forgeSvc =
      ServiceManager.getService(
        'ForgeSvc')

    this.dmAPI = new DMAPI({
      apiUrl: '/api/dm'
    })

    this.react = options.react
	}

	/////////////////////////////////////////////////////////
	// Load callback
  //
  /////////////////////////////////////////////////////////
	load () {

    this.react.setState({

      user: this.options.appState.user,
      activeTabKey: null,
      showTitle: false,
      hubs: null

    }).then (async() => {

      await this.react.pushRenderExtension(this)

      if (!this.options.appState.user) {

        try {

          const user = await this.forgeSvc.getUser()

          this.react.setState({
            user
          })

        } catch (ex) {

          this.showLogin()
        }
      }

      const hubsRes = await this.dmAPI.getHubs()

      this.react.setState({
        hubs: hubsRes.data
      })
    })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu').then(
        (ctxMenuExtension) => {

          ctxMenuExtension.addHandler(
            this.onContextMenu)
        })

    console.log('Viewing.Extension.DataManagement loaded')

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'data-management'
  }

  /////////////////////////////////////////////////////////
	// Extension Id
  //
  /////////////////////////////////////////////////////////
	static get ExtensionId () {

		return 'Viewing.Extension.DataManagement'
	}

  /////////////////////////////////////////////////////////
	// Unload callback
  //
  /////////////////////////////////////////////////////////
	unload () {

    console.log('Viewing.Extension.DataManagement loaded')

    super.unload ()

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = DataManagementExtension.ExtensionId

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
  renderTitle (docked) {

    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className="title">
        <label>
          Data Management
        </label>
        <div className="data-management-controls">
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
  renderTreeView () {

    return (
      <DataTreeView
        menuContainer={this.options.appContainer}
        api={this.dmAPI}
      />
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onTabSelected (tabKey) {

    this.react.setState({
      activeTabKey: tabKey
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderHubs (hubs) {

    const state = this.react.getState()

    const tabs = hubs.map((hub) => {

      const hubHeader = this.dmAPI.getHubHeader(hub)

      const title = `${hubHeader}: ${hub.attributes.name}`

      return (
        <Tab  className="tab-container"
          eventKey={hub.id}
          title={title}
          key={hub.id}>
          stuff
        </Tab>
      )
    })

    const activeTabKey = state.activeTabKey || hubs[0].id

    return (
      <Tabs onSelect={this.onTabSelected}
        className="tabs-container"
        activeKey={activeTabKey}
        id="hubs-tab">
      { tabs }
      </Tabs>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {hubs} = this.react.getState()

    const showLoader = !hubs

    return (
      <div className="content">
        <ReactLoader show={showLoader}/>
        { hubs && hubs.length && this.renderHubs(hubs) }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts) {

    const {showTitle} = this.react.getState()

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        className={this.className}
        showTitle={showTitle}>

        { this.renderContent () }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  DataManagementExtension.ExtensionId,
  DataManagementExtension)

export default 'Viewing.Extension.DataManagement'
