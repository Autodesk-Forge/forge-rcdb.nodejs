import React, { PropTypes } from 'react'
import ServiceManager from 'SvcManager'
import PieChart from './PieChart'
import Legend from 'Legend'
import './DBChart.scss'

class DBChart extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()

    this.eventSvc = ServiceManager.getService(
      'EventSvc')

    this.eventSvc.on('chart.redraw', (chartData) => {

      this.draw(chartData)
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  render() {

    setTimeout(() => {
      this.draw(this.props.data)
    }, 0)

    return (
      <div className="db-chart">
        <div className="legend-scroll">
          <div id="legend-container">
          </div>
        </div>
        <div id="pie-chart-container">
        </div>
        <div className="footer">
          <div className="footer-panel">
          </div>
          <div className="footer-panel">
          </div>
        </div>
      </div>
    );
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  draw (chartData) {

    $('#legend-container').empty()

    this.legend = new Legend(
      '#legend-container',
      chartData)

    this.legend.on('legend.click', (item) => {

      this.props.onClick(item)
    })

    $('#pie-chart-container').empty()

    if(chartData && chartData.length) {

      const parentSize = {
        height: $('.db-chart').height(),
        width: $('.db-chart').width()
      }

      this.pieChart = new PieChart(
        '#pie-chart-container',
        chartData,
        { effects: { load: { effect: "none" }}})

      this.pieChart.on('pieSegment.click', (item) => {

        this.props.onClick(item)
      })
    }
  }
}

export default DBChart
