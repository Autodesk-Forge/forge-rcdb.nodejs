/////////////////////////////////////////////////////////////////
// MetaProperties Viewer Extension
// By Philippe Leefsma, Autodesk Inc, April 2017
//
/////////////////////////////////////////////////////////////////
import {AddMetaProperty} from './MetaProperty'
import MetaAPI from './Viewing.Extension.MetaProperties.API'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import MetaTreeView from './MetaTreeView'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'
import { ReactLoader } from 'Loader'
import DOMPurify from 'dompurify'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

class MetaPropertiesExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////
	// Class constructor
  //
  /////////////////////////////////////////////////////////
	constructor (viewer, options) {

		super (viewer, options)

    this.onDeleteProperty = this.onDeleteProperty.bind(this)
    this.onEditProperty = this.onEditProperty.bind(this)
    this.onMetaChanged = this.onMetaChanged.bind(this)
    this.onContextMenu = this.onContextMenu.bind(this)
    this.onSelection = this.onSelection.bind(this)
    this.renderTitle = this.renderTitle.bind(this)

    this.dialogSvc =
      ServiceManager.getService('DialogSvc')

    this.eventSink = options.eventSink

    this.react = options.react
	}

	/////////////////////////////////////////////////////////
	// Load callback
  //
  /////////////////////////////////////////////////////////
	load () {

    this.eventSink.on('model.loaded', () => {

      if (this.options.loader) {

        this.options.loader.hide()
      }

      this.initLoadEvents ()
    })

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
      'Viewing.Extension.ContextMenu').then(
        (ctxMenuExtension) => {

          ctxMenuExtension.addHandler(
            this.onContextMenu)
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
  initLoadEvents () {

    this.viewerEvent([

      Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT

    ]).then((args) => {

      this.onModelFullyLoaded(args)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelFullyLoaded (args) {

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

    const {apiUrl, database} = this.options

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

      const selection = event.selections[0]

      const nodeId = selection.dbIdArray[0]

      if (nodeId !== this.nodeId) {

        this.loadNodeProperties(nodeId)
      }

      this.nodeId = nodeId

    } else {

      const {model} = this.react.getState()

      if (model) {

        const instanceTree = model.getData().instanceTree

        const nodeId = instanceTree.getRootId()

        if (nodeId !== this.nodeId) {

          this.loadNodeProperties(nodeId)
        }

        this.nodeId = nodeId
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async loadNodeProperties (nodeId) {

    await this.react.setState({
      properties: []
    })

    const {model} = this.react.getState()

    const modelProperties =
      await Toolkit.getProperties(
        model, nodeId)

    const metaProperties =
      await this.api.getNodeMetaProperties(nodeId)

    const properties = [
      ...modelProperties,
      ...metaProperties
    ]

    this.react.setState({
      properties,
      nodeId
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onContextMenu (event) {

    const {model} = this.react.getState()

    if (!model) {
      return
    }

    const instanceTree = model.getData().instanceTree

    const dbId = event.dbId || (instanceTree
      ? instanceTree.getRootId()
      : -1)

    if (dbId > -1) {

      event.menu.push({
        title: 'Add Meta Property',
        target: () => {
          this.showAddMetaPropertyDlg(dbId)
        }
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMetaChanged (metaProperty) {

    this.metaProperty = metaProperty
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onEditProperty (metaProperty) {

    console.log(metaProperty)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onDeleteProperty (metaProperty) {

    const onClose = (result) => {

      if (result === 'OK') {

        this.api.deleteNodeMetaProperty(metaProperty.id)
      }

      this.dialogSvc.off('dialog.close', onClose)
    }

    this.dialogSvc.on('dialog.close', onClose)

    const msg = DOMPurify.sanitize(
      `Are you sure you want to delete`
      + ` <b>${metaProperty.displayName}</b> ?`)

    this.dialogSvc.setState({
      title: 'Delete Property ...',
      content:
        <div dangerouslySetInnerHTML={{__html: msg}}>
        </div>,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  showAddMetaPropertyDlg (nodeId) {

    const onClose = (result) => {

      if (result === 'OK') {

        const metaProperty = Object.assign(
          this.metaProperty, {
            nodeId: nodeId.toString(),
            id: this.guid()
          })

        this.api.addNodeMetaProperty(metaProperty)
      }

      this.dialogSvc.off('dialog.close', onClose)
    }

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      className: 'add-property-dlg',
      title: 'Add Meta Property ...',
      disableOK: true,
      open: true,
      content:
        <AddMetaProperty onChanged={this.onMetaChanged}
          disableOK={this.dialogSvc.disableOK}
        />
    }, true)
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
        menuContainer={this.options.appContainer}
        onDeleteProperty={this.onDeleteProperty}
        onEditProperty={this.onEditProperty}
        nodeId={nodeId}
        model={model}
        name={name}
      />
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
