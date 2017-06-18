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

    this.notify = {
      remove: this.props.removeNotifications,
      update: this.props.updateNotification,
      add: this.props.addNotification
    }

    this.gallerySvc = ServiceManager.getService(
      'GallerySvc')

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

    const models = await this.gallerySvc.getModels()

    this.assignState({
      models
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderModel (modelInfo) {

    const href = `/viewer?id=${modelInfo._id}`

    return (
      <div key={modelInfo._id} className="item">
        <Link className="content" to={href}>
          <div className="image-container">
            <Image src={`/api/gallery/thumbnails/${modelInfo.model.urn}`}/>
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
            <div/>
          </div>
        </div>
      </div>
    )
  }
}

export default GalleryView
























































