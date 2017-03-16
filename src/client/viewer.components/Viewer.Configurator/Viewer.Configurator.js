import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import { ReactLoader, Loader } from 'Loader'
import ServiceManager from 'SvcManager'
import './Viewer.Configurator.scss'
import Viewer from 'Viewer'
import React from 'react'

class ViewerConfigurator extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    setViewerEnv: React.PropTypes.func.isRequired,
    database: React.PropTypes.string.isRequired,
    modelId: React.PropTypes.string.isRequired,
    viewerEnv: React.PropTypes.string
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.state = {
      dataExtension: null,
      viewerPanels: [],
      dbModel: null
    }

    this.getViewablePath = this.getViewablePath.bind(this)

    this.modelSvc = ServiceManager.getService('ModelSvc')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentDidMount () {

    this.loader = new Loader(this.loaderContainer)

    const dbModel = await this.modelSvc.getModel(
      this.props.database, this.props.modelId)

    if (!this.props.viewerEnv) {

      const viewerEnv = await this.initialize({
        useConsolidation: true,
        env: dbModel.env
      })

      this.props.setViewerEnv (viewerEnv)

      //2.13
      Autodesk.Viewing.setApiEndpoint(
        window.location.origin + '/lmv-proxy')

      //2.14
      //Autodesk.Viewing.setEndpointAndApi(
      //  window.location.origin + '/lmv-proxy', 'modelDerivativeV2')

      Autodesk.Viewing.Private.memoryOptimizedSvfLoading = true
    }

    this.setState(Object.assign({}, this.state, {
      dbModel
    }))
  }

  /////////////////////////////////////////////////////////
  // Initialize viewer environment
  //
  /////////////////////////////////////////////////////////
  initialize (options) {

    return new Promise((resolve, reject) => {

      Autodesk.Viewing.Initializer (options, () => {

        resolve ()

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Load a document from URN
  //
  /////////////////////////////////////////////////////////
  loadDocument (urn) {

    return new Promise((resolve, reject) => {

      const paramUrn = !urn.startsWith('urn:')
        ? 'urn:' + urn
        : urn

      Autodesk.Viewing.Document.load(paramUrn, (doc) => {

        resolve (doc)

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  toArray (obj) {

    return obj ? (Array.isArray(obj) ? obj : [obj]) : []
  }

  /////////////////////////////////////////////////////////
  // Return viewable path: first 3d or 2d item by default
  //
  /////////////////////////////////////////////////////////
  getViewablePath (doc, pathIdx = 0, roles = ['3d', '2d']) {

    const rootItem = doc.getRootItem()

    let items = []

    this.toArray(roles).forEach((role) => {

      items = [ ...items,
        ...Autodesk.Viewing.Document.getSubItemsWithProperties(
          rootItem, { type: 'geometry', role }, true) ]
    })

    if (!items.length || pathIdx > items.length-1) {

      return null
    }

    return doc.getViewablePath(items[pathIdx])
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadDynamicExtension (viewer, extension, options) {

    return new Promise ((resolve, reject) => {

      var ext = viewer.getExtension(extension.id)

      if (ext) {

        if (ext.reload) {

          ext.reload(options)
        }

        return resolve (ext)
      }

      System.import(
        '../../viewer.components/Viewer.Extensions/' +
        extension.id + '/index').then(() => {

        var extState = {}

        extState[extension.id] = {}

        const newState = Object.assign({},
          this.state, extState)

        this.setState(newState, () => {

          if (viewer.loadExtension (extension.id, options)) {

            const ext = viewer.getExtension (extension.id)

            return resolve (ext)
          }

          reject ('Failed to load extension: ' + extension.id)
        })

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setupDynamicExtensions (viewer, extensions, defaultOptions) {

    const createDefaultOptions = (id) => {

      const fullDefaultOptions = Object.assign({},
        defaultOptions, {
          react: {
            setRenderExtension: (ext) => {

              return new Promise ((resolve) => {
                const newState = Object.assign({},
                  this.state, {
                    renderExtension: ext
                  })

                this.setState(newState, () => {
                  resolve ()
                })
              })
            },
            forceUpdate: () => {

              return new Promise ((resolve) => {
                this.forceUpdate(() => {
                  resolve()
                })
              })
            },
            getComponent: () => {

              return this
            },
            getState: () => {

              return this.state[id] || {}
            },
            setState: (state, merge) => {

              return new Promise ((resolve) => {

                const extState = this.state[id] || {}

                var newExtState = {}

                newExtState[id] = merge
                  ? _.merge({}, extState, state)
                  : Object.assign({}, extState, state)

                const newState = Object.assign({},
                  this.state, newExtState)

                this.setState(newState, () => {

                  resolve (newExtState)
                })
              })
            },
            addViewerPanel: (panel) => {

              return new Promise ((resolve) => {

                const newState = Object.assign({},
                  this.state, {
                    viewerPanels: [
                      ...this.state.viewerPanels,
                      panel
                  ]})

                this.setState(newState, () => {
                  resolve ()
                })
              })
            }
          }
        })

      return fullDefaultOptions
    }

    viewer.loadDynamicExtension = (id, options = {}) => {

      const fullOptions = _.merge ({},
        createDefaultOptions(id), {
          viewerDocument: this.viewerDocument
        },
        options)

      return this.loadDynamicExtension (
        viewer, {id}, fullOptions)
    }

    const extensionTasks = extensions.map(
      (extension) => {

        return viewer.loadDynamicExtension (
          extension.id,
          extension.options)
      })

    return Promise.all (extensionTasks)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (viewer, model) {

    try {

      this.loader = new Loader(viewer.container)

      viewer.start()

      const ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
        'toolbar-forge-configurator')

      var viewerToolbar = viewer.getToolbar (true)

      viewerToolbar.addControl (ctrlGroup)

      const defaultOptions = {
        apiUrl: `/api/models/${this.props.database}`,
        getViewablePath: this.getViewablePath,
        loadDocument: this.loadDocument,
        database: this.props.database,
        dbModel: this.state.dbModel,
        parentControl: ctrlGroup,
        loader: this.loader,
        model: model
      }

      const extensions =
        model.dynamicExtensions ||
        this.state.dbModel.dynamicExtensions || []

      await this.setupDynamicExtensions (
        viewer, extensions, defaultOptions)

      switch (this.state.dbModel.env) {

        case 'Local':

          viewer.loadModel(model.path)

          break

        case 'AutodeskProduction':

          this.viewerDocument =
            await this.loadDocument(model.urn)

          const path = this.getViewablePath(
            this.viewerDocument,
            model.pathIdx || 0,
            model.role || ['3d', '2d'])

          const options = {
            sharedPropertyDbPath:
              this.viewerDocument.getPropertyDbPath()
          }

          viewer.loadModel (path, options)

          break
      }

    } catch(ex) {

      console.log('Viewer Initialization Error: ')
      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  renderLoader () {

    return (
      <div className="configurator-loader"
        ref={ (div) => this.loaderContainer = div }>
      </div>
    )
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  renderExtension () {

    const {renderExtension} = this.state

    const content = renderExtension
      ? this.state.renderExtension.render()
      : <div></div>

    return (
      <div className="data-pane">
        <ReactLoader show={!renderExtension}/>
        { content }
      </div>
    )
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  renderModel (model) {

    return (
      <Viewer panels= {this.state.viewerPanels}
        onViewerCreated={
          (viewer) => this.onViewerCreated(viewer, model)
          }
      />
    )
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onStopResize () {

    if (this.state.renderExtension) {

      if (this.state.renderExtension.onStopResize) {

        this.state.renderExtension.onStopResize()
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onResize () {

    if (this.state.renderExtension) {

      if (this.state.renderExtension.onResize) {

        this.state.renderExtension.onResize()
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render () {

    // dbModel not loaded yet -> render loader

    if (!this.state.dbModel) {

      return this.renderLoader ()
    }

    const { model, layout } = this.state.dbModel

    switch (layout ? layout.type : 'default') {

      case 'flexLayoutLeft':
        return (
          <ReflexContainer className="configurator"
            key="configurator" orientation='vertical'>
            <ReflexElement flex={layout.leftFlex || 0.3}>
              {this.renderExtension()}
            </ReflexElement>
            <ReflexSplitter
              onStopResize={() => this.onStopResize()}
              onResize={() => this.onResize()}
            />
            <ReflexElement propagateDimensions={true}>
              {this.renderModel(model)}
            </ReflexElement>
          </ReflexContainer>
        )

      case 'flexLayoutRight':
        return (
          <ReflexContainer className="configurator"
            key="configurator" orientation='vertical'>
            <ReflexElement propagateDimensions={true}>
              {this.renderModel(model)}
            </ReflexElement>
            <ReflexSplitter
              onStopResize={() => this.onStopResize()}
              onResize={() => this.onResize()}
            />
            <ReflexElement flex={layout.rightFlex || 0.7}>
              {this.renderExtension()}
            </ReflexElement>
          </ReflexContainer>
        )

      default:
        return this.renderModel(model)
    }
  }
}

export default ViewerConfigurator























































