/////////////////////////////////////////////////////////
// Viewing.Extension.Database.CostBreakdown
// by Philippe Leefsma, September 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import './Viewing.Extension.Database.CostBreakdown.scss'
import WidgetContainer from 'WidgetContainer'
import {ReactLoader as Loader} from 'Loader'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'
import sortBy from 'lodash/sortBy'
import DBChart from 'DBChart'
import React from 'react'
import d3 from 'd3'

class DatabaseCostBreakdownExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onSelectItem = this.onSelectItem.bind(this)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'database-cost-breakdown'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Database.CostBreakdown'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      selectedItem: null,
      legendData: [],
      pieData: [],
      guid: null

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.Database.CostBreakdown loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Database.CostBreakdown unloaded')

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  buildLegendData (materialMap, fieldName) {

    const keys = Object.keys (materialMap)

    const length = keys.length

    const colors = d3.scale.linear()
      .domain([0, length * .33, length * .66, length])
      .range([
        '#FCB843',
        '#C2149F',
        '#0CC4BD',
        '#0270E9'
      ])

    let totalCost = 0.0
    let totalMass = 0.0

    for (let key in materialMap) {

      const item = materialMap[key]

      totalCost += item.totalCost
      totalMass += item.totalMass
    }

    const legendData = keys.map((key, idx) => {

      const item = materialMap[key]

      const cost = item.totalCost.toFixed(2)
      const mass = item.totalMass.toFixed(2)

      const costPercent = (item.totalCost * 100 / totalCost).toFixed(2)
      const massPercent = (item.totalMass * 100 / totalMass).toFixed(2)

      const label = fieldName === 'totalCost'
        ? `${key}: ${costPercent}% (${cost} USD)`
        : `${key}: ${massPercent}% (${mass} Kg)`

      const legendLabel = [
        {text: key, spacing: 0},
        {text: `% ${costPercent}`, spacing: 190},
        {text: `$USD ${cost}`, spacing: 250}
      ]

      return {
        value: parseFloat(item[fieldName].toFixed(2)),
        percent: item.totalCost * 100 / totalCost,
        color: colors(idx),
        legendLabel,
        label,
        item
      }
    })

    return sortBy(legendData,
      (entry) => {
        return entry.value * -1.0
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  groupDataSmallerThan (data, threshold) {

    const groupedData = []

    let otherData = {
      value: 0,
      percent: 0,
      item: {
        components: []
      }
    }

    data.forEach((entry) => {

      if (entry.percent < threshold) {

        const components = [
          ...otherData.item.components,
          ...entry.item.components
        ]

        const percent = otherData.percent + entry.percent

        const value = otherData.value + entry.value

        const label = `Other materials: ` +
          `${percent.toFixed(2)}% ` +
          `(${value.toFixed(2)} USD)`

        otherData = Object.assign({}, entry, {
          percent,
          label,
          value,
          item: {
            components
          }
        })

      } else {

        groupedData.push(entry)
      }
    })

    if (otherData.value > 0) {

      groupedData.push(otherData)
    }

    return groupedData
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  computeCost (materialMap) {

    const legendData = this.buildLegendData(
      materialMap,
      'totalCost')

    const pieData = this.groupDataSmallerThan(
      legendData,
      5.0)

    this.react.setState({
      guid: this.guid(),
      legendData,
      pieData
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectItem (item) {

    this.emit('item.selected', item)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setSelectedItem (item) {

    this.react.setState({
      selectedItem: item
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStopResize () {

    this.react.setState({
      guid: this.guid()
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
          Cost Breakdown
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {guid, legendData, pieData} = this.react.getState()

    const showLoader = !legendData.length

    return (
      <div className="content">
        <Loader show={showLoader}/>
        <DBChart
          onSelectItem={this.onSelectItem}
          legendData={legendData}
          pieData={pieData}
          guid={guid}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts = {showTitle: true}) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>

        { this.renderContent() }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  DatabaseCostBreakdownExtension.ExtensionId,
  DatabaseCostBreakdownExtension)
