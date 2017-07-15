import ContentEditable from 'react-contenteditable'
import autobind from 'autobind-decorator'
import ModelUploader from 'ModelUploader'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import RecentModels from 'RecentModels'
import Background from 'Background'
import { Link } from 'react-router'
import Spinner from 'react-spinkit'
import './GalleryView.scss'
import Image from 'Image'
import React from 'react'

class GalleryView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.extractorSvc = ServiceManager.getService(
      'ExtractorSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.notifySvc = ServiceManager.getService(
      'NotifySvc')

    this.dialogSvc = ServiceManager.getService(
      'DialogSvc')

    this.state = {
      search: '',
      items: []
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    this.props.setNavbarState({
      links: {
        settings: false
      }
    })

    this.socketSvc.on('extract.ready',
      this.onExtractReady)

    this.socketSvc.on('model.deleted',
      this.refresh)

    this.socketSvc.on('model.added',
      this.refresh)

    this.refresh()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    this.socketSvc.off('extract.ready',
      this.onExtractReady)

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

    const items =
      await this.modelSvc.getModels(
      'gallery')

    this.assignState({
      items
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  async onDropFiles (files) {

    return Promise.resolve(true)

    //return new Promise((resolve) => {
    //
    //  const onClose = (result) => {
    //
    //    resolve(result === 'OK')
    //
    //    this.dialogSvc.off('dialog.close', onClose)
    //  }
    //
    //  this.dialogSvc.on('dialog.close', onClose)
    //
    //  this.dialogSvc.setState({
    //    className: 'agreement-dlg',
    //    title: 'Gallery Terms & Conditions',
    //    captionOK: 'I Approve',
    //    content:
    //      <div>
    //        dude
    //      </div>,
    //    open: true
    //  })
    //})
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onInitUpload (data) {

    const notification = this.notifySvc.add({
      title: 'Uploading ' + data.file.name,
      message: 'progress: 0%',
      dismissible: false,
      status: 'loading',
      id: data.uploadId,
      dismissAfter: 0,
      position: 'tl'
    })

    notification.buttons = [{
      name: 'Hide',
      onClick: () => {
        notification.dismissAfter = 1
        this.notifySvc.update(notification)
      }
    }]

    this.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onUploadProgress (data) {

    const notification =
      this.notifySvc.getNotification(data.uploadId)

    if (!notification.forgeUpload) {

      const progress = data.percent * 0.5

      notification.message =
        `progress: ${progress.toFixed(2)}%`

      this.notifySvc.update(notification)
    }
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
  getExpiry (item) {

    if (item.lifetime) {

      const age = Date.now() - new Date(item.timestamp)

      const expiry = item.lifetime - age/1000

      if (expiry > 86400) {

        return `Expires in: ${Math.round(expiry/86400)} days`
      }

      if (expiry > 3600) {

        return `Expires in: ${Math.round(expiry/3600)} hours`
      }

      if (expiry > 60) {

        return `Expires in: ${Math.round(expiry/60)} minutes`
      }
    }

    return false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  showSpinner (itemId, show) {

    const items = this.state.items.map((item) => {
      if (item._id === itemId) {
        return Object.assign({}, item, {
          spinner: show
        })
      }
      return item
    })

    this.assignState({
      items
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  extract (item) {

    if (!item.spinner) {

      const itemId = item._id

      this.showSpinner(itemId, true)

      this.extractorSvc.getStatus(itemId).then(() => {

        this.extractorSvc.download(itemId)

        setTimeout(
          () => this.showSpinner(itemId, false),
          2000)

      }, (error) => {

        if (error.status === 404) {

          this.extractorSvc.extract(itemId, {
            socketId: this.socketSvc.socketId
          })
        }
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onExtractReady (msg) {

    this.showSpinner(msg.modelId, false)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItem (item) {

    const thumbnailUrl = this.modelSvc.getThumbnailUrl(
      'gallery', item._id, 200)

    const href = `/viewer?id=${item._id}`

    const expiry = this.getExpiry(item)

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
          <div className="svf"
            onClick={() => this.extract(item)}>
            <span className="fa fa-cloud-download">
            </span>
            <label>
              Download SVF
            </label>
            {
              item.spinner &&
              <Spinner spinnerName='cube-grid'/>
            }
          </div>
          {
            expiry &&
            <div className="expiry">
              <span className="fa fa-clock-o">
              </span>
              <label>
                {expiry}
              </label>
            </div>
          }
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
              <ModelUploader
                onProgress={this.onUploadProgress}
                socketId={this.socketSvc.socketId}
                onInitUpload={this.onInitUpload}
                onDropFiles={this.onDropFiles}
                database={'gallery'}
              />
            </div>
            <div className="recent">
              <RecentModels database="gallery"/>
            </div>
          <div/>
          </div>
        </div>
      </div>
    )
  }
}

export default GalleryView
























































