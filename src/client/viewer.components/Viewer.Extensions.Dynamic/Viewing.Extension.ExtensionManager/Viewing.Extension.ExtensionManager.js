/////////////////////////////////////////////////////////
// Viewing.Extension.DualViewer
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////
import './Viewing.Extension.ExtensionManager.scss'
import ExtensionBase from 'Viewer.ExtensionBase'
import ExtensionPane from './ExtensionPane'
import ServiceManager from 'SvcManager'
import PaneManager from 'PaneManager'
import ReactDOM from 'react-dom'
import React from 'react'

class ExtensionManager extends ExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super (viewer, options)

    this.storageSvc = ServiceManager.getService(
      'StorageSvc')

    this.renderTitle = this.renderTitle.bind(this)

    this.render = this.render.bind(this)

    this.reactOpts = {
      pushRenderExtension: (extension) => {

        return new Promise((resolve) => {

          const state = this.react.getState()

          if (!state.renderExtensions.length &&
              !state.visible) {

            this.react.pushRenderExtension(this)
          }

          this.react.setState({
            renderExtensions: [
              ...state.renderExtensions, extension
            ]

          }).then(async() => {

            resolve()

            await this.react.forceUpdate()

            this.onStopResize()
          })
        })
      },
      popRenderExtension: (extensionId) => {

        const state = this.react.getState()

        const renderExtensions =
          state.renderExtensions.filter((ext) => {
            return ext.id !== extensionId
          })

        return new Promise((resolve) => {

          this.react.setState({
            renderExtensions
          }).then(async() => {

            resolve()

            if (!renderExtensions.length &&
                !state.visible) {

              await this.react.popRenderExtension()
            }

            await this.react.forceUpdate()

            this.onStopResize()
          })
        })
      }
    }

    this.eventSink = options.eventSink

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'extension-manager'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ExtensionManager'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.initLoadEvents ()

    this.viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (e) => {

        this.options.loader.hide()
      })

    const extensionsByName = _.sortBy(
      this.options.extensions || [], (ext) => {
        return ext.name
      })

    this.react.setState({

      visible: this.options.visible,
      extensions: extensionsByName,
      renderExtensions: []

    }).then (async() => {

      if (this.options.visible) {

        await this.react.pushRenderExtension(this)
      }

      const extensions = this.options.extensions || []

      const storage = this.storageSvc.load(
        'extension-manager')

      const loadExts = extensions.filter ((extension) => {

        if (this.options.useStorage) {

          const storageExtensions = storage.extensions || []

          extension.enabled = extension.enabled ||
            storageExtensions.includes(extension.id)
        }

        return extension.enabled
      })

      for (const extension of loadExts) {

        await this.loadDynamicExtension(extension)
      }
    })

    console.log('Viewing.Extension.ExtensionManager loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.ExtensionManager unloaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadDynamicExtension (extension) {

    return new Promise((resolve, reject) => {

      const { extensions } = this.react.getState()

      extension.loading = true

      this.react.setState({
        extensions
      })

      const options = Object.assign({},
        extension.options, {
          react: this.reactOpts
        })

      this.viewer.loadDynamicExtension(
        extension.id, options).then((extInstance) => {

          extension.loading = false
          extension.enabled = true

          this.react.setState({
            extensions
          })

          resolve(extInstance)

        }, (error) => {

          reject(error)
        })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  fireModelEvents (extInstance) {

    for (const eventId in this.events) {

      const event = this.events[eventId]

      if (extInstance[event.handler]) {

        extInstance[event.handler](event.args)
      }
    }
  }

  initLoadEvents () {

    this.events = {}

    const events = [
      {
        id: [
          Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT
        ],
        handler: 'onModelFullyLoaded'
      },
      {
        id: Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
        handler: 'onObjectTreeCreated'
      },
      {
        id: Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT,
        handler: 'onModelRootLoaded'
      },
      {
        id: Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        handler: 'onGeometryLoaded'
      }
    ]

    events.forEach((event) => {
      const eventId = event.id.toString()
      this.viewerEvent(event.id).then((args) => {
        this.events[eventId] = {
          handler: event.handler,
          args
        }
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onExtensionItemClicked (extension) {

    if (extension.loading) {

      return
    }

    if (extension.enabled) {

      await this.react.popViewerPanel(extension.id)

      this.viewer.unloadExtension(extension.id)

      const { extensions, renderExtensions } =
        this.react.getState()

      extension.enabled = false

      const renderExts =
        renderExtensions.filter((ext) => {
          return ext.id !== extension.id
        })

      await this.react.setState({
          renderExtensions: renderExts,
          extensions
        })

      this.react.forceUpdate()

      if (this.options.useStorage) {

        this.storageSvc.save(
          'extension-manager', {
            extensions: extensions.filter((ext) => {
              return ext.enabled
            }).map((ext) => {
              return ext.id
            })
          })
      }

    } else {

      const { extensions } = this.react.getState()

      const extInstance =
        await this.loadDynamicExtension (extension)

      if (this.options.useStorage) {

        this.storageSvc.save(
          'extension-manager', {
            extensions: extensions.filter((ext) => {
              return ext.enabled
            }).map((ext) => {
              return ext.id
            })
          })
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStopResize () {

    const { renderExtensions } = this.react.getState()

    renderExtensions.forEach((extension) => {

      if (extension.onStopResize) {

        extension.onStopResize()
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onResize () {

    const { renderExtensions } = this.react.getState()

    renderExtensions.forEach((extension) => {

      if (extension.onResize) {

        extension.onResize()
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Extension Manager
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderExtensions () {

    const { extensions } = this.react.getState()

    return extensions.map((extension) => {

      const className = 'item' +
        (extension.enabled ? ' enabled' : '') +
        (extension.loading ? ' loading' : '')

      return (
        <div key={extension.id} className={className}
           onClick={() => {
            this.onExtensionItemClicked(extension)
          }}>
          <label>
            { extension.name}
          </label>
        </div>
      )
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderExtensionManager () {

    return (
      <ExtensionPane renderTitle={this.renderTitle}
        key={ExtensionManager.ExtensionId}
        className="extension-manager">

        <div className="extension-list">
          { this.renderExtensions() }
        </div>

      </ExtensionPane>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const state = this.react.getState()

    const renderExtensions = _.sortBy(
      state.renderExtensions, (ext) => {
        return ext.options.displayIndex || 0
      })

    const extensionPanes = renderExtensions.map (
      (extension) => {

        return (
          <ExtensionPane
            renderTitle={() => extension.renderTitle(true)}
            onStopResize={(e) => this.onStopResize()}
            onResize={(e) => this.onResize()}
            className={extension.className}
            flex={extension.options.flex}
            key={extension.id}>
            {
              extension.render({
                showTitle: false,
                docked: true
              })
            }
          </ExtensionPane>
        )
      })

    const panes = state.visible
      ? [this.renderExtensionManager(), ...extensionPanes]
      :  extensionPanes

    return (
      <PaneManager orientation="horizontal">
        { panes }
      </PaneManager>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ExtensionManager.ExtensionId,
  ExtensionManager)
