import { DropdownButton, MenuItem } from 'react-bootstrap'
import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import Systems from '../Systems'
import JSONView from 'JSONView'
import React from 'react'

export default class CreateView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.state = {
      event: Systems[0].events[0],
      system: Systems[0],
      scope: null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const { system, event, scope } = this.state

    const systemItems = Systems.map((system) => {

      return (
        <MenuItem eventKey={system.id} key={system.id}
          onClick={() => {

            this.assignState({
              system
            })
          }}>
          { system.name }
        </MenuItem>
      )
    })

    const eventItems = system.events.map((event) => {

      return (
        <MenuItem eventKey={event.id} key={event.id}
          onClick={() => {

            this.assignState({
              event
            })
          }}>
          { event.name }
        </MenuItem>
      )
    })

    return(
      <div className="create">

        <DropdownButton
          title={`Select system: ${system ? system.name : ''}`}
          key={'dropdown-systems'}
          id={'dropdown-systems'}>
            { systemItems }
        </DropdownButton>

        <hr/>

        <DropdownButton
          title={`Select event: ${event ? event.name : ''}`}
          key={'dropdown-events'}
          id={'dropdown-events'}>
            { eventItems }
        </DropdownButton>

        <hr/>

        <button
          onClick={() => this.props.onCreateHook(system, event, scope)}
          className="create-btn">
          Create Hook
        </button>

      </div>
    )
  }
}
