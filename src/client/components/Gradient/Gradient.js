/////////////////////////////////////////////////////////
// Gradient
// by Philippe Leefsma, March 2017
//
/////////////////////////////////////////////////////////
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import React from 'react'
import './Gradient.scss'
import d3 from 'd3'

class Gradient extends React.Component {

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

    $(this.container).empty()

    this.draw(this.props.data)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  draw (data) {

    if (!data || !data.length) {

      return
    }

    const container = this.container

    const height = $(container).height()

    const width = $(container).width()

    const svg = d3.select(container).append("svg")
      .attr("height", height)
      .attr("width", width)
      .append("g")

    const min = d3.min(data, (d) => {return d.value })
    const max = d3.max(data, (d) => {return d.value })

    const clrScaleDomain = this.props.colorScale.map(
      (clr, idx) => {
        const lenght = this.props.colorScale.length - 1
        return (min + (max-min) * idx/lenght)
      })

    const colorScale = d3.scale.linear()
      .domain(clrScaleDomain)
      .range(this.props.colorScale)
    //.interpolate(d3.interpolateHcl);

    //Extra scale since the color scale is interpolated
    const countScale = d3.scale.linear()
      .domain([min, max])
      .range([0, width])

    //Calculate the variables for the gradient
    const numStops = 10
    const countRange = countScale.domain()
    const range = countRange[1] - countRange[0]
    const countPoint = []
    for(var i = 0; i < numStops; ++i) {
      countPoint.push(i * range / (numStops-1) + countRange[0])
    }

    const gradientId = this.guid()

    //Create the gradient
    svg.append("defs").append("linearGradient")
      .attr("id", gradientId)
      .selectAll("stop")
      .data(d3.range(numStops))
      .enter().append("stop")
      .attr("offset", (d,i) => {
        return countScale (countPoint[i])/width
      })
      .attr("stop-color", (d,i) => {
        return colorScale (countPoint[i])
      })
      .attr("x2", "100%").attr("y2", "0%")
      .attr("x1", "0%").attr("y1", "0%")

    const legend = svg.append("g")
      .attr("transform", `translate(${width/2}, 5)`)
      .attr("class", "legendWrapper")

    legend.append("rect")
      .attr("transform", `translate(${(-width/2)}, 5)`)
      .style("fill", `url(#${gradientId})`)
      .attr("class", "legendRect")
      .attr("width", width)
      .attr("height", 10)
      .attr("x", 0)
      .attr("y", 0)

    const xScale = d3.scale.linear()
      .domain([ min, max])
      .range([-width/2, width/2])

    const ticks = width > 240 ? 11 : 5

    const xAxis = d3.svg.axis()
      .orient("bottom")
      .scale(xScale)
      .ticks(ticks)

    legend.append("g")
      .attr("transform", `translate(5, 15)`)
      .attr("class", "axis")
      .call(xAxis)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  guid (format = 'xxxxxxxxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className="gradient"
        ref={ (div) => this.container = div }>
      </div>
    )
  }
}

export default Gradient
