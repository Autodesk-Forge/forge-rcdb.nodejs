import PropTypes from 'prop-types'
import React from 'react'

export default class Switch extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    className: PropTypes.string,
    checked: PropTypes.bool
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    checked: true,
    className: ''
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()

    this.state = {
      checked: true
    }

    this.handleChange = this.handleChange.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    this.setState({
      checked: this.props.checked
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  handleChange () {

    const checked = !this.state.checked

    this.setState({
      checked
    })

    if (this.props.onChange) {

      this.props.onChange (checked)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const classNames = [
      'switch-container',
      ...this.props.className.split(' ')
    ]

    return(
      <div className={classNames.join(' ')}>
        <label>
          <input ref="switch" className="switch"
            onChange={this.handleChange}
            checked={this.state.checked}
            value={this.state.checked}
            type="checkbox"
          />
          <div>
            <span>
              <g className="icon icon-toolbar grid-view">
              </g>
            </span>
            <span>
              <g className="icon icon-toolbar ticket-view">
              </g>
            </span>
            <div></div>
          </div>
        </label>
      </div>
    )
  }
}
