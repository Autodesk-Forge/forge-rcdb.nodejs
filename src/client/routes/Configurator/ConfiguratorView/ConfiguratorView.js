import ConfiguratorHomeView from './ConfiguratorHomeView'
import ViewerConfigurator from 'Viewer.Configurator'
import NotificationsSystem from 'reapop'
import theme from 'reapop-theme-wybo'
import './ConfiguratorView.scss'
import React from 'react'

class ConfiguratorView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    theme.notificationsContainer.className.main =
      'notifications'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    this.props.setNavbarState({
      links: {
        settings: false,
        about: true,
        home: false
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const notify = {
      remove: this.props.removeNotifications,
      update: this.props.updateNotification,
      add: this.props.addNotification
    }

    const view = this.props.location.query.id
      ? <ViewerConfigurator
          viewerEnv={this.props.appState.viewerEnv}
          setViewerEnv={this.props.setViewerEnv}
          modelId={this.props.location.query.id}
          database='configurator'
          notify={notify}
        />
      : <ConfiguratorHomeView/>

    return (
      <div className="configurator-view">
        <NotificationsSystem theme={theme}/>
        { view }
      </div>
    )
  }
}

export default ConfiguratorView























































