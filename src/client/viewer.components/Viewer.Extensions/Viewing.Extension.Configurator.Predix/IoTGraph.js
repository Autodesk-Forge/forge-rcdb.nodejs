import { TimeSeries as SmoothieTimeSeries, SmoothieChart } from './smoothie'
import React from 'react'

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
export default class IoTGraph extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    threshold: 25 + (0.5 - Math.random()) * 10
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
        return { min: 0, max: 50 }
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
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    if (!props.activeItem) {
      return
    }

    if (!this.props.activeItem ||
      props.activeItem.id !== this.props.activeItem.id) {

      clearInterval(this.intervalId)

      this.thresholdSeries.clear()
      this.dataSeries.clear()

      this.intervalId = setInterval(() => {
        const t = new Date().getTime()
        this.thresholdSeries.append(t, this.props.threshold)

        const value = this.props.value || 30 + (0.5 - Math.random()) * 10

        this.dataSeries.append(t, value)
      }, 250)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const width = isNaN(this.props.dimensions.width)
      ? 100
      : this.props.dimensions.width

    const height = isNaN(this.props.dimensions.height)
      ? 100
      : Math.floor((this.props.dimensions.height-10)/3)

    const item = this.props.activeItem

    const tagId = item
      ? item.tags[this.props.tagIdx]
      : ''

    const style = {
      display: item ? 'block' : 'none',
      height: height
    }

    return (
      <div style={style}>
        <div className="graph-title">
          <label>
            Tag {tagId}
          </label>
        </div>
        <canvas className="graph" width={width} height={height-30}
          ref={ (div) => this.canvas = div }> 
        </canvas> 
      </div>
    )
  }
}
