/////////////////////////////////////////////////////////
// ReactPie: a responsive PieChart in pure React + SVG
// by Philippe Leefsma, Jan 2017
//
/////////////////////////////////////////////////////////
import PieSegment from './ReactPieSegment'
import ReactTooltip from 'react-tooltip'
import Measure from 'react-measure'
import Stopwatch from 'Stopwatch'
import easing from 'easing-js'
import React from 'react'
import './ReactPie.scss'

export default class ReactPie extends React.Component {

  /////////////////////////////////////////////////////////
  // Defines a few default properties
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    innerRadius: 0.35,
    outerRadius: 0.90,
    fillOpacity: 0.95,
    strokeWidth: 1.0,
    data: []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.disableTooltip = this.disableTooltip.bind(this)

    const size = { width:0, height:0 }

    const segments = this.resizeSegments(
      this.loadSegments(props.data),
      size)

    this.state = {
      tooltipActive: false,
      tooltip: '',
      segments,
      size
    }
  }

  /////////////////////////////////////////////////////////
  // Upon properties change, reload the pie only if
  // dataGuid has changed. This is controlled by the
  // parent component
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    if (props.dataGuid !== this.props.dataGuid) {

      const segments = this.resizeSegments(
        this.loadSegments(props.data),
        this.state.size)

      this.animate ({
        onUpdate: (tween) => {

          const stepSegments = segments.map((segment) => {
            return Object.assign({}, segment, {
              delta: segment.delta * tween
            })
          })

          this.setState(Object.assign({},
            this.state, {
              segments: stepSegments
            }))
        },
        duration: 850
      })
    }
  }

  /////////////////////////////////////////////////////////
  // Loads pie segments
  //
  /////////////////////////////////////////////////////////
  loadSegments (data) {

    const total = data.reduce((res, entry) => {
      return entry.value + res
    }, 0)

    let startAcc = 0.0

    return data.map((entry, index) => {

      const delta = (2 * Math.PI * entry.value/total)

      const label = Math.floor(100 * entry.value/total) + '%'

      const strokeColor = entry.strokeColor ||
        this.props.strokeColor ||
        entry.color

      const key = entry.key || this.guid()

      const start = startAcc

      startAcc += delta

      const dir = {
        x: Math.cos(start + 0.5 * delta),
        y: Math.sin(start + 0.5 * delta)
      }

      return {
        delta: delta - 0.25 * Math.PI/180,
        fillColor: entry.color,
        value: entry.value,
        color: entry.color,
        expandTween: 0.0,
        expanded: false,
        strokeColor,
        label,
        index,
        start,
        dir,
        key
      }
    })
  }

  /////////////////////////////////////////////////////////
  // Resize pie segments after parent container
  // has been resized for example
  //
  /////////////////////////////////////////////////////////
  resizeSegments (segments, size) {

    const { innerRadius, outerRadius } = this.props

    const { width, height } = size

    const outerRadiusPx =
      0.5 * outerRadius * Math.min(
        width, height)

    const innerRadiusPx =
      0.5 * innerRadius * Math.min(
        width, height)

    const centre = {
      y: height * 0.5,
      x: width * 0.5
    }

    return segments.map((segment) => {

      return Object.assign({}, segment, {
        rOut: outerRadiusPx,
        rIn: innerRadiusPx,
        centre
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Generates a guid
  //
  /////////////////////////////////////////////////////////
  guid (format = 'xxx-xxx-xxx') {

    var d = new Date().getTime()

    const guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }

  /////////////////////////////////////////////////////////
  // Animation: {
  //  onUpdate,
  //  duration,
  //  easing
  // }
  //
  /////////////////////////////////////////////////////////
  animate ({onUpdate, duration, easing}) {

    const stopwatch = new Stopwatch()

    let dt = 0.0

    const animationStep = () => {

      dt += stopwatch.getElapsedMs()

      if (dt > duration) {

        onUpdate(1.0)

      } else {

        const param = dt/duration

        const animParam = easing
          ? easing(param, duration/1000)
          : param

        onUpdate(animParam)
      }

      if (dt < duration) {

        requestAnimationFrame(animationStep)
      }
    }

    animationStep()
  }

  /////////////////////////////////////////////////////////
  // Mouse over segment handler
  //
  /////////////////////////////////////////////////////////
  onSegmentMouseOver (e, segment) {

    const entry = this.props.data[segment.index]

    this.setState(Object.assign({},
      this.state, {
        tooltipActive: true,
        tooltip: entry.label
      }))

    if (this.props.onSegmentMouseOver) {

      this.props.onSegmentMouseOver(entry)
    }
  }

  /////////////////////////////////////////////////////////
  // Segment clicked handler
  //
  /////////////////////////////////////////////////////////
  onSegmentClicked (e, segment) {

    let expandOutIdx = -1
    let expandInIdx = -1

    const segments = this.state.segments.map((s, idx) => {

      const nextExpanded = (s.key === segment.key && !segment.expanded)

      if (s.expanded !== nextExpanded) {

        nextExpanded
          ? expandOutIdx = idx
          : expandInIdx = idx
      }

      return(Object.assign({}, s, {
        expanded: nextExpanded
      }))
    })

    this.animate({
      onUpdate: (tween) => {

        if (expandInIdx > -1) {
          segments[expandInIdx].expandTween = 1.0 - tween
        }

        if (expandOutIdx > -1) {
          segments[expandOutIdx].expandTween = tween
        }

        this.setState(Object.assign({},
          this.state, {
            segments
          }))
      },
      easing: (t, duration) => {
        return easing.easeOutElastic(
          t, 0, 1, duration)
      },
      duration: 750
    })

    if (this.props.onSegmentClicked) {

      const entry = this.props.data[segment.index]

      this.props.onSegmentClicked(
        entry, segment.expanded)
    }
  }

  /////////////////////////////////////////////////////////
  // Expands a segment
  //
  /////////////////////////////////////////////////////////
  expandSegment (segment) {

    const offsetRad = Math.PI/180 * 1.2 * segment.expandTween

    const offset = segment.rOut * 0.05 * segment.expandTween

    const centre = {
      x: segment.centre.x + segment.dir.x * offset,
      y: segment.centre.y + segment.dir.y * offset
    }

    return Object.assign({}, segment, {
      delta: segment.delta - 2 * offsetRad,
      start: segment.start + offsetRad,
      rOut: segment.rOut + offset,
      rIn: segment.rIn + offset,
      centre: centre
    })
  }

  /////////////////////////////////////////////////////////
  // Disable tooltip
  //
  /////////////////////////////////////////////////////////
  disableTooltip () {

    this.setState(Object.assign({},
      this.state, {
        tooltipActive: false
      }))
  }

  /////////////////////////////////////////////////////////
  // React render
  //
  /////////////////////////////////////////////////////////
  render () {

    const segments = this.state.segments.map((segment) => {

      const onSegmentMouseOver = (e) => {
        this.onSegmentMouseOver(e, segment)
        e.stopPropagation()
      }

      const onSegmentClicked = (e) => {
        this.onSegmentClicked(e, segment)
      }

      segment = segment.expandTween
        ? this.expandSegment(segment)
        : segment

      return (
        <PieSegment
          strokeColor={segment.strokeColor}
          onMouseOver={onSegmentMouseOver}
          fillColor={segment.fillColor}
          onClick={onSegmentClicked}
          centre={segment.centre}
          delta={segment.delta}
          start={segment.start}
          label={segment.label}
          rOut={segment.rOut}
          rIn={segment.rIn}
          key={segment.key}
        />
      )
    })

    const tooltipCls = this.state.tooltipActive
      ? 'react-pie-tooltip-container active'
      : 'react-pie-tooltip-container'

    return (
      <Measure bounds onResize={(rect) => {

          const size = {
            height: rect.bounds.height,
            width: rect.bounds.width
          }

          const segments = this.resizeSegments(
            this.state.segments, size)

          this.setState(Object.assign({},
            this.state, {
              segments,
              size
            }))
        }}>
        {
          ({ measureRef }) =>
            <div ref={measureRef} className="react-pie">
              <div className="react-pie-inner"
                onMouseMove={this.disableTooltip}
                data-for="react-pie-tooltip"
                data-tip=''>
                <svg>
                  {segments}
                </svg>
              </div>
              <div className={tooltipCls}>
                <ReactTooltip
                  getContent={[() => <div>{this.state.tooltip}</div>]}
                  className="react-pie-tooltip"
                  id="react-pie-tooltip"
                  effect="float"
                />
              </div>
            </div>
        }
      </Measure>
    )
  }
}


