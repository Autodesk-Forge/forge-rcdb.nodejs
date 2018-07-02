/////////////////////////////////////////////////////////
// Viewing.Extension.ModelLoader
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import ContentEditable from 'react-contenteditable'
import './Viewing.Extension.ModelLoader.scss'
import WidgetContainer from 'WidgetContainer'
import ServiceManager from 'SvcManager'
import { ReactLoader } from 'Loader'
import Toolkit from 'Viewer.Toolkit'
import sortBy from 'lodash/sortBy'
import DOMPurify from 'dompurify'
import ReactDOM from 'react-dom'
import Image from 'Image'
import Label from 'Label'
import React from 'react'
import {
  DropdownButton,
  MenuItem
} from 'react-bootstrap'

class ModelLoaderExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onContextMenu = this.onContextMenu.bind(this)
    this.renderTitle = this.renderTitle.bind(this)

    this.dialogSvc =
      ServiceManager.getService('DialogSvc')

    this.modelSvc =
      ServiceManager.getService('ModelSvc')

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'model-loader'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ModelLoader'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    if (!this.viewer.model) {

      this.viewer.container.classList.add('empty')

      if (this.options.loader) {

        this.options.loader.show(false)
      }
    }

    const models = this.models

    const activeModel = models.length
      ? models[0]
      : null

    this.firstFileType = activeModel
      ? this.getFileType(activeModel.urn)
      : null

    this.react.setState({

      activeModel,
      models

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    const transformerReactOptions = {
      pushRenderExtension: () => {
        return Promise.resolve()
      },
      popRenderExtension: () => {
        return Promise.resolve()
      }
    }

    const transformerOptions = Object.assign({}, {
        react: transformerReactOptions,
        fullTransform : true,
        hideControls : true
      }, this.options.transformer)

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ModelTransformer',
      transformerOptions).then((modelTransformer) => {

        this.react.setState({
          modelTransformer
        })

        if (activeModel) {

          modelTransformer.setModel(
            activeModel)
        }
      })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu').then(
      (ctxMenuExtension) => {
        ctxMenuExtension.addHandler(
          this.onContextMenu)
      })

    console.log('Viewing.Extension.ModelLoader loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onContextMenu (event) {

    if (event.model) {

      event.menu.push({
        title: 'Unload model ...',
        target: () => {

          this.unloadModel ()
        }
      })
    }
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.ModelLoader unloaded')

    this.viewer.unloadExtension(
      'Viewing.Extension.ModelTransformer')

    this.react.popViewerPanel(this)

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  scaleModel (model, scale) {

    const fragCount = model.getFragmentList().
      fragments.fragId2dbId.length

    //fragIds range from 0 to fragCount-1
    for (var fragId = 0; fragId < fragCount; ++fragId) {

      const fragProxy =
        this.viewer.impl.getFragmentProxy(
          model, fragId)

      fragProxy.getAnimTransform()

      fragProxy.scale = new THREE.Vector3(
        scale, scale, scale)

      fragProxy.updateAnimTransform()
    }

    this.viewer.impl.sceneUpdated(true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelCompletedLoad (event) {

    const model = event.model

    const modelScale = model.getUnitScale()

    this.refScale = this.refScale || modelScale

    if (modelScale !== this.refScale) {

      this.scaleModel(model, modelScale/this.refScale)
    }
  }

  /////////////////////////////////////////////////////////
  // Displays model selection popup dialog
  //
  /////////////////////////////////////////////////////////
  showModelDlg () {

    this.dialogSvc.setState({
      className: 'model-loader-dlg',
      title: 'Select Model ...',
      showOK: false,
      search: '',
      content:
        <div>
          <ReactLoader show={true}/>
        </div>,
      open: true
    })

    this.modelSvc.getModels(this.options.database).then(
      (models) => {

        const dbModelsByName =
          sortBy(models, (model) => {
            return model.name
          })

        this.dialogSvc.setState({
          dbModels: dbModelsByName,
          open: true
        }, true)

        this.setDlgItems (dbModelsByName)
      })
  }

  /////////////////////////////////////////////////////////
  // Get file type by base64 decoding the model URN
  //
  /////////////////////////////////////////////////////////
  getFileType (urn) {

    return window.atob(urn).split(".").pop(-1)
  }

  /////////////////////////////////////////////////////////
  // Loads a model based on database info
  // For testing purpose also supports
  // loading models offline
  // See for more details: http://autode.sk/2qsKxx8
  //
  /////////////////////////////////////////////////////////
  loadModel (dbModel) {

    return new Promise(async(resolve) => {

      this.options.loader.show(true)

      const fileType =
        dbModel.fileType ||
        this.getFileType(dbModel.model.urn)

      const loadOptions = {
        placementTransform:
          this.buildPlacementTransform(fileType)
      }

      switch (dbModel.env) {

        case 'AutodeskProduction':

          const lmvProxy =
            dbModel.model.proxy || 'lmv-proxy-2legged'

          Autodesk.Viewing.endpoint.setEndpointAndApi(
            `${window.location.origin}/${lmvProxy}`,
            'derivativeV2')

          const doc = await Toolkit.loadDocument(
            dbModel.model.urn)

          const items = Toolkit.getViewableItems(doc)

          if (items.length) {

            const path = doc.getViewablePath(items[0])

            this.viewer.loadModel(path, loadOptions,
              (model) => {

                model.database =
                  dbModel.database || this.options.database
                model.dbModelId = dbModel._id
                model.urn = dbModel.model.urn
                model.name = dbModel.name
                model.guid = this.guid()
                model.proxy = lmvProxy

                this.eventSink.emit('model.loaded', {
                  model
                })

                resolve (model)
              })
          }

          break

        case 'Local':

          const path = dbModel.model.path

          this.viewer.loadModel(path, loadOptions,
            (model) => {

              model.database = this.options.database
              model.dbModelId = dbModel._id
              model.urn = dbModel.model.urn
              model.name = dbModel.name
              model.guid = this.guid()

              this.eventSink.emit('model.loaded', {
                model
              })

              resolve (model)
            })

          break
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Unload model upon user request
  //
  /////////////////////////////////////////////////////////
  async unloadModel () {

    const {activeModel, models} = this.react.getState()

    const onClose = async(result) => {

      if (result === 'OK') {

        const filteredModels = models.filter((model) => {
          return model.guid !== activeModel.guid
        })

        if (!filteredModels.length) {

          this.viewer.container.classList.add('empty')

          this.firstFileType = null
        }

        await this.react.setState({
          models: filteredModels
        })

        const nextActiveModel = filteredModels.length
            ? filteredModels[0]
            : null

        this.eventSink.emit('model.unloaded', {
          model: activeModel
        })

        this.viewer.impl.unloadModel(activeModel)

        await this.setActiveModel(nextActiveModel, {
          source: 'model.unloaded'
        })
      }

      this.dialogSvc.off('dialog.close', onClose)
    }

    const msg = DOMPurify.sanitize(
      `Are you sure you want to unload`
      + `<b><br/>${activeModel.name}</b> ?`)

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      className: 'model-loader-unload-dlg',
      title: 'Unload Model ...',
      content:
        <div dangerouslySetInnerHTML={{__html: msg}}>
        </div>,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  // .rvt and .nwc files are z-oriented, whereas other
  // file formats are y-oriented.
  // Depending what file type was the initial model,
  // we need to adjust the subsequent loaded models
  //
  /////////////////////////////////////////////////////////
  buildPlacementTransform (fileType) {

    this.firstFileType = this.firstFileType || fileType

    const placementTransform = new THREE.Matrix4()

    // those file type have different orientation
    // than other, so need to correct it
    // upon insertion
    const zOriented = ['rvt', 'nwc']

    if (zOriented.indexOf(this.firstFileType) > -1) {

      if (zOriented.indexOf(fileType) < 0) {

        placementTransform.makeRotationX(
          90 * Math.PI/180)
      }

    } else {

      if(zOriented.indexOf(fileType) > -1) {

        placementTransform.makeRotationX(
          -90 * Math.PI/180)
      }
    }

    return placementTransform
  }

  /////////////////////////////////////////////////////////
  // Fit whole model to view
  //
  /////////////////////////////////////////////////////////
  fitModelToView (model) {

    const instanceTree = model.getData().instanceTree

    if (instanceTree) {

      const rootId = instanceTree.getRootId()

      this.viewer.fitToView([rootId], model)
    }
  }

  /////////////////////////////////////////////////////////
  // ModelBeginLoad event
  //
  /////////////////////////////////////////////////////////
  onModelBeginLoad (event) {

    const {models} = this.react.getState()

    const model = event.model

    this.react.setState({
      models: [...models, model]
    })

    this.setActiveModel (model, {
      source: 'model.loaded',
      fitToView: true
    })

    this.firstFileType = this.firstFileType ||
      this.getFileType(model.urn)
  }

  /////////////////////////////////////////////////////////
  // ModelRootLoaded event
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded (event) {

    this.viewer.container.classList.remove('empty')

    this.options.loader.show(false)
  }

  /////////////////////////////////////////////////////////
  // Model Selected event
  //
  /////////////////////////////////////////////////////////
  onSelection (event) {

    if (event.selections && event.selections.length) {

      const selection = event.selections[0]

      const model = selection.model

      this.setActiveModel (model, {
        source: 'model.selected'
      })

      this.eventSink.emit('model.selected', {
        model
      })
    }
  }

  /////////////////////////////////////////////////////////
  // Set model as active
  //
  /////////////////////////////////////////////////////////
  async setActiveModel (model, params = {}) {

    const activeGuid = this.viewer.activeModel
      ? this.viewer.activeModel.guid
      : null

    this.viewer.activeModel = model

    if (params.fitToView) {

      this.fitModelToView (model)
    }

    await this.react.setState({
      activeModel: model
    })

    if (model) {

      //this.setStructure(model)

      if (model.guid !== activeGuid) {

        this.eventSink.emit('model.activated', {
          source: params.source,
          model
        })
      }
    }
  }

  /////////////////////////////////////////////////////////
  // Fixing the model structure browser to show active
  // model structure
  //
  /////////////////////////////////////////////////////////
  setStructure (model) {

    const instanceTree = model.getData().instanceTree

    const modelstructure = this.viewer.modelstructure

    if (instanceTree && modelstructure) {

      if (modelstructure.instanceTree !== instanceTree) {

        modelstructure.setModel(instanceTree)
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSearchChanged (e) {

    const search = e.target.value.toLowerCase()

    this.dialogSvc.setState({
      search
    }, true)

    const state = this.dialogSvc.getState()

    const filteredDbModels =
      state.dbModels.filter((dbModel) => {
        return search.length
          ? dbModel.name.toLowerCase().indexOf(search) > -1
          : true
      })

    this.setDlgItems (filteredDbModels)
  }

  /////////////////////////////////////////////////////////
  // Load model items in popup selection dialog
  //
  /////////////////////////////////////////////////////////
  setDlgItems (dbModels) {

    const state = this.dialogSvc.getState()

    const modelDlgItems = dbModels.map((dbModel) => {

      const thumbnailUrl = this.modelSvc.getThumbnailUrl(
        this.options.database, dbModel._id, 200)

      return (
        <div key={dbModel._id} className="model-item"
          onClick={() => {

            this.loadModel(dbModel)

            this.dialogSvc.setState({
              open: false
            })
        }}>
          <Image src={thumbnailUrl}/>
          <Label text= {dbModel.name}/>
        </div>
      )
    })

    this.dialogSvc.setState({
      content:
        <div>
          <ReactLoader show={false}/>
          <ContentEditable
            onChange={(e) => this.onSearchChanged(e)}
            onKeyDown={(e) => this.onKeyDown(e)}
            data-placeholder="Search ..."
            html={state.search}
            className="search"
          />
          <div className="scroller">
            { modelDlgItems }
          </div>
        </div>
    }, true)
  }

  /////////////////////////////////////////////////////////
  // Panel docking mode
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = ModelLoaderExtension.ExtensionId

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
          Model Loader
        </label>
        <div className="model-loader-controls">
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

    const {activeModel, models} = this.react.getState()

    const modelItems = models.map((model, idx) => {
      return (
        <MenuItem eventKey={idx} key={model.guid}
          onClick={() => {

            this.setActiveModel(model, {
              source: 'dropdown',
              fitToView: true
            })
          }}>
          { model.name }
        </MenuItem>
      )
    })

    const modelName = activeModel
      ? activeModel.name
      : ''

    return (
      <div className="controls">

        <div className="row">

          <DropdownButton
            title={"Model: " +  modelName}
            className="sequence-dropdown"
            disabled={!activeModel}
            key="sequence-dropdown"
            id="sequence-dropdown">
           { modelItems }
          </DropdownButton>

          <button onClick={() => this.showModelDlg()}
            title="Load model">
            <span className="fa fa-plus"/>
          </button>

          <button onClick={() => this.unloadModel()}
            disabled={!activeModel}
            title="Unload model">
            <span className="fa fa-times"/>
          </button>

        </div>

      </div>
    )
  }

  /////////////////////////////////////////////////////////
  // React method - render transformer extension UI
  //
  /////////////////////////////////////////////////////////
  renderTransformer () {

    const {modelTransformer} = this.react.getState()

    return modelTransformer
      ? modelTransformer.render({showTitle: false})
      : <div/>
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

        { this.renderControls() }
        { this.renderTransformer() }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ModelLoaderExtension.ExtensionId,
  ModelLoaderExtension)
