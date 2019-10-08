import { client as config } from 'c0nfig'
import { Services } from 'ServiceContext'
import merge from 'lodash/merge'

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
    type: DATABASE_CHANGE,
    payload: database
  }
}

export function layoutChange (layoutType) {
  return {
    type: LAYOUT_CHANGE,
    payload: layoutType
  }
}

export function themeChange (theme) {
  return {
    type: THEME_CHANGE,
    payload: theme
  }
}

export function saveAppState () {
  return {
    type: SAVE_APP_STATE
  }
}

export function setNavbarState (state) {
  return {
    type: SET_NAVBAR_STATE,
    payload: state
  }
}

export function setViewerEnv (env) {
  return {
    type: SET_VIEWER_ENV,
    payload: env
  }
}

const getUserWithStats = async (user) => {
  if (user.uploadLimit !== undefined) {
    const activeModels =
      await Services.userSvc.getActiveModels(
        'gallery')

    const allowedUploads =
      user.uploadLimit - activeModels.length

    return Object.assign({}, user, {
      allowedUploads
    })
  }

  return user
}

export function setUser (user) {
  if (!user) {
    return {
      type: SET_USER,
      payload: null
    }
  }

  return (dispatch) => {
    getUserWithStats(user).then((userWithStats) => {
      dispatch({
        type: SET_USER,
        payload: userWithStats
      })
    })
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {

  [DATABASE_CHANGE]: (state, action) => {
    const storage = Object.assign({},
      state.storage, {
        database: action.payload
      })

    return Object.assign({}, state, {
      storage
    })
  },

  [LAYOUT_CHANGE]: (state, action) => {
    const storage = Object.assign({},
      state.storage, {
        layoutType: action.payload
      })

    return Object.assign({}, state, {
      storage
    })
  },

  [THEME_CHANGE]: (state, action) => {
    const storage = Object.assign({},
      state.storage, {
        theme: action.payload
      })

    return Object.assign({}, state, {
      storage
    })
  },

  [SAVE_APP_STATE]: (state, action) => {
    Services.storageSvc.save('AppState.storage', state.storage)

    return state
  },

  [SET_NAVBAR_STATE]: (state, action) => {
    const navbar = merge({},
      state.navbar,
      action.payload)

    return Object.assign({}, state, {
      navbar
    })
  },

  [SET_VIEWER_ENV]: (state, action) => {
    return Object.assign({}, state, {
      viewerEnv: action.payload
    })
  },

  [SET_USER]: (state, action) => {
    return Object.assign({}, state, {
      user: action.payload
    })
  }
}

// ------------------------------------
// get storage
// ------------------------------------
const getStorage = () => {
  const defaultAppState = {
    layoutType: 'flexLayoutRight',
    theme: {
      viewer: {
        theme: config.viewerTheme,
        backgroundColor: [
          205, 205, 205,
          255, 255, 255
        ],
        lightPreset: 1
      }
    }
  }

  const storage = Services.storageSvc.load(
    'AppState.storage',
    defaultAppState)

  return storage
}

// ------------------------------------
// Initial App State
// ------------------------------------
const createInitialState = () => {
  const defaultState = {
    navbar: {
      visible: true,
      links: {
        settings: true,
        gallery: true,
        login: true,
        demos: true,
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

  return handler
    ? handler(state, action)
    : state
}
