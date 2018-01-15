import React from 'react'

export default class ReactPieSegment extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onClick = this.onClick.bind(this)

    this.state = {
      z: 0
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  generatePathDef(centre, rIn, rOut, start, delta) {

    const endRad = start + delta

    const startOut = {
      x: centre.x + rOut * Math.cos(start),
      y: centre.y + rOut * Math.sin(start)
    }

    const endOut = {
      x: centre.x + rOut * Math.cos(endRad),
      y: centre.y + rOut * Math.sin(endRad)
    }

    const startIn = {
      x: centre.x + rIn * Math.cos(endRad),
      y: centre.y + rIn * Math.sin(endRad)
    };

    var endIn = {
      x: centre.x + rIn * Math.cos(start),
      y: centre.y + rIn * Math.sin(start)
    }

    const largeArc = delta > Math.PI ? 1 : 0

    return (
      `M${startOut.x},${startOut.y}` +
      ` A${rOut},${rOut} 0 ` +
      `${largeArc},1 ${endOut.x},${endOut.y}` +
      ` L${startIn.x},${startIn.y}` +
      ` A${rIn},${rIn} 0 ` +
      `${largeArc},0 ${endIn.x},${endIn.y}` +
      ` L${startOut.x},${startOut.y} Z`
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMouseEnter (e) {

    this.setState({
      z: 2.0
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMouseLeave (e) {

    this.setState({
      z: 1.0
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMouseMove (e) {

    this.props.onMouseOver(e)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onClick (e) {

    this.props.onClick(e)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const {
      fillColor, strokeColor,
      start, delta,
      rIn, rOut,
      centre
    } = this.props

    const pathDef = this.generatePathDef(
      centre, rIn, rOut, start, delta)

    const labelDist = rIn + 0.5 * (rOut-rIn)

    const labelRad = start + 0.5 * delta

    const labelPos = {
      x: centre.x + labelDist * Math.cos (labelRad) - 5,
      y: centre.y + labelDist * Math.sin (labelRad) + 5
    }

    const labelStyle = {
      transform: `translate(${labelPos.x}px, ${labelPos.y}px)`
    }

    return (
      <g className='react-pie-segment' z={this.state.z}>
        <path
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onMouseMove={this.onMouseMove}
          onClick={this.onClick}
          stroke={strokeColor}
          fill={fillColor}
          d={pathDef}
        />
        <text style={labelStyle}>
          {this.props.label}
        </text>
      </g>
    )
  }
}



