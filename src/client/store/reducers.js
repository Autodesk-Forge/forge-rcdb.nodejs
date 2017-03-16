import { combineReducers } from 'redux'

//default reducers
import locationReducer from './location'
import appReducer from './app'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
    app: appReducer,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
