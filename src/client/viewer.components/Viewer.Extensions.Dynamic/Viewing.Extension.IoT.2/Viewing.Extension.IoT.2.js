/////////////////////////////////////////////////////////
// Viewing.Extension.IoT2
// by Philippe Leefsma, June 2017
//
/////////////////////////////////////////////////////////
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import {OverlayTrigger, Popover} from 'react-bootstrap'
import {IoTGraphContainer} from './IoT.Graph'
import WidgetContainer from 'WidgetContainer'
import HotSpotCommand from 'HotSpot.Command'
import EventTool from 'Viewer.EventTool'
import ServiceManager from 'SvcManager'
import './Viewing.Extension.IoT.2.scss'
import Toolkit from 'Viewer.Toolkit'
import { ReactLoader } from 'Loader'
import DOMPurify from 'dompurify'
import Switch from 'Switch'
import data from './data'
import React from 'react'
import d3 from 'd3'

class IoTExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onToggleHotspotCmd = this.onToggleHotspotCmd.bind(this)

    this.hotSpotCommand = new HotSpotCommand (viewer, {
      animate: true,
      hotspots: []
    })

    this.hotSpotCommand.on('hotspot.clicked', (item) => {

      const s = this.viewer.getState({viewport: true})

      console.log(JSON.stringify(s))

      this.onItemClicked(item)
    })

    this.dialogSvc =
      ServiceManager.getService('DialogSvc')

    this.eventTool = new EventTool(this.viewer)

    this.react = this.options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'IoT2'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.IoT.2'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.viewer.setQualityLevel(false, false)
    this.viewer.setProgressiveRendering(true)
    this.viewer.setGroundReflection(false)
    this.viewer.setGroundShadow(false)
    this.viewer.setBackgroundColor(
      255, 255, 255,
      255, 255, 255)

    this.react.setState({

      activeItem: null,

      items: data.items,

      filters: {

        conveyors: true,
        sorters: true,
        DRMs: true,

        warning: true,
        error: true,
        OK: true
      },

      hotspotCmdActive: false

    }).then (() => {

      this.react.pushRenderExtension(this)

      this.updateGraphData()
    })

    this.eventTool.on ('singleclick', (pointer) => {

      const hitTest = this.viewer.clientToWorld(
        pointer.canvasX,
        pointer.canvasY,
        true)

      if (hitTest) {

        const worldPoint = hitTest.intersectPoint

        console.log(hitTest.dbId)
        console.log(worldPoint)

        const colors = this.getHotspotStatusColors(
          'warning')

        this.hotSpotCommand.createHotSpot({
          strokeColor: colors.stroke,
          fillColor: colors.fill,
          dbId: hitTest.dbId,
          worldPoint
        })
      }
    })

    console.log('Viewing.Extension.IoT.2 loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.IoT.2 unloaded')

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateGraphData () {

    const state = this.react.getState()

    const items = state.items.map((item) => {

      item.graphData.forEach((data) => {

        if (data.name.toLowerCase() === 'oil level') {

          data.value -= (Math.random() * 0.05)

          data.value = Math.max(0.6, data.value)
        }
      })

      return item
    })

    this.react.setState({
      items
    })

    setTimeout(() => this.updateGraphData(),
      1000 * (5 + Math.random() * 10))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onExtensionLoaded (event) {

    if (event.extensionId === 'Autodesk.FirstPerson') {

      $('#toolbar-firstPersonTool').click((e) => {

        e.stopPropagation()

        const toolCtrl = this.viewer.toolController

        this.firstPerson
          ? toolCtrl.deactivateTool('firstperson')
          : toolCtrl.activateTool('firstperson')

        this.firstPerson = !this.firstPerson
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded () {

    super.onModelRootLoaded()

    const state = this.react.getState()

    const hotspots = state.items.map((item) => {

      const colors = this.getHotspotStatusColors(
        item.status)

      const hotspotData = Object.assign({}, item, {
        strokeColor: colors.stroke,
        fillColor: colors.fill
      })

      return this.hotSpotCommand.createHotSpot(
        hotspotData)
    })

    this.options.loader.show(false)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onToolbarCreated() {

    this.viewer.restoreState(data.initialState)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onObjectTreeCreated () {

    this.viewer.toolController.activateTool('firstperson')

    this.firstPerson = true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelCompletedLoad (event) {

    this.react.setState({
      loader: false
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = IoTExtension.ExtensionId

    if (docked) {

      await this.react.popRenderExtension(id)

      this.react.pushViewerPanel(this, {
        height: 250,
        width: 350
      })

    } else {

      await this.react.popViewerPanel(id)

      this.react.pushRenderExtension(this)
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onItemClicked (selectedItem) {

    const state = this.react.getState()

    if (state.activeItem &&
        state.activeItem.id !== selectedItem.id) {

      state.activeItem.active = false
    }

    const items = state.items.map((item) => {

      if (selectedItem.id === item.id) {

        this.viewer.restoreState(
          item.state)

        item.active = !item.active

        state.activeItem = item.active
          ? item
          : null

      } else {

        item.active = false
      }

      return item
    })

    this.react.setState({
      items
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onFilterChanged (key) {

    const state = this.react.getState()

    state.filters[key] = !state.filters[key]

    const visibleItems = state.items.filter((item) => {

      return (state.filters[item.status] &&
              state.filters[item.type])
    })

    const visibleIds = visibleItems.map((item) => item.id)

    this.hotSpotCommand.isolate(visibleIds)

    this.react.setState ({
      filters: state.filters
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onToggleHotspotCmd () {

    const {hotspotCmdActive} = this.react.getState()

    hotspotCmdActive
      ? this.eventTool.deactivate()
      : this.eventTool.activate()

    this.react.setState({
      hotspotCmdActive: !hotspotCmdActive
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getHotspotStatusColors (status) {

    switch (status) {

      case 'warning':
        return {
          stroke: '#f0ad4e',
          fill: '#f0ad4e'
        }

      case 'error':
        return {
          stroke: '#d9534f',
          fill: '#d9534f'
        }

      case 'OK':
        return {
          stroke: '#00FF00',
          fill: '#00FF00'
        }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItems (items) {

    return items.map((item) => {

      const active = item.active ? ' active' : ''

      const colors = this.getHotspotStatusColors(item.status)

      const style = {
        backgroundColor: this.hexToRgbA(colors.fill, 0.3),
        border: `2px solid ${colors.stroke}`
      }

      return (
        <div className={`list-item ${item.status}` + active}
          key={`item-${item.id}`}
          onClick={() => {
            this.onItemClicked(item)
          }}>
          <span className="fa fa-exclamation-circle"/>
          <label>
            {item.name + ' : ' +item.metadata[1].value}
          </label>
        </div>
      )
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItemList () {

    const state = this.react.getState()

    const typesMap = {
      conveyors: [],
      sorters: [],
      DRMs: []
    }

    state.items.forEach((item) => {

      if (state.filters[item.status] &&
          state.filters[item.type]) {
        typesMap[item.type].push(item)
      }
    })

    return (
      <div className="content">
        <ReactLoader show={state.loader}/>
        <div className="item-list-container">
          { this.renderItems (typesMap.conveyors)  }
          { typesMap.conveyors.length !==0 && <hr/>}
          { this.renderItems (typesMap.DRMs)  }
          { typesMap.sorters.length !==0 && <hr/>}
          { this.renderItems (typesMap.sorters)  }
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderMetaValue (metadata) {

    switch(metadata.type) {

      case 'link':
        return (
          <a href={metadata.value} target="_blank">
            {'Open'}
           </a>
        )
      default:
        return metadata.value
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItemDetails (item) {

    const rows = item.metadata.map((data, idx) => {

      return (
        <tr key={item.id + idx}>
          <td className="name-field">
            {data.name}:&nbsp;
          </td>
          <td>
            {this.renderMetaValue(data)}
          </td>
        </tr>
      )
    })

    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td className="name-field">Name:&nbsp;</td>
              <td>{item.name}</td>
            </tr>
            {rows}
          </tbody>
        </table>
        { item.alert && this.renderItemAlert(item) }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItemAlert (item) {

    return (
      <div className="item-alert">
        <span className="fa fa-exclamation-circle"/>
        <label className="item-alert-msg">
          {item.alert.msg}
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderFiltersPopover (filters) {

    return (
      <Popover id="filters"  className="IoT2" title="Display Filters">

        <label>
          Equipment Type:
        </label>

        <div className="row">
          <Switch onChange={() => this.onFilterChanged('conveyors')}
            checked={filters.conveyors}
          />
          <label>
            Conveyors
          </label>
        </div>

        <div className="row">
          <Switch onChange={() => this.onFilterChanged('sorters')}
            checked={filters.sorters}
          />
          <label>
            Sorters
          </label>
        </div>

        <div className="row">
          <Switch onChange={() => this.onFilterChanged('DRMs')}
            checked={filters.DRMs}
          />
          <label>
            DRMs
          </label>
        </div>

        <hr/>

        <label>
          Equipment Status:
        </label>

        <div className="row">
          <Switch onChange={() => this.onFilterChanged('warning')}
            checked={filters.warning}
          />
          <label>
            Warning
          </label>
        </div>

        <div className="row">
          <Switch onChange={() => this.onFilterChanged('error')}
            checked={filters.error}
          />
          <label>
            Error
          </label>
        </div>

        <div className="row">
          <Switch onChange={() => this.onFilterChanged('OK')}
            checked={filters.OK}
          />
          <label>
            OK
          </label>
        </div>

      </Popover>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle (titleOpts = {}) {

    const state = this.react.getState()

    const hotspotActive = state.hotspotCmdActive
      ? 'active' : ''

    return (
      <div className="title">
        <label>
          Equipment
        </label>
          <div className="IoT-controls">
            {
              false &&
              <button title="Hotspots" className={hotspotActive}
                onClick={this.onToggleHotspotCmd}>
                <span className="fa fa-podcast"/>
              </button>
            }
            <OverlayTrigger trigger="click"
              overlay={this.renderFiltersPopover(state.filters)}
              placement="left"
              rootClose>
              <button title="Filters">
                <span className="fa fa-filter"/>
              </button>
            </OverlayTrigger>
          </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts = {}) {

    const state = this.react.getState()

    return (
      <ReflexContainer orientation='horizontal'>

        <ReflexElement minSize={39}>
          <WidgetContainer
            renderTitle={() => this.renderTitle(opts.docked)}
            showTitle={opts.showTitle}
            className={this.className}>
            { this.renderItemList () }
          </WidgetContainer>
        </ReflexElement>

        {
          state.activeItem &&
          <ReflexSplitter propagate={true}/>
        }
        {
          state.activeItem &&
          <ReflexElement minSize={39} flex={0.28}>
            <WidgetContainer
              showTitle={opts.showTitle}
              className={this.className + ' item-details'}
              title='Details'>
                { this.renderItemDetails(state.activeItem) }
            </WidgetContainer>
          </ReflexElement>
        }

        {
          state.activeItem &&
          <ReflexSplitter propagate={true}/>
        }
        {
          state.activeItem &&
          <ReflexElement
            propagateDimensions={true}
            renderOnResize={true}
            minSize={101}
            flex={0.4}>
              <IoTGraphContainer
                item={state.activeItem}
              />
          </ReflexElement>
        }

        </ReflexContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  IoTExtension.ExtensionId,
  IoTExtension)


