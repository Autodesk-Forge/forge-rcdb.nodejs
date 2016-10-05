/////////////////////////////////////////////////////////////////////
// ForceGraph
// by Philippe Leefsma, April 2016
//
// Simple ForceGraph using d3 API
//
/////////////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'
import './CircleGraph.css'
import d3 from 'd3'

export default class CircleGraph extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(selector, root) {

    super();

    var width = "567", height = "567";

    var margin = 5, diameter = height;

    var color = d3.scale.linear()
      .domain([-1, 5])
      .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
      .interpolate(d3.interpolateHcl);

    var pack = d3.layout.pack()
      .padding(2)
      .size([width - margin, height - margin])
      .value(function(d) {
        var size = Math.max(d.size, 300);
        size = Math.min(size, 10);
        return size;
      })

    var svg = d3.select(selector).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var focus = root,
      nodes = pack.nodes(root),
      view;

    var circle = svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("class", function(d) {
        return d.parent ? (d.children && d.children.length)  ?
          "node" : "node node--leaf" : "node node--root";
      })
      .style("fill", function(d) {

        if(!d){
          return null;
        }

        return (d.children && d.children.length) ? color(d.depth) : null;
      })
      .on("click", function(d) {

        if (d && focus !== d) {
          zoom(d);
          d3.event.stopPropagation();
        }
      });

    var text = svg.selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) {
        return d.parent === root ? 1 : 0;
      })
      .style("display", function(d) {
        return d.parent === root ? "inline" : "none";
      })
      .text(function(d) { return d.name; });

    var node = svg.selectAll("circle,text");

    d3.select(selector).on("click", ()=> {

      zoom(root);
    });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {

      if(!d){
        return;
      }

      focus = d;

      var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [
            focus.x, focus.y, focus.r * 2 + margin
          ]);
          return function(t) { zoomTo(i(t)); };
        });

      transition.selectAll("text")
        .filter(function(d) {
          if(!d){
            return false;
          }
          return d.parent === focus || this.style.display === "inline";
        })
        .style("fill-opacity", function(d) {
          return d.parent === focus ? 1 : 0;
        })
        .each("start", function(d) {
          if (d.parent === focus) this.style.display = "inline";
        })
        .each("end", function(d) {
          if (d.parent !== focus) this.style.display = "none";
        });
    }

    function zoomTo(v) {

      var k = diameter / v[2];
      view = v;
      node.attr("transform", function(d) {
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
      });
      circle.attr("r", function(d) { return d.r * k; });
    }
  }
}