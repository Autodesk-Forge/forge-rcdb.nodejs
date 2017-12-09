import BaseComponent from 'BaseComponent'
import ReactJson from 'react-json-view'
import { ReactLoader } from 'Loader'
import React from 'react'

export default class ManifestView extends BaseComponent {

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

    const {manifest} = this.props

    return(
      <div className="manifest">
        <ReactLoader show={!manifest}/>
        {
          manifest &&
          <ReactJson
            src={manifest}
            name={false}
          />
        }
      </div>
    )
  }
}
