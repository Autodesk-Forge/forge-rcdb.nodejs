import { DropdownButton, MenuItem } from 'react-bootstrap'
import BaseComponent from 'BaseComponent'
import { ServiceContext } from 'ServiceContext'
import { ReactLoader } from 'Loader'
import Systems from '../Systems'
import JSONView from 'JSONView'
import React from 'react'

export default class EventsView extends BaseComponent {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super(props)

    this.onEventSelected = this.onEventSelected.bind(this)
    this.onWebHookEvent = this.onWebHookEvent.bind(this)

    this.socketSvc.on(
      'forge.hook',
      this.onWebHookEvent)

    this.socketSvc.connect().then(() => {
      this.socketSvc.emit(
        'forge.userId',
        this.props.user.userId)
    })

    this.state = {
      eventDetails: null,
      events: []
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillUnmount () {
    this.socketSvc.off(
      'forge.hook',
      this.onWebHookEvent)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onWebHookEvent (event) {
    this.assignState({
      events: [...this.state.events, event]
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onEventSelected (event) {
    this.assignState({
      eventDetails: event
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onDeleteEvent (event) {
    const events = this.state.events.filter((e) => {
      return e.hook.hookId !== event.hook.hookId
    })

    await this.assignState({
      events
    })

    if (this.state.eventDetails) {
      const hook = this.state.eventDetails.hook

      if (hook.hookId === event.hook.hookId) {
        this.assignState({
          eventDetails: null
        })
      }
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderEvents () {
    return this.state.events.map((event) => {
      const hook = event.hook

      return (
        <div
          className='event' key={hook.hookId}
          onClick={() => this.onEventSelected(event)}
        >
          {'Event: ' + hook.event}
          <button
            onClick={(e) => {
              this.onDeleteEvent(event)
              e.stopPropagation()
            }}
            title='delete event'
          >
            <span className='fa fa-times' />
          </button>
        </div>
      )
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderEventDetails () {
    return (
      <JSONView src={this.state.eventDetails} />
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const { eventDetails } = this.state

    return (
      <div className='events'>
        <div className='events-list'>
          {this.renderEvents()}
        </div>
        <div className='events-details'>
          {eventDetails && this.renderEventDetails()}
        </div>
      </div>
    )
  }
}
