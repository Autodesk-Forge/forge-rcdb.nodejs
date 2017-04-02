/////////////////////////////////////////////////////////
// Viewing.Extension.StateManager.React
// by Philippe Leefsma, March 2017
//
/////////////////////////////////////////////////////////
import ConfigAPI from './Viewing.Extension.Config.API'
import ContentEditable from 'react-contenteditable'
import ExtensionBase from 'Viewer.ExtensionBase'
import './Viewing.Extension.ConfigManager.scss'
import WidgetContainer from 'WidgetContainer'
import 'react-dragula/dist/dragula.min.css'
import ServiceManager from 'SvcManager'
import Toolkit from 'Viewer.Toolkit'
import Dragula from 'react-dragula'
import DOMPurify from 'dompurify'
import ReactDOM from 'react-dom'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'
import {
  DropdownButton,
  MenuItem
} from 'react-bootstrap'

class ConfigManagerExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.renderTitle = this.renderTitle.bind(this)

    this.dialogSvc =
      ServiceManager.getService('DialogSvc')

    this.react = options.react

    if (this.options.apiUrl) {

      const modelId = this.options.dbModel._id

      this.api = new ConfigAPI(
        options.apiUrl +
        `/config/${options.database}/${modelId}`)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'config-manager'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ConfigManager'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (e) => {

        this.options.loader.hide()
      })

    this.react.setState({

      newSequenceName: '',
      newStateName: '',
      sequence: null,
      sequences: [],
      items: []

    }).then (() => {

      this.react.pushRenderExtension(this).then(async() => {

        const component = this.react.getComponent()

        const domItems = ReactDOM.findDOMNode(
          component.refs.items)

        this.drake = Dragula([domItems])

        this.drake.on('drop', () => {

          this.onUpdateSequence()
        })

        if (this.api) {

          const sequences = await this.api.getSequences()

          const sequence = sequences.length ?
            sequences[0] : null

          this.react.setState({
            sequences
          })

          this.setActiveSequence (sequence)
        }
      })
    })

    console.log('Viewing.Extension.ConfigManager loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    this.react.popViewerPanel(this)

    console.log('Viewing.Extension.ConfigManager unloaded')

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

        const state = this.react.getState()

        const sequence = {
          name: state.newSequenceName,
          id: this.guid(),
          stateIds: []
        }

        this.react.setState({
          sequences: [
            ...state.sequences, sequence
          ],
          sequence: sequence,
          items: []
        })

        if (this.api) {

          this.api.addSequence(sequence)
        }
      }

      this.dialogSvc.off('dialog.close', onClose)
    }

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      className: 'config-manager-dlg',
      title: 'Add Sequence ...',
      content:
        <div>
          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'newSequenceName')}
            onKeyDown={(e) => this.onKeyDown(e)}
            data-placeholder="Sequence name ..."
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

    const state = this.react.getState()

    const onClose = (result) => {

      if (result === 'OK') {

        if (this.api) {

          this.api.deleteSequence(state.sequence.id)
        }

        const sequences = state.sequences.filter(
          (sequence) => {
            return sequence.id !== state.sequence.id
          })

        const sequence = sequences.length ?
          sequences[0] : null

        this.react.setState({
          sequences
        })

        this.setActiveSequence(sequence)
      }

      this.dialogSvc.off('dialog.close', onClose)
    }

    this.dialogSvc.on('dialog.close', onClose)

    const msg = DOMPurify.sanitize(
      `Are you sure you want to delete`
      + ` <b>${state.sequence.name}</b> ?`)

    this.dialogSvc.setState({
      className: 'config-manager-dlg',
      title: 'Delete Sequence ...',
      content:
        <div dangerouslySetInnerHTML={{__html: msg}}>
        </div>,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getStateIds () {

    const component = this.react.getComponent()

    const domItems = ReactDOM.findDOMNode(
      component.refs.items)

    const stateIds =
      Array.from(domItems.childNodes).map(
        (childNode) => {

          return childNode.dataset.id
        })

    return stateIds
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUpdateSequence () {

    const { sequence } = this.react.getState()

    this.react.setState({
      sequence: Object.assign({}, sequence, {
          stateIds: this.getStateIds()
        })
    })

    if (this.api) {

      this.api.updateSequence(sequence)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  addItem (item) {

    const state = this.react.getState()

    if (!item) {

      var viewerState = this.viewer.getState()

      viewerState.name = state.newStateName.length
        ? state.newStateName
        : new Date().toString('d/M/yyyy H:mm:ss')

      viewerState.id = this.guid()

      if (this.api) {

        this.api.addState(
          state.sequence.id,
          viewerState)
      }

      this.react.setState({
        items: [...state.items, viewerState],
        newStateName: ''
      })

      this.on(`restoreState.${viewerState.id}`, () => {

        console.log(viewerState)

        this.onRestoreState(viewerState)
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
  onRestoreState (viewerState) {

    this.viewer.getState (viewerState)

    const filteredState = this.filterState(
      viewerState,
      'objectSet',
      'explodeScale')

    this.viewer.restoreState(filteredState)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteItem (id) {

    const state = this.react.getState()

    this.react.setState({
      items: state.items.filter((item) => {
        return item.id !== id
      })
    })

    if (this.api) {

      this.api.deleteState(state.sequence.id, id)
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
  setActiveSequence (sequence) {

    this.off ()

    this.react.setState({
      sequence
    })

    if (this.api) {

      if (sequence) {

        this.api.getStates(sequence.id).then((states) => {

          states.map((state) => {

            this.on(`restoreState.${state.id}`, () => {

              this.onRestoreState(state)
            })
          })

          this.react.setState({
            items: states
          })
        })

      } else {

        this.react.setState({
          items: []
        })
      }
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  playSequence (period) {

    const { loop } = this.react.getState()

    const stateIds = this.getStateIds()

    var sequenceIdx = 0

    const step = (stateId) => {

      this.emit(`restoreState.${stateId}`)

      //$(`#${id}`).addClass('active')

      setTimeout(() => {
        //$(`#${id}`).removeClass('active')
      }, period * 0.9)

      ++sequenceIdx

      if (sequenceIdx == stateIds.length) {

        if (!loop) {

          //this.playToggleBtn.setState(0)
          return
        }

        sequenceIdx = 0
      }

      setTimeout(() => {

        step(stateIds[sequenceIdx])

      }, period)
    }

    if (stateIds.length > 0) {

      step(stateIds[sequenceIdx])
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setDocking (docked) {

    const id = ConfigManagerExtension.ExtensionId

    if (docked) {

      this.react.popRenderExtension(id).then(() => {

        this.react.pushViewerPanel(this)
      })

    } else {

      this.react.popViewerPanel(id).then(() => {

        this.react.pushRenderExtension(this)
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle (docked) {

    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className="title">
        <label>
          Config Manager
        </label>
        <div className="config-manager-controls">
          <button onClick={() => this.setDocking(docked)}
            title="Toggle docking mode">
            <span className={spanClass}>
            </span>
          </button>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderControls () {

    const state = this.react.getState()

    const sequences = state.sequences.map((sequence, idx) => {
      return (
        <MenuItem eventKey={idx} key={idx} onClick={() => {

          this.setActiveSequence(sequence)
        }}>
          { sequence.name }
        </MenuItem>
      )
    })

    const sequenceName = state.sequence
      ? state.sequence.name : ''

    return (
      <div className="controls">

        <div className="row">

          <DropdownButton
            title={"Sequence: " +  sequenceName}
            className="sequence-dropdown"
            disabled={!state.sequence}
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
            disabled={!state.sequence}
            title="Delete sequence">
            <span className="fa fa-times">
            </span>
          </button>

        </div>

        <div className="row">

          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'newStateName')}
            onKeyDown={(e) => this.onKeyDown(e)}
            data-placeholder="State name ..."
            className="state-name-input"
            disabled={!state.sequence}
            html={''}/>

          <button onClick={() => this.addItem()}
            disabled={!state.sequence}
            title="Save state">
            <span className="fa fa-database">
            </span>
          </button>

          <button onClick={() => this.playSequence(2000)}
            disabled={!state.sequence}
            title="Play sequence">
            <span className="fa fa-play">
            </span>
          </button>

          <Switch isChecked={true} className="loop"/>

        </div>

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
        <div data-id={item.id} key={item.id}
          className="item"
          onClick={
            () => this.onRestoreState (item)
          }>

          <Label truncateText=" …"
            text={text}
          />

          <button onClick={(e) => {
            this.deleteItem(item.id)
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
      <div className="items" ref="items">
        { items }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>

        { this.renderControls() }
        { this.renderItems() }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ConfigManagerExtension.ExtensionId,
  ConfigManagerExtension)
