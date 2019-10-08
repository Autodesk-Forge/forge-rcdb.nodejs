import autobind from 'autobind-decorator'
//import NotificationsSystem from 'reapop'
//import theme from 'reapop-theme-custom'
import PropTypes from 'prop-types'
import 'react-reflex/styles.css'
import 'Dialogs/dialogs.scss'
import Header from 'Header'
import React from 'react'
import 'core.scss'
import {ServiceContext} from 'ServiceContext'


class CoreLayout extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    children : PropTypes.element.isRequired
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super(props)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {



    // this.context.notifySvc.initialize ({
    //   remove: this.props.removeNotifications,
    //   update: this.props.updateNotification,
    //   add: this.props.addNotification
    // })


    this.context.socketSvc.on('extract.ready',
      this.onExtractReady)

    this.context.socketSvc.on('upload.progress',
      this.onForgeUploadProgress)

    this.context.socketSvc.on('upload.error',
      this.onForgeUploadError)

    this.context.socketSvc.on('svf.progress',
      this.onForgeTranslateProgress)

    this.context.socketSvc.on('job.progress',
      this.onForgeJobProgress)

    this.context.socketSvc.on('svf.error',
      this.onForgeTranslateError)

    this.context.socketSvc.on('model.added',
      this.onModelAdded)



    this.context.dialogSvc.setComponent(this)



    this.context.forgeSvc.getUser().then((user) => {

      this.props.setUser(user)

    }, () => {

      this.props.setUser(null)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    this.context.socketSvc.off('extract.ready',
      this.onExtractReady)

    this.context.socketSvc.off('upload.progress',
      this.onForgeUploadProgress)

    this.context.socketSvc.off('upload.error',
      this.onForgeUploadError)

    this.context.socketSvc.off('svf.progress',
      this.onForgeTranslateProgress)

    this.context.socketSvc.off('svf.error',
      this.onForgeTranslateError)

    this.context.socketSvc.off('job.progress',
      this.onForgeJobProgress)

    this.context.socketSvc.off('job.error',
      this.onForgeTranslateError)

    this.context.socketSvc.off('model.added',
      this.onModelAdded)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeUploadProgress (msg) {

    const notification = this.context.notifySvc.getNotification(
      msg.uploadId)

    if (notification) {

      notification.forgeUpload = true

      const progress = 50.0 + (
          isNaN(msg.progress)
            ? 0
            : (msg.progress * 0.5))

      notification.message =
        `progress: ${progress.toFixed(2)}%`

      if (progress === 100) {

        notification.title = `${msg.filename} uploaded!`
        notification.message = `progress: 100%`
        notification.dismissAfter = 2000
        notification.dismissible = true
        notification.status = 'success'
      }

      this.context.notifySvc.update(notification)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeUploadError (msg) {

    const notification = this.context.notifySvc.getNotification(
      msg.uploadId)

    if (notification) {

      notification.message = `upload failed :(`

      notification.buttons = [{
        name: 'Show error',
        onClick: () => {
          console.log(msg.error)
          notification.dismissAfter = 1
          this.context.notifySvc.update(notification)
        }
      }, {
        name: 'Hide',
        onClick: () => {
          notification.dismissAfter = 1
          this.context.notifySvc.update(notification)
        }
      }]

      this.context.notifySvc.update(notification)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeTranslateProgress (msg) {

    let notification =
      this.context.notifySvc.getNotification(
        msg.jobId)

    if (!notification) {

      notification = this.context.notifySvc.add({
        title: 'Translating ' + msg.filename,
        dismissible: false,
        status: 'loading',
        dismissAfter: 0,
        position: 'tl',
        id: msg.jobId
      })

      notification.buttons = [{
        name: 'Hide',
        onClick: () => {
          notification.dismissAfter = 1
          this.context.notifySvc.update(notification)
        }
      }]
    }

    notification.message = `progress: ${msg.progress}`

    this.context.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeTranslateError (msg) {

    const notification =
      this.context.notifySvc.getNotification(
        msg.jobId)

    if (notification) {

      notification.message = `translation failed :(`

      notification.buttons = [{
          name: 'Show error in console',
          onClick: () => {
            console.log(msg.error)
            notification.dismissAfter = 1
            this.context.notifySvc.update(notification)
          }
        }, {
          name: 'Close',
          onClick: () => {
            notification.dismissAfter = 1
            this.context.notifySvc.update(notification)
          }
      }]

      this.context.notifySvc.update(notification)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeJobProgress (msg) {

    let notification =
      this.context.notifySvc.getNotification(
        msg.jobId)

    if (!notification) {

      notification = this.context.notifySvc.add({
        title: 'Processing Job: ' + msg.filename,
        dismissible: false,
        status: 'loading',
        dismissAfter: 0,
        position: 'tl',
        id: msg.jobId
      })

      notification.buttons = [{
        name: 'Hide',
        onClick: () => {
          notification.dismissAfter = 1
          this.context.notifySvc.update(notification)
        }
      }]
    }

    notification.message = `progress: ${msg.progress}`

    if (msg.progress === '100%') {

      notification.title = 'Job completed: ' + msg.filename,
      notification.dismissAfter = 2000
      notification.dismissible = true
      notification.status = 'success'
    }

    this.context.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onModelAdded (msg) {

    // this triggrs an update in case
    // max uploads have been reached
    this.props.setUser(this.props.appState.user)

    let notification =
      this.context.notifySvc.getNotification(
        msg.jobId)

    if (notification) {

      notification.status = 'success'

      notification.buttons = [{
        name: 'Load',
        primary: true,
        onClick: () => {
          const host = window.location.protocol +
            '//' + window.location.host
          const url = `${host}/viewer?id=${msg.modelId}`
          window.open(url,'_blank')
        }
      }, {
        name: 'Hide',
        onClick: () => {
          notification.dismissAfter = 1
          this.context.notifySvc.update(notification)
        }
      }]

      this.context.notifySvc.update(notification)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onExtractReady (msg) {

    this.context.extractorSvc.download(msg.modelId)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className='container'>
        <Header {...this.props} />
        <div className='core-layout__viewport'>
          {this.props.children}
        </div>
        { this.context.dialogSvc.render() }
      </div>
    )
  }
}
CoreLayout.contextType = ServiceContext

export default CoreLayout
