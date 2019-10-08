import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { history } from 'BrowserContext'
// default reducers
import locationReducer from './location'
import appReducer from './app'

export const makeRootReducer = (history, asyncReducers = {}) => {
  return combineReducers({
    router: connectRouter(history),
    location: locationReducer,
    app: appReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }, history = history) => {
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(history, store.asyncReducers))
}

export default makeRootReducer
