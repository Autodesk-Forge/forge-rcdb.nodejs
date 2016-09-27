// ------------------------------------
// Constants
// ------------------------------------
export const LOAD_DB_ITEMS = 'LOAD_DB_ITEMS'
export const ON_DB_ITEM_SELECTED = 'ON_DB_ITEM_SELECTED'

// ------------------------------------
// Actions
// ------------------------------------
export const loadDbItems = (dbItems) => {

  return {
    type    : LOAD_DB_ITEMS,
    payload : dbItems
  }
}

export const onDbItemSelected = (dbItem) => {

  return {
    type    : ON_DB_ITEM_SELECTED,
    payload : dbItem
  }
}

export const actions = {
  loadDbItems,
  onDbItemSelected
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [LOAD_DB_ITEMS] : (state, action) => {
    return Object.assign({}, state, {
      dbItems: action.payload
    })
  },
  [ON_DB_ITEM_SELECTED] : (state, action) => {
    return Object.assign({}, state, {
      selectedDbItem: action.payload
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  dbItems: [],
  selectedDbItem: {
    value:''
  }
}

export default function reducer (state = initialState, action) {

  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}






