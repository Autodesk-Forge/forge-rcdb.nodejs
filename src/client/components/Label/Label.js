import PropTypes from 'prop-types'
import DOMPurify from 'dompurify'
import ReactDOM from 'react-dom'
import React from 'react'
import './Label.scss'

export default class Label extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    textAlign: PropTypes.string,
    className: PropTypes.string,
    text: PropTypes.string
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    textAlign: 'left',
    className: '',
    text: ''
  }

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
  render () {

    const classNames = [
      'label-container',
      ...this.props.className.split(' ')
    ]

    const style = {
      width: this.props.textAlign === 'center'
        ? '100%' : '',
      textAlign: this.props.textAlign
    }

    return(
      <div className={classNames.join(' ')}
        style={style}>
        <p>
          { DOMPurify.sanitize(this.props.text) }
        </p>
      </div>
    )
  }
}
