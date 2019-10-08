import ConfiguratorHomeView from './ConfiguratorHomeView'
import ViewerConfigurator from 'Viewer.Configurator'
import { history as browserHistory } from 'BrowserContext'
import './ConfiguratorView.scss'
import React from 'react'
import { ServiceContext } from 'ServiceContext'
import queryString from 'query-string'

class ConfiguratorView extends React.Component {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super(props)
    this.onError = this.onError.bind(this)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillMount () {
    this.props.setNavbarState({
      links: {
        settings: false
      }
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onError (error) {
    if (error.status === 404) {
      browserHistory.push('/404')
    } else if (error) {
      console.log('unhandled error:')
      console.log(error)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const params = queryString.parse(this.props.location.search)
    const view = params.id
      ? <ViewerConfigurator
        setNavbarState={this.props.setNavbarState}
        setViewerEnv={this.props.setViewerEnv}
        modelId={params.id}
        appState={this.props.appState}
        location={this.props.location}
        onError={this.onError}
        notify={this.notify}
        showLoader
        database='configurator'
        />
      : <ConfiguratorHomeView />

    return (
      <div className='configurator-view'>
        {view}
      </div>
    )
  }
}

export default ConfiguratorView
