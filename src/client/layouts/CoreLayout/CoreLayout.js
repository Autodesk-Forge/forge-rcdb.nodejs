import autobind from 'autobind-decorator'
import NotificationsSystem from 'reapop'
import ServiceManager from 'SvcManager'
import theme from 'reapop-theme-custom'
import PropTypes from 'prop-types'
import 'react-reflex/styles.css'
import 'Dialogs/dialogs.scss'
import Header from 'Header'
import React from 'react'
import 'core.scss'

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

    this.notifySvc =
      ServiceManager.getService(
        'NotifySvc')

    this.notifySvc.initialize ({
      remove: this.props.removeNotifications,
      update: this.props.updateNotification,
      add: this.props.addNotification
    })

    this.extractorSvc =
      ServiceManager.getService(
        'ExtractorSvc')

    this.socketSvc =
      ServiceManager.getService(
        'SocketSvc')

    this.socketSvc.on('extract.ready',
      this.onExtractReady)

    this.socketSvc.on('upload.progress',
      this.onForgeUploadProgress)

    this.socketSvc.on('upload.error',
      this.onForgeUploadError)

    this.socketSvc.on('svf.progress',
      this.onForgeTranslateProgress)

    this.socketSvc.on('job.progress',
      this.onForgeJobProgress)

    this.socketSvc.on('svf.error',
      this.onForgeTranslateError)

    this.socketSvc.on('model.added',
      this.onModelAdded)

    this.dialogSvc =
      ServiceManager.getService(
        'DialogSvc')

    this.dialogSvc.setComponent(this)

    this.forgeSvc =
      ServiceManager.getService(
        'ForgeSvc')

    this.forgeSvc.getUser().then((user) => {

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

    this.socketSvc.off('extract.ready',
      this.onExtractReady)

    this.socketSvc.off('upload.progress',
      this.onForgeUploadProgress)

    this.socketSvc.off('upload.error',
      this.onForgeUploadError)

    this.socketSvc.off('svf.progress',
      this.onForgeTranslateProgress)

    this.socketSvc.off('svf.error',
      this.onForgeTranslateError)

    this.socketSvc.off('job.progress',
      this.onForgeJobProgress)

    this.socketSvc.off('job.error',
      this.onForgeTranslateError)

    this.socketSvc.off('model.added',
      this.onModelAdded)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeUploadProgress (msg) {

    const notification = this.notifySvc.getNotification(
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

      this.notifySvc.update(notification)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeUploadError (msg) {

    const notification = this.notifySvc.getNotification(
      msg.uploadId)

    if (notification) {

      notification.message = `upload failed :(`

      notification.buttons = [{
        name: 'Show error',
        onClick: () => {
          console.log(msg.error)
          notification.dismissAfter = 1
          this.notifySvc.update(notification)
        }
      }, {
        name: 'Hide',
        onClick: () => {
          notification.dismissAfter = 1
          this.notifySvc.update(notification)
        }
      }]

      this.notifySvc.update(notification)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeTranslateProgress (msg) {

    let notification =
      this.notifySvc.getNotification(
        msg.jobId)

    if (!notification) {

      notification = this.notifySvc.add({
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
          this.notifySvc.update(notification)
        }
      }]
    }

    notification.message = `progress: ${msg.progress}`

    this.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeTranslateError (msg) {

    const notification =
      this.notifySvc.getNotification(
        msg.jobId)

    if (notification) {

      notification.message = `translation failed :(`

      notification.buttons = [{
          name: 'Show error in console',
          onClick: () => {
            console.log(msg.error)
            notification.dismissAfter = 1
            this.notifySvc.update(notification)
          }
        }, {
          name: 'Close',
          onClick: () => {
            notification.dismissAfter = 1
            this.notifySvc.update(notification)
          }
      }]

      this.notifySvc.update(notification)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onForgeJobProgress (msg) {

    let notification =
      this.notifySvc.getNotification(
        msg.jobId)

    if (!notification) {

      notification = this.notifySvc.add({
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
          this.notifySvc.update(notification)
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

    this.notifySvc.update(notification)
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
      this.notifySvc.getNotification(
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
          this.notifySvc.update(notification)
        }
      }]

      this.notifySvc.update(notification)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onExtractReady (msg) {

    this.extractorSvc.download(msg.modelId)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className='container'>
        <div className='notifications'>
          <NotificationsSystem theme={theme}/>
        </div>
        <Header {...this.props} />
        <div className='core-layout__viewport'>
          {this.props.children}
        </div>
        { this.dialogSvc.render() }
      </div>
    )
  }
}

export default CoreLayout
