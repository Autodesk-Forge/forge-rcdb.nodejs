// ------------------------------------
// Constants
// ------------------------------------
export const LAYOUT_CHANGE = 'LAYOUT_CHANGE'
export const THEME_CHANGE = 'THEME_CHANGE'

// ------------------------------------
// Actions
// ------------------------------------
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

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {

  [LAYOUT_CHANGE] : (state, action) => {

    return Object.assign({}, state, {
      layoutType: action.payload
    })
  },

  [THEME_CHANGE] : (state, action) => {

    return Object.assign({}, state, {
      theme: action.payload
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
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

export default function reducer (state = initialState, action) {

  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
