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

  const routes = require('./routes/index').default(store)

  ReactDOM.render(
    <Provider store={store}>
      <LanguageProvider messages={messages}>
        <AppContainer store={store} routes={routes} />
      </LanguageProvider>
    </Provider>,
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
    module.hot.accept('./routes/index', () =>
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
// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
  (new Promise((resolve) => {
    resolve(import('intl'))
  })).then(() => Promise.all([
      import('intl/locale-data/jsonp/en.js'),
      import('intl/locale-data/jsonp/zh.js')
    ])).then(() => render(translationMessages))
    .catch((err) => {
      throw err
    })
} else {
  render(translationMessages)
}



