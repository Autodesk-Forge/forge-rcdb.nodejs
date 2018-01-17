import { DropdownButton, MenuItem } from 'react-bootstrap'
import BaseComponent from 'BaseComponent'
import ReactJson from 'react-json-view'
import { ReactLoader } from 'Loader'
import Systems from '../Systems'
import React from 'react'

export default class CreateView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onSelect = this.onSelect.bind(this)
    this.onEdit = this.onEdit.bind(this)

    this.state = {
      event: Systems[0].events[0],
      system: Systems[0],
      scope: {
        folder: 'DM folderId ...'
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelect () {
    
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onEdit ({updated_src}) {
    
    this.assignState({
      scope: updated_src
    })
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
        <div className="controls">
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
        <div className="scope">
          <ReactJson
            onSelect={this.onSelect}
            enableClipboard={false}
            onDelete={this.onEdit}
            onEdit={this.onEdit}
            onAdd={this.onEdit}
            src={scope}
            name={false}
          />
        </div>
      </div>
    )
  }
}
