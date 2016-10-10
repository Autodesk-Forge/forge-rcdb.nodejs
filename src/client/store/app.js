// ------------------------------------
// Constants
// ------------------------------------
export const LAYOUT_CHANGE = 'LAYOUT_CHANGE'

// ------------------------------------
// Actions
// ------------------------------------
export function layoutChange (layoutType) {
  return {
    type    : LAYOUT_CHANGE,
    payload : layoutType
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
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  layoutType: 'splitLayoutRight'
}

export default function reducer (state = initialState, action) {

  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
