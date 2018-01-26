///////////////////////////////////////////////////////////
// MetaProperties Viewer Extension
// By Philippe Leefsma, Autodesk Inc, April 2017
//
///////////////////////////////////////////////////////////
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import Search from './Viewing.Extension.MetaProperties.Search'
import MetaAPI from './Viewing.Extension.MetaProperties.API'
import {OverlayTrigger, Popover} from 'react-bootstrap'
import {AddMetaProperty} from './MetaProperty'
import WidgetContainer from 'WidgetContainer'
import MetaTreeView from './MetaTreeView'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'
import { ReactLoader } from 'Loader'
import DOMPurify from 'dompurify'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

class MetaPropertiesExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
	// Class constructor
  //
  /////////////////////////////////////////////////////////
	constructor (viewer, options) {

		super (viewer, options)

    this.onPropertyDeleted = this.onPropertyDeleted.bind(this)
    this.onPropertyUpdated = this.onPropertyUpdated.bind(this)
    this.onDeleteProperty = this.onDeleteProperty.bind(this)
    this.onPropertyAdded = this.onPropertyAdded.bind(this)
    this.onEditProperty = this.onEditProperty.bind(this)
    this.onMetaChanged = this.onMetaChanged.bind(this)
    this.onContextMenu = this.onContextMenu.bind(this)
    this.onSearch = this.onSearch.bind(this)

    this.dialogSvc =
      ServiceManager.getService('DialogSvc')

    this.socketSvc =
      ServiceManager.getService('SocketSvc')

    this.socketSvc.connect()

    this.react = options.react
	}

	/////////////////////////////////////////////////////////
	// Load callback
  //
  /////////////////////////////////////////////////////////
	load () {

    this.socketSvc.on (
      'meta.propertyDeleted',
      this.onPropertyDeleted)

    this.socketSvc.on (
      'meta.propertyUpdated',
      this.onPropertyUpdated)

    this.socketSvc.on (
      'meta.propertyAdded',
      this.onPropertyAdded)

    this.react.setState({

      properties: [],
      search: false,
      model: null,
      dbId: null

    }).then (() => {

      this.react.pushRenderExtension(this)

      const model = this.viewer.activeModel ||
        this.viewer.model

      if (model) {

        this.setModel(model)
      }
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

    console.log('Viewing.Extension.MetaProperties loaded')

    this.socketSvc.off (
      'meta.propertyDeleted',
      this.onPropertyDeleted)

    this.socketSvc.off (
      'meta.propertyUpdated',
      this.onPropertyUpdated)

    this.socketSvc.off (
      'meta.propertyAdded',
      this.onPropertyAdded)

    super.unload ()

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded () {

    this.options.loader.show(false)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onObjectTreeCreated (event) {

    const selectors = [
      '#toolbar-propertiesTool',
      '#toolbar-zoomTool',
      '#toolbar-panTool'
    ]

    selectors.forEach((selector) => {
      $(selector).css({
        display: 'none'
      })
    })

    this.setModel(event.model)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelActivated (event) {

    if (event.source !== 'model.loaded') {

      this.setModel(event.model)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onPropertyAdded (metaPayload) {

    this.loadNodeProperties (metaPayload.dbId, true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onPropertyUpdated (metaPayload) {

    this.loadNodeProperties (metaPayload.dbId, true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onPropertyDeleted (dbId) {

    this.loadNodeProperties (dbId, true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setModel (model) {

    const modelId = model.dbModelId ||
      this.options.dbModel._id

    const database = model.database ||
      this.options.database

    const {apiUrl} = this.options

    this.api = new MetaAPI(
      `${apiUrl}/meta/${database}/${modelId}`)

    await this.react.setState({
      api: this.api,
      model
    })

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

      const dbId = selection.dbIdArray[0]

      this.loadNodeProperties(dbId)

    } else {

      const {model} = this.react.getState()

      if (model) {

        const instanceTree = model.getData().instanceTree

        const dbId = instanceTree.getRootId()

        this.loadNodeProperties(dbId)
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getNodeData (dbId) {

    return new Promise((resolve, reject) => {

      const {model} = this.react.getState()

      model.getProperties(dbId, (result) => {

        resolve ({
          externalId: result.externalId,
          component: result.name
        })

      }, (error) => {

        reject(error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async loadNodeProperties (dbId, refresh) {

    const state = this.react.getState()

    if (!refresh && dbId === state.dbId) {
      return
    }

    if (!refresh) {

      await this.react.setState({
        properties: []
      })
    }

    const data = await this.getNodeData(dbId)

    const {model} = this.react.getState()

    const modelProperties =
      await Toolkit.getProperties(
        model, dbId)

    const metaProperties =
      await this.api.getNodeMetaProperties(dbId)

    const properties = this.buildFinalProperties(
      modelProperties, metaProperties)

    await this.react.setState({
      externalId: data.externalId,
      guid: this.guid(),
      properties,
      dbId
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  buildFinalProperties (
    modelProperties, metaProperties) {

    let finalModelProperties = [
      ...modelProperties
    ]

    const finalMetaProperties =
      metaProperties.filter((metaProperty) => {

        if (metaProperty.isOverride) {

          const entries = finalModelProperties.entries()

          for (let [idx, modelProperty] of entries) {

            const displayCategory =
              modelProperty.displayCategory || 'Other'

            if (displayCategory ===
                metaProperty.displayCategory &&
                modelProperty.displayName ===
                metaProperty.displayName) {

                finalModelProperties.splice(idx, 1)
                break
            }
          }

          return metaProperty.metaType !== 'DeleteOverride'
        }

        return true
      })

    return [
      ...finalModelProperties,
      ...finalMetaProperties
    ]
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

    event.menu.forEach((entry) => {

      const title = entry.title.toLowerCase()

      if (title === 'show all objects') {

        entry.target = () => {
          Toolkit.isolateFull(
            this.viewer, [], model)
          this.viewer.fitToView()
        }
      }
    })

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
  getFileExt (filename) {

    return filename.split('.').pop(-1)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  buildMetaPayload (metaProperty) {

    switch (metaProperty.metaType) {

      case 'File':

        if (metaProperty.file) {

          const file = metaProperty.file

          const fileExt = this.getFileExt(file.name)

          const fileId =
            `${this.guid('xxxx-xxxx-xxxx')}.${fileExt}`

          const payload = Object.assign({},
            metaProperty, {
              filelink: this.api.apiUrl + `/download/${fileId}`,
              fileId
            })

          const notification = this.options.notify.add({
            title: 'Uploading ' + file.name,
            message: 'progress: 0%',
            dismissible: false,
            status: 'loading',
            dismissAfter: 0,
            position: 'tl'
          })

          this.api.uploadResource(fileId, file, {
            progress: (percent) => {

              notification.message =
                `progress: ${percent.toFixed(2)}%`

              if (percent === 100) {

                notification.title = `${file.name} uploaded!`
                notification.message = `progress: 100%`
                notification.dismissAfter = 5000
                notification.dismissible = true
                notification.status = 'success'
                notification.buttons = [{
                  name: 'OK',
                  primary: true
                }]
              }

              this.options.notify.update(notification)
            }
          })

          window.URL.revokeObjectURL(file.preview)

          delete payload.file

          return payload

        } else {

          // file not changed
          return metaProperty
        }

      default:
        return metaProperty
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  showAddMetaPropertyDlg (dbId) {

    const onClose = async(result) => {

      this.dialogSvc.off('dialog.close', onClose)

      if (result === 'OK') {

        const nodeData = await this.getNodeData(dbId)

        const metaProperty = Object.assign({},
          this.metaPropertyEdits, nodeData, {
            dbId: dbId.toString(),
            id: this.guid()
          })

        const metaPayload = this.buildMetaPayload(
          metaProperty)

        this.addProperty(metaPayload)

        await this.api.addNodeMetaProperty(
          metaPayload)

        this.socketSvc.broadcast (
          'meta.propertyAdded',
          metaPayload)
      }
    }

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      className: 'meta-property-dlg',
      title: 'Add Meta Property ...',
      disableOK: true,
      open: true,
      content:
        <AddMetaProperty
          disableOK={this.dialogSvc.disableOK}
          onChanged={this.onMetaChanged}
        />
    }, true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  addProperty (metaProperty) {

    const {properties} = this.react.getState()

    this.react.setState({
      properties: [...properties, metaProperty],
      guid: this.guid()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMetaChanged (metaPropertyEdits) {

    this.metaPropertyEdits = metaPropertyEdits
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onEditProperty (metaProperty, isModelOverride) {

    return new Promise ((resolve) => {

      const onClose = async(result) => {

        this.dialogSvc.off('dialog.close', onClose)

        if (result === 'OK') {

          const newMetaProperty = Object.assign({},
            metaProperty, this.metaPropertyEdits,
            isModelOverride ? {
              isOverride: true
            }:{})

          const newMetaPayload = this.buildMetaPayload(
            newMetaProperty)

          resolve (newMetaPayload)

          this.editProperty (newMetaPayload,
            isModelOverride)

          if (isModelOverride) {

            await this.api.addNodeMetaProperty(
              newMetaPayload)

          } else {

            if ((newMetaProperty.metaType !=='File' ||
                 newMetaProperty.file) &&
                 metaProperty.fileId) {

              this.api.deleteResource(metaProperty.fileId)
            }

            await this.api.updateNodeMetaProperty(
              newMetaPayload)
          }

          this.socketSvc.broadcast (
            'meta.propertyUpdated',
            newMetaPayload)

        } else {

          resolve (false)
        }
      }

      this.dialogSvc.on('dialog.close', onClose)

      this.metaPropertyEdits = {}

      const dlgProps = Object.assign({}, metaProperty, {
        disableName: metaProperty.isOverride || isModelOverride,
        disableOK: this.dialogSvc.disableOK,
        onChanged: this.onMetaChanged,
        disableCategory: true
      })

      const override =
        (metaProperty.isOverride || isModelOverride)
          ? '[Override] '
          : ''

      this.dialogSvc.setState({
        title: `Edit Meta Property ${override}...`,
        content: <AddMetaProperty {...dlgProps}/>,
        className: 'meta-property-dlg',
        disableOK: true,
        open: true
      }, true)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  editProperty (metaProperty, isNewOverride) {

    const {properties} = this.react.getState()

    if (isNewOverride) {

      const entries = properties.entries()

      for (let [idx, prop] of entries) {

        if (prop.displayCategory ===
            metaProperty.displayCategory &&
            prop.displayName ===
            metaProperty.displayName) {

          properties.splice(idx, 1)

          this.react.setState({
            properties: [
              ...properties, metaProperty
            ]
          })

          break
        }
      }

    } else {

      this.react.setState({
        properties: [
            ...properties.filter((prop) => {
            return prop.id !== metaProperty.id
          }), metaProperty
        ]
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onDeleteProperty (metaProperty, isModelOverride) {

    return new Promise ((resolve) => {

      const onClose = async(result) => {

        this.dialogSvc.off('dialog.close', onClose)

        if (result === 'OK') {

          if (isModelOverride) {

            const metaPayload = Object.assign({},
              metaProperty, {
                metaType: 'DeleteOverride',
                isOverride: true
              })

            this.deleteProperty (metaPayload, true)

            await this.api.addNodeMetaProperty(
              metaPayload)

          } else {

            // deleting an override is like creating a
            // DeleteOverride ...

            if (metaProperty.isOverride) {

              const metaPayload = Object.assign({},
                metaProperty, {
                  metaType: 'DeleteOverride'
                })

              this.deleteProperty (metaPayload)

              await this.api.updateNodeMetaProperty(
                metaPayload)

            } else {

              this.deleteProperty (metaProperty)

              await this.api.deleteNodeMetaProperty(
                metaProperty.id)
            }
          }

          this.socketSvc.broadcast (
            'meta.propertyDeleted',
            metaProperty.dbId)

          return resolve (metaProperty)

        } else {

          resolve (null)
        }
      }

      this.dialogSvc.on('dialog.close', onClose)

      const msg = DOMPurify.sanitize(
        `Are you sure you want to delete ` +
        `<b>${metaProperty.displayName}</b> ?`)

      const override =
        (metaProperty.isOverride || isModelOverride)
          ? '[Override] '
          : ''

      this.dialogSvc.setState({
        title: `Delete Property ${override}...`,
        content:
          <div dangerouslySetInnerHTML={{
              __html: msg
            }}
          />,
        open: true
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  deleteProperty (metaProperty, isNewOverride) {

    const {properties} = this.react.getState()

    if (isNewOverride) {

      const entries = properties.entries()

      for (let [idx, prop] of entries) {

        if (prop.displayCategory ===
            metaProperty.displayCategory &&
            prop.displayName ===
            metaProperty.displayName) {

            properties.splice(idx, 1)

            this.react.setState({
              properties
            })

            break
        }
      }

    } else {

      this.react.setState({
        properties: properties.filter((prop) => {
          return prop.id !== metaProperty.id
        })
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  deleteAllProperties (dbId) {

    return new Promise ((resolve) => {

      const onClose = async(result) => {

        this.dialogSvc.off('dialog.close', onClose)

        if (result === 'OK') {

          resolve (true)

          await this.api.deleteNodeMetaProperties(dbId)

          this.loadNodeProperties(dbId, true)

          this.socketSvc.broadcast (
            'meta.propertyDeleted', dbId)

        } else {

          resolve (false)
        }
      }

      this.dialogSvc.on('dialog.close', onClose)

      const {model} = this.react.getState()

      const instanceTree = model.getData().instanceTree

      const nodeName = instanceTree.getNodeName(dbId)

      const msg = DOMPurify.sanitize(
        'Are you sure you want to delete all ' +
        'custom properties on ' +
        `<br/><b>${nodeName}</b> ?`)

      this.dialogSvc.setState({
        title: `Delete Component Properties ...`,
        content:
          <div dangerouslySetInnerHTML={{
            __html: msg
            }}
          />,
        open: true
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSearch () {

    const {search} = this.react.getState()

    this.react.setState({
      search: !search
    })
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
        className: this.className,
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

    const {dbId, search} = this.react.getState()

    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className="title">
        <label>
          Meta Properties
        </label>
        <div className="meta-properties-controls">
          <button className={search ? 'active':''}
            onClick={this.onSearch}
            title="Search MetaProperties">
            <span className="fa fa-search" style={{
              position: 'relative',
              top: '-1px'
            }}/>
          </button>
          <OverlayTrigger trigger="click"
            overlay={this.renderPopover()}
            placement="left"
            rootClose>
            <button title="Export MetaProperties">
              <span className="fa fa-cloud-download"/>
            </button>
          </OverlayTrigger>
          <button onClick={() => this.showAddMetaPropertyDlg(dbId)}
            title="Add new MetaProperty on component">
            <span className="fa fa-plus"/>
          </button>
          <button onClick={() => this.deleteAllProperties(dbId)}
            title="Delete all MetaProperties on component">
            <span className="fa fa-close" style={{
              position: 'relative',
              top: '-1px'
            }}/>
          </button>
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
  renderTreeView (properties) {

    const {guid, model, dbId, externalId} =
      this.react.getState()

    const instanceTree = model.getData().instanceTree

    const rootName = instanceTree.getNodeName(dbId)

    return (
      <MetaTreeView
        onDeleteModelProperty={this.onDeleteModelProperty}
        onEditModelProperty={this.onEditModelProperty}
        menuContainer={this.options.appContainer}
        onDeleteProperty={this.onDeleteProperty}
        onEditProperty={this.onEditProperty}
        properties={properties}
        externalId={externalId}
        displayName={rootName}
        model={model}
        dbId={dbId}
        guid={guid}
      />
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderPopover () {

    return (
      <Popover  className={`${this.className} exports`}
        title="Meta Exports"
        id="exports-popover" >
        <button
          onClick={() => {
            this.api.exportProperties('json')
          }}
          title=".json export">
          <span className="fa fa-cloud-download"/>
          <label>
            MetaProperties.json
          </label>
        </button>
        <button
          onClick={() => {
            this.api.exportProperties('csv')
          }}
          title=".csv export">
          <span className="fa fa-cloud-download"/>
          <label>
            MetaProperties.csv
          </label>
        </button>
      </Popover>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {api, model, properties, search} =
      this.react.getState()

    return (
      <div className="content">
        <ReflexContainer orientation='horizontal'>
            <ReflexElement>
              <ReactLoader show={!properties.length}/>
              {
                properties.length &&
                this.renderTreeView(properties)
              }
            </ReflexElement>
            {
              search &&
              <ReflexSplitter/>
            }
            {
              search &&
              <ReflexElement
                propagateDimensions={true}
                renderOnResize={true}
                minSize={40}>
                <Search viewer={this.viewer}
                  model={model}
                  api={api}
                />
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
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>
        { this.renderContent () }
      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  MetaPropertiesExtension.ExtensionId,
  MetaPropertiesExtension)

export default 'Viewing.Extension.MetaProperties'
