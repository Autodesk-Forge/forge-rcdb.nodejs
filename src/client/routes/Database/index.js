import { injectReducer } from '../../store/reducers'

export default (store) => ({

  path : 'database',

  getComponent (nextState, cb) {

    require.ensure([], (require) => {

      const container = require('./containers/DatabaseContainer').default
      const reducer = require('./modules/database').default

      injectReducer(store, { key: 'database', reducer })

      cb(null, container)

    }, 'database')
  }
})
