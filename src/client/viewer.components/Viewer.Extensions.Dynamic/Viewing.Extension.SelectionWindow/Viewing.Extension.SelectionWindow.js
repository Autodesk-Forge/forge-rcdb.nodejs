/////////////////////////////////////////////////////////////////
// SelectionWindow Viewer Extension
// By Philippe Leefsma, Autodesk Inc, August 2017
//
/////////////////////////////////////////////////////////////////
import SelectionWindowTool from './Viewing.Extension.SelectionWindow.Tool'
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import SelectionTreeView from './SelectionTreeView'
import WidgetContainer from 'WidgetContainer'
import { ReactLoader } from 'Loader'
import Toolkit from 'Viewer.Toolkit'
import ReactDOM from 'react-dom'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

class SelectionWindowExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.setPartialSelect = this.setPartialSelect.bind(this)
    this.onNodeDblClicked = this.onNodeDblClicked.bind(this)
    this.onNodeClicked = this.onNodeClicked.bind(this)
    this.renderTitle = this.renderTitle.bind(this)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      showLoader: true,
      selection: null,
      active: false

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu', {
        buildMenu: (menu) => {
          return menu.map((item) => {
            const title = item.title.toLowerCase()
            if (title === 'show all objects') {
              return {
                title: 'Show All objects',
                target: () => {
                  Toolkit.isolateFull(this.viewer)
                  this.viewer.fitToView()
                }
              }
            }
            return item
          })
        }
      })

    console.log('Viewing.Extension.SelectionWindow loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'selection-window'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.SelectionWindow'
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.SelectionWindow unloaded')

    this.selectionWindowTool.off()

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded () {

    this.selectionWindowTool =
      new SelectionWindowTool(this.viewer)

    this.selectionWindowTool.on('deactivate', () => {

      this.react.setState({active: false})
    })

    this.selectionWindowTool.on('activate', () => {

      this.react.setState({active: true})
    })

    this.selectionWindowTool.on('selection',
      (selection) => {

        this.viewer.impl.selector.setSelection(
          selection.dbIds,
          selection.model)

        this.react.setState({selection})
      })

    this.viewer.toolController.registerTool(
      this.selectionWindowTool)

    this.react.setState({
      showLoader: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelActivated (event) {

    this.selectionWindowTool.setModel(event.model)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setPartialSelect (partialSelect) {

    this.selectionWindowTool.setPartialSelect(partialSelect)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async startSelection () {

    await this.react.setState({selection: null})

    this.viewer.toolController.activateTool(
      this.selectionWindowTool.getName())
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = SelectionWindowExtension.ExtensionId

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
  onNodeClicked (node) {

    const model = node.model

    if (model) {

      switch (node.type) {

        case 'component':
          this.viewer.impl.selector.setSelection(
            [node.id],
            model)
          break

        case 'root':
          this.viewer.impl.selector.setSelection(
            node.props.childIds,
            model)
          break
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onNodeDblClicked (node) {

    const model = node.model

    if (model) {

      switch (node.type) {

        case 'component':

          model.visibilityManager.isolate(node.id)

          Toolkit.isolateFull (
            this.viewer,
            node.id,
            model)

          break

        case 'root':

          model.visibilityManager.isolate(
            node.props.childIds)

          Toolkit.isolateFull (
            this.viewer,
            node.props.childIds,
            model)

          this.viewer.fitToView(
            node.props.childIds,
            model)

          break
      }
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
          Selection Window
        </label>
        <div className="selection-window-controls">
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
  renderContent () {

    const {active, showLoader, selection} =
      this.react.getState()

    return (
      <div className="content">
        <ReactLoader show={showLoader}/>
        <div className="row">
          <button onClick={() => this.startSelection()}
            className={`select-btn ${active ? 'active':''}`}>
            <span className="fa fa-object-group"/>
            Select ...
          </button>
          <Label text="Partial Selection: "/>
          <Switch onChange={this.setPartialSelect}
            checked={false}
          />
        </div>
        <div className="selection-tree-container">
          <SelectionTreeView
            onNodeDblClicked={this.onNodeDblClicked}
            onNodeClicked={this.onNodeClicked}
            selection={selection}/>
        </div>
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
  SelectionWindowExtension.ExtensionId,
  SelectionWindowExtension)

export default 'Viewing.Extension.SelectionWindow'
