import { injectReducer } from '../../store/reducers'

export default (store) => ({

  path : 'viewer',

  getComponent (nextState, cb) {

    require.ensure([], (require) => {

      const container = require('./containers/ViewerContainer').default
      const reducer = require('./modules/viewer').default

      injectReducer(store, { key: 'viewer', reducer })

      cb(null, container)

    }, 'viewer')
  }
})
