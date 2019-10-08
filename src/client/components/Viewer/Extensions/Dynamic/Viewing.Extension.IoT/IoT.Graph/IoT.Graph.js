import { SmoothieChart, TimeSeries } from './smoothie'
import React from 'react'

/// //////////////////////////////////////////////////////////////
//
//
/// //////////////////////////////////////////////////////////////
export default class IoTGraph extends React.Component {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor () {
    super()

    this.state = {
      value: 0
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentDidMount () {
    this.thresholdSeries = new TimeSeries()

    this.dataSeries = new TimeSeries()

    this.chart = new SmoothieChart({
      yRangeFunction: () => {
        return {
          min: this.props.min,
          max: this.props.max
        }
      }
    })

    this.intervalId = 0

    this.chart.addTimeSeries(this.thresholdSeries, {
      strokeStyle: 'rgba(255, 0, 0, 1)',
      fillStyle: 'rgba(255, 0, 0, 0.0)',
      lineWidth: 1
    })

    this.chart.addTimeSeries(this.dataSeries, {
      strokeStyle: 'rgba(0, 255, 0, 1)',
      fillStyle: 'rgba(0, 255, 0, 0.2)',
      lineWidth: 1
    })

    this.chart.streamTo(this.canvas, 100)

    this.updateGraph(this.props)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillReceiveProps (props) {
    if (props.guid !== this.props.guid) {
      this.updateGraph(props)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  updateGraph (props) {
    clearInterval(this.intervalId)

    this.thresholdSeries.clear()
    this.dataSeries.clear()

    this.intervalId = setInterval(() => {
      const t = new Date().getTime()
      this.thresholdSeries.append(t, this.props.threshold)

      const value = this.props.value ||
        props.randomBase + (0.5 - Math.random()) * props.randomRange

      this.setState({
        value
      })

      this.dataSeries.append(t, value)
    }, 1000)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const width = isNaN(this.props.dimensions.width)
      ? 100 : this.props.dimensions.width

    const height = isNaN(this.props.dimensions.height)
      ? 100 : Math.floor((this.props.dimensions.height - 1) / 3)

    const label =
      `Tag ${this.props.tagId} - ` +
      ` ${this.props.name}: ${this.state.value.toFixed(2)}`

    const style = { height }

    return (
      <div style={style}>
        <div className='graph-title'>
          <label>
            {label}
          </label>
        </div>
        <canvas
          className='graph' width={width} height={height - 30}
          ref={(div) => this.canvas = div}
        /> 
      </div>
    )
  }
}
