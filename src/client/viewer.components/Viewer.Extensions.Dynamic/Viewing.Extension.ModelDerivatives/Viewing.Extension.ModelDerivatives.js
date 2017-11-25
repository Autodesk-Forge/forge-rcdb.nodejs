///////////////////////////////////////////////////////////
// ModelDerivatives Viewer Extension
// By Philippe Leefsma, Autodesk Inc, July 2017
//
///////////////////////////////////////////////////////////
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import DerivativesAPI from './Derivatives.API'
import WidgetContainer from 'WidgetContainer'
import { browserHistory } from 'react-router'
import { Tabs, Tab } from 'react-bootstrap'
import ManifestView from './ManifestView'
import ExportsView from './ExportsView'
import ServiceManager from 'SvcManager'
import { ReactLoader } from 'Loader'
import Measure from 'react-measure'
import DOMPurify from 'dompurify'
import ReactDOM from 'react-dom'
import JobView from './JobView'
import Image from 'Image'
import Label from 'Label'
import React from 'react'

class ModelDerivativesExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
	// Class constructor
  //
  /////////////////////////////////////////////////////////
	constructor (viewer, options) {

		super (viewer, options)

    this.onTabSelected = this.onTabSelected.bind(this)

    this.derivativesAPI = new DerivativesAPI({
      apiUrl: this.options.apiUrl
    })

    this.modelSvc =
      ServiceManager.getService(
        'ModelSvc')

    this.socketSvc =
      ServiceManager.getService(
        'SocketSvc')

    this.notifySvc =
      ServiceManager.getService(
      'NotifySvc')

    this.dialogSvc =
      ServiceManager.getService(
        'DialogSvc')

    this.forgeSvc =
      ServiceManager.getService(
        'ForgeSvc')

    this.userSvc =
      ServiceManager.getService(
        'UserSvc')

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

      selectedModel: null,
      manifest: null,
      tabsWidth: 0,
      models: []

    }).then (async() => {

      await this.react.pushRenderExtension(this)

      if (!this.options.appState.user) {

        try {

          const user = await this.forgeSvc.getUser()

          this.react.setState({
            user
          })

        } catch (ex) {

          return this.showLogin()
        }
      }

      const models =
        await this.userSvc.getActiveModels(
          this.options.database)

      this.react.setState({
        models
      })
    })

    console.log('Viewing.Extension.ModelDerivatives loaded')

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'model-derivatives'
  }

  /////////////////////////////////////////////////////////
	// Extension Id
  //
  /////////////////////////////////////////////////////////
	static get ExtensionId () {

		return 'Viewing.Extension.ModelDerivatives'
	}

  /////////////////////////////////////////////////////////
	// Unload callback
  //
  /////////////////////////////////////////////////////////
	unload () {

    console.log('Viewing.Extension.ModelDerivatives loaded')

    super.unload ()

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = ModelDerivativesExtension.ExtensionId

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
  async selectModel (dbModel) {

    this.react.setState({
      selectedModel: dbModel,
      manifest: null
    })

    const urn = dbModel.model.urn

    try {

      const manifest =
        await this.derivativesAPI.getManifest(urn)

      this.react.setState({
        manifest
      })

    } catch (ex) {


    }
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
  renderModels () {

    const {models, selectedModel} = this.react.getState()

    const modelItems = models.map((dbModel) => {

      const thumbnailUrl = this.modelSvc.getThumbnailUrl(
        this.options.database, dbModel._id, 200)

      const active = (selectedModel === dbModel)
        ? ' active' : ''

      return (
        <div className={"model-item" + active}
          key={dbModel._id}
          onClick={() => {
            if (!active) {
              this.selectModel(dbModel)
            }
          }}>
          <Image src={thumbnailUrl}/>
          <Label text= {dbModel.name}/>
        </div>
      )
    })

    return (
      <WidgetContainer
        title="Select a model to load its derivatives ..."
        showTitle={true}>

        <div className="models">
          { modelItems }
        </div>

      </WidgetContainer>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderDerivatives () {

    const {activeTabKey, selectedModel, tabsWidth} =
      this.react.getState()

    const widgetTitle = 'Model Derivatives: ' +
      selectedModel.name

    const nbTabs = 4

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

    return (
      <WidgetContainer
        className={this.className}
        title={widgetTitle}
        showTitle={true}>
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
                id="derivatives-tab"
                className="tabs">
                <Tab className="tab-container"
                  title={tabTitle('Manifest')}
                  eventKey="manifest"
                  key="manifest">
                  { this.renderManifestTab() }
                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('Hierarchy')}
                  eventKey="hierarchy"
                  key="hierarchy">
                  { this.renderHierarchyTab() }
                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('Exports')}
                  eventKey="exports"
                  key="exports">
                  { this.renderExportsTab() }
                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('Custom Job')}
                  eventKey="job"
                  key="job">
                  { this.renderJobTab() }
                </Tab>
              </Tabs>
            </div>
          }
        </Measure>
      </WidgetContainer>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderManifestTab () {

    const {manifest} = this.react.getState()

    return (
      <ManifestView manifest={manifest}/>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderHierarchyTab () {

    return (
      <div>
        Hierarchy
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderExportsTab () {

    return (
      <ExportsView/>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderJobTab () {

    return (
      <JobView/>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {models, selectedModel} = this.react.getState()

    const {showModelSelector} = this.options

    const showLoader = !models.length

    return (
      <div className="content">
        <ReactLoader show={showLoader}/>
        <ReflexContainer>
          {
            showModelSelector &&
            <ReflexElement minSize={39}>
            { this.renderModels() }
            </ReflexElement>
          }
          {
            showModelSelector &&
            selectedModel &&
            <ReflexSplitter/>
          }
          {
            selectedModel &&
            <ReflexElement minSize={39}>
              { this.renderDerivatives () }
            </ReflexElement>
          }
        </ReflexContainer>
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
        showTitle={false}>

        { this.renderContent () }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  ModelDerivativesExtension.ExtensionId,
  ModelDerivativesExtension)

export default 'Viewing.Extension.ModelDerivatives'
