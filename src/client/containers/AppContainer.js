import { browserHistory, Router } from 'react-router'
import { Provider } from 'react-redux'
import PropTypes from 'prop-types'
import ReactGA from 'react-ga'
import React from 'react'

class AppContainer extends React.Component {

  static propTypes = {
    routes : PropTypes.object.isRequired,
    store  : PropTypes.object.isRequired
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.logPageView = this.logPageView.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.props.GA.accountIds.forEach((accountId) => {

      ReactGA.initialize(accountId)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  shouldComponentUpdate () {

    return false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  logPageView () {

    if (this.props.env === 'production') {

      const {pathname, search} = window.location

      const page = pathname + search

      ReactGA.set({
        page
      })

      ReactGA.pageview(page)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const { routes, store } = this.props

    return (
      <Provider store={store}>
        <div style={{ height: '100%' }}>
          <Router
            onUpdate={this.logPageView}
            history={browserHistory}
            children={routes}
          />
        </div>
      </Provider>
    )
  }
}

export default AppContainer
