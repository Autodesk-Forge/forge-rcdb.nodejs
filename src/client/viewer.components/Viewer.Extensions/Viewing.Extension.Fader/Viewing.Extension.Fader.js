/////////////////////////////////////////////////////////////////
// ForgeFader signal attenuation calculator Forge viewer extension
// By Jeremy Tammik, Autodesk Inc, 2017-03-28
/////////////////////////////////////////////////////////////////
import FaderCoreExtension from './Viewing.Extension.Fader.Core'
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import ViewerTooltip from 'Viewer.Tooltip'
import EventTool from 'Viewer.EventTool'
import 'rc-tooltip/assets/bootstrap.css'
import 'rc-slider/assets/index.css'
import Tooltip from 'rc-tooltip'
import Gradient from 'Gradient'
import Slider from 'rc-slider'
import Switch from 'Switch'
import React from 'react'

class FaderExtension extends ExtensionBase
{
  /////////////////////////////////////////////////////////////////
  // Class constructor
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  /////////////////////////////////////////////////////////////////
  load () {

    this.viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (e) => {

        this.options.loader.hide()
      })

    if (this.viewer.loadExtension(FaderCoreExtension)) {

      this.tooltip = new ViewerTooltip(this.viewer, {
        stroke: '#88FF88',
        fill: '#88FF88'
      })

      this.tooltip.setContent(`
        <div id="fader-tooltipId" class="fader-tooltip">
            Specify source ...
        </div>`, '#fader-tooltipId')

      this.eventTool = new EventTool(this.viewer)

      this.eventTool.activate()

      this.eventTool.on('mousemove', (event) => {

        const pointer = {
          x: event.canvasX,
          y: event.canvasY
        }

        const hitTest = this.viewer.clientToWorld(
          pointer.x, pointer.y, true)

        if (hitTest) {

          this.tooltip.activate()

          //console.log(hitTest)

        } else {

          this.tooltip.deactivate()
        }
      })

      this.faderCore = this.viewer.getExtension(
        FaderCoreExtension)

      this.react = this.options.react

      this.react.pushRenderExtension(this)
    }

    console.log('Viewing.Extension.Fader loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'forge-fader'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.Fader'
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Fader unloaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onStopResize () {

    this.react.setState({
      guid: this.guid()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onResize () {

    this.react.setState({
      guid: this.guid()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onShowFloorFace (checked) {


  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onShowRaycasting (checked) {


  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Forge Fader
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSliderChanged (props) {

    const { value, dragging, offset } = props

    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        visible={dragging}
        overlay={value}
        placement="top">
        <Slider.Handle className="rc-slider-handle"
          offset={offset}/>
      </Tooltip>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderControls () {

    const {guid} = this.react.getState()

    return (
      <div className="controls">

        <div className="row">
          <div className="control-element">
            Show Floor Face
          </div>
        </div>
        <div className="row" style={{marginBottom: '18px'}}>
          <Switch className="control-element"
            onChange={(checked) => this.onShowFloorFace(checked)}
            checked={false}/>
        </div>

        <div className="row">
          <div className="control-element">
            Show Raycasting
          </div>
        </div>
        <div className="row" style={{marginBottom: '18px'}}>
          <Switch className="control-element"
            onChange={(checked) => this.onShowRaycasting(checked)}
            checked={false}/>
        </div>

        <div className="row">
          <div className="control-element">
          dB/m
          </div>
        </div>
        <div className="row" style={{marginBottom: '18px'}}>
          <Slider className="control-element"
            handle={this.onSliderChanged}
            defaultValue={3}
            step={0.01}
            min={2.0}
            max={4.0} />
        </div>

        <div className="row">
          <div className="control-element">
            dB/m
          </div>
        </div>
        <div className="row" style={{marginBottom: '18px'}}>
          <Slider className="control-element"
            handle={this.onSliderChanged}
            defaultValue={3}
            step={0.01}
            min={2.0}
            max={4.0} />
        </div>


        <div className="row">
          <div className="control-element">
            Lengend
          </div>
        </div>
        <div className="row" style={{
          width: "calc(100% - 43px)",
          height: "80px"
        }}>
          <Gradient className="control-element"
            guid={guid}
            ticks={10}
            data={[
              {day:2,hour:1,count:127},
              {day:4,hour:1,count:150}
            ]}/>
        </div>

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

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  FaderExtension.ExtensionId,
  FaderExtension)

module.exports = 'Viewing.Extension.Fader'
