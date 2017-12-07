import ContentEditable from 'react-contenteditable'
import autobind from 'autobind-decorator'
import ModelUploader from 'ModelUploader'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import RecentModels from 'RecentModels'
import Paginator from 'react-paginate'
import Background from 'Background'
import { Link } from 'react-router'
import Spinner from 'react-spinkit'
import DOMPurify from 'dompurify'
import './GalleryView.scss'
import Image from 'Image'
import React from 'react'

class GalleryView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    perPage: 10
  }

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

    this.state = {
      pageCount: 1,
      search: '',
      offset: 0,
      items: [],
      page: 0
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

    const {offset, search} = this.state

    const limit = this.props.perPage

    const opts = {
      offset,
      search,
      limit
    }

    const countRes = await this.modelSvc.getCount(
      'gallery', opts)

    const items = await this.modelSvc.getModels(
      'gallery', opts)

    const pageCount =
      Math.ceil(countRes.count / limit)

    this.assignState({
      pageCount,
      items
    })

    this.primaryRef.scrollTop = 0
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
              You have to be an Autodesk employee
              in order to be able to upload
              models to the gallery ...
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
  async onFileDrop () {

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

    const search =  e.target.value.toLowerCase()

    const offset = 0

    const page = 0

    this.assignState({offset, page, search}).then(() => {

      this.refresh()
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

          this.socketSvc.getSocketId().then((socketId) => {
            this.extractorSvc.extract(itemId, {
              socketId
            })
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
  @autobind
  onPageChanged (data) {

    const page = data.selected

    const offset = Math.ceil(page * this.props.perPage)

    this.assignState({offset, page}).then(() => {

      this.refresh()
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

    const expiry = this.getExpiry(item)

    return (
      <div key={item._id} className="item">
        <Link className="content" to={href}>
          <div className="image-container">
            <Image src={thumbnailUrl}/>
          </div>
          <h3 className="title">
            {DOMPurify.sanitize(item.name)}
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

    return this.state.items.map((item) => {

      return this.renderItem (item)
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
          <div className="paginator">
            <Paginator
              subContainerClassName={"pages pagination"}
              onPageChange={this.onPageChanged}
              containerClassName={"pagination"}
              pageCount={this.state.pageCount}
              initialPage={this.state.page}
              forcePage={this.state.page}
              breakClassName={"break-me"}
              previousLabel={"previous"}
              activeClassName={"active"}
              marginPagesDisplayed={1}
              breakLabel={<a>...</a>}
              pageRangeDisplayed={3}
              nextLabel={"next"}
            />
          </div>
          <div className="scroller">
            <div className="primary" ref={
              (div) => this.primaryRef = div
              }>
              <div className="items">
                {this.renderItems()}
              </div>
            </div>
            <div className="secondary">
              <div className="uploader">
                <ModelUploader
                  onProgress={this.onUploadProgress}
                  onInitUpload={this.onInitUpload}
                  user={this.props.appState.user}
                  onFileDrop={this.onFileDrop}
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
      </div>
    )
  }
}

export default GalleryView
























































