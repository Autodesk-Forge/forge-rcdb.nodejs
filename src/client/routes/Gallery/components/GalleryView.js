import ModelUploader from 'ModelUploader'
import ServiceManager from 'SvcManager'
import { Link } from 'react-router'
import './GalleryView.scss'
import Image from 'Image'
import React from 'react'

class GalleryView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.notifySvc = ServiceManager.getService(
      'NotifySvc')

    this.state = {
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

    this.props.setNavbarState({
      links: {
        settings: false
      }
    })

    const models =
      await this.modelSvc.getModels(
        'gallery')

    const modelsByName = _.sortBy(
      models, (model) => {

      return model.name
    })

    this.assignState({
      models: modelsByName
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUploadProgress (file, percent) {

    console.log(percent)

    //const notification = this.notification
    //
    //if (notification.progress < 50) {
    //
    //  notification.progress = percent/2
    //
    //  notification.message =
    //    `progress: ${(percent/2).toFixed(2)}%`
    //
    //  this.notify.update(notification)
    //}
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderModel (modelInfo) {

    const thumbnailUrl = this.modelSvc.getThumbnailUrl(
      'gallery', modelInfo._id, 200)

    const href = `/viewer?id=${modelInfo._id}`

    return (
      <div key={modelInfo._id} className="item">
        <Link className="content" to={href}>
          <div className="image-container">
            <Image src={thumbnailUrl}/>
          </div>
          <h3 className="title">
              {modelInfo.name}
          </h3>
        </Link>
        <div className="footer">

        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderModels () {

    const models = this.state.models.map((model) => {

      return this.renderModel(model)
    })

    return models
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className="gallery-view">
        <div className="search">
        </div>
        <div className="container">
          <div className="primary">
            <div className="items">
              {this.renderModels()}
            </div>
          </div>
          <div className="secondary">
            {
            false &&
            <div className="uploader">
              <ModelUploader apiUrl={'/api/models/gallery'}
                onProgress={this.onUploadProgress}
                socketId={this.socketSvc.socketId}
              />
            </div>
            }
          <div/>
          </div>
        </div>
      </div>
    )
  }
}

export default GalleryView
























































