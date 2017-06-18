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

    this.onForgeUploadProgress =
      this.onForgeUploadProgress.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentWillMount () {

    this.socketSvc =
      ServiceManager.getService(
        'SocketSvc')

    this.socketSvc.on('progress',
      this.onForgeUploadProgress)

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

    console.log('forge')
    console.log(msg)

    //const percent = 50.0 + msg.progress * 0.5
    //
    //const notification = this.notification
    //
    //notification.progress = percent
    //
    //notification.message =
    //  `progress: ${percent.toFixed(2)}%`
    //
    //if (percent === 100) {
    //
    //  notification.title = `${msg.objectKey} uploaded!`
    //  notification.message = `progress: 100%`
    //  notification.dismissAfter = 2000
    //  notification.dismissible = true
    //  notification.status = 'success'
    //  notification.buttons = [{
    //    name: 'OK',
    //    primary: true
    //  }]
    //
    //  this.postSVFJob(msg)
    //}
    //
    //this.notify.update(notification)
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
