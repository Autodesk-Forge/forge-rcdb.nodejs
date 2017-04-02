import ViewerConfigurator from 'Viewer.Configurator'
import ConfiguratorHome from './ConfiguratorHome'
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

    return (this.props.location.query.id
      ? <div className="configurator-view">
          <ViewerConfigurator
            viewerEnv={this.props.appState.viewerEnv}
            setViewerEnv={this.props.setViewerEnv}
            modelId={this.props.location.query.id}
            database='forge-configurator'/>
        </div>
      : <ConfiguratorHome/>
    )
  }
}

export default ConfiguratorView























































