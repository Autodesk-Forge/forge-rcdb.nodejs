import ViewerConfigurator from 'Viewer.Configurator'
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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render () {

    return (
      <ViewerConfigurator
        viewerEnv={this.props.appState.viewerEnv}
        setViewerEnv={this.props.setViewerEnv}
        modelId={this.props.location.query.id}
        database='forge-configurator'/>
    )
  }
}

export default ConfiguratorView























































