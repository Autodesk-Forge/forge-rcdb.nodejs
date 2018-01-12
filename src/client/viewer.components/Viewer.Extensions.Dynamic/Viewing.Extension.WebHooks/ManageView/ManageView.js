import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import JSONView from 'JSONView'
import React from 'react'

export default class ManageView extends BaseComponent {

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
  renderHooks () {

    return this.props.hooks.map((hook) => {

      return(
        <div className="hook">

        </div>
      )
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return(
      <div className="manage">
        <div className="hooks">
          { this.renderHooks() }
        </div>
      </div>
    )
  }
}
