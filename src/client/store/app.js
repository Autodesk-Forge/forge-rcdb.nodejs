// ------------------------------------
// Constants
// ------------------------------------
export const DATABASE_CHANGE = 'DATABASE_CHANGE'
export const LAYOUT_CHANGE = 'LAYOUT_CHANGE'
export const THEME_CHANGE = 'THEME_CHANGE'
export const SAVE_STORAGE = 'SAVE_STORAGE'

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

export function saveStorage () {

  return {
    type    : SAVE_STORAGE
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

  [SAVE_STORAGE] : (state, action) => {

    return state
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
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

const storageState = {
  layoutType: 'splitLayoutRight'
}

const initialState = Object.assign({},
  defaultState,
  storageState)

export default function reducer (state = initialState, action) {

  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
