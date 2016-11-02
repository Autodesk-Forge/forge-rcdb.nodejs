import React, { PropTypes } from 'react'
import PieChart from './PieChart'
import Legend from 'Legend'
import './DBChart.scss'

class DBChart extends React.Component {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  componentDidMount () {

    $(window).resize(() => {
      if(this.eventTimeout) {
        clearTimeout(this.eventTimeout)
      }
      this.eventTimeout = setTimeout(() => {
        this.draw(this.props.data)
      }, 100)
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

    $('#legend-container').css({
      height: `${chartData.length * 20}px`
    })

    this.legend = new Legend(
      '#legend-container',
      chartData)

    this.legend.on('legend.click', (data) => {

      this.pieChart.pie.openSegment(data.index)

      this.props.onClick(data.item)
    })

    $('#pie-chart-container').empty()

    if(chartData && chartData.length) {

      const filteredChartData = _.filter(chartData,
        (entry) => {
          return entry.value > 0
        })

      const pieChartHeight = $('#pie-chart-container').height(),
            pieChartWidth = $('#pie-chart-container').width()

      this.pieChart = new PieChart(
        '#pie-chart-container',
        filteredChartData,
        { effects: { load: { effect: "none" }},
          size: {
            canvasHeight: pieChartHeight * 0.9,
            canvasWidth: pieChartWidth * 0.9,
            pieInnerRadius: '0%',
            pieOuterRadius: '98%'
          }})

      this.pieChart.on('pieSegment.click', (item) => {

        this.props.onClick(item)
      })
    }
  }
}

export default DBChart
