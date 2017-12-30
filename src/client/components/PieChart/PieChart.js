/////////////////////////////////////////////////////////
// PieChart
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////
import React from 'react'
import d3pie from 'd3pie'
import './PieChart.scss'
import d3 from 'd3'

class PieChart extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.draw(this.props.data)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  shouldComponentUpdate (nextProps) {

    if (nextProps.dataGuid !== this.props.dataGuid) {

      return true
    }

    return false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidUpdate () {

    $(this.container).empty()

    this.draw(this.props.data, {
      effects: {
        load: {
          effect: 'none'
        }
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  draw (data, opts= {}) {

    if (!data || !data.length) {

      return
    }

    const size = Math.min(
      this.container.offsetHeight,
      this.container.offsetWidth)

    const options =  Object.assign({}, {

      size: {
        canvasHeight: size,
        canvasWidth: size,
        pieInnerRadius: '40%',
        pieOuterRadius: '98%'
      },

      data: {
        content: data
      },

      tooltips: {
        enabled: true,
        type: "placeholder",
        placeholderParser: (index, replacements) => {
          Object.assign(replacements, {
            unit: data[index].unit
          })
        },
        string: '{label}',
        styles: {
          fadeInSpeed: 250,
          backgroundColor: "#bababa",
          backgroundOpacity: 0.85,
          color: "#00",
          borderRadius: 2,
          font: "ArtifaktElementRegular",
          fontSize: 10,
          padding: 4,
          zIndex: 1000
        }
      },

      labels: {
        outer: {
          format: 'none',
          hideWhenLessThanPercentage: 5,
          pieDistance: 32
        },
        inner: {
          hideWhenLessThanPercentage: 5
        }
      },

      callbacks: {
        onClickSegment: (event) => {

          if (this.props.onSegmentClicked) {

            this.props.onSegmentClicked (
              event.data, event.expanded)
          }
        }
      },

      misc: {
        gradient: {
          enabled: false,
          percentage: 100
        }
      }
    }, opts)

    this.pie = new d3pie(this.container, options)

    this.applyCustomProps()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  applyCustomProps () {

    $(this.container).find('svg').css({
      transform: `translate(0px, -2px)`,
      overflow: 'visible'
    })

    setTimeout(()=> {

      const $path = $(this.container).find(
        `g[class*="_arc"] > path`)

      $path.css({
        'stroke-width': '0'
      })
    }, 100)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className="pie-chart" ref={ (div) => {
          this.container = div
        }}
      />
    )
  }
}

export default PieChart
