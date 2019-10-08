import autobind from 'autobind-decorator'
import BaseComponent from 'BaseComponent'
import {ServiceContext} from 'ServiceContext'
import ImageGrid from 'ImageGrid'
import './RecentModels.scss'
import React from 'react'

class RecentModels extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()



    this.state = {
      images: [],
      dimensions: {
        height: 0,
        width: 0
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    this.context.socketSvc.on('model.deleted',
      this.refresh)

    this.context.socketSvc.on('model.added',
      this.refresh)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.refresh()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    this.context.socketSvc.off('model.deleted',
      this.refresh)

    this.context.socketSvc.off('model.added',
      this.refresh)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  async refresh () {

    const db = this.props.database

    const models = await this.context.modelSvc.getRecentModels(db)

    const images = models.map((model) => {

      const thumbnailUrl = this.context.modelSvc.getThumbnailUrl(
        db, model._id, 200)

      const href = `/viewer?id=${model._id}`

      return {
        title: model.name,
        src: thumbnailUrl,
        link: href
      }
    })

    this.assignState({
      images
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    return (
      <ImageGrid images={this.state.images}/>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className="recent-models">
        <div className="title">
          <span className="fa fa-info-circle"/>
          <label>
            Recent Models
          </label>
        </div>
        <div className="content">
            {this.renderContent()}
        </div>
      </div>
    )
  }
}

export default RecentModels
