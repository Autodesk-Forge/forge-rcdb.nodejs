/////////////////////////////////////////////////////////
// Viewing.Extension.ModelLoader
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import ContentEditable from 'react-contenteditable'
import ExtensionBase from 'Viewer.ExtensionBase'
import './Viewing.Extension.ModelLoader.scss'
import WidgetContainer from 'WidgetContainer'
import ServiceManager from 'SvcManager'
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

class ModelLoaderExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onSelection = this.onSelection.bind(this)
    this.renderTitle = this.renderTitle.bind(this)

    this.modelSvc =
      ServiceManager.getService('ModelSvc')

    this.dialogSvc =
      ServiceManager.getService('DialogSvc')

    this.eventSink = options.eventSink

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
    }

    if (this.options.loader) {
      this.options.loader.hide()
    }

    this.react.setState({

      activeModel: null,
      models: []

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    const reactOptions = {
      pushRenderExtension: () => {
        return Promise.resolve()
      },
      popRenderExtension: () => {
        return Promise.resolve()
      }
    }

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ModelTransformer', {
        fullTransform: true,
        react: reactOptions

      }).then((modelTransformer) => {

        this.react.setState({
          modelTransformer
        })
      })

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    console.log('Viewing.Extension.ModelLoader loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    this.react.popViewerPanel(this)

    console.log('Viewing.Extension.ModelLoader unloaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
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

        const dbModelsByName = _.sortBy(models, (model) => {
          return model.name
        })

        this.dialogSvc.setState({
          dbModels: dbModelsByName,
          open: true
        }, true)

        this.setDlgItems (dbModelsByName)

        this.batchRequestThumbnails(5)
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadModel (dbModel) {

    return new Promise(async(resolve) => {

      this.viewer.container.classList.remove('empty')

      const fileType =
        window.atob(dbModel.urn).split(".").pop(-1)

      const loadOptions = {
        placementTransform:
          this.buildPlacementTransform(fileType)
      }

      switch (dbModel.env) {

        case 'AutodeskProduction':

          const doc = await Toolkit.loadDocument(dbModel.urn)

          const items = Toolkit.getViewableItems(doc)

          if (items.length) {

            const path = doc.getViewablePath(items[0])

            this.viewer.loadModel(path, loadOptions,
              (model) => {

                model.dbModelId = dbModel._id
                model.name = dbModel.name
                model.guid = this.guid()

                resolve (model)
              })
          }

          break

        case 'Local':

          this.viewer.loadModel(dbModel.path, loadOptions,
            (model) => {

              model.dbModelId = dbModel._id
              model.name = dbModel.name
              model.guid = this.guid()

              resolve (model)
            })

          break
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
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
        }

        await this.react.setState({
          models: filteredModels
        })

        const nextActiveModel = filteredModels.length
            ? filteredModels[0]
            : null

        await this.setActiveModel(nextActiveModel, {
          source: 'model.unloaded'
        })

        this.eventSink.emit('model.unloaded', {
          model: activeModel
        })

        this.viewer.impl.unloadModel(activeModel)
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
  //
  //
  /////////////////////////////////////////////////////////
  buildPlacementTransform (fileType) {

    const placementTransform = new THREE.Matrix4()

    this.firstFileType = this.firstFileType || fileType

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
  //
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
  //
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
  //
  //
  /////////////////////////////////////////////////////////
  async setActiveModel (model, params = {}) {

    if (params.fitToView) {

      this.fitModelToView (model)
    }

    this.setStructure(model)

    await this.react.setState({
      source: params.source,
      activeModel: model
    })

    this.eventSink.emit('model.activated', {
      source: params.source,
      model
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setStructure (model) {

    const instanceTree = model.getData().instanceTree

    if (instanceTree && this.viewer.modelstructure) {

      this.viewer.modelstructure.setModel(
        instanceTree)
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
  //
  //
  /////////////////////////////////////////////////////////
  setDlgItems (dbModels) {

    const modelDlgItems = dbModels.map((dbModel) => {

      return (
        <div key={dbModel._id} className="model-item"
          onClick={() => {

            this.loadModel(dbModel).then(async(model) => {

              const {models} = this.react.getState()

              const modelsByName =
                _.sortBy([...models, model], (m) => {
                  return m.name
                })

              this.react.setState({
                models: modelsByName
              })

              this.eventSink.emit('model.loaded', {
                model
              })

              await this.setActiveModel (model, {
                source: 'model.loaded',
                fitToView: true
              })
            })

            this.dialogSvc.setState({
              open: false
            })
        }}>
          <img className={dbModel.thumbnail ? "":"default-thumbnail"}
            src={dbModel.thumbnail ? dbModel.thumbnail : ""}/>
          <Label text= {dbModel.name}/>
        </div>
      )
    })

    const state = this.dialogSvc.getState()

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
  //
  //
  /////////////////////////////////////////////////////////
  batchRequestThumbnails (size) {

    const state = this.dialogSvc.getState()

    const chunks = _.chunk(state.dbModels, size)

    chunks.forEach((modelChunk) => {

      const modelIds = modelChunk.map((model) => {
        return model._id
      })

      this.modelSvc.getThumbnails(
        this.options.database, modelIds).then(
          (thumbnails) => {

            const dbModels = state.dbModels.map((model) => {

              const idx = modelIds.indexOf(model._id)

              return (idx < 0
                ? model
                : Object.assign({}, model, {
                  thumbnail: thumbnails[idx]
                }))
            })

            this.dialogSvc.setState({
              dbModels
            }, true)

            this.setDlgItems (dbModels)
          })
    })
  }

  /////////////////////////////////////////////////////////
  //
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
  //
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
  //
  //
  /////////////////////////////////////////////////////////
  renderTransformer () {

    const {modelTransformer} = this.react.getState()

    return modelTransformer
      ? modelTransformer.render({showTitle: false})
      : <div/>
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
        { this.renderTransformer() }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ModelLoaderExtension.ExtensionId,
  ModelLoaderExtension)
