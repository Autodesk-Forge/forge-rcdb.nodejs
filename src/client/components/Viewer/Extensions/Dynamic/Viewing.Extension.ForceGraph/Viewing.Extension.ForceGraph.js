/// //////////////////////////////////////////////////////
// Viewing.Extension.ForceGraph
// by Philippe Leefsma, May 2017
//
/// //////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import { ReactLoader as Loader } from 'Loader'
import './Viewing.Extension.ForceGraph.scss'
import Toolkit from 'Viewer.Toolkit'
import ForceGraph from 'ForceGraph'
import React from 'react'
import d3 from 'd3'

class ForceGraphExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.onStopResize = this.onStopResize.bind(this)

    this.renderTitle = this.renderTitle.bind(this)

    this.render = this.render.bind(this)

    this.react = options.react
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  get className () {
    return 'force-graph'
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.ForceGraph'
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    window.addEventListener(
      'resize', this.onStopResize)

    this.react.setState({

      activeProperty: '',
      showLoader: true,
      disabled: false,
      root: null,
      items: []

    }).then(() => {
      this.react.pushRenderExtension(this)

      const model = this.viewer.activeModel

      if (model) {
        this.loadGraph(model)
      }
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

    console.log('Viewing.Extension.ForceGraph loaded')

    return true
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.ForceGraph unloaded')

    window.removeEventListener(
      'resize', this.onStopResize)

    super.unload()

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async loadGraph (model) {
    await this.react.setState({
      showLoader: true
    })

    this.componentIds = await Toolkit.getLeafNodes(model)

    const graphProperties =
      this.options.graphProperties ||
      await Toolkit.getPropertyList(
        this.viewer, this.componentIds, model)

    $('#force-graph-dropdown').parent().find('ul').css({
      height: Math.min(
        $('.force-graph').height() - 42,
        graphProperties.length * 26 + 16)
    })

    await this.react.setState({
      items: graphProperties
    })

    this.setActiveProperty(
      graphProperties[this.options.defaultIndex || 0])
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onModelActivated (event) {
    if (event.source !== 'model.loaded') {
      this.loadGraph(event.model)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onGeometryLoaded (event) {
    this.loadGraph(event.model)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async setActiveProperty (propName, disable) {
    await this.react.setState({
      activeProperty: disable ? propName : '',
      disabled: disable,
      showLoader: true
    })

    const root = await this.buildDataTree(propName)

    await this.react.setState({
      activeProperty: propName,
      showLoader: false,
      guid: this.guid(),
      disabled: false,
      root
    })
  }

  /// //////////////////////////////////////////////////////////
  // Builds a custom data tree formatted for the force graph
  // based on viewer input property
  //
  /// //////////////////////////////////////////////////////////
  async buildDataTree (propName) {
    const model = this.viewer.activeModel

    const root = await Toolkit.buildModelTree(model)

    const taskFunc = (node, parent) => {
      return new Promise(async (resolve, reject) => {
        try {
          node.parent = parent

          const prop = await Toolkit.getProperty(
            model, node.dbId, propName)

          if (isNaN(prop.displayValue)) {
            node.size = 0
          } else {
            node.size = prop.displayValue
          }

          return resolve()
        } catch (ex) {
          node.size = 0

          return resolve()
        }
      })
    }

    await Toolkit.runTaskOnDataTree(
      root, taskFunc)

    this.normalize(root)

    return root
  }

  /// //////////////////////////////////////////////////////////
  // Normalize data tree: sets size between [0, 1]
  // based on computed max over all nodes
  //
  /// //////////////////////////////////////////////////////////
  normalize (root) {
    var min = Number.MAX_VALUE
    var max = -Number.MAX_VALUE

    const computeMinMaxRec = (node) => {
      min = Math.min(min, node.size)
      max = Math.max(max, node.size)

      if (node.children) {
        node.children.forEach((child) => {
          computeMinMaxRec(child)
        })
      }
    }

    computeMinMaxRec(root)

    if (max === 0) {
      return
    }

    var count = 0
    var sum = 0

    const normalizeRec = (node) => {
      node.size /= max

      sum += node.size
      ++count

      if (node.children) {
        node.children.forEach((child) => {
          normalizeRec(child)
        })
      }
    }

    normalizeRec(root)

    root.average = sum / count
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onStopResize () {
    const state = this.react.getState()

    $('#force-graph-dropdown').parent().find('ul').css({
      height: Math.min(
        $('.force-graph').height() - 42,
        state.items.length * 26 + 16)
    })

    this.react.setState({
      guid: this.guid()
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderTitle () {
    const state = this.react.getState()

    const menuItems = state.items.map((item, idx) => {
      return (
        <MenuItem
          eventKey={idx} key={idx} onClick={() => {
            this.setActiveProperty(item, true)
          }}
        >
          {item}
        </MenuItem>
      )
    })

    return (
      <div className='title controls'>
        <label>
          Force Graph
        </label>

        <DropdownButton
          title={'Property: ' + state.activeProperty}
          disabled={state.disabled}
          key='force-graph-dropdown'
          id='force-graph-dropdown'
        >
          {menuItems}
        </DropdownButton>
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render (opts = { showTitle: true }) {
    const state = this.react.getState()

    return (
      <WidgetContainer
        renderTitle={this.renderTitle}
        showTitle={opts.showTitle}
        className={this.className}
      >

        <Loader show={state.showLoader} />

        <ForceGraph
          onNodeClicked={(node) => {
            Toolkit.isolateFull(
              this.viewer, node.dbId,
              this.viewer.activeModel)

            this.viewer.fitToView()
          }}
          guid={state.guid}
          root={state.root}
        />

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ForceGraphExtension.ExtensionId,
  ForceGraphExtension)
