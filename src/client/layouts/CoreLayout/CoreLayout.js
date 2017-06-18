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

    //theme.notificationsContainer.className.main = 'notifications'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentWillMount () {

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
