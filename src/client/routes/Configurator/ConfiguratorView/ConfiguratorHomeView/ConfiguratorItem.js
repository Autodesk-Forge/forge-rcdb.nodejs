import { DropdownButton, MenuItem } from 'react-bootstrap'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import { Link } from 'react-router'
import Stars from 'react-stars'
import Image from 'Image'
import React from 'react'
import Label from 'Label'

class ConfiguratorItem extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.state = {
      activeModel: null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setActiveModel (activeModel) {

    this.assignState({
      activeModel
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    const name =  this.props.item.model
      ? this.props.item.model.name
      : this.props.item.name

    const activeModel = {
      _id: this.props.item._id,
      name
    }

    this.assignState({
      activeModel
    })

    if (this.props.item.extraModels) {

      const extraModels = [
        ...this.props.item.extraModels
      ]

      extraModels.unshift(activeModel)

      this.assignState({
        extraModels,
        activeModel
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  ratingChanged () {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderDropdown () {

    const extraModels = this.state.extraModels

    const menuItems = extraModels.map((model, idx) => {
      return (
        <MenuItem eventKey={idx} key={idx} onClick={() => {

          this.setActiveModel(model)
        }}>
          { model.name }
        </MenuItem>
      )
    })

    return (
      <DropdownButton
        title={"Model: " + this.state.activeModel.name}
        key="extra-dropdown"
        id="extra-dropdown">
       { menuItems }
      </DropdownButton>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const activeModel = this.state.activeModel

    const item = this.props.item

    const thumbnailUrl = this.modelSvc.getThumbnailUrl(
      'configurator', item._id)

    const href = `/configurator?id=${activeModel._id}`

    return (
      <div className="item">
        <Link className="content" to={href}>
          <label className="title">
              { item.name }
          </label>
          <div className="image-container">
            <Image src={thumbnailUrl}/>
          </div>
          <p className="description">
              { item.desc || '' }
          </p>
        </Link>
        <div className="footer">
          {
            item.extraModels &&
            this.renderDropdown()
          }
          <div className="git-link">
            <Label text="Source on "/>
            <a className="fa fa-github"
              href={item.git}
              target="_blank">
            </a>
          </div>
          <div className="stars">
            <Label text="Rate this demo: "/>
            <Stars
              onChange={this.ratingChanged}
              color2={'#ffd700'}
              count={5}
              size={22}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default ConfiguratorItem























































