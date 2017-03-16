import { injectReducer } from '../../store/reducers'

export default (store) => ({

  path : 'configurator',

  getComponent (nextState, cb) {

    require.ensure([], (require) => {

      const container = require('./containers/ConfiguratorContainer').default
      const reducer = require('./modules/configurator').default

      injectReducer(store, { key: 'configurator', reducer })

      cb(null, container)

    }, 'configurator')
  }
})

