import { injectReducer } from '../../store/reducers'

export default (store) => ({

  path : 'test',

  getComponent (nextState, cb) {

    require.ensure([], (require) => {

      const container = require('./containers/TestContainer').default
      const reducer = require('./modules/test').default

      injectReducer(store, { key: 'test', reducer })

      cb(null, container)

    }, 'test')
  }
})

