import ContentEditable from 'react-contenteditable'
import ModelUploader from 'ModelUploader'
import ServiceManager from 'SvcManager'
import Background from 'Background'
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

    this.onUploadProgress = this.onUploadProgress.bind(this)

    this.onInitUpload = this.onInitUpload.bind(this)

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.notifySvc = ServiceManager.getService(
      'NotifySvc')

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

    this.props.setNavbarState({
      links: {
        settings: false
      }
    })

    const models =
      await this.modelSvc.getModels(
        'gallery')

    const items = _.sortBy(
      models, (model) => {

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
  onInitUpload (data) {

    this.notifySvc.add({
      title: 'Uploading ' + data.file.name,
      message: 'progress: 0%',
      dismissible: false,
      status: 'loading',
      id: data.uploadId,
      dismissAfter: 0,
      position: 'tl'
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUploadProgress (data) {

    const notification =
      this.notifySvc.getNotification(data.uploadId)

      notification.message =
        `progress: ${(data.percent/2).toFixed(2)}%`

    this.notifySvc.update(notification)
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
      'gallery', item._id, 200)

    const href = `/viewer?id=${item._id}`

    return (
      <div key={item._id} className="item">
        <Link className="content" to={href}>
          <div className="image-container">
            <Image src={thumbnailUrl}/>
          </div>
          <h3 className="title">
              {item.name}
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
  render() {

    return (

      <div className="gallery-view">
        <Background/>
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
          <div className="secondary">
            <div className="uploader">
              <ModelUploader apiUrl={'/api/models/gallery'}
                onProgress={this.onUploadProgress}
                socketId={this.socketSvc.socketId}
                onInitUpload={this.onInitUpload}
                />
            </div>
          <div/>
          </div>
        </div>
      </div>
    )
  }
}

export default GalleryView
























































