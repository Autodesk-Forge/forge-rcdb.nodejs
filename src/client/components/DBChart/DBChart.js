import PieChart from './PieChart'
import ReactDOM from 'react-dom'
import Legend from 'Legend'
import React from 'react'
import './DBChart.scss'

class DBChart extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.state = {
      chartStyle: 'full'
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.refresh()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  shouldComponentUpdate (nextProps) {

    if (nextProps.guid !== this.props.guid) {

      return true
    }

    return false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidUpdate () {

    this.refresh()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    const domElement = ReactDOM.findDOMNode(this)

    const height = domElement.offsetHeight

    const chartStyle = height < 220
      ? 'compact'
      : 'full'

    this.setState({
      chartStyle
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    if (this.pieChart) {

      this.pieChart.destroy()
    }

    $('.pie-chart-container').empty()

    $('.legend-container').empty()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  refresh () {

    $('.legend-container').empty()

    $('.legend-container').css({
      height: `${this.props.legendData.length * 20}px`
    })

    this.legend = new Legend(
      $('.legend-container')[0],
      this.props.legendData)

    this.legend.on('legend.click', (data) => {

      this.pieChart.pie.openSegment(data.index)

      this.props.onSelectItem(
        data.item.dbMaterial)
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

          this.props.onSelectItem(arg)
        })
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className={'db-chart ' + this.state.chartStyle}>
        <div className="legend-scroll">
          <div className="legend-container"/>
        </div>
        <div className="pie-chart-container"/>
        <div className="footer">
          <div className="footer-panel"/>
          <div className="footer-panel"/>
        </div>
      </div>
    )
  }
}

export default DBChart
