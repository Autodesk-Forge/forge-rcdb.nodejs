/////////////////////////////////////////////////////////////////
// MetaProperties Viewer Extension
// By Philippe Leefsma, Autodesk Inc, April 2017
//
/////////////////////////////////////////////////////////////////
import MetaAPI from './Viewing.Extension.MetaProperties.API'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import MetaTreeView from './MetaTreeView'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'
import { ReactLoader } from 'Loader'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

class MetaPropertiesExtension extends ExtensionBase {

	/////////////////////////////////////////////////////////////////
	// Class constructor
  //
	/////////////////////////////////////////////////////////////////
	constructor (viewer, options) {

		super (viewer, options)

    this.onContextMenu = this.onContextMenu.bind(this)
    this.onSelection = this.onSelection.bind(this)
    this.renderTitle = this.renderTitle.bind(this)

    this.dialogSvc =
      ServiceManager.getService('DialogSvc')

    this.react = options.react
	}

	/////////////////////////////////////////////////////////
	// Load callback
  //
  /////////////////////////////////////////////////////////
	load () {

    this.viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (e) => {

        if (this.options.loader) {
          this.options.loader.hide()
        }
      })

    this.viewerEvent([

      Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT

    ]).then((args) => this.onModelLoaded(args))

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.react.setState({

      properties: [],
      nodeId: null,
      model: null

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu').then((contextMenu) => {

        contextMenu.on('buildMenu', this.onContextMenu)
      })

    console.log('Viewing.Extension.MetaProperties loaded')

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'meta-properties'
  }

  /////////////////////////////////////////////////////////
	// Extension Id
  //
  /////////////////////////////////////////////////////////
	static get ExtensionId () {

		return 'Viewing.Extension.MetaProperties'
	}

  /////////////////////////////////////////////////////////
	// Unload callback
  //
  /////////////////////////////////////////////////////////
	unload () {

    this.viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    console.log('Viewing.Extension.MetaProperties loaded')

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelLoaded (args) {

    const model = args[0].model

    this.setModel(model)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setModel (model) {

    this.react.setState({
      model
    })

    const modelId = model.dbModelId ||
      this.options.dbModel._id

    const {apiUrl, database} = this.options.apiUrl

    this.api = new MetaAPI(
      `${apiUrl}/meta/${database}/${modelId}`)

    const instanceTree = model.getData().instanceTree

    this.loadNodeProperties(instanceTree.getRootId())
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelection (event) {

    if (event.selections.length) {

      const nodeId = event.selections[0].dbIdArray[0]

      this.loadNodeProperties(nodeId)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async loadNodeProperties (nodeId) {

    const {model} = this.react.getState()

    const modelProperties =
      await Toolkit.getProperties(
        model, nodeId)

    await this.react.setState({
      properties: modelProperties
    })

    const metaProperties =
      await this.api.getNodeMetaProperties(nodeId)

    const properties = [
      ...modelProperties,
      ...metaProperties
    ]

    this.react.setState({
      properties
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onContextMenu (event) {

    if (event.selectedDbId) {

      event.menu.push({
        title: 'Add Meta Property',
        target: () => {
          this.showMetaDlg(event.selectedDbId)
        }
      })

      return event.menu
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  showMetaDlg (nodeId) {

    const metaProperty = {
      category: 'Forge',
      value: 'MetaProperty Demo',
      id: this.guid(),
      nodeId: nodeId.toString()
    }

    this.api.addNodeMetaProperty(metaProperty)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = MetaPropertiesExtension.ExtensionId

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
          Meta Properties
        </label>
        <div className="meta-properties-controls">
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
  renderControls () {

    return (
      <div className="controls">

      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTreeView (properties) {

    const {model, nodeId} = this.react.getState()

    const instanceTree = model.getData().instanceTree

    const name = instanceTree.getNodeName(nodeId)

    return (
      <MetaTreeView properties={properties}
        name={name}/>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {properties} = this.react.getState()

    const content = properties.length
      ? this.renderTreeView(properties)
      : <div/>

    return (
      <div className="content">
        <ReactLoader show={!properties.length}/>
        { content }
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

        { this.renderControls() }
        { this.renderContent () }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  MetaPropertiesExtension.ExtensionId,
  MetaPropertiesExtension)

export default 'Viewing.Extension.MetaProperties'
