import BaseComponent from 'BaseComponent'
import ReactJson from 'react-json-view'
import { ReactLoader } from 'Loader'
import React from 'react'

export default class ExportsView extends BaseComponent {

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

    return(
      <div className="manifest">
        <ReactLoader show={!this.props.manifest}/>
        {
          this.props.manifest &&
          <ReactJson
            src={this.props.manifest}
            name={false}
          />
        }
      </div>
    )
  }
}
