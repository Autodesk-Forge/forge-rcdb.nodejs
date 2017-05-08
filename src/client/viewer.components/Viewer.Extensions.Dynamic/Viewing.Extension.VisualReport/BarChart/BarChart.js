/////////////////////////////////////////////////////////////////////
// BarChart
// by Philippe Leefsma, April 2016
//
// Simple BarChart using d3 API
//
/////////////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'
import './BarChart.scss'
import d3 from 'd3'


export default class BarChart extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(selector, data) {

    super();

    var container = $(selector)[0];

    var margin = {
      top: 40,
      right: 40,
      bottom: 100,
      left: 80
    };

    var width = Math.min(Math.max(
      $('.tabs-container').width() - 40,
      30 * data.length), 100 * data.length);

    var height = $('.tabs-container').height() - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands(
      [0, width], .1);

    var y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%");

    var d3Container = d3.select(selector);

    var svg = d3Container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    x.domain(data.map(function(d) { return d.label; }));

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

    var tooltip = d3.select(selector)
      .append('div')
      .style('display', 'none')
      .style('height', '20px')
      .style('position','absolute')
      .style('padding','0 10px')
      .style('background','white')
      .style('opacity',0);

    var tempcolor = null;

    svg.selectAll(".bar-item")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar-item")
      .attr("x", function(d) {
        return x(d.label);
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
      .on('click', (item)=>{
        this.emit('bar.click', {
          dbIds: item.dbIds
        });
      })
      .on('mouseover',function(props){

        tooltip.transition()
          .style('opacity',.9);

        var offset = $(container).offset();

        var x = d3.event.pageX - offset.left;
        var y = d3.event.pageY - offset.top;

        tooltip.html(props.label + ': ' + props.value)
          .style('left', x - 20 + 'px')
          .style('top', y - 40 + 'px')
          .style('display', 'block')

        tempcolor = this.style.fill;

        d3.select(this)
          .style('fill','#6AB8E3')
          .style('opacity',.5);
      })
      .on('mouseout',function(d){

        d3.select(this)
          .style('opacity',1)
          .style('fill',tempcolor);

        tooltip.style('display', 'none');
      });

    function type(d) {
      d.value = +d.value;
      return d;
    }

    //$('.d3 > svg').css('transform', 'translate(0px, 42px)');
  }
}
