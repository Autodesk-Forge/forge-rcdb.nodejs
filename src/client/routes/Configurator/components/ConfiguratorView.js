import ViewerConfigurator from 'Viewer.Configurator'
import ConfiguratorHome from './ConfiguratorHome'
import React from 'react'

class ConfiguratorView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)
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

    return (
      this.props.location.query.id
        ? <ViewerConfigurator
          viewerEnv={this.props.appState.viewerEnv}
          setViewerEnv={this.props.setViewerEnv}
          modelId={this.props.location.query.id}
          database='forge-configurator'/>
        : <ConfiguratorHome/>
    )
  }
}

export default ConfiguratorView























































