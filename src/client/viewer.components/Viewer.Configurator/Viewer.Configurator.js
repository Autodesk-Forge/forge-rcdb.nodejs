import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import { ReactLoader, Loader } from 'Loader'
import ServiceManager from 'SvcManager'
import './Viewer.Configurator.scss'
import Stopwatch from 'Stopwatch'
import Viewer from 'Viewer'
import Panel from 'Panel'
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

    this.getViewablePath = this.getViewablePath.bind(this)

    this.modelSvc = ServiceManager.getService('ModelSvc')

    this.pushRenderExtension =
      this.pushRenderExtension.bind(this)

    this.popRenderExtension =
      this.popRenderExtension.bind(this)

    this.state = {
      dataExtension: null,
      viewerPanels: [],
      viewerFlex: 1.0,
      dbModel: null
    }

    this.viewerFlex = 1.0
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setReactState (state) {

    return new Promise((resolve) => {

      const newState = Object.assign(
        {}, this.state, state)

      this.setState(newState, () => {
        resolve()
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentDidMount () {

    this.loader = new Loader(this.loaderContainer)

    const dbModel = await this.modelSvc.getModel(
      this.props.database,
      this.props.modelId)

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

    this.setReactState({
      dbModel
    })
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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

        this.setReactState(extState).then(() => {

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
  pushRenderExtension (extension) {

    return new Promise (async(resolve) => {

      const layout = this.state.dbModel.layout

      this.viewerFlex = !layout
        ? 1.0
        : 1.0 - (layout.leftFlex || layout.rightFlex || 0.3)

      const done = (start, end) => {
        return start <= end
      }

      const update = (viewerFlex) => {

        return new Promise((resolve) => {

          this.setReactState({
              viewerFlex
            }).then(() => resolve())
        })
      }

      await this.animate (
        1.0, this.viewerFlex, -0.7,
        done, update)

      await this.setReactState({
          paneExtStyle: {display: 'block'},
          viewerFlex: this.viewerFlex
        })

      setTimeout(() => {

        this.setReactState({
          renderExtension: extension
        }).then(() => {

          resolve ()
        })

      }, 300)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  popRenderExtension () {

    return new Promise ((resolve) => {

      this.setReactState({
        renderExtension: null
      }).then(() => {
        resolve ()
      })

      setTimeout(async() => {

        const done = (start, end) => {
          return start >= end
        }

        const update = (viewerFlex) => {

          return new Promise((resolve) => {

            this.setReactState({
              viewerFlex
            }).then(() => resolve())
          })
        }

        await this.animate (
          this.viewerFlex, 1.0, 0.7,
          done, update)

        await this.setReactState({
          paneExtStyle: { display: 'none' },
          viewerFlex: 1.0
        })

        resolve ()

      }, 300)
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

            pushRenderExtension:
              this.pushRenderExtension,

            popRenderExtension:
              this.popRenderExtension,

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

                this.setReactState(newExtState).then(() => {

                  resolve (newExtState)
                })
              })
            },
            pushViewerPanel: (extension) => {

              return new Promise ((resolve) => {

                const panel = new Panel(extension)

                this.setReactState({
                  viewerPanels: [
                    ...this.state.viewerPanels,
                    panel
                  ]}).then(() => {

                  resolve ()
                })
              })
            },
            popViewerPanel: (extensionId) => {

              return new Promise ((resolve) => {

                this.setReactState({
                  viewerPanels:
                    this.state.viewerPanels.filter((panel) => {
                      return panel.id !==  extensionId
                    })
                }).then(() => {
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
  animate (start, end, speed, done, fn) {

    return new Promise((resolve) => {

      const stopwatch = new Stopwatch()

      const stepFn = () => {

        const dt = stopwatch.getElapsedMs() * 0.001

        if (!done(start, end)) {

          fn (start += speed * dt).then(() => {

            window.requestAnimationFrame(stepFn)
          })

        } else {

          resolve()
        }
      }

      stepFn ()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createToolbar (viewer) {

    let toolbarContainer = document.createElement('div')

    toolbarContainer.className = 'configurator-toolbar'

    viewer.container.appendChild(toolbarContainer)

    const toolbar = new Autodesk.Viewing.UI.ToolBar (true)

    const ctrlGroup =
      new Autodesk.Viewing.UI.ControlGroup(
        'configurator')

    toolbar.addControl(ctrlGroup)

    toolbarContainer.appendChild(
      toolbar.container)

    return ctrlGroup
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (viewer, model) {

    try {

      this.loader = new Loader(viewer.container)

      viewer.start()

      const ctrlGroup = this.createToolbar (viewer)

      const defaultOptions = {
        getViewablePath: this.getViewablePath,
        loadDocument: this.loadDocument,
        database: this.props.database,
        dbModel: this.state.dbModel,
        parentControl: ctrlGroup,
        loader: this.loader,
        apiUrl: `/api`,
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderLoader () {

    return (
      <div className="configurator-loader"
        ref={ (div) => this.loaderContainer = div }>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderExtension () {

    const { renderExtension } = this.state

    const renderOptions = {
      showTitle: true,
      docked: true
    }

    const content = renderExtension
      ? this.state.renderExtension.render(renderOptions)
      : <div></div>

    return (
      <div className="data-pane">
        <ReactLoader show={!renderExtension}/>
        { content }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderModel (model) {

    return (
      <Viewer panels= {this.state.viewerPanels}
        onViewerCreated={(viewer) => {
          this.onViewerCreated(viewer, model)
        }}
      />
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStopResize (e) {

    this.viewerFlex = e.component.props.flex

    if (this.state.renderExtension) {

      if (this.state.renderExtension.onStopResize) {

        this.state.renderExtension.onStopResize()
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onResize () {

    if (this.state.renderExtension) {

      if (this.state.renderExtension.onResize) {

        this.state.renderExtension.onResize()
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const { dbModel, viewerFlex, paneExtStyle } = this.state

    if (!dbModel) {

      // dbModel not loaded yet -> render loader
      return this.renderLoader ()
    }

    const { layout, model } = dbModel

    switch (layout ? layout.type : 'default') {

      case 'flexLayoutLeft':
        return (
          <ReflexContainer className="configurator"
            key="configurator" orientation='vertical'>
            <ReflexElement style={paneExtStyle}>
              {this.renderExtension()}
            </ReflexElement>
            <ReflexSplitter onStopResize={() => this.forceUpdate()}
              style={paneExtStyle}
            />
            <ReflexElement onStopResize={(e) => this.onStopResize(e)}
              onResize={(e) => this.onResize(e)}
              propagateDimensions={true}
              flex={viewerFlex}>
              {this.renderModel(model)}
            </ReflexElement>
          </ReflexContainer>
        )

      case 'flexLayoutRight':
        return (
          <ReflexContainer className="configurator"
            key="configurator" orientation='vertical'>
            <ReflexElement onStopResize={(e) => this.onStopResize(e)}
              onResize={(e) => this.onResize(e)}
              propagateDimensions={true}
              flex={viewerFlex}>
              {this.renderModel(model)}
            </ReflexElement>
            <ReflexSplitter onStopResize={() => this.forceUpdate()}
              style={paneExtStyle}
            />
            <ReflexElement style={paneExtStyle}>
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























































