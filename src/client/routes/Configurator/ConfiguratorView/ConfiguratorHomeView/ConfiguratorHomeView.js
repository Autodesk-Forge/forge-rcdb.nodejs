import ContentEditable from 'react-contenteditable'
import { browserHistory } from 'react-router'
import ServiceManager from 'SvcManager'
import './ConfiguratorHomeView.scss'
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
      models: []
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

    const modelsbyName = _.sortBy(models,
      (model) => {
        return model.name
      })

    this.assignState({
      models: modelsbyName
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

    const state = Object.assign(this.state, {
      search: e.target.value.toLowerCase()
    })

    this.setState(state)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderModels () {

    const {search, models} = this.state

    const filteredModels = models.filter((model) => {
        return search.length
          ? model.name.toLowerCase().indexOf(search) > -1
          : true
      })

    return filteredModels.map((model) => {

      const thumbnailUrl = this.modelSvc.getThumbnailUrl(
        'configurator', model._id)

      const href = `/configurator?id=${model._id}`

      return (
        <div className="model-item" key={model._id}>
          <a className="git-link fa fa-github"
            href={model.git}
            target="_blank">
          </a>
          <a className="content" href={href}
            onClick={(e)=>this.gotToLink(e, href)}>
            <Image src={thumbnailUrl}/>
            <div className="text-content">
              <Label text={model.name}/>
              <br/>
              <br/>
              <p className="description">
                { model.desc || '' }
              </p>
            </div>
          </a>
        </div>
      )
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
        <div className="scroller">
          { this.renderModels() }
        </div>
      </div>
    )
  }
}

export default ConfiguratorHomeView























































