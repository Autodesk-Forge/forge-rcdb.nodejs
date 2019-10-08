import { ReflexElement } from 'react-reflex'
import PropTypes from 'prop-types'
import Stopwatch from 'Stopwatch'
import './PaneManager.scss'
import React from 'react'

class PaneElement extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    showTitle: PropTypes.bool
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    showTitle: true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super(props)



    this.state = {
      size: -1
    }

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onLockSizeClicked () {

    this.props.onLockSize({
      locked: this.props.sizeLocked,
      maxSize: this.props.maxSize,
      minSize: this.props.minSize,
      paneId: this.props.id,
      size: this.getSize()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMinimizeClicked () {
    if (this.props.sizeLocked) {
      return
    }

    const currentSize = this.getSize()

    const update = (size) => {

      return new Promise((resolve) => {

        const newSize = size < this.props.minSize
          ? this.props.minSize
          : size

        this.setState(Object.assign({},
          this.state, {
            size: newSize
          }), () => resolve())
      })
    }

    const done = (from, to) => {

      return from < to
    }

    this.animate (currentSize,
      this.props.minSize, -450,
      done, update).then(() => {

        if (this.props.onStopResize) {

          this.props.onStopResize()
        }
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMaximizeClicked () {

    if (this.props.sizeLocked) {
      return
    }

    const currentSize = this.getSize()

    const update = (size) => {

      return new Promise((resolve) => {

        this.setState(Object.assign({},
          this.state, {
            size
          }), () => resolve())
      })
    }

    const done = (start, end) => {

      return start >= end
    }

    this.animate (currentSize,
      window.innerHeight, 450,
      done, update).then(() => {

        if (this.props.onStopResize) {

          this.props.onStopResize()
        }
      })
  }

  componentDidMount() {
    this.onLockSizeClicked =
      this.onLockSizeClicked.bind(this)

    this.onMinimizeClicked =
      this.onMinimizeClicked.bind(this)

    this.onMaximizeClicked =
      this.onMaximizeClicked.bind(this)

 }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getSize () {

    const domElement = this.myDiv

    switch (this.props.orientation) {

      case 'horizontal':
        return domElement.offsetHeight

      case 'vertical':
        return domElement.offsetWidth

      default:
        return 0
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  animate (start, end, speed, done, fn) {

    return new Promise((resolve) => {

      const stopwatch = new Stopwatch()

      const stepFn = () => {

        const dt = stopwatch.getElapsedMs() * 0.001

        if (!done(start, end)) {

          fn (start += speed * dt).then(() => {

            window.requestAnimationFrame(stepFn)
          })

        } else {

          resolve()
        }
      }

      stepFn ()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    if (!this.props.showTitle) {

      return (
        <div>
        </div>
      )
    }

    if (this.props.renderTitle) {

      return(
        <div className="title">
          { this.props.renderTitle() }
          { this.renderControls() }
        </div>
      )
    }

    return (
      <div className="title">
        <label>
          { this.props.title }
        </label>
       { this.renderControls() }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderControls () {

    const lockStyle = this.props.sizeLocked
      ? { color: '#FF0000' } : {}

    const lockClass = this.props.sizeLocked
      ? 'fa fa-lock' : 'fa fa-unlock'

    return (
      <div className="controls">
      
        <button onClick={this.onMinimizeClicked}
          title="minimize widget">
          <span className="fa fa-minus-square-o">
          </span>
        </button>
        <button onClick={this.onMaximizeClicked}
          title="maximize widget">
          <span className="fa fa-plus-square-o">
          </span>
        </button>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const style = this.props.showTitle
      ? {height: 'calc(100% - 40px)'}
      : {height: '100%'}

    return (
      <ReflexElement size={this.state.size} {...this.props}>
        <div className="pane-element" style={style} ref={c=>this.myDiv=c}>
          { this.renderTitle() }
          <div className="content">
             { this.props.children }
          </div>
        </div>
      </ReflexElement>
    )
  }
}

export default PaneElement
