import ConfiguratorHomeView from './ConfiguratorHomeView'
import ViewerConfigurator from 'Viewer.Configurator'
import './ConfiguratorView.scss'
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

    const view = this.props.location.query.id
      ? <ViewerConfigurator
          viewerEnv={this.props.appState.viewerEnv}
          setViewerEnv={this.props.setViewerEnv}
          modelId={this.props.location.query.id}
          database='configurator'/>
      : <ConfiguratorHomeView/>

    return (
      <div className="configurator-view">
        { view }
      </div>
    )
  }
}

export default ConfiguratorView























































