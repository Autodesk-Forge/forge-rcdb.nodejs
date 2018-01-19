///////////////////////////////////////////////////////////
// WebHooks Viewer Extension
// By Philippe Leefsma, Autodesk Inc, January 2017
//
///////////////////////////////////////////////////////////
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import WidgetContainer from 'WidgetContainer'
import { browserHistory } from 'react-router'
import { Tabs, Tab } from 'react-bootstrap'
import WebHooksAPI from './WebHooks.API'
import ServiceManager from 'SvcManager'
import ManageView from './ManageView'
import CreateView from './CreateView'
import EventsView from './EventsView'
import { ReactLoader } from 'Loader'
import Measure from 'react-measure'
import Image from 'Image'
import Label from 'Label'
import React from 'react'


class WebHooksExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
	// Class constructor
  //
  /////////////////////////////////////////////////////////
	constructor (viewer, options) {

		super (viewer, options)

    this.onTabSelected = this.onTabSelected.bind(this)
    this.onCreateHook = this.onCreateHook.bind(this)

    this.webHooksAPI = new WebHooksAPI({
      apiUrl: '/api/hooks'
    })

    this.dialogSvc =
      ServiceManager.getService(
        'DialogSvc')

    this.forgeSvc =
      ServiceManager.getService(
        'ForgeSvc')

    this.notifySvc =
      ServiceManager.getService(
        'NotifySvc')

    this.react = options.react
	}

	/////////////////////////////////////////////////////////
	// Load callback
  //
  /////////////////////////////////////////////////////////
	load () {

    this.options.loader.show(false)

    if (!this.viewer.model) {

      this.viewer.container.classList.add('empty')
    }

    this.react.setState({

      user: this.options.appState.user,
      activeTabKey: 'hook-create',
      tabsWidth: 0,
      hooks: []

    }).then (async() => {

      if (!this.options.appState.user) {

        try {

          const user = await this.forgeSvc.getUser()

          await this.react.setState({
            user
          })

        } catch (ex) {

          return this.showLogin()
        }
      }

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.WebHooks loaded')

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'web-hooks'
  }

  /////////////////////////////////////////////////////////
	// Extension Id
  //
  /////////////////////////////////////////////////////////
	static get ExtensionId () {

		return 'Viewing.Extension.WebHooks'
	}

  /////////////////////////////////////////////////////////
	// Unload callback
  //
  /////////////////////////////////////////////////////////
	unload () {

    console.log('Viewing.Extension.WebHooks loaded')

    super.unload ()

		return true
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
  onTabSelected (tabKey) {

    this.react.setState({
      activeTabKey: tabKey
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onCreateHook (system, event, scope) {

    try {

      if (event.id) {
        
        const res = 
          await this.webHooksAPI.createEventHook(
            system.id, event.id, scope)
  
        console.log(res)
  
      } else {
  
        const res = 
          await this.webHooksAPI.createSystemHook(
            system.id, scope)
  
        console.log(res)
      }
  
      this.notifySvc.add({
        message: event.id || 'system-wide',
        title: 'Hook added ... :)',
        dismissAfter: 2500,
        dismissible: false,
        status: 'success',
        id: this.guid(),
        position: 'tl'
      })

    } catch (ex) {

      this.notifySvc.add({
        message: event.id || 'system-wide',
        title: 'Hook rejected ... :(',
        dismissAfter: 2500,
        dismissible: false,
        status: 'error',
        id: this.guid(),
        position: 'tl'
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderManageTab () {

    const {hooks} = this.react.getState()

    return (
      <ManageView webHooksAPI={this.webHooksAPI}/>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderCreateTab () {

    return (
      <CreateView
        onCreateHook={this.onCreateHook}
      />
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderEventsTab () {
    
    const {user} = this.react.getState()

    return (
      !!user && <EventsView user={user}/>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {activeTabKey, tabsWidth} =
      this.react.getState()

    const nbTabs = 3

    const style = {
      width:
        `${Math.floor((tabsWidth-8)/nbTabs-15)}px`
    }

    const tabTitle = (title) => {
      return (
        <label style={style}>
          {title}
        </label>
      )
    }

    const showLoader = false

    return (
      <div className="content">
        <ReactLoader show={showLoader}/>
        <Measure bounds onResize={(rect) => {
          this.react.setState({
            tabsWidth: rect.bounds.width
          })
        }}>
        {
          ({ measureRef }) =>
            <div ref={measureRef} className="tabs-container">
              <Tabs activeKey={activeTabKey}
                onSelect={this.onTabSelected}
                id="hooks-create-tab"
                className="tabs">
                <Tab className="tab-container"
                  title={tabTitle('Create Hook')}
                  eventKey="hook-create"
                  key="hook-create">
                    { this.renderCreateTab() }
                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('Manage Hooks')}
                  eventKey="hook-manage"
                  key="hook-manage">
                    { this.renderManageTab() }
                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('Events Log')}
                  eventKey="hook-events"
                  key="hook-events">
                    { this.renderEventsTab() }
                </Tab>
              </Tabs>
            </div>
          }
        </Measure>
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
        className={this.className}
        title="Web Hooks"
        showTitle={true}>

        { this.renderContent () }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  WebHooksExtension.ExtensionId,
  WebHooksExtension)
