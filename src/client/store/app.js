import ServiceManager from 'SvcManager'

// ------------------------------------
// Constants
// ------------------------------------
export const SET_NAVBAR_STATE = 'SET_NAVBAR_STATE'
export const DATABASE_CHANGE = 'DATABASE_CHANGE'
export const SAVE_APP_STATE = 'SAVE_APP_STATE'
export const SET_VIEWER_ENV = 'SET_VIEWER_ENV'
export const LAYOUT_CHANGE = 'LAYOUT_CHANGE'
export const THEME_CHANGE = 'THEME_CHANGE'
export const SET_USER = 'SET_USER'

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

export function setNavbarState (state) {
  return {
    type    : SET_NAVBAR_STATE,
    payload : state
  }
}

export function setViewerEnv (env) {
  return {
    type    : SET_VIEWER_ENV,
    payload : env
  }
}

export function setUser (user) {
  return {
    type    : SET_USER,
    payload : user
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {

  [DATABASE_CHANGE] : (state, action) => {

    const storage = Object.assign({},
      state.storage, {
        database: action.payload
      })

    return Object.assign({}, state, {
      storage
    })
  },

  [LAYOUT_CHANGE] : (state, action) => {

    const storage = Object.assign({},
      state.storage, {
        layoutType: action.payload
      })

    return Object.assign({}, state, {
      storage
    })
  },

  [THEME_CHANGE] : (state, action) => {

    const storage = Object.assign({},
      state.storage, {
        theme: action.payload
      })

    return Object.assign({}, state, {
      storage
    })
  },

  [SAVE_APP_STATE] : (state, action) => {

    const storageSvc = ServiceManager.getService(
      'StorageSvc')

    storageSvc.save('AppState.storage', state.storage)

    return state
  },

  [SET_NAVBAR_STATE] : (state, action) => {

    const navbar = _.merge({},
      state.navbar, action.payload)

    return Object.assign({}, state, {
      navbar
    })
  },

  [SET_VIEWER_ENV] : (state, action) => {

    return Object.assign({}, state, {
      viewerEnv: action.payload
    })
  },

  [SET_USER] : (state, action) => {

    return Object.assign({}, state, {
      user: action.payload
    })
  }
}

// ------------------------------------
// get storage
// ------------------------------------
const getStorage = () => {

  const storageSvc = ServiceManager.getService(
    'StorageSvc')

  const storage = storageSvc.load(
    'AppState.storage') || {}

  const storageVersion = 1.0

  const defaultStorage = {
    layoutType: 'flexLayoutRight',
    storageVersion,
    theme: {
      css: '/resources/themes/forge-white.css',
      name: 'forge-white-theme',
      viewer: {
        backgroundColor: [
          245, 245, 245,
          245, 245, 245
        ]
      }
    }
  }

  if (storage.version) {

    return storage.version < storageVersion
      ? defaultStorage
      : storage
  }

  return defaultStorage
}

// ------------------------------------
// Initial App State
// ------------------------------------
const createInitialState = () => {

  const defaultState = {
    navbar: {
      links:{
        settings: true,
        about: true,
        home: true
      }
    },
    viewerEnv: null,
    user: null
  }

  const initialState = Object.assign({},
    defaultState, {
      storage: getStorage()
    })

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
