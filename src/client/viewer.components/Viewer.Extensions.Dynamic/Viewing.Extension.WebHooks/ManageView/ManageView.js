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

    this.webHooksAPI = this.props.webHooksAPI

    this.state = {
      hookDetails: null,
      system: null,
      hooks: []
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
  onRemoveHook (hook) {
  
    const hooks = this.state.hooks.filter((hk) => {
      return hk.hookId !== hook.hookId
    })

    this.assignState({
      hooks
    })

    this.webHooksAPI.removeHook(
      this.state.system.id,
      hook.eventType,
      hook.hookId)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderHooks () {

    return this.state.hooks.map((hook) => {

      return(
        <div className="hook" key={hook.hookId} 
          onClick={() => this.onHookSelected(hook)}>
          { "Hook: " + hook.eventType }
          <button  
            onClick={(e) => {
              this.onRemoveHook(hook)
              e.stopPropagation()
            }}
            title="remove that hook">
            <span className="fa fa-times"/>
          </button>
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
  
              this.assignState({
                system
              })

              this.webHooksAPI.getSystemHooks(
                system.id).then((hooks) => {
                  this.assignState({
                    hooks: Array.isArray(hooks) 
                      ? hooks : []
                  })
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
