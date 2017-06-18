import { injectReducer } from '../../store/reducers'

export default (store) => ({

  path : '*',

  getComponent (nextState, cb) {

    require.ensure([], (require) => {

      const container = require('./containers/PageNotFoundContainer').default
      const reducer = require('./modules/pageNotFound').default

      injectReducer(store, { key: 'pageNotFound', reducer })

      cb(null, container)

    }, 'pageNotFound')
  }
})

