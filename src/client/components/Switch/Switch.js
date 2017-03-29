import React from 'react'

export default class Switch extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    className: React.PropTypes.string
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    isChecked: true,
    className: ''
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.state = {
      isChecked: true
    }

    this.handleChange =  this.handleChange.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    this.setState({
      isChecked: this.props.isChecked
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  handleChange () {

    this.setState({
      isChecked: !this.state.isChecked
    })
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
            checked={this.state.isChecked}
            value={this.state.isChecked}
            onChange={this.handleChange}
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
