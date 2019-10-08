import HierarchyTreeView from './HierarchyTreeView'
import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import React from 'react'

export default class HierarchyView extends BaseComponent {
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
    const { guid, hierarchy } = this.props

    return (
      <div className='hierarchy'>
        <ReactLoader show={!hierarchy} />
        {
          this.props.hierarchy &&
            <HierarchyTreeView
              hierarchy={hierarchy}
              guid={guid}
            />
        }
      </div>
    )
  }
}
