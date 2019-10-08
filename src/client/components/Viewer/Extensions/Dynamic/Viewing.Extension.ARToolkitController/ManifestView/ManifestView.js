import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import JSONView from 'JSONView'
import React from 'react'

export default class ManifestView extends BaseComponent {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super(props)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const { manifest } = this.props

    return (
      <div className='manifest'>
        <ReactLoader show={!manifest} />
        {manifest && <JSONView src={manifest} />}
      </div>
    )
  }
}
