import ViewingApp from 'Viewer.ViewingApplication'
import Toolkit from 'Viewer.Toolkit'
import Viewer from 'Viewer'
import React from 'react'

class TestView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onViewingApplicationCreated =
      this.onViewingApplicationCreated.bind(this)

    this.state = {
      urn: null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  assignState (state) {

    return new Promise((resolve) => {

      const newState = Object.assign(
        {}, this.state, state)

      this.setState(newState, () => {
        resolve()
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Initialize viewer environment
  //
  /////////////////////////////////////////////////////////
  initialize (options) {

    return new Promise((resolve, reject) => {

      Autodesk.Viewing.Initializer (options, () => {

        resolve ()

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Load a document from URN
  //
  /////////////////////////////////////////////////////////
  loadDocument (urn) {

    return new Promise((resolve, reject) => {

      const paramUrn = !urn.startsWith('urn:')
        ? 'urn:' + urn
        : urn

      Autodesk.Viewing.Document.load(paramUrn, (doc) => {

        resolve (doc)

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentDidMount () {

    if (!this.props.appState.viewerEnv) {

      const viewerEnv = await this.initialize({
        env: 'AutodeskProduction',
        useConsolidation: true
        //getAccessToken: function(onGetAccessToken) {
        //  $.get('/api/forge/token/2legged', (token) => {
        //    onGetAccessToken(token.access_token, token.expires_in)
        //  })
        //}
      })

      this.props.setViewerEnv (viewerEnv)

      Autodesk.Viewing.setEndpointAndApi(
        window.location.origin + '/lmv-proxy-2legged',
        'modelDerivativeV2')

      Autodesk.Viewing.Private.memoryOptimizedSvfLoading = true
    }

    this.assignState({
      urn: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmNkYi1nYWxsZXJ5LWRldi9zZWF0LmR3Zg=='
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onViewerCreated (viewer) {

    try {

      //viewer.start()

    } catch(ex) {

      console.log('Viewer Initialization Error: ')
      console.log(ex)
    }
  }

  ////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onViewingApplicationCreated () {


  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render1() {

    return (
      <div className="test">
        <Viewer onViewerCreated={(data) => this.onViewerCreated(data)}
          style={{height:"calc(100vh - 65px)"}}/>
      </div>
    )
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return (
      <div className="test" style={{height:"calc(100vh - 65px)"}}>
        <ViewingApp
          urn={this.state.urn}
          onViewingApplicationCreated={this.onViewingApplicationCreated}
        />
      </div>
    )
  }
}

export default TestView
























































