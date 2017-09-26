import { browserHistory, Router } from 'react-router'
import GoogleAnalytics from 'react-g-analytics'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import React from 'react'

class AppContainer extends React.Component {

  static propTypes = {
    routes : PropTypes.object.isRequired,
    store  : PropTypes.object.isRequired
  }

  shouldComponentUpdate () {
    return false
  }

  renderGA = () => {
    return (
      <div>
        <GoogleAnalytics id="7938776"/>
        <GoogleAnalytics id="60717701"/>
      </div>
    )
  }

  render () {

    const { env, routes, store } = this.props

    const prod = (env === 'production')

    return (
      <Provider store={store}>
        <div style={{ height: '100%' }}>
          {prod && this.renderGA() }
          <Router history={browserHistory} children={routes} />
        </div>
      </Provider>
    )
  }
}

export default AppContainer
