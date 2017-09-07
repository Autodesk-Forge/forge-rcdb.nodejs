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

    this.storageSvc = ServiceManager.getService(
      'StorageSvc')

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.notifySvc = ServiceManager.getService(
      'NotifySvc')

    this.dialogSvc = ServiceManager.getService(
      'DialogSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.forgeSvc = ServiceManager.getService(
      'ForgeSvc')

    this.userSvc = ServiceManager.getService(
      'UserSvc')

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

    this.settings = this.storageSvc.load('gallery')

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
  onLogIn () {

    this.forgeSvc.login()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  validateUploadLimit () {

    return new Promise((resolve) => {

      const onClose = (result) => {

        resolve(result === 'OK')

        this.dialogSvc.off('dialog.close', onClose)
      }

      this.dialogSvc.on('dialog.close', onClose)

      this.dialogSvc.setState({
        className: 'agreement-dlg',
        title: 'Gallery Terms & Conditions',
        captionOK: 'I Agree',
        content:
          <div>
            Yo
          </div>,
        open: true
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  validateAgreement () {

    return new Promise((resolve) => {

      const onClose = (result) => {

        this.dialogSvc.off('dialog.close', onClose)

        if (result === 'OK') {

          this.settings.agreement = true

          this.storageSvc.save(
            'gallery', this.settings)

          return resolve(true)
        }

        resolve(false)
      }

      this.dialogSvc.on('dialog.close', onClose)

      this.dialogSvc.setState({
        className: 'agreement-dlg',
        title: 'Gallery Terms & Conditions',
        captionOK: 'I Agree',
        content:
          <div>
            <p>
              &nbsp;&nbsp;
              By uploading your model to Forge
              RCDB Gallery, you agree to make the
              viewable content available publicly.
              The seed file however remains
              your property.
            </p>

            <p>
              &nbsp;&nbsp;
              The viewable content will remain on
              the Gallery 30 days by default.
              The author reserves the right to
              maintain permanently models
              that he finds interesting.
            </p>

            <p>
              &nbsp;&nbsp;
              If you are not an Autodesk employee,
              you have a limit of 5 active models at
              a time. Once reached that limit you
              will not be able to upload more models
              until one of them expire.
            </p>

            <p>
              &nbsp;&nbsp;
              Reminder: That website is purely a
              demo and the author makes no
              guarrantee that uploaded models
              will remain available even
              during the 30 days default period.
            </p>

          </div>,
        open: true
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  async onDropFiles (files) {

    if (this.settings.agreement) {

      return true
    }

    const res = await this.validateAgreement()

    return res
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
                loggedIn={!!this.props.appState.user}
                onProgress={this.onUploadProgress}
                socketId={this.socketSvc.socketId}
                onInitUpload={this.onInitUpload}
                onDropFiles={this.onDropFiles}
                onLogIn={this.onLogIn}
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
























































