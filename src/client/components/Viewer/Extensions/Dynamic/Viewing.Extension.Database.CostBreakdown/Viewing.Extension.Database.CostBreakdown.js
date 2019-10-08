/// //////////////////////////////////////////////////////
// Viewing.Extension.Database.CostBreakdown
// by Philippe Leefsma, September 2017
//
/// //////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import { ReflexContainer, ReflexElement } from 'react-reflex'
import './Viewing.Extension.Database.CostBreakdown.scss'
import WidgetContainer from 'WidgetContainer'
import { ReactLoader as Loader } from 'Loader'
import BaseComponent from 'BaseComponent'
import { ServiceContext } from 'ServiceContext'
import { findDOMNode } from 'react-dom'
import Toolkit from 'Viewer.Toolkit'
import PieLegend from './PieLegend'
import sortBy from 'lodash/sortBy'
import PieChart from 'PieChart'
import React from 'react'
import d3 from 'd3'

class DatabaseCostBreakdownExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.onItemSelected = this.onItemSelected.bind(this)

    this.react = options.react
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  get className () {
    return 'database-cost-breakdown'
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.Database.CostBreakdown'
  }

  reload (options) {
    // this.unload()
    this.options = options
    // this.react = options.react

    this.load(true)
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load (reload) {
    this.react.setState({

      selectedItem: null,
      legendData: [],
      pieData: [],
      guid: null

    }).then(() => {
      if (!reload) { this.react.pushRenderExtension(this) }
    })

    console.log('Viewing.Extension.Database.CostBreakdown loaded')

    return true
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.Database.CostBreakdown unloaded')

    super.unload()

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  buildLegendData (materialMap, fieldName) {
    const keys = Object.keys(materialMap)

    const length = keys.length

    const colors = d3.scale.linear()
      .domain([0, length * 0.33, length * 0.66, length])
      .range([
        '#FCB843',
        '#C2149F',
        '#0CC4BD',
        '#0270E9'
      ])

    let totalCost = 0.0

    for (const key in materialMap) {
      const item = materialMap[key]

      totalCost += item.totalCost
    }

    const legendData = keys.map((key, idx) => {
      const item = materialMap[key]

      const costPercent = (item.totalCost * 100 / totalCost).toFixed(2)

      const percent = item.totalCost * 100 / totalCost

      const cost = item.totalCost.toFixed(2)

      const label = `${key}: ${costPercent}% (${cost} USD)`

      return {
        value: parseFloat(item[fieldName].toFixed(2)),
        percentTxt: '% ' + percent.toFixed(2),
        cost: '$USD ' + cost,
        color: colors(idx),
        name: key,
        percent,
        label,
        item
      }
    })

    return sortBy(legendData,
      (entry) => {
        return entry.value * -1.0
      })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
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

        const label = 'Other materials: ' +
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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onStopResize () {
    this.react.setState({
      guid: this.guid()
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onItemSelected (item) {
    this.emit('item.selected', item)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setSelectedItem (item) {
    this.react.setState({
      selectedItem: item
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderTitle () {
    return (
      <div className='title'>
        <label>
          Cost Breakdown
        </label>
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderContent () {
    const {
      legendData,
      pieData,
      guid
    } = this.react.getState()

    const showLoader = !legendData.length

    return (
      <div className='content'>
        <Loader show={showLoader} />
        <CostGraphContainer
          onItemSelected={this.onItemSelected}
          legendData={legendData}
          pieData={pieData}
          guid={guid}
        />
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render (opts = { showTitle: true }) {
    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}
      >

        {this.renderContent()}

      </WidgetContainer>
    )
  }
}

class CostGraphContainer extends BaseComponent {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor () {
    super()

    this.onSegmentClicked = this.onSegmentClicked.bind(this)

    this.state = {
      showPie: false
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillReceiveProps (props) {
    const domElement = findDOMNode(this)

    const height = domElement.offsetHeight

    const showPie = !!(height > 220)

    this.assignState({
      showPie
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onSegmentClicked (data, expanded) {
    const item = !expanded
      ? data.item
      : null

    this.props.onItemSelected(item)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const {
      onItemSelected,
      legendData,
      pieData
    } = this.props

    return (
      <ReflexContainer>
        <ReflexElement flex={this.state.showPie ? 0.4 : 1}>
          {
            legendData.length &&
              <PieLegend
                onItemSelected={onItemSelected}
                data={legendData}
              />
          }
        </ReflexElement>
        {
          this.state.showPie &&
            <ReflexElement>
              <div style={{
                background: '#fdfdfd',
                paddingTop: '10px',
                height: '100%'
              }}
              >
                <PieChart
                  onSegmentClicked={this.onSegmentClicked}
                  dataGuid={this.props.guid}
                  data={pieData}
                />
              </div>
            </ReflexElement>
        }
      </ReflexContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  DatabaseCostBreakdownExtension.ExtensionId,
  DatabaseCostBreakdownExtension)
