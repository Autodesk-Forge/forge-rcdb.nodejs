import ContentEditable from 'react-contenteditable'
import { browserHistory } from 'react-router'
import ServiceManager from 'SvcManager'
import './ConfiguratorHomeView.scss'
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
  async componentWillMount () {

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    const models = await this.modelSvc.getModels(
      'configurator')

    const modelsbyName = _.sortBy(models,
      (model) => {
        return model.name
      })

    this.setState(Object.assign({}, this.state, {
      models: modelsbyName
    }), () => {

      this.batchRequestThumbnails(5)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  gotToLink (href) {

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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  batchRequestThumbnails (size) {

    const chunks = _.chunk(this.state.models, size)

    chunks.forEach((modelChunk) => {

      const modelIds = modelChunk.map((model) => {
        return model._id
      })

      this.modelSvc.getThumbnails('configurator', modelIds).then(
        (thumbnails) => {

          const models = this.state.models.map((model) => {

            const idx = modelIds.indexOf(model._id)

            return (idx < 0
              ? model
              : Object.assign({}, model, {
              thumbnail: thumbnails[idx]
            }))
          })

          this.setState(
            Object.assign({}, this.state, {
              models
            }))
        })
    })
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

      const href = `/configurator?id=${model._id}`

      return (
        <div key={model._id} className="model-item"
          onClick={()=>this.gotToLink(href)}>
          <img className={model.thumbnail ? "":"default-thumbnail"}
            src={model.thumbnail ? model.thumbnail : ""}/>
          <Label text={model.name}/>
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























































