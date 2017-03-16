/////////////////////////////////////////////////////////////////////
// ForceGraph
// by Philippe Leefsma, April 2016
//
// Simple ForceGraph using d3 API
//
/////////////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'
import './ForceGraph.css'
import d3 from 'd3'

export default class ForceGraph extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(selector, root) {

    super();

    var width = "567", height = "415";

    var force = d3.layout.force()
      .size([width, height])
      //.linkDistance((link)=> {
      //  //link.source
      //  //link.target
      //  var dist = Math.max(link.source.size * 100, 100)
      //  return dist;
      //})
      //.charge((d)=>{
      //  return 1;
      //})
      .on("tick", tick);

    var svg = d3.select(selector)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var link = svg.selectAll(".link");
    var node = svg.selectAll(".node");

    function update() {

      var nodes = flatten(root),
        links = d3.layout.tree().links(nodes);

      // Restart the force layout.
      force.nodes(nodes)
        .links(links)
        .start();

      // Update the links…
      link = link.data(links, function(d) {
        return d.target.id;
      });

      // Exit any old links.
      link.exit().remove();

      // Enter any new links.
      link.enter().insert("line", ".node")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      // Update the nodes…
      node = node.data(nodes, (d)=> {
        return d.id;
      })
      .style("fill", color);

      // Exit any old nodes.
      node.exit().remove();

      // Enter any new nodes.
      node.enter().append("circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x })
        .attr("cy", function(d) { return d.y })
        .attr("r", function(d) {
          var size = d.size * 80;
          size = Math.max(size, 2.5);
          size = Math.min(size, 8);
          return size;
        })
        .style("fill", color)
        .on("dblclick", onDoubleClick)
        .on("click", onClick)
        .call(force.drag);
    }

    function tick() {

      link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    }

    // Color leaf nodes orange, and packages white or blue.
    function color(d) {
      return d._children ?
        "#3182bd" :
        d.children ? "#c6dbef" : "#fd8d3c";
    }

    // Toggle children on double-click.
    function onDoubleClick(d) {

      if (!d3.event.defaultPrevented) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update();
      }
    }

    // fire event on click
    var onClick = (d)=> {

     this.emit('node.click', d);
    }

    // Returns a list of all nodes under parent
    function flatten(parent) {

      var nodes = [], i = 0;

      function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
      }

      recurse(parent);
      return nodes;
    }

    update();
  }
}