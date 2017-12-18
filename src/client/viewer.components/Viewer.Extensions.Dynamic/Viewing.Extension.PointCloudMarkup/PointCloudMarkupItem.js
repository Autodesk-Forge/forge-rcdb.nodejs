import {OverlayTrigger, Popover} from 'react-bootstrap'
import BaseComponent from 'BaseComponent'
import 'rc-tooltip/assets/bootstrap.css'
import 'rc-slider/assets/index.css'
import Tooltip from 'rc-tooltip'
import Slider from 'rc-slider'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

export default class PointCloudMarkupItem extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onClick = this.onClick.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onClick () {

    this.props.onClick(this.props.markup.id)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderMarkupSettings () {

    const markup = this.props.markup

    const id = markup.id

    return (
      <Popover
        className="pointcloud-markup-item settings"
        title="Markup Settings"
        id="settings">

        <label>
          Point Size:
        </label>

        <Slider
          handle={(props) => this.onSliderChanged(props)}
          defaultValue={markup.size}
          max={100.0}
          step={1.0}
          min={1.0}
        />

        <hr/>

        <label>
          Visibility:
        </label>

        <Switch
          onChange={(checked) => this.props.onVisible(id, checked)}
          checked={markup.visible}
        />

        <hr/>

        <label>
          Occlusion:
        </label>

        <Switch
          onChange={(checked) => this.props.onOcclusion(id, checked)}
          checked={markup.occlusion}
        />

        <div className="footer"/>

      </Popover>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSliderChanged (props) {

    const { value, dragging, offset } = props

    this.props.onSizeChanged(
      this.props.markup.id,
      value)

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
  render () {

    const id = this.props.markup.id

    return(
      <div className="item"
        onClick={this.onClick}>
        <OverlayTrigger trigger="click"
          overlay={this.renderMarkupSettings()}
          onExited={this.props.onHideSettings}
          placement="left"
          rootClose>
          <button className="settings-btn"
            title="Markup Settings">
            <span className="fa fa-cog"/>
          </button>
        </OverlayTrigger>
        <Label text= {"Markup " + id}/>
        <div className="remove"
          onClick={(e) => {
            this.props.onRemove(id)
            e.stopPropagation()
          }}>
          <span className="fa fa-times"/>
        </div>
      </div>
    )
  }
}
