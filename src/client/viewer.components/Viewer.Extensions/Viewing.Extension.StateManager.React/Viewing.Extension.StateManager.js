/////////////////////////////////////////////////////////
// Viewing.Extension.StateManager.React
// by Philippe Leefsma, March 2017
//
/////////////////////////////////////////////////////////
import StateAPI from './Viewing.Extension.StateManager.API'
import ContentEditable from 'react-contenteditable'
import ExtensionBase from 'Viewer.ExtensionBase'
import './Viewing.Extension.StateManager.scss'
import WidgetContainer from 'WidgetContainer'
import Label from 'react-text-truncate'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'
import React from 'react'
import {
  DropdownButton,
  MenuItem
} from 'react-bootstrap'

class StateManagerExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.dialogSvc = ServiceManager.getService(
      'DialogSvc')

    this.react = options.react

    if(this.options.apiUrl) {

      this.api = new StateAPI(
        options.apiUrl)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'state-manager'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.StateManager.React'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      sequenceDisabled: true,
      newSequenceName: '',
      sequenceName: '',
      stateName: '',
      sequences: [],
      items: []

    }).then (() => {

      this.react.setRenderExtension(this).then(() => {

        if (this.api) {

          this.dbModelId = this.options.dbModel._id

          this.api.getSequence(this.dbModelId).then(
            async(sequence) => {

            var states = await this.api.getStates(
              this.dbModelId)

            sequence.forEach((stateId) => {

              states.forEach((state) => {

                if(state.guid == this.options.stateId) {

                  this.viewer.restoreState(state, false)
                }

                if (state.guid == stateId) {

                  this.addItem (state)
                }
              })
            })
          })
        }
      })
    })

    console.log('Viewing.Extension.StateManager.React loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.StateManager.React unloaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  addSequence () {

    this.react.setState({
      newSequenceName: ''
    })

    const onClose = (result) => {

      if (result === 'OK') {

        const {newSequenceName} = this.react.getState()

        console.log('New sequence: ' + newSequenceName)
      }

      this.dialogSvc.off('dialog.close', onClose)
    }

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      className: 'state-manager-dlg',
      title: 'Add Sequence ...',
      content:
        <div>
          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'newSequenceName')}
            onKeyDown={(e) => this.onKeyDown(e)}
            className="sequence-name-input"
            html={''}/>
        </div>,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  deleteSequence () {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  addItem (item) {

    const state = this.react.getState()

    if (!item) {

      var viewerState = this.viewer.getState()

      viewerState.guid = this.guid()

      viewerState.name = state.stateName.length
        ? state.stateName
        : new Date().toString('d/M/yyyy H:mm:ss')

      if (this.api) {

        this.api.addState(
          this.dbModelId,
          viewerState)
      }

      this.react.setState({
        items: [...state.items, viewerState]
      })

    } else {

      this.react.setState({
        items: [...state.items, item]
      })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onItemClicked (viewerState) {

    this.viewer.getState (viewerState)

    const filteredState = this.filterState(
      viewerState, 'objectSet', 'explodeScale')

    this.viewer.restoreState(filteredState)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteItem (guid) {

    const state = this.react.getState()

    this.react.setState({
      items: state.items.filter((item) => {
        return item.guid !== guid
      })
    })

    if (this.api) {

      this.api.removeState(this.dbModelId, guid)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()
      return
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInputChanged (e, key) {

    const state = this.react.getState()

    state[key] = e.target.value

    this.react.setState(state)
  }

  /////////////////////////////////////////////////////////
  // Filter a state selections
  //
  /////////////////////////////////////////////////////////
  filterState (srcState, setNames, elementNames) {

    const strObj = JSON.stringify(srcState)

    const state = JSON.parse(strObj)

    const sets = Array.isArray(setNames) ?
      setNames : [setNames]

    const elements = Array.isArray(elementNames) ?
      elementNames : [elementNames]

    sets.forEach((setName)=>{

      if(state[setName]){

        elements.forEach((elementName)=>{

          state[setName].forEach((element)=> {

            delete element[elementName]
          })
        })
      }
    })

    return state
  }

  /////////////////////////////////////////////////////////
  // A fix for viewer.restoreState
  // that also restores pivotPoint
  //
  /////////////////////////////////////////////////////////
  restoreStateWithPivot(state, filter=null, immediate=false) {

    const viewer = this.viewer

    function onStateRestored() {

      viewer.removeEventListener(
        Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT,
        onStateRestored);

      const pivot = state.viewport.pivotPoint;

      setTimeout(function () {

        viewer.navigation.setPivotPoint(
          new THREE.Vector3(
            pivot[0], pivot[1], pivot[2]))
      }, 1250)
    }

    viewer.addEventListener(
      Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT,
      onStateRestored)

    viewer.restoreState(state, filter, immediate)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          State Manager
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderControls () {

    const state = this.react.getState()

    const sequences = state.sequences.map((item, idx) => {
      return (
        <MenuItem eventKey={idx} key={idx} onClick={() => {

        }}>
          { item.name }
        </MenuItem>
      )
    })

    return (
      <div className="controls">

        <DropdownButton
          title={"Sequence: " + state.sequenceName }
          disabled={state.sequenceDisabled}
          className="sequence-dropdown"
          key="sequence-dropdown"
          id="sequence-dropdown">
         { sequences }
        </DropdownButton>

        <button onClick={() => this.addSequence()}
          title="Add sequence">
          <span className="fa fa-plus">
          </span>
        </button>

        <button onClick={() => this.deleteSequence()}
          title="Delete sequence">
          <span className="fa fa-times">
          </span>
        </button>

        <br/>

        <ContentEditable
          onChange={(e) => this.onInputChanged(e, 'stateName')}
          onKeyDown={(e) => this.onKeyDown(e)}
          className="state-name-input"
          html={''}/>

        <button onClick={() => this.addItem()}
          title="Save state">
          <span className="fa fa-database">
          </span>
        </button>

        <button onClick={() => this.playSequence()}
          title="Play sequence">
          <span className="fa fa-play">
          </span>
        </button>

      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItems () {

    const state = this.react.getState()

    const items = state.items.map((item) => {

      const text = item.name

      return (
        <div key={item.guid} className="item" onClick={
            () => this.onItemClicked (item)
          }>

          <Label truncateText=" …"
            text={text}
            line={1}
          />

          <button onClick={(e) => {
            this.deleteItem(item.guid)
            e.stopPropagation()
            e.preventDefault()
            }}
            title="Delete state">
            <span className="fa fa-times">
            </span>
          </button>
        </div>
      )
    })

    return (
      <div className="items">
        { items }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts = {showTitle: true}) {

    return (
      <WidgetContainer renderTitle={this.renderTitle}
        showTitle={opts.showTitle}
        className={this.className}>

        { this.renderControls() }
        { this.renderItems() }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  StateManagerExtension.ExtensionId,
  StateManagerExtension)
