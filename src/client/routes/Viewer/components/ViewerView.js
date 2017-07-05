import ViewerConfigurator from 'Viewer.Configurator'
import { browserHistory } from 'react-router'
import './ViewerView.scss'
import React from 'react'

class ViewerView extends React.Component {

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
      <div className="viewer-view">
        <ViewerConfigurator
          setNavbarState={this.props.setNavbarState}
          onViewerCreated={this.onViewerCreated}
          setViewerEnv={this.props.setViewerEnv}
          modelId={this.props.location.query.id}
          appState={this.props.appState}
          location={this.props.location}
          onError={this.onError}
          database='gallery'
          showLoader={true}
        />
      </div>
    )
  }
}

export default ViewerView
























































