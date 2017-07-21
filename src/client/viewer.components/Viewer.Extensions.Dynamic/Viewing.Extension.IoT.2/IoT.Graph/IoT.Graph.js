import { TimeSeries as SmoothieTimeSeries, SmoothieChart } from './smoothie'
import React from 'react'

export default class IoTGraph extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()

    this.state = {
      value: 0
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.thresholdSeries = new SmoothieTimeSeries()

    this.dataSeries = new SmoothieTimeSeries()

    this.chart = new SmoothieChart({
      yRangeFunction: () => {
        return {
          min: this.props.min,
          max: this.props.max
        }
      }
    })

    this.updateId = 0

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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    clearInterval(this.updateId)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    if (props.guid !== this.props.guid) {

      this.updateGraph(props)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateGraph (props) {

    clearTimeout(this.updateId)

    this.thresholdSeries.clear()
    this.dataSeries.clear()

    const update = () => {

      const t = new Date().getTime()
      this.thresholdSeries.append(t, this.props.threshold)

      const value = this.props.value ||
        props.randomBase + (0.5 - Math.random()) * props.randomRange

      this.setState({
        value
      })

      this.dataSeries.append(t, value)

      this.updateId = setTimeout(update, 1000)
    }

    update()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const {dimensions, name, rows} = this.props

    const label = ` ${name}: ${this.state.value.toFixed(2)}`

    const width = isNaN(dimensions.width)
      ? 100 : dimensions.width - 1

    const height = isNaN(dimensions.height)
      ? 100 : Math.floor((dimensions.height - 2)/rows)

    const style = {
      height
    }

    return (
      <div style={style}>
        <div className="graph-title">
          <label>
            { label }
          </label>
        </div>
        <canvas ref={ (div) => this.canvas = div }
          width={width} height={height-30}
          className="graph"
        /> 
      </div>
    )
  }
}
