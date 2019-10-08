
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import routes from './routes'
import store from './store'
import React from 'react'
import 'bootstrap'
// i18 imports
// import LanguageProvider from './translations/LanguageProvider'
// import { translationMessages } from './i18n'

ReactDOM.render(
  <Provider store={store}>
    {routes()}
  </Provider>,
  document.getElementById('root')
)
