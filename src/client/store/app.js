import ServiceManager from 'SvcManager'

// ------------------------------------
// Constants
// ------------------------------------
export const DATABASE_CHANGE = 'DATABASE_CHANGE'
export const SAVE_APP_STATE = 'SAVE_APP_STATE'
export const LAYOUT_CHANGE = 'LAYOUT_CHANGE'
export const THEME_CHANGE = 'THEME_CHANGE'

// ------------------------------------
// Actions
// ------------------------------------
export function databaseChange (database) {
  return {
    type    : DATABASE_CHANGE,
    payload : database
  }
}

export function layoutChange (layoutType) {
  return {
    type    : LAYOUT_CHANGE,
    payload : layoutType
  }
}

export function themeChange (theme) {
  return {
    type    : THEME_CHANGE,
    payload : theme
  }
}

export function saveAppState () {
  return {
    type    : SAVE_APP_STATE
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {

  [DATABASE_CHANGE] : (state, action) => {

    return Object.assign({}, state, {
      database: action.payload
    })
  },

  [LAYOUT_CHANGE] : (state, action) => {

    return Object.assign({}, state, {
      layoutType: action.payload
    })
  },

  [THEME_CHANGE] : (state, action) => {

    return Object.assign({}, state, {
      theme: action.payload
    })
  },

  [SAVE_APP_STATE] : (state, action) => {

    const storageSvc = ServiceManager.getService(
      'StorageSvc')

    storageSvc.save('AppState', state)

    return state
  }
}

// ------------------------------------
// Initial App State
// ------------------------------------

const createInitialState = () => {

  const defaultState = {
    layoutType: 'splitLayoutRight',
    theme: {
      name: 'Snow-White',
      css: '/resources/themes/snow-white.css',
      viewer: {
        backgroundColor: [
          245, 245, 245,
          245, 245, 245
        ]
      }
    }
  }

  const storageSvc = ServiceManager.getService(
    'StorageSvc')

  const storageState = storageSvc.load(
    'AppState')

  const initialState = Object.assign({},
    defaultState,
    storageState)

  return initialState
}

// ------------------------------------
// Reducer
// ------------------------------------

export default function reducer (
  state = createInitialState(), action) {

  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
