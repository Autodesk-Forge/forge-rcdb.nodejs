import { browserHistory } from 'react-router'
import NotificationsSystem from 'reapop'
import ServiceManager from 'SvcManager'
import theme from 'reapop-theme-wybo'
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
  constructor () {

    super()

    this.onForgeTranslateProgress =
      this.onForgeTranslateProgress.bind(this)

    this.onForgeUploadProgress =
      this.onForgeUploadProgress.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentWillMount () {

    this.notifySvc =
      ServiceManager.getService(
        'NotifySvc')

    this.notifySvc.initialize ({
      remove: this.props.removeNotifications,
      update: this.props.updateNotification,
      add: this.props.addNotification
    })

    this.socketSvc =
      ServiceManager.getService(
        'SocketSvc')

    this.socketSvc.on('upload.progress',
      this.onForgeUploadProgress)

    this.socketSvc.on('svf.progress',
      this.onForgeTranslateProgress)

    this.dialogSvc =
      ServiceManager.getService(
        'DialogSvc')

    this.dialogSvc.setComponent(this)

    this.forgeSvc =
      ServiceManager.getService(
        'ForgeSvc')

    const user = await this.forgeSvc.getUser()

    this.props.setUser(user)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onForgeUploadProgress (msg) {

    const notification = this.notifySvc.getNotification(
      msg.uploadId)

    const percent = 50.0 + msg.progress * 0.5

    notification.message =
      `progress: ${percent.toFixed(2)}%`

    if (percent === 100) {

      notification.title = `${msg.filename} uploaded!`
      notification.message = `progress: 100%`
      notification.dismissAfter = 2000
      notification.dismissible = true
      notification.status = 'success'
      notification.buttons = [{
        primary: true,
        name: 'OK'
      }]
    }

    this.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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
    }

    notification.message = `progress: ${msg.progress}`

    if (msg.progress === '100%') {

      notification.status = 'success'

      notification.buttons = [{
        name: 'Load',
        primary: true,
        onClick: () => {
          browserHistory.push(`/viewer?id=${msg.modelId}`)
        }
      }, {
        name: 'Close',
        onClick: () => {
          this.notifySvc.remove(notification)
        }
      }]
    }

    this.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const { appState, children } = this.props

    return (
      <div className='container'>
        <div className='notifications'>
          <NotificationsSystem theme={theme}/>
        </div>
        <link rel="stylesheet" type="text/css"
          href={appState.storage.theme.css}
        />
        <Header {...this.props} />
        <div className='core-layout__viewport'>
          {children}
        </div>
        { this.dialogSvc.render() }
      </div>
    )
  }
}

export default CoreLayout
