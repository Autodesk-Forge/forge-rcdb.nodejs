/////////////////////////////////////////////////////////
// BarChart
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////
import React from 'react'
import './BarChart.scss'
import d3 from 'd3'

class BarChart extends React.Component {

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

    const margin = {
      bottom: 55,
      right: 40,
      left: 50,
      top: 30
    }

    var width = Math.min(
      Math.max($(container).width() - 40,
        30 * data.length),
      100 * data.length) - 10

    var height = $(container).height() - 93

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%");

    var d3Container = d3.select(container);

    var svg = d3Container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    x.domain(data.map(function(d) { return d.shortLabel }));

    y.domain([0, d3.max(data, function(d) {
      return d.value / 1000;
    })]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d) {
        return "rotate(-20)"
      });

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "translate(60, -30)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Components (% Total)");

    var tooltip = d3.select(this.container)
      .append('div')
      .style('background','#bababa')
      .style('position','absolute')
      .style('border-radius','4px')
      .style('padding','0 10px')
      .style('display', 'none')
      .style('height', 'auto')
      .style('opacity', 0.70)

    var tempcolor = null

    svg.selectAll(".bar-item")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar-item")
      .attr("x", function(d) {
        return x(d.shortLabel);
      })
      .attr("width", x.rangeBand())
      .attr("y", function(d) {
        return y(d.value / 1000);
      })
      .attr("height", function(d) {
        return height - y(d.value / 1000);
      })
      .style('fill',function(d, i){
        return data[i].color;
      })
      .on('click', (item) => {
        if (this.props.onGroupClicked) {
          this.props.onGroupClicked (item)
        }
      })
      .on('mouseover', function(props) {

        tooltip.transition()
          .style('opacity', .9)

        var offset = $(container).offset()

        var x = d3.event.pageX - offset.left
        var y = d3.event.pageY - offset.top

        tooltip.html(props.label)
          .style('left', x + 5 + 'px')
          .style('top', y + 15 + 'px')
          .style('display', 'block')

        tempcolor = this.style.fill

        d3.select(this)
          .style('fill','#6AB8E3')
          .style('opacity',.5)
      })
      .on('mousemove', function(e) {

        var offset = $(container).offset()

        var x = d3.event.pageX - offset.left
        var y = d3.event.pageY - offset.top

        tooltip.style('left', x + 5 + 'px')
          .style('top', y + 15 + 'px')
          .style('display', 'block')

        d3.select(this)
          .style('fill','#6AB8E3')
          .style('opacity', .5)
      })
      .on('mouseout', function(d) {

        d3.select(this)
          .style('fill',tempcolor)
          .style('opacity', 1)

        tooltip.style('display', 'none')
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className="bar-chart"
        ref={ (div) => this.container = div }>
      </div>
    )
  }
}

export default BarChart
