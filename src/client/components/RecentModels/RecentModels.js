import autobind from 'autobind-decorator'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
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

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

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

    this.socketSvc.on('model.deleted',
      this.refresh)

    this.socketSvc.on('model.added',
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

    this.socketSvc.off('model.deleted',
      this.refresh)

    this.socketSvc.off('model.added',
      this.refresh)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  async refresh () {

    const db = this.props.database

    const models = await this.modelSvc.getRecentModels(db)

    const images = models.map((model) => {

      const thumbnailUrl = this.modelSvc.getThumbnailUrl(
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
