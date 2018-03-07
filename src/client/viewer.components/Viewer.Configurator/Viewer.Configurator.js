import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import ViewingApplication from 'Viewer.ViewingApplication'
import { ReactLoader, Loader } from 'Loader'
import BaseComponent from 'BaseComponent'
import autobind from 'autobind-decorator'
import ServiceManager from 'SvcManager'
import './Viewer.Configurator.scss'
import PropTypes from 'prop-types'
import Stopwatch from 'Stopwatch'
import ReactDOM from 'react-dom'
import merge from 'lodash/merge'
import find from 'lodash/find'
import easing from 'easing-js'
import Viewer from 'Viewer'
import Panel from 'Panel'
import React from 'react'

import { intlShape } from 'react-intl'

class ViewerConfigurator extends BaseComponent {

  static contextTypes = {
    intl: intlShape
  }

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
  constructor(props, context) {

    super(props, context)

    this.notifySvc = ServiceManager.getService(
      'NotifySvc')

    this.eventSvc = ServiceManager.getService(
      'EventSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.state = {
      dataExtension: null,
      viewerPanels: [],
      viewerFlex: 1.0,
      resizing: false,
      dbModel: null
    }

    this.viewerFlex = 1.0
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentDidMount () {

    try {

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

        Autodesk.Viewing.Private.memoryOptimizedSvfLoading = true
      }

      this.assignState({
        dbModel
      })

      window.addEventListener(
        'resize', this.onStopResize)

      window.addEventListener(
        'resize', this.onResize)

    } catch (ex) {

      return this.props.onError(ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    window.removeEventListener(
      'resize', this.onStopResize)

    window.removeEventListener(
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
        ? 'urn:' + urn : urn

      Autodesk.Viewing.Document.load(paramUrn, (doc) => {

        resolve (doc)

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Return viewable path: first 3d or 2d item by default
  //
  /////////////////////////////////////////////////////////
  @autobind
  getViewablePath (doc, pathIdx = 0, query = [
      { type: 'geometry', role: '3d' },
      { type: 'geometry', role: '2d' }
    ]) {

    const toArray = (obj) => {

      return obj ? (Array.isArray(obj) ? obj : [obj]) : []
    }

    const rootItem = doc.getRootItem()

    let items = []

    toArray(query).forEach((queryItem) => {

      items = [ ...items,
        ...Autodesk.Viewing.Document.getSubItemsWithProperties(
          rootItem, queryItem, true) ]
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

        const extState = {
          [extension.id]: {}
        }

        this.assignState(extState).then(() => {

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
  @autobind
  pushRenderExtension (extension) {

    return new Promise (async(resolve) => {

      const layout = this.state.dbModel.layout

      this.viewerFlex = layout
        ? 1.0 - (layout.leftFlex || layout.rightFlex || 0.3)
        : 1.0

      await this.assignState({
        paneExtStyle: { display: 'block' }
      })

      await this.runAnimation (
        1.0, this.viewerFlex, 1.0)

      setTimeout(() => {

        this.assignState({
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
  @autobind
  popRenderExtension () {

    return new Promise ((resolve) => {

      this.assignState({
        renderExtension: null
      }).then(() => {
        resolve ()
      })

      setTimeout(async() => {

        await this.runAnimation(
          this.viewerFlex, 1.0, 1.0)

        await this.assignState({
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
  @autobind
  pushViewerPanel (viewer) {

    return (renderable, opts = {}) => {

      const nbPanels = this.state.viewerPanels.length

      const panelId = renderable.id

      const props = Object.assign({
          left: 10 + 50 * nbPanels,
          top: 10 + 55 * nbPanels
        }, opts, {
        container: viewer.container,
        id: panelId,
        renderable,
        react: {
          setState: (state) => {

            return new Promise((resolve) => {

              const panelState = this.state[panelId] || {}

              const newPanelState = {
                [panelId]: Object.assign({},
                  panelState, state)
              }

              this.assignState(newPanelState).then(() => {

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

        this.assignState({
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
  @autobind
  popViewerPanel (panelId) {

    return new Promise ((resolve) => {

      const targetPanel = find(this.state.viewerPanels, {
        id: panelId
      })

      targetPanel
        ? targetPanel.destroy().then(() => {

        const viewerPanels =
          this.state.viewerPanels.filter((panel) => {
            return (panel.id !== panelId)
          })

          this.assignState({
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
  setupDynamicExtensions (viewer) {

    const ctrlGroup = this.createToolbar (viewer)

    const defaultOptions = {
      setNavbarState: this.props.setNavbarState,
      appContainer: ReactDOM.findDOMNode(this),
      getViewablePath: this.getViewablePath,
      loadDocument: this.loadDocument,
      model:this.state.dbModel.model,
      database: this.props.database,
      location: this.props.location,
      appState: this.props.appState,
      dbModel: this.state.dbModel,
      parentControl: ctrlGroup,
      notify: this.notifySvc,
      loader: this.loader,
      apiUrl: '/api'
    }

    const createDefaultOptions = (id) => {

      const fullDefaultOptions = Object.assign({},
        defaultOptions, {
          react: {
            formatMessage: this.context.intl.formatMessage,

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
            setState: (state, doMerge) => {

              return new Promise ((resolve) => {

                const extState = this.state[id] || {}

                const newExtState = {
                  [id]: doMerge
                    ? merge({}, extState, state)
                    : Object.assign({}, extState, state)
                }

                this.assignState(newExtState).then(() => {

                  resolve (newExtState)
                })
              })
            },
            props: this.props
          }
        })

      return fullDefaultOptions
    }

    viewer.loadDynamicExtension = (id, options = {}) => {

      const fullOptions = merge ({},
        createDefaultOptions(id), {
          viewerDocument: this.viewerDocument,
          eventSink: this.eventSvc
        },
        options)

      return this.loadDynamicExtension (
        viewer, {id}, fullOptions)
    }

    const extensions =
      this.state.dbModel.dynamicExtensions || []

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

        this.assignState({
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
  buildTransform (transform = {}) {

    const matrix = new THREE.Matrix4()

    const position = new THREE.Vector3()

    position.fromArray(transform.position || [0,0,0])

    const euler = new THREE.Euler(
      0,0,0, 'XYZ')

    euler.fromArray(transform.euler || [0,0,0])

    const quaternion = new THREE.Quaternion()

    quaternion.setFromEuler(euler)

    const scale = new THREE.Vector3()

    scale.fromArray(transform.scale || [1,1,1])

    matrix.compose(
      position,
      quaternion,
      scale)

    return matrix
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onModelRootLoaded (event) {

    const viewer = event.target

    viewer.removeEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT,
      this.onModelRootLoaded)

    const nav = viewer.navigation

    nav.toPerspective()

    viewer.autocam.setHomeViewFrom(
      nav.getCamera())
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onGeometryLoaded (event) {

    const viewer = event.target

    viewer.removeEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT,
      this.onGeometryLoaded)

    setTimeout(() => {
      if (viewer.viewCubeUi) {
        viewer.showViewCubeTriad(true)
      }
    }, 2000)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (viewer, modelInfo) {

    try {

      const {appState, showLoader} = this.props

      this.loader = new Loader(viewer.container)

      this.loader.show(showLoader)

      if (this.props.onViewerCreated) {

        this.props.onViewerCreated(
          viewer, this.loader)
      }

      viewer.setTheme(appState.storage.theme.viewer.theme)

      viewer.start()

      viewer.addEventListener(
        Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT,
        this.onModelRootLoaded)

      viewer.addEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        this.onGeometryLoaded)

      viewer.prefs.tag('ignore-producer')

      const viewerTheme = appState.storage.theme.viewer

      viewer.setLightPreset(viewerTheme.lightPreset)

      const bgClr = viewerTheme.backgroundColor

      viewer.setBackgroundColor(
        bgClr[0], bgClr[1], bgClr[2],
        bgClr[3], bgClr[4], bgClr[5])

      await this.setupDynamicExtensions (viewer)

      if (modelInfo) {

        const lmvProxy =
          modelInfo.proxy || 'lmv-proxy-2legged'

        Autodesk.Viewing.endpoint.setEndpointAndApi(
          `${window.location.origin}/${lmvProxy}`,
          'modelDerivativeV2')

        switch (this.state.dbModel.env) {

          case 'Local':

            const localOptions = {
              placementTransform: this.buildTransform(
                modelInfo.transform)
            }

            viewer.loadModel(modelInfo.path, localOptions, (model) => {

              model.name = modelInfo.displayName || modelInfo.name
              model.dbModelId = this.state.dbModel._id
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

            const query = modelInfo.query || [
              { type: 'geometry', role: '3d' },
              { type: 'geometry', role: '2d' }
            ]

            const path = this.getViewablePath(
              this.viewerDocument,
              modelInfo.pathIndex || 0,
              query)

            const loadOptions = {
              sharedPropertyDbPath:
                this.viewerDocument.getPropertyDbPath(),
              placementTransform: this.buildTransform(
                modelInfo.transform)
            }

            viewer.loadModel(path, loadOptions, (model) => {

              model.name = modelInfo.displayName || modelInfo.name
              model.dbModelId = this.state.dbModel._id
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

  ////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onViewingApplicationCreated (viewingApp) {


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

    const {resizing} = this.state

    const viewerStyle = {
      pointerEvents: resizing
        ? 'none'
        : 'all'
    }

    return (
      <Viewer onViewerCreated={(viewer) => {
          this.onViewerCreated(viewer, modelInfo)
        }}
        panels= {this.state.viewerPanels}
        style={viewerStyle}
      />
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onViewerStartResize (e) {

    this.assignState({
      resizing: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onViewerStopResize (e) {

    this.viewerFlex = e.component.props.flex

    if (this.state.renderExtension) {

      if (this.state.renderExtension.onStopResize) {

        this.state.renderExtension.onStopResize()
      }
    }

    this.assignState({
      resizing: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onStopResize (e) {

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
  @autobind
  onResize (event) {

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

    switch (layout ? layout.type : 'none') {

      case 'flexLayoutLeft':
        return (
          <ReflexContainer className="configurator"
            key="configurator" orientation='vertical'>
            <ReflexElement style={paneExtStyle}>
              {this.renderExtension()}
            </ReflexElement>
            <ReflexSplitter
              onStopResize={() => this.forceUpdate()}
              style={paneExtStyle}
            />
            <ReflexElement
              onStartResize={this.onViewerStartResize}
              onStopResize={this.onViewerStopResize}
              propagateDimensions={true}
              onResize={this.onResize}
              flex={viewerFlex}>
              {this.renderModel(modelInfo)}
            </ReflexElement>
          </ReflexContainer>
        )

      case 'flexLayoutRight':
        return (
          <ReflexContainer className="configurator"
            key="configurator" orientation='vertical'>
            <ReflexElement
              onStartResize={this.onViewerStartResize}
              onStopResize={this.onViewerStopResize}
              propagateDimensions={true}
              onResize={this.onResize}
              flex={viewerFlex}>
              {this.renderModel(modelInfo)}
            </ReflexElement>
            <ReflexSplitter
              onStopResize={() => this.forceUpdate()}
              style={paneExtStyle}
            />
            <ReflexElement style={paneExtStyle}>
              {this.renderExtension()}
            </ReflexElement>
          </ReflexContainer>
        )

      case 'none':
      default:
        return this.renderModel(modelInfo)
    }
  }
}

export default ViewerConfigurator















































