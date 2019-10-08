import { client as config } from 'c0nfig'
import createStore from './createStore'

const initialState = window.___INITIAL_STATE__

const store = createStore(initialState)

export default store
