/////////////////////////////////////////////////////////
// Viewing.Extension.BarChart
// by Philippe Leefsma, March 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import {ReactLoader as Loader} from 'Loader'
import './Viewing.Extension.BarChart.scss'
import Toolkit from 'Viewer.Toolkit'
import BarChart from 'BarChart'
import React from 'react'
import d3 from 'd3'

class BarChartExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.toggleTheming = this.toggleTheming.bind(this)

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

    return 'bar-chart'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.BarChart'
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
      theming: false,
      items: [],
      data: []
    }).then (() => {

      this.react.pushRenderExtension(this)

      const model = this.viewer.activeModel

      if (model) {

        this.loadChart (model)
      }
    })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu', {
        buildMenu: (menu, selectedDbId) => {
          return !selectedDbId
            ? [{
            title: 'Show all objects',
            target: () => {
              Toolkit.isolateFull(this.viewer)
              this.viewer.fitToView()
            }}]
            : menu
        }
      })

    console.log('Viewing.Extension.BarChart loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    const state = this.react.getState()

    if (state.theming) {

      this.toggleTheming()
    }

    window.removeEventListener(
      'resize', this.onStopResize)

    console.log('Viewing.Extension.BarChart unloaded')

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async loadChart (model) {

    await this.react.setState({
      showLoader: true
    })

    this.componentIds = await Toolkit.getLeafNodes(model)

    const chartProperties =
      this.options.chartProperties ||
      await Toolkit.getPropertyList(
        this.viewer, this.componentIds, model)

    $('#bar-chart-dropdown').parent().find('ul').css({
      height: Math.min(
        $('.bar-chart').height() - 42,
        chartProperties.length * 26 + 16)
    })

    await this.react.setState({
      items: chartProperties
    })

    this.setActiveProperty (
      chartProperties[this.options.defaultIndex || 0])

    const fragIds = await Toolkit.getFragIds(
      model, this.componentIds)

    this.fragIdToMaterial = {}

    const fragList = model.getFragmentList()

    fragIds.forEach((fragId) => {

      const material = fragList.getMaterial(fragId)

      if (material) {

        this.fragIdToMaterial[fragId] = material
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelActivated (event) {

    if (event.source !== 'model.loaded') {

      this.loadChart(event.model)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onGeometryLoaded (event) {

    this.loadChart(event.model)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  toggleTheming () {

    const state = this.react.getState()

    const theming = !state.theming

    this.react.setState({
      theming
    })

    if (theming) {

      state.data.forEach((group) => {

        group.dbIds.forEach((dbId) => {

          Toolkit.setMaterial(
            this.viewer.activeModel, dbId,
            group.material)
        })
      })

    } else {

      for(const fragId in this.fragIdToMaterial) {

        const material = this.fragIdToMaterial[fragId]

        const fragList =
          this.viewer.activeModel.getFragmentList()

        fragList.setMaterial(fragId, material)
      }
    }

    this.viewer.impl.invalidate(
      true, false, false)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setActiveProperty (propName, disable) {

    const state = this.react.getState()

    await this.react.setState({
      activeProperty: disable ? propName : '',
      disabled: disable,
      showLoader: true
    })

    const data = await this.buildPropertyData (propName)

    await this.react.setState({
      activeProperty: propName,
      showLoader: false,
      guid: this.guid(),
      disabled: false,
      data
    })

    if (state.theming) {

      data.forEach((group) => {

        group.dbIds.forEach((dbId) => {

          Toolkit.setMaterial(
            this.viewer.activeModel, dbId,
            group.material)
        })
      })

      this.viewer.impl.invalidate(
        true, false, false)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createMaterial (clrStr) {

    const clr = parseInt(clrStr.replace('#',''), 16)

    const props = {
      shading: THREE.FlatShading,
      name: this.guid(),
      specular: clr,
      shininess: 0,
      emissive: 0,
      diffuse: 0,
      color: clr
    }

    const material = new THREE.MeshPhongMaterial(props)

    this.viewer.impl.matman().addMaterial(
      props.name, material, true)

    return material
  }

  /////////////////////////////////////////////////////////
  // Group object map for small values:
  // If one entry of the map is smaller than minPercent,
  // this entry will be merged in the "group" entry
  //
  /////////////////////////////////////////////////////////
  groupMap (map, group, totalValue, minPercent) {

    return _.transform (map, (result, value, key) => {

      if (value.length * 100 / totalValue < minPercent) {

        result[group] = (result[group] || []).concat(value)

      } else {

        result[key] = value
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async buildPropertyData (propName) {

    const componentsMap = await Toolkit.mapComponentsByProp(
      this.viewer.activeModel, propName,
      this.componentIds)

    for (const key in componentsMap) {

      if (!key.length || key.indexOf('<') > -1) {

        delete componentsMap[key]
      }
    }

    const groupedMap = this.groupMap(componentsMap, 'Other',
      this.componentIds.length, 2.0)

    const keys = Object.keys (groupedMap)

    const colors = d3.scale.linear()
      .domain([0, keys.length * .33, keys.length * .66, keys.length])
      .range(['#FCB843', '#C2149F', '#0CC4BD', '#0270E9'])

    const data = keys.map((key, idx) => {

      const dbIds = groupedMap[key]

      const color = colors(idx)

      const percent = 100 * dbIds.length / this.componentIds.length

      return {
        label: `${key}: ${percent.toFixed(2)}% (${dbIds.length})`,
        material: this.createMaterial(color),
        value: dbIds.length,
        shortLabel: key,
        percent,
        dbIds,
        color
      }
    })

    return data
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStopResize () {

    const state = this.react.getState()

    $('#bar-chart-dropdown').parent().find('ul').css({
      height: Math.min(
        $('.bar-chart').height() - 42,
        state.items.length * 26 + 16)
    })

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

    const themingClr = {
      color: state.theming
        ? '#FF0000'
        : '#9b9b9b'
    }

    return (
      <div className="title controls">
        <label>
          Bar Chart
        </label>

        <DropdownButton
          title={"Property: " + state.activeProperty }
          disabled={state.disabled}
          key="bar-chart-dropdown"
          id="bar-chart-dropdown">
         { menuItems }
        </DropdownButton>

        <button onClick={this.toggleTheming}
          disabled={state.disabled}
          title="color theming">
          <span className="fa fa-paint-brush" style={themingClr}>
          </span>
        </button>
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

        <BarChart onGroupClicked={(e) => {

            const dbIds = e.dbIds

            Toolkit.isolateFull(
              this.viewer, dbIds,
              this.viewer.activeModel)

            this.viewer.fitToView()
          }}
          guid={state.guid}
          data={state.data}
        />

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  BarChartExtension.ExtensionId,
  BarChartExtension)
