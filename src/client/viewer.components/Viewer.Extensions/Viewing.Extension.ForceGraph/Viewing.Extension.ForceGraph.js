/////////////////////////////////////////////////////////
// Viewing.Extension.ForceGraph
// by Philippe Leefsma, May 2017
//
/////////////////////////////////////////////////////////
import { DropdownButton, MenuItem } from 'react-bootstrap'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import {ReactLoader as Loader} from 'Loader'
import './Viewing.Extension.ForceGraph.scss'
import Toolkit from 'Viewer.Toolkit'
import ForceGraph from 'ForceGraph'
import React from 'react'
import d3 from 'd3'

class ForceGraphExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onStopResize = this.onStopResize.bind(this)

    this.renderTitle = this.renderTitle.bind(this)

    this.render = this.render.bind(this)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'force-graph'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ForceGraph'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    window.addEventListener(
      'resize', this.onStopResize)

    this.react.setState({

      activeProperty: '',
      showLoader: true,
      disabled: false,
      data: null,
      items: []

    }).then (async() => {

      const graphProperties = this.options.graphProperties

      $('#force-graph-dropdown').parent().find('ul').css({
        height: Math.min(
          $('.force-graph').height() - 42,
          graphProperties.length * 26 + 16)
      })

      await this.react.setState({
        items: graphProperties
      })

      this.setActiveProperty (
        graphProperties[this.options.defaultIndex || 0])

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.ForceGraph loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    window.removeEventListener(
      'resize', this.onStopResize)

    console.log('Viewing.Extension.ForceGraph unloaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setActiveProperty (propName, disable) {

    await this.react.setState({
      activeProperty: disable ? propName : '',
      disabled: disable,
      showLoader: true
    })

    //const data = await this.buildPropertyData (propName)

    await this.react.setState({
      activeProperty: propName,
      showLoader: false,
      guid: this.guid(),
      disabled: false
    })
  }

  /////////////////////////////////////////////////////////////
  // Builds a custom data tree formatted for the force graph
  // based on viewer input property
  //
  /////////////////////////////////////////////////////////////
  async buildCustomDataTree (propName) {

    var model = this.viewer.model

    var root = await Toolkit.buildModelTree(model)

    var taskFunc = (node, parent)=> {

      return new Promise(async(resolve, reject) => {

        try {

          node.parent = parent;

          var prop = await ViewerToolkit.getProperty(
            model, node.dbId, propName);

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
      });
    }

    await ViewerToolkit.runTaskOnDataTree(
      root, taskFunc)

      this.normalize(root)

      return root
  }

  /////////////////////////////////////////////////////////////
  // Normalize data tree: sets size between [0, 1]
  // based on computed max over all nodes
  //
  /////////////////////////////////////////////////////////////
  normalize(dataTree) {

    var min =  Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;

    function computeMinMaxRec(node){

      min = Math.min(min, node.size);
      max = Math.max(max, node.size);

      if(node.children){

        node.children.forEach((child)=>{

          computeMinMaxRec(child);
        });
      }
    }

    if(max === 0){
      return;
    }

    computeMinMaxRec(dataTree);

    function normalizeRec(node){

      node.size /= max;

      if(node.children){

        node.children.forEach((child)=>{

          normalizeRec(child);
        });
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStopResize () {

    const state = this.react.getState()

    this.react.setState({
      guid: this.guid()
    })
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

          this.setActiveProperty (item, true)
        }}>
          { item }
        </MenuItem>
      )
    })
    return (
      <div className="title controls">
        <label>
          Force Graph
        </label>

        <DropdownButton
          title={"Property: " + state.activeProperty }
          disabled={state.disabled}
          key="force-graph-dropdown"
          id="force-graph-dropdown">
         { menuItems }
        </DropdownButton>
      </div>
    )
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

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ForceGraphExtension.ExtensionId,
  ForceGraphExtension)
