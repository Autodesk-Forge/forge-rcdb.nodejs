
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import React from 'react'
import './AboutDlg.scss'

export default class AboutDlg extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor() {

    super()

  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  close () {

    this.props.close()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

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
               Written by Philippe Leefsma
               <br/>
               <a href="https://twitter.com/F3lipek" target="_blank">
               @F3lipek
               </a>
               &nbsp;- October 2016
               <br/>
               <br/>
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
