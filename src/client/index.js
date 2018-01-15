
import { AppContainer as HMR } from 'react-hot-loader'
import AppContainer from './containers/AppContainer'
import {client as config} from 'c0nfig'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import 'font-awesome-webpack'
import store from './store'
import 'bootstrap-webpack'
import React from 'react'

//i18 imports
import LanguageProvider from './translations/LanguageProvider'
import { translationMessages } from './i18n'

// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root')

let render = (messages) => {

  const routes = require('./routes').default(store)

  ReactDOM.render(
    <HMR>
      <Provider store={store}>
        <LanguageProvider messages={messages}>
          <AppContainer
            env={config.env}
            routes={routes}
            store={store}
          />
        </LanguageProvider>
      </Provider>
    </HMR>,
    MOUNT_NODE
  )
}

// ========================================================
// This code is excluded from production bundle
// ========================================================
if (config.env === 'development') {

  if (window.devToolsExtension) {

    window.devToolsExtension.open()
  }

  if (module.hot) {

    // Development render functions
    const renderApp = render
    const renderError = (error) => {
      const RedBox = require('redbox-react').default
      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE)
    }

    // Wrap render in try/catch
    render = () => {
      try {
        renderApp(translationMessages)
      } catch (error) {
        renderError(error)
      }
    }

    // Setup hot module replacement
    module.hot.accept('./routes', () =>
      setImmediate(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE)
        render()
      })
    )
  }
}

// ========================================================
// Go!
// ========================================================
render(translationMessages)

