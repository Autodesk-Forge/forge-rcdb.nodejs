import ViewerConfigurator from 'Viewer.Configurator'
import { browserHistory } from 'react-router'
import './DatabaseView.scss'
import React from 'react'

class DatabaseView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onViewerCreated = this.onViewerCreated.bind(this)
    this.onError = this.onError.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    this.props.setNavbarState({
      links: {
        settings: false
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onError (error) {

    if (error.responseJSON === 'Not Found') {

      browserHistory.push('/404')
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onViewerCreated (viewer, loader) {

    viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, () => {
        loader.show(false)
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className="database-view">
        <ViewerConfigurator
          setNavbarState={this.props.setNavbarState}
          onViewerCreated={this.onViewerCreated}
          setViewerEnv={this.props.setViewerEnv}
          modelId={this.props.location.query.id}
          appState={this.props.appState}
          location={this.props.location}
          onError={this.onError}
          showLoader={true}
          database='rcdb'
        />
      </div>
    )
  }
}

export default DatabaseView





















































