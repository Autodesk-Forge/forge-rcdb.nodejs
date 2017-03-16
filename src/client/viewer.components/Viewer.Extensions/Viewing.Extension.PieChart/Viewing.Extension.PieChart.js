/////////////////////////////////////////////////////////
// Viewing.Extension.BarChart
// by Philippe Leefsma, March 2017
//
/////////////////////////////////////////////////////////
import { DropdownButton, MenuItem } from 'react-bootstrap'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import {ReactLoader as Loader} from 'Loader'
import './Viewing.Extension.PieChart.scss'
import Toolkit from 'Viewer.Toolkit'
import PieChart from 'PieChart'
import Viewer from 'Viewer'
import React from 'react'
import d3 from 'd3'

class PieChartExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onGeometryLoaded = this.onGeometryLoaded.bind(this)

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

    return 'pie-chart'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.PieChart'
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
      disabled: true,
      items: [],
      data: []
    }).then (() => {

      this.react.setRenderExtension(this)
    })

    this.viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoaded)

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

    console.log('Viewing.Extension.PieChart loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    this.viewer.removeEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoaded)

    window.removeEventListener(
      'resize', this.onStopResize)

    console.log('Viewing.Extension.PieChart unloaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onGeometryLoaded () {

    this.componentIds = await Toolkit.getLeafNodes(
      this.viewer.model)

    const chartProperties =
      this.options.chartProperties ||
      await Toolkit.getPropertyList(
      this.viewer, this.componentIds)

    $('#pie-chart-dropdown').parent().find('ul').css({
      height: Math.min(
        $('.pie-chart').height() - 42,
        chartProperties.length * 26 + 16)
    })

    await this.react.setState({
      items: chartProperties
    })

    this.setActiveProperty (
      chartProperties[this.options.defaultIndex || 0])

    var fragIds = await Toolkit.getFragIds(
      this.viewer.model,
      this.componentIds)

    this.fragIdToMaterial = {}

    const fragList = this.viewer.model.getFragmentList()

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
            this.viewer.model, dbId,
            group.material)
        })
      })

    } else {

      for(const fragId in this.fragIdToMaterial) {

        const material = this.fragIdToMaterial[fragId]

        const fragList = this.viewer.model.getFragmentList()

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
            this.viewer.model, dbId,
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

    var componentsMap = await Toolkit.mapComponentsByProp(
      this.viewer.model, propName,
      this.componentIds)

    for (const key in componentsMap) {

      if (!key.length || key.indexOf('<') > -1) {

        delete componentsMap[key]
      }
    }

    var groupedMap = this.groupMap(componentsMap, 'Other',
      this.componentIds.length, 2.0)

    var keys = Object.keys (groupedMap)

    var colors = d3.scale.linear()
      .domain([0, keys.length * .33, keys.length * .66, keys.length])
      .range(['#FCB843', '#C2149F', '#0CC4BD', '#0270E9'])

    const data = keys.map((key, idx) => {

      var dbIds = groupedMap[key]

      var color = colors(idx)

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

    $('#pie-chart-dropdown').parent().find('ul').css({
      height: Math.min(
        $('.pie-chart').height() - 42,
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
          Pie Chart
        </label>

        <DropdownButton
          title={"Property: " + state.activeProperty }
          disabled={state.disabled}
          key="pie-chart-dropdown"
          id="pie-chart-dropdown">
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

        <PieChart flex={0.30}
          onGroupClicked={(e) => {

            const dbIds = e.expanded ? [] : e.data.dbIds

            Toolkit.isolateFull(
              this.viewer,
              dbIds)

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
  PieChartExtension.ExtensionId,
  PieChartExtension)
