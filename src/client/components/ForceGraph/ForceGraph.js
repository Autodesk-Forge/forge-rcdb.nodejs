/////////////////////////////////////////////////////////
// ForceGraph
// by Philippe Leefsma, May 2017
//
/////////////////////////////////////////////////////////
import './ForceGraph.scss'
import React from 'react'
import d3 from 'd3'

class ForceGraph extends React.Component {

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

    const {root} = this.props

    this.draw (root)
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

    const {root} = this.props

    $(this.container).empty()

    this.draw(root)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  draw (root) {

    if (!root) {

      return
    }

    const container = this.container

    const height = container.offsetHeight
    const width = container.offsetWidth

    var force = d3.layout.force()
      .size([width, height])
      .on("tick", () => tick())

    var svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    var link = svg.selectAll(".link")
    var node = svg.selectAll(".node")

    const update = () => {

      var nodes = this.flatten(root)
      var links = d3.layout.tree().links(nodes)

      // Restart the force layout.
      force.nodes(nodes)
        .links(links)
        .start()

      // Update the links…
      link = link.data(links, (d) => {
        return d.target.id
      })

      // Exit any old links.
      link.exit().remove()

      // Enter any new links.
      link.enter().insert("line", ".node")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })

      // Update the nodes…
      node = node.data(nodes, (d)=> {
        return d.id
      }).style("fill", color)

      // Exit any old nodes.
      node.exit().remove()

      // Enter any new nodes.
      node.enter().append("circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x })
        .attr("cy", function(d) { return d.y })
        .attr("r", function(d) {
          var size = d.size * 10.0 / root.average
          size = Math.max(size, 3.0)
          size = Math.min(size, 15.0)
          return size
        })
        .style("fill", color)
        .on("dblclick", onDoubleClick)
        .on("click", (n) => {
          if (this.props.onNodeClicked) {
            this.props.onNodeClicked (n)
          }
        })
        .call(force.drag)
    }

    const tick = () => {

      link.attr("x1", (d) => { return d.source.x })
          .attr("y1", (d) => { return d.source.y })
          .attr("x2", (d) => { return d.target.x })
          .attr("y2", (d) => { return d.target.y })

      node.attr("cx", (d) => { return d.x })
          .attr("cy", (d) => { return d.y })
    }

    // Color leaf nodes orange, and packages white or blue.
    const color = (d) => {
      return d._children
        ? "#3182bd"
        : d.children ? "#c6dbef" : "#fd8d3c"
    }

    // Toggle children on double-click.
    const onDoubleClick = (d) => {

      if (!d3.event.defaultPrevented) {

        if (d.children) {

          d._children = d.children
          d.children = null

        } else {

          d.children = d._children
          d._children = null
        }

        update()
      }
    }

    update()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  flatten (parent) {

    const nodes = []
    var i =0

    const recurse = (node) => {

      if (node.children) {

        node.children.forEach(recurse)
      }

      if (!node.id) {
        node.id = ++i
      }
      nodes.push(node)
    }

    recurse(parent)

    return nodes
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className="force-graph"
        ref={ (div) => this.container = div }>
      </div>
    )
  }
}

export default ForceGraph
