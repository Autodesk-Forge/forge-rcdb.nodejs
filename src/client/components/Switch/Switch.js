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

    this.toggle = this.toggle.bind(this)

    this.state = {
      checked: true
    }
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
  toggle () {

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
      <div className={classNames.join(' ')}
        onClick={this.toggle}>
        <input ref="switch" className="switch"
          checked={this.state.checked}
          value={this.state.checked}
          onChange={()=> {}}
          type="checkbox"
        />
        <div>
          <span>
            <g className="icon icon-toolbar grid-view"/>
          </span>
          <span>
            <g className="icon icon-toolbar ticket-view"/>
          </span>
          <div/>
        </div>
      </div>
    )
  }
}
