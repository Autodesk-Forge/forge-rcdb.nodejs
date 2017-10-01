import ServiceManager from 'SvcManager'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import React from 'react'
import './AboutDlg.scss'

export default class AboutDlg extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor() {

    super()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount() {

    this.forgeSvc = ServiceManager.getService('ForgeSvc')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  close () {

    this.props.close()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const clientId = this.forgeSvc
      ? this.forgeSvc.clientId
      : ''

    return (
      <div>
        <Modal className="dialog about"
          contentLabel=""
          isOpen={this.props.open}
          onRequestClose={() => {this.close()}}>

          <div className="title">
            <img/>
            <b>About Forge RCDB ...</b>
          </div>

          <div className="content ">
             <div>
               Forge / Responsive / Connected / Database
               <br/>
               Written by Philippe Leefsma
               <br/>
               <a href="https://twitter.com/F3lipek" target="_blank">
               @F3lipek
               </a>
               &nbsp;- October 2016
               <br/>
               <br/>
               <div>
                 This App ClientID:
                 <div className="clientId">
                  {clientId}
                 </div>
               </div>
               Source on github:
               <br/>
               <a href="https://github.com/Autodesk-Forge/forge-rcdb.nodejs" target="_blank">
               Forge RCDB
               </a>
             </div>
          </div>

        </Modal>
      </div>
    )
  }
}
