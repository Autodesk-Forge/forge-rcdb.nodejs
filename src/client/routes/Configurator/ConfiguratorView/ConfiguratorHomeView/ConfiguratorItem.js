import { DropdownButton, MenuItem } from 'react-bootstrap'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import { Link } from 'react-router'
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
          <div className="image-container">
            <Image src={thumbnailUrl}/>
          </div>
          <label className="title">
              { item.name }
          </label>
          <p className="description">
              { item.desc || '' }
          </p>
        </Link>
        <div className="footer">
          {
            item.extraModels &&
            this.renderDropdown()
          }
          <a className="git-link fa fa-github"
            href={item.git}
            target="_blank">
          </a>
        </div>
      </div>
    )
  }
}

export default ConfiguratorItem























































