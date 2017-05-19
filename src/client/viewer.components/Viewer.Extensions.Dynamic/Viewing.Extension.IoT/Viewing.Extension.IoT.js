/////////////////////////////////////////////////////////////////
// Configurator Extension
// By Philippe Leefsma, February 2016
//
/////////////////////////////////////////////////////////////////
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import HotSpotPropertyPanel from './IoT.HotSpot.PropertyPanel'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import EventTool from 'Viewer.EventTool'
import ServiceManager from 'SvcManager'
import IoTPopover from './IoT.Popover'
import Toolkit from 'Viewer.Toolkit'
import IoTGraph from './IoT.Graph'
import React from 'react'
import './Data.scss'

// Commands
import HotSpotCommand from 'HotSpot.Command'

import hotspots from './hotspots'

class IoTExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onSelection = this.onSelection.bind(this)

    this.react = this.options.react

    this.hotSpotCommand = new HotSpotCommand (viewer, {
      parentControl: options.parentControl,
      hotspots
    })

    this.panel = new HotSpotPropertyPanel(
      this.viewer.container,
      this.guid(),
      'Hotspot Data')

    var controlledHotspot = null

    this.hotSpotCommand.on('hotspot.created', (hotspot) => {

      if (hotspot.data.controlled) {

        controlledHotspot = hotspot

        hotspot.hide()
      }
    })

    this.hotSpotCommand.on('hotspot.clicked', (hotspot) => {

      console.log(JSON.stringify(this.viewer.getState({viewport:true})))

      const state = this.react.getState()

      this.panel.setProperties(hotspot.data.properties)

      this.hotSpotCommand.isolate(hotspot.id)

      this.panel.setVisible(true)

      this.viewer.restoreState(
        hotspot.data.viewerState)

      Toolkit.isolateFull(
        this.viewer,
        hotspot.data.isolateIds)

      const id = hotspot.data.id

      const stateHotSpots = state.hotspots.map((hotspot) => {

        return Object.assign({}, hotspot, {
          active: hotspot.id === id
        })
      })

      this.react.setState({
        activeItem: hotspot.data,
        hotspots: stateHotSpots
      })
    })

    this.socketSvc = ServiceManager.getService('SocketSvc')

    const sensorEvents = [
      'sensor.acceleration',
      'sensor.temperature',
      'sensor.lux'
    ]

    const passThreshold = (data) => {

      for(const key of Object.keys(data) ) {

        if (data[key].value >= data[key].threshold) {

          return true
        }
      }

      return false
    }

    this.socketSvc.on(sensorEvents.join(' '), (data) => {

      if (!controlledHotspot) {

        return
      }

      const state = this.react.getState()

      const activeItem = state.activeItem

      if (activeItem && (activeItem.id === controlledHotspot.id)) {

        this.react.setState({
          graphData: data
        })
      }

      if (passThreshold(data)) {

        clearTimeout(this.timeout)

        this.timeout = null

        controlledHotspot.data.strokeColor = '#FF0000'
        controlledHotspot.data.fillColor = '#FF8888'

        if (controlledHotspot) {
          controlledHotspot.show()
        }

        const stateHostSpots = state.hotspots.filter((hotspot) => {
          return !hotspot.controlled
        })

        this.react.setState({
          hotspots: [
            ...stateHostSpots,
            controlledHotspot.data
          ]
        })

      } else {

        this.react.setState({
          hotspots: state.hotspots.map((hotspot) => {

            if (hotspot.id === controlledHotspot.id) {

              hotspot.strokeColor = '#4CAF50'
              hotspot.fillColor = '#4CAF50'
            }

            return hotspot
          })
        })

        if (!this.timeout) {

          this.timeout = setTimeout(() => {

            this.timeout = null

            controlledHotspot.hide()

            this.react.setState({
              hotspots: state.hotspots.filter((hotspot) => {
                return !hotspot.controlled
              })
            })

            if (activeItem && (activeItem.id === controlledHotspot.id)) {

              this.react.setState({
                activeItem: null,
                graphData: null
              })
            }
          }, 20 * 1000)
        }
      }
    })

    this.timeout = null
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.UISettings', {
        toolbar:{
          removedControls: [
            '#navTools'
          ],
          retargetedControls: [

          ]
        }
    })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu', {
        buildMenu: (menu, selectedDbId) => {
          return !selectedDbId
            ? [{
                title: 'Show all objects',
                target: () => {
                  Toolkit.isolateFull(this.viewer)
                  this.hotSpotCommand.isolate()
                  this.viewer.fitToView()
              }}]
            : menu
        }
    })

    this.eventTool = new EventTool(this.viewer)

    this.eventTool.activate()

    this.eventTool.on('singleclick', (event) => {

      this.pointer = event
    })

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (e) => {

        this.options.loader.hide()
        this.hotSpotCommand.activate()
      })

    this.viewer.setProgressiveRendering(true)
    this.viewer.setQualityLevel(false, true)
    this.viewer.setGroundReflection(false)
    this.viewer.setGroundShadow(false)
    this.viewer.setLightPreset(1)

    this.react.pushRenderExtension(this)

    this.react.setState({
      hotspots: hotspots.filter((hotspot) => {
        return !hotspot.controlled
      })

    })

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.IoT'
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.hotSpotCommand.deactivate()

    return true
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onSelection (event) {

    if (event.selections && event.selections.length) {

      const selection = event.selections[0]

      const data = this.viewer.clientToWorld(
        this.pointer.canvasX,
        this.pointer.canvasY,
        true)

      console.log(data)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onItemClicked (item) {

    const state = this.react.getState()

    const activeItem = state.activeItem

    if (activeItem && (activeItem.id === item.id)) {

      const stateHotSpots = state.hotspots.map((hotspot) => {

        return Object.assign({}, hotspot, {
          active: false
        })
      })

      this.react.setState({
        hotspots: stateHotSpots,
        activeItem: null,
        graphData: null
      })

      Toolkit.isolateFull(this.viewer)

      this.hotSpotCommand.isolate()

      this.panel.setVisible(false)

      this.viewer.fitToView()

    } else {

      this.panel.setProperties(item.properties)

      this.hotSpotCommand.isolate(item.id)

      this.panel.setVisible(true)

      this.viewer.restoreState(
        item.viewerState)

      Toolkit.isolateFull(
        this.viewer,
        item.isolateIds)

      const stateHotSpots = state.hotspots.map((hotspot) => {

        return Object.assign({}, hotspot, {
          active: hotspot.id === item.id
        })
      })

      this.react.setState({
        hotspots: stateHotSpots,
        activeItem: item,
        graphData: null
      })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  hexToRgbA (hex, alpha) {

    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {

      var c = hex.substring(1).split('')

      if (c.length == 3) {

        c = [c[0], c[0], c[1], c[1], c[2], c[2]]
      }

      c = '0x' + c.join('')

      return `rgba(${(c>>16)&255},${(c>>8)&255},${c&255},${alpha})`
    }

    throw new Error('Bad Hex Number: ' + hex)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  renderGraphs () {

    const state = this.react.getState()

    if (!state.activeItem) {
      return (<div></div>)
    }

    //TEMP
    const threshold1 = state.graphData
      ? state.graphData.temperature.threshold
      : 20 + (0.5 - Math.random()) * 2

    //Accel
    const threshold2 = state.graphData
      ? state.graphData.acceleration.threshold
      : 0.5 + (0.5 - Math.random()) * 0.1

    //Accel
    const threshold3 = state.graphData
      ? state.graphData.lux.threshold
      : 150 + (0.5 - Math.random()) * 50

    const value1 = state.graphData
      ? state.graphData.temperature.value
      : null

    const value2 = state.graphData
      ? state.graphData.acceleration.value
      : null

    const value3 = state.graphData
      ? state.graphData.lux.value
      : null

    return (
      <div>
        <IoTGraph
          tag={state.activeItem.tags[0]}
          threshold={threshold1}
          name={"Temperature"}
          randomBase={22}
          randomRange={5}
          value={value1}
          tagIdx={0}
        />
        <IoTGraph
          tag={state.activeItem.tags[0]}
          threshold={threshold2}
          name={"Acceleration"}
          randomBase={22}
          randomRange={5}
          value={value2}
          tagIdx={1}
        />
        <IoTGraph
          tag={state.activeItem.tags[0]}
          threshold={threshold3}
          randomBase={22}
          randomRange={5}
          value={value3}
          name={"Lux"}
          tagIdx={2}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render () {

    const state = this.react.getState()

    const items = state.hotspots.map((hotspot) => {

      const active = hotspot.active ? ' active' : ''

      const style = {
        backgroundColor: this.hexToRgbA(hotspot.fillColor, 0.3),
        border: `2px solid ${hotspot.strokeColor}`
      }

      return (
        <div key={`item-${hotspot.id}`}
          className={'list-item ' + active}
          onClick={() => {
            this.onItemClicked(hotspot)
          }}>
          <div className="item-priority" style={style}>
          </div>
          <label>
            {hotspot.name || hotspot.id}
          </label>
        </div>
      )
    })

    return (
      <WidgetContainer title="Incidents">
        <ReflexContainer key="incidents" orientation='horizontal'>
          <ReflexElement flex={0.35}>
            <div className="item-list-container">
              {items}
            </div>
          </ReflexElement>
          <ReflexSplitter/>
          <ReflexElement className="graph-list-container"
            renderOnResize={true}
            propagateDimensions={true}>
            {
              state.activeItem &&
              <IoTGraphContainer
                tags={state.activeItem.tags}
                graphData={state.graphData}
                guid={state.activeItem.id}
              />
            }
          </ReflexElement>
        </ReflexContainer>
      </WidgetContainer>
    )
  }
}

class IoTGraphContainer extends React.Component {

  render () {

    const { guid, graphData, dimensions, tags} = this.props

    //TEMP
    const threshold1 = graphData
      ? graphData.temperature.threshold
      : 20 + (0.5 - Math.random()) * 2

    //Accel
    const threshold2 = graphData
      ? graphData.acceleration.threshold
      : 0.5 + (0.5 - Math.random()) * 0.2

    //LUX
    const threshold3 = graphData
      ? graphData.lux.threshold
      : 150 + (0.5 - Math.random()) * 50

    const value1 = graphData
      ? graphData.temperature.value
      : null

    const value2 = graphData
      ? graphData.acceleration.value
      : null

    const value3 = graphData
      ? graphData.lux.value
      : null

    return (
      <div>
        <IoTGraph
          dimensions={dimensions}
          threshold={threshold1}
          name={"Temperature"}
          randomRange={10.0}
          randomBase={23.0}
          tagId={tags[0]}
          value={value1}
          guid={guid}
          max={50.0}
          min={0.0}
        />
        <IoTGraph
          dimensions={dimensions}
          threshold={threshold2}
          name={"Acceleration"}
          randomRange={0.3}
          randomBase={0.7}
          tagId={tags[1]}
          value={value2}
          guid={guid}
          max={2.0}
          min={0.0}
        />
        <IoTGraph
          dimensions={dimensions}
          threshold={threshold3}
          randomRange={50.0}
          randomBase={145.0}
          tagId={tags[2]}
          value={value3}
          name={"Lux"}
          guid={guid}
          max={200.0}
          min={0.0}
        />
      </div>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  IoTExtension.ExtensionId,
  IoTExtension)

module.exports = 'Viewing.Extension.IoT'
