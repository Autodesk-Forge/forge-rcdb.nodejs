import ContentEditable from 'react-contenteditable'
import { browserHistory } from 'react-router'
import ServiceManager from 'SvcManager'
import './ConfiguratorHomeView.scss'
import { Link } from 'react-router'
import Image from 'Image'
import React from 'react'
import Label from 'Label'

class ConfiguratorHomeView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()

    this.state = {
      search: '',
      items: []
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  assignState (state) {

    return new Promise((resolve) => {

      const newState = Object.assign(
        {}, this.state, state)

      this.setState(newState, () => {
        resolve()
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentWillMount () {

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    const models = await this.modelSvc.getModels(
      'configurator')

    const items = _.sortBy(models,
      (model) => {
        return model.name
      })

    this.assignState({
      items
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  gotToLink (e, href) {

    e.preventDefault()

    browserHistory.push(href)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSearchChanged (e) {

    this.assignState({
      search: e.target.value.toLowerCase()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItem (item) {

    const thumbnailUrl = this.modelSvc.getThumbnailUrl(
      'configurator', item._id)

    const href = `/configurator?id=${item._id}`

    return (
      <div key={item._id} className="item">
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
          <a className="git-link fa fa-github"
            href={item.git}
            target="_blank">
          </a>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItems () {

    const {search, items} = this.state

    const filteredItems = items.filter((model) => {
      return search.length
        ? model.name.toLowerCase().indexOf(search) > -1
        : true
    })

    return filteredItems.map((item) => {

      return this.renderItem(item)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className="home">
        <ContentEditable
          onChange={(e) => this.onSearchChanged(e)}
          onKeyDown={(e) => this.onKeyDown(e)}
          data-placeholder="Search ..."
          html={this.state.search}
          className="search"/>
        <div className="container">
          <div className="primary">
            <div className="items">
              {this.renderItems()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ConfiguratorHomeView























































