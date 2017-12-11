import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import JSONView from 'JSONView'
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

    return(
      <div className="manifest">
        <ReactLoader show={!this.props.manifest}/>
        {
          this.props.manifest &&
          <JSONView src={this.props.manifest}/>
        }
      </div>
    )
  }
}
