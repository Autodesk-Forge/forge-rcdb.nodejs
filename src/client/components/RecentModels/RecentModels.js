import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import Measure from 'react-measure'
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

    this.refresh = this.refresh.bind(this)

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.socketSvc.on('model.added',
      this.refresh)

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
  componentDidMount () {

    this.refresh()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async refresh () {

    const db = this.props.database

    const models = await this.modelSvc.getRecentModels(db)

    const images = models.map((model) => {

      const thumbnailUrl = this.modelSvc.getThumbnailUrl(
        db, model._id, 200)

      const href = `/viewer?id=${model._id}`

      return {
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
      <ImageGrid
        images={this.state.images}
        size={this.props.size}
      />
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const { width, height } = this.state.dimensions

    return (
      <Measure
        bounds
        onResize={(rect) => {
          this.assignState({ dimensions: rect.bounds })
        }}>
        {
          ({ measureRef }) =>
            <div ref={measureRef} className="recent-models">
              <div className="title">
                <span className="fa fa-clock-o"/>
                Recent Models
              </div>
              <div className="content">
                {this.renderContent()}
              </div>
            </div>
        }
      </Measure>
    )
  }
}

export default RecentModels
