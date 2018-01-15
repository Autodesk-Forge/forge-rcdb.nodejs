import { DropdownButton, MenuItem } from 'react-bootstrap'
import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import Systems from '../Systems'
import JSONView from 'JSONView'
import React from 'react'

export default class ManageView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.state = {
      hookDetails: null,
      system: null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onHookSelected (hook) {

    this.assignState({
      hookDetails: hook
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderHooks () {

    return this.props.hooks.map((hook) => {

      return(
        <div className="hook" key={hook.hookId} 
          onClick={() => this.onHookSelected(hook)}>
          { "Hook" }
        </div>
      )
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderHookDetails () {

    return (
      <JSONView src={this.state.hookDetails}/>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const { system, hookDetails } = this.state

    const systemItems = Systems.map((system) => {
      
        return (
          <MenuItem eventKey={system.id} key={system.id}
            onClick={() => {
  
              this.props.onSystemSelected(system)

              this.assignState({
                system
              })

            }}>
            { system.name }
          </MenuItem>
        )
      })

    return(
      <div className="manage">

        <DropdownButton
          title={`Select system: ${system ? system.name : ''}`}
          key={'dropdown-systems'}
          id={'dropdown-systems'}>
            { systemItems }
        </DropdownButton>

        <div className="hooks">
          { this.renderHooks() }
        </div>

        <div className="hook-details">
          { hookDetails && this.renderHookDetails() }
        </div>
      </div>
    )
  }
}
