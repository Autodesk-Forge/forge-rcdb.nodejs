import AppContainer from './containers/AppContainer'
import createStore from './store/createStore'
import {client as config} from 'c0nfig'
import ReactDOM from 'react-dom'
import 'font-awesome-webpack'
import 'bootstrap-webpack'
import React from 'react'

import { Provider } from 'react-redux'
import LanguageProvider from './translations/LanguageProvider'
import { translationMessages } from './i18n'

//Services
import ServiceManager from 'SvcManager'
import ExtractorSvc from 'ExtractorSvc'
import MaterialSvc from 'MaterialSvc'
import StorageSvc from 'StorageSvc'
import NotifySvc from 'NotifySvc'
import DialogSvc from 'DialogSvc'
import SocketSvc from 'SocketSvc'
import ModelSvc from 'ModelSvc'
import EventSvc from 'EventSvc'
import ForgeSvc from 'ForgeSvc'
import UserSvc from 'UserSvc'

// ========================================================
// Services Initialization
// ========================================================

const storageSvc = new StorageSvc({
  storageKey: 'Autodesk.Forge-RCDB.Storage',
  storageVersion: config.storageVersion
})

const materialSvc = new MaterialSvc({
  apiUrl: '/api/materials'
})

const socketSvc = new SocketSvc({
  host: config.host,
  port: config.port
})

socketSvc.connect().then((socket) => {
  console.log(`${config.host}:${config.port}`)
  console.log('Client socket connected: ' + socket.id)
})

const extractorSvc = new ExtractorSvc({
  apiUrl: '/api/extract'
})

const modelSvc = new ModelSvc({
  apiUrl: '/api/models'
})

const notifySvc = new NotifySvc()

const dialogSvc = new DialogSvc()

const eventSvc = new EventSvc()

const forgeSvc = new ForgeSvc({
  apiUrl: '/api/forge'
})

const userSvc = new UserSvc({
  apiUrl: '/api/user'
})

// ========================================================
// Services Registration
// ========================================================
ServiceManager.registerService(extractorSvc)
ServiceManager.registerService(materialSvc)
ServiceManager.registerService(storageSvc)
ServiceManager.registerService(socketSvc)
ServiceManager.registerService(dialogSvc)
ServiceManager.registerService(notifySvc)
ServiceManager.registerService(modelSvc)
ServiceManager.registerService(eventSvc)
ServiceManager.registerService(forgeSvc)
ServiceManager.registerService(userSvc)

// ========================================================
// Store Instantiation
// ========================================================
const initialState = window.___INITIAL_STATE__

const store = createStore(initialState)

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
// render()

// Chunked polyfill for browsers without Intl support
if (!window.Intl) {
  (new Promise((resolve) => {
    resolve(import('intl'));
  }))
    .then(() => Promise.all([
      import('intl/locale-data/jsonp/en.js'),
      import('intl/locale-data/jsonp/zh.js'),
    ]))
    .then(() => render(translationMessages))
    .catch((err) => {
      throw err;
    });
} else {
  render(translationMessages);
}



