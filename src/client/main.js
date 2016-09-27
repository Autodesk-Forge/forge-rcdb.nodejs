import AppContainer from './containers/AppContainer'
import createStore from './store/createStore'
import ServiceManager from 'SvcManager'
import MaterialSvc from 'MaterialSvc'
import ReactDOM from 'react-dom'
import 'font-awesome-webpack'
import 'bootstrap-webpack'
import React from 'react'

// ========================================================
// Store Instantiation
// ========================================================
const initialState = window.___INITIAL_STATE__
const store = createStore(initialState)

// ========================================================
// Services Initialization
// ========================================================
const materialSvc = new MaterialSvc({
  apiUrl: '/api/materials'
})

ServiceManager.registerService(materialSvc)

// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root')

let render = () => {

  const routes = require('./routes/index').default(store)

  ReactDOM.render(
    <AppContainer store={store} routes={routes} />,
    MOUNT_NODE
  )
}

// ========================================================
// Developer Tools Setup
// ========================================================
if (__DEV__) {
  if (window.devToolsExtension) {
    window.devToolsExtension.open()
  }
}

// This code is excluded from production bundle
if (__DEV__) {
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
        renderApp()
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
render()
