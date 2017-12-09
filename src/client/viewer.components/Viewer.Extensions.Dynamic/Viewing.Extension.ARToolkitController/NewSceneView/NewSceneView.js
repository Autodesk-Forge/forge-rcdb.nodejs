import HierarchyTreeView from './HierarchyTreeView'
import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import React from 'react'

export default class NewSceneView extends BaseComponent {

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

    const {guid, hierarchy} = this.props

    return(
      <div className="new-scene">
        <ReactLoader show={!hierarchy}/>
        {
          this.props.hierarchy &&
          <HierarchyTreeView
            hierarchy={hierarchy}
            showSwitch={true}
            guid={guid}
          />
        }
      </div>
    )
  }
}
