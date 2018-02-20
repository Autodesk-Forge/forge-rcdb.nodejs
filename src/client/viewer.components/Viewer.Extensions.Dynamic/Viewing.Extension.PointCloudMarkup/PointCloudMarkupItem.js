import defaultTex from './PointCloudMarkup/texture.png'
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

    this.onNameChanged = this.onNameChanged.bind(this)
    this.onIconClicked = this.onIconClicked.bind(this)
    this.onClick = this.onClick.bind(this)

    this.state = {
      name: props.markup.name
    }
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
  onNameChanged (e) {

    const id = this.props.markup.id

    const name = e.target.value

    this.assignState({
      name
    })

    this.props.onNameChanged(id, name)
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
        id={"settings-"+id}>

        <label>
          Name:
        </label>

        <input
          onChange={this.onNameChanged}
          placeholder="Markup name ..."
          value={this.state.name}
          className="input-name"
        />

        <hr/>

        <label>
          Point Size:
        </label>

        <Slider
          handle={(props) => this.onSliderChanged(props)}
          defaultValue={markup.size}
          max={200.0}
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
  onIconClicked (e) {

    if (this.props.animation) {

      this.props.onIconClicked()

      e.stopPropagation()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderIcon () {

    const getStyle = () => {

      if (this.props.animation) {

        const clr = this.props.markup.color

        const background =
          `rgba(${clr.x*255},${clr.y*255},${clr.z*255},0.2)`

        const border = `solid 2px ` +
          `rgba(${clr.x*255},${clr.y*255},${clr.z*255},1)`

        return {
          background,
          border
        }
      }

      return {
        backgroundImage: `url(${defaultTex})`
      }
    }

    return (
      <div className="item-icon" onClick={this.onIconClicked}>
        <div style={getStyle()}/>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const markup = this.props.markup

    return(
      <div className="item"
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
        onClick={this.onClick}>
        { this.renderIcon() }
        <Label text= {markup.name}/>
        <button className="remove hover-control"
          title="Remove Markup"
          onClick={(e) => {
            this.props.onRemove(markup.id)
            e.stopPropagation()
          }}>
          <span className="fa fa-times"/>
        </button>
        <OverlayTrigger trigger="click"
          overlay={this.renderMarkupSettings()}
          onExited={this.props.onHideSettings}
          placement="left"
          rootClose>
          <button className="settings-btn hover-control"
            title="Markup Settings">
            <span className="fa fa-cog"/>
          </button>
        </OverlayTrigger>
      </div>
    )
  }
}
