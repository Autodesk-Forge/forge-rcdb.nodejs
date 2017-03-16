import React, { PropTypes } from 'react'
import PieChart from './PieChart'
import ReactDOM from 'react-dom'
import Legend from 'Legend'
import './DBChart.scss'

class DBChart extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.state = {
      style: 'full'
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  componentDidMount () {

    this.onResizeHandler = () => {
      this.onResize()
    }

    window.addEventListener(
      'resize',
      this.onResizeHandler)

    this.draw()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    const domElement = ReactDOM.findDOMNode(this)

    const height = domElement.offsetHeight

    this.setState({
      style: (height > 220 ? 'full' : 'compact')
    }, () => {

      this.draw()
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onResize () {

    if(this.eventTimeout) {
      clearTimeout(this.eventTimeout)
    }

    this.eventTimeout = setTimeout(() => {
      this.draw()
    }, 100)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  componentWillUnmount () {

    window.removeEventListener(
      'resize',
      this.onResizeHandler)

    if (this.pieChart) {

      this.pieChart.destroy()
    }

    $('.pie-chart-container').empty()

    $('.legend-container').empty()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  draw () {

    $('.legend-container').empty()

    $('.legend-container').css({
      height: `${this.props.legendData.length * 20}px`
    })

    this.legend = new Legend(
      $('.legend-container')[0],
      this.props.legendData)

    this.legend.on('legend.click', (data) => {

      this.pieChart.pie.openSegment(data.index)

      this.props.onClick(data.item.dbMaterial, false)
    })

    $('.pie-chart-container').empty()

    if(this.props.pieData.length) {

      const height = $('.pie-chart-container').height()
      const width = $('.pie-chart-container').width()

      if($('.pie-chart-container').length) {

        this.pieChart = new PieChart(
          '.pie-chart-container',
          this.props.pieData,
          { effects: { load: { effect: "none" }},
            size: {
              canvasHeight: height * 0.9,
              canvasWidth: width * 0.9,
              pieInnerRadius: '0%',
              pieOuterRadius: '98%'
            }})

        this.pieChart.on('pieSegment.click', (item) => {

          const arg = item
            ? (item.dbMaterial || item)
            : null

          this.props.onClick(arg, false)
        })
      }
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  render() {

    return (
      <div className={'db-chart ' + this.state.style}>
        <div className="legend-scroll">
          <div className="legend-container">
          </div>
        </div>
        <div className="pie-chart-container">
        </div>
        <div className="footer">
          <div className="footer-panel">
          </div>
          <div className="footer-panel">
          </div>
        </div>
      </div>
    )
  }
}

export default DBChart
