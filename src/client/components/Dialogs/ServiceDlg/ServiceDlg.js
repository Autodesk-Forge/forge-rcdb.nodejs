import React, { PropTypes } from 'react'
import Modal from 'react-modal'
import './ServiceDlg.scss'

export default class ServiceDlg extends React.Component {

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
    className: ''
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor() {

    super ()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onOk () {

    this.props.close('OK')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onCancel () {

    this.props.close('CANCEL')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  close () {

    this.props.close('CANCEL')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    if (this.props.renderTitle) {

      return this.props.renderTitle()
    }

    return (
      <div className="title">
        <img/>
        <b>{this.props.title}</b>
      </div>
      )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    if (this.props.renderContent) {

      return this.props.renderContent()
    }

    return (
      <div className="content">
        <b>{this.props.content}</b>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderControls () {

    if (this.props.renderControls) {

      return this.props.renderControls()
    }

    return (
      <div className="controls">
        <button onClick={() => this.onOk()}>
          <span className="fa fa-check">
          </span>
          <label>OK</label>
        </button>
        <button onClick={() => this.onCancel()}>
          <span className="fa fa-times">
          </span>
          <label>Cancel</label>
        </button>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const classNames = [
      'dialog', 'service',
      ...this.props.className.split(' ')
    ]

    return (
      <div>
        <Modal onRequestClose={() => {this.close()}}
          className={classNames.join(' ')}
          isOpen={this.props.open}
          contentLabel="">

          {this.renderTitle()}
          {this.renderContent()}
          {this.renderControls()}

        </Modal>
      </div>
    )
  }
}
