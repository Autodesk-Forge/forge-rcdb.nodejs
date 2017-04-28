/////////////////////////////////////////////////////////
// Viewing.Extension.DualViewer
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import './Viewing.Extension.DualViewer.scss'
import {ReactLoader as Loader} from 'Loader'
import Toolkit from 'Viewer.Toolkit'
import Viewer from 'Viewer'
import React from 'react'
import {
  DropdownButton,
  MenuItem
} from 'react-bootstrap'

class DualViewerExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super (viewer, options)

    this.onSelectionChanged =
      this.onSelectionChanged.bind(this)

    this.onStopResize =
      this.onStopResize.bind(this)

    this.onResize =
      _.throttle(this.onResize, 100)

    this.renderTitle =
      this.renderTitle.bind(this)

    this.render =
      this.render.bind(this)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'dual-viewer'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.DualViewer'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    window.addEventListener(
      'resize', this.onStopResize)

    this.pathIndex = this.options.defaultPathIndex || 0

    this.react.setState({

      showLoader: true,
      disabled: true,
      activeView: '',
      items: []

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    this.viewer.addEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      this.onSelectionChanged)

    console.log('Viewing.Extension.DualViewer loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    if (this.viewerModel) {

      this.dualViewer.impl.unloadModel(
        this.viewerModel)
    }

    this.viewer.removeEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      this.onSelectionChanged)

    window.removeEventListener(
      'resize', this.onStopResize)

    console.log('Viewing.Extension.DualViewer unloaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (viewer) {

    try {

      this.viewerModel = null

      this.dualViewer = viewer

      this.dualViewer.start()

      this.viewerDocument =
        this.options.viewerDocument ||
        await Toolkit.loadDocument(
          this.options.model.urn)

      const items = Toolkit.getViewableItems(
        this.viewerDocument, '2d')

      if (items.length) {

        await this.react.setState({
          disabled: false,
          items
        })

        this.setActiveView (items[this.pathIndex])

        $('#viewer-dropdown').parent().find('ul').css({
          height: Math.min(
            $('.dual-viewer').height() - 42,
            items.length * 26)
        })

        this.dualViewer.addEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT, (e) => {

            if (!this.selection2Locked) {
              this.selection1Locked = true
              this.viewer.select(e.dbIdArray)
              this.selection1Locked = false
            }
          })
      }

    } catch(ex) {

      console.log('Viewer Initialization Error:')
      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectionChanged (e) {

    if (!this.selection1Locked && this.dualViewer) {
      this.selection2Locked = true
      this.dualViewer.select(e.dbIdArray)
      this.selection2Locked = false
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    const state = this.react.getState()

    const menuItems = state.items.map((item, idx) => {
      return (
        <MenuItem eventKey={idx} key={idx} onClick={() => {

          this.setActiveView (item)

          this.pathIndex = idx
        }}>
          { item.name }
        </MenuItem>
      )
    })

    return (
      <div className="title">
        <label>
        {this.options.title || '2D View'}
        </label>

        <DropdownButton
          title={"View: " + state.activeView }
          disabled={state.disabled}
          key={"viewer-dropdown"}
          id="viewer-dropdown">
         { menuItems }
        </DropdownButton>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setActiveView (item) {

    await this.react.setState({
      activeView: item.name,
      showLoader: true,
      disabled: true
    })

    const path = this.viewerDocument.getViewablePath(item)

    if (this.viewerModel) {

      this.dualViewer.impl.unloadModel(
        this.viewerModel)
    }

    const options = {
      sharedPropertyDbPath:
        this.viewerDocument.getPropertyDbPath()
    }

    this.dualViewer.loadModel(path, options, (model) => {

      this.dualViewer.fitToView()

      this.viewerModel = model

      this.react.setState({
        showLoader: false,
        disabled: false
      })

    }, () => {

      this.viewerModel = null

      this.react.setState({
        disabled: false,
        showLoader: false
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStopResize () {

    const state = this.react.getState()

    $('#viewer-dropdown').parent().find('ul').css({
      height: Math.min(
        $('.dual-viewer').height() - 42,
        state.items.length * 26 + 16)
    })

    if (this.dualViewer && this.dualViewer.impl) {

      this.dualViewer.resize()

      this.dualViewer.fitToView()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onResize () {

    if (this.dualViewer && this.dualViewer.impl) {

      this.dualViewer.resize()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts = {showTitle: true}) {

    const state = this.react.getState()

    return (
      <WidgetContainer renderTitle={this.renderTitle}
        showTitle={opts.showTitle}
        className={this.className}>

        <Loader show={state.showLoader}/>

        <Viewer flex={0.40}
          onViewerCreated={
            (viewer) => {
              clearTimeout(this.timeoutId)
              this.timeoutId = setTimeout(
                () => this.onViewerCreated(viewer),
                250)
            }
          }
          className={this.className}
        />

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  DualViewerExtension.ExtensionId,
  DualViewerExtension)
