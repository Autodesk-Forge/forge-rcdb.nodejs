import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import { ReactLoader, Loader } from 'Loader'
import ServiceManager from 'SvcManager'
import './Viewer.Configurator.scss'
import PropTypes from 'prop-types'
import Stopwatch from 'Stopwatch'
import ReactDOM from 'react-dom'
import easing from 'easing-js'
import Viewer from 'Viewer'
import Panel from 'Panel'
import React from 'react'

class ViewerConfigurator extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    setViewerEnv: PropTypes.func.isRequired,
    database: PropTypes.string.isRequired,
    modelId: PropTypes.string.isRequired,
    appState: PropTypes.object
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.getViewablePath = this.getViewablePath.bind(this)

    this.eventSvc = ServiceManager.getService('EventSvc')

    this.modelSvc = ServiceManager.getService('ModelSvc')

    this.pushRenderExtension =
      this.pushRenderExtension.bind(this)

    this.pushViewerPanel =
      this.pushViewerPanel.bind(this)

    this.popRenderExtension =
      this.popRenderExtension.bind(this)

    this.popViewerPanel =
      this.popViewerPanel.bind(this)

    this.onResize =
      this.onResize.bind(this)

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

    if (!this.props.appState.viewerEnv) {

      const viewerEnv = await this.initialize({
        useConsolidation: true,
        env: dbModel.env
      })

      this.props.setViewerEnv (viewerEnv)

      Autodesk.Viewing.setEndpointAndApi(
        window.location.origin + '/lmv-proxy-2legged',
        'modelDerivativeV2')

      Autodesk.Viewing.Private.memoryOptimizedSvfLoading = true
    }

    this.setReactState({
      dbModel
    })

    window.addEventListener(
      'resize', this.onResize)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    window.addEventListener(
      'resize', this.onResize)
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
        '../../viewer.components/Viewer.Extensions.Dynamic/' +
        extension.id + '/index').then(() => {

        var extState = {}

        extState[extension.id] = {}

        this.setReactState(extState).then(() => {

          viewer.loadExtension (
            extension.id, options).then((extInstance) => {

            this.eventSvc.emit('extension.loaded', {
              extension: extInstance
            })

            return resolve (extInstance)

          }, (err) => {

            reject ('Failed to load extension: ' + extension.id)
          })
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

      this.viewerFlex = layout
        ? 1.0 - (layout.leftFlex || layout.rightFlex || 0.3)
        : 1.0

      await this.setReactState({
        paneExtStyle: { display: 'block' }
      })

      await this.runAnimation (
        1.0, this.viewerFlex, 1.0)

      setTimeout(() => {

        this.setReactState({
          renderExtension: extension
        }).then(() => {

          resolve ()
        })

      }, 250)
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

        await this.runAnimation(
          this.viewerFlex, 1.0, 1.0)

        await this.setReactState({
          paneExtStyle: { display: 'none' }
        })

        resolve ()

      }, 250)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  pushViewerPanel (viewer) {

    return (extension, opts = {}) => {

      const nbPanels = this.state.viewerPanels.length

      const panelId = 'panel-' + extension.id

      const props = Object.assign({
          left: 10 + 50 * nbPanels,
          top: 10 + 55 * nbPanels
        }, opts, {
        container: viewer.container,
        renderable: extension,
        id: panelId,
        react: {
          setState: (state) => {

            return new Promise((resolve) => {

              const panelState = this.state[panelId] || {}

              var newPanelState = {}

              newPanelState[panelId] = Object.assign({},
                panelState, state)

              this.setReactState(newPanelState).then(() => {

                resolve(newPanelState)
              })
            })
          },
          getState: () => {

            return this.state[panelId] || {}
          }
        }
      })

      return new Promise ((resolve) => {

        const panel = new Panel (props)

        this.setReactState({
          viewerPanels: [
            ...this.state.viewerPanels,
            panel
          ]
        }).then(() => {

          resolve (panel)
        })
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  popViewerPanel (extensionId) {

    const targetPanelId = 'panel-' + extensionId

    return new Promise ((resolve) => {

      const targetPanel = _.find(this.state.viewerPanels, {
        id: targetPanelId
      })

      targetPanel
        ? targetPanel.destroy().then(() => {

        const viewerPanels =
          this.state.viewerPanels.filter((panel) => {
            return (panel.id !== targetPanelId)
          })

          this.setReactState({
            viewerPanels
          })
          resolve ()
        })
       : resolve ()
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

            pushViewerPanel:
              this.pushViewerPanel(viewer),

            popRenderExtension:
              this.popRenderExtension,

            popViewerPanel:
              this.popViewerPanel,

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
            }
          }
        })

      return fullDefaultOptions
    }

    viewer.loadDynamicExtension = (id, options = {}) => {

      const fullOptions = _.merge ({},
        createDefaultOptions(id), {
          viewerDocument: this.viewerDocument,
          eventSink: this.eventSvc
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
  animate (period, easing, update) {

    return new Promise((resolve) => {

      const stopwatch = new Stopwatch()

      let elapsed = 0

      const stepFn = () => {

        const dt = stopwatch.getElapsedMs() * 0.001

        elapsed += dt

        if (elapsed < period) {

          const eased = easing(elapsed/period)

          update (eased).then(() => {

            window.requestAnimationFrame(stepFn)
          })

        } else {

          update(1.0)

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
  runAnimation (start, end, animPeriod) {

    const easingFn = (t) => {
      //b: begging value, c: change in value, d: duration
      return easing.easeInOutExpo(t, 0, 1.0, animPeriod * 0.9)
    }

    const update = (eased) => {

      const viewerFlex =
        (1.0 - eased) * start + eased * end

      return new Promise((resolve) => {

        this.setReactState({
          viewerFlex
        }).then(() => resolve())
      })
    }

    return this.animate (
      animPeriod, easingFn, update)
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
  async onViewerCreated (viewer, modelInfo) {

    try {

      this.loader = new Loader(viewer.container)

      viewer.start()

      viewer.prefs.tag('ignore-producer')

      const ctrlGroup = this.createToolbar (viewer)

      const defaultOptions = {
        setNavbarState: this.props.setNavbarState,
        appContainer: ReactDOM.findDOMNode(this),
        getViewablePath: this.getViewablePath,
        loadDocument: this.loadDocument,
        database: this.props.database,
        location: this.props.location,
        appState: this.props.appState,
        dbModel: this.state.dbModel,
        notify: this.props.notify,
        parentControl: ctrlGroup,
        loader: this.loader,
        model: modelInfo,
        apiUrl: `/api`
      }

      const extensions =
        this.state.dbModel.dynamicExtensions || []

      await this.setupDynamicExtensions (
        viewer, extensions, defaultOptions)

      if (modelInfo) {

        switch (this.state.dbModel.env) {

          case 'Local':

            viewer.loadModel(modelInfo.path, {}, (model) => {

              model.dbModelId = this.state.dbModel._id
              model.name = modelInfo.name
              model.urn = modelInfo.urn
              model.guid = this.guid()

              viewer.activeModel = model

              this.eventSvc.emit('model.loaded', {
                model
              })
            })

            break

          case 'AutodeskProduction':

            this.viewerDocument =
              await this.loadDocument(modelInfo.urn)

            const path = this.getViewablePath(
              this.viewerDocument,
              modelInfo.pathIdx || 0,
              modelInfo.role || ['3d', '2d'])

            const options = {
              sharedPropertyDbPath:
                this.viewerDocument.getPropertyDbPath()
            }

            viewer.loadModel(path, options, (model) => {

              model.dbModelId = this.state.dbModel._id
              model.name = modelInfo.name
              model.urn = modelInfo.urn
              model.guid = this.guid()

              viewer.activeModel = model

              this.eventSvc.emit('model.loaded', {
                model
              })
            })

            break
        }
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
  guid (format = 'xxxxxxxxxxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
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
      : <div/>

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
  renderModel (modelInfo) {

    return (
      <Viewer panels= {this.state.viewerPanels}
        onViewerCreated={(viewer) => {
          this.onViewerCreated(viewer, modelInfo)
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

    const modelInfo = dbModel.model

    const layout = dbModel.layout

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
              {this.renderModel(modelInfo)}
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
              {this.renderModel(modelInfo)}
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
        return this.renderModel(modelInfo)
    }
  }
}

export default ViewerConfigurator























































