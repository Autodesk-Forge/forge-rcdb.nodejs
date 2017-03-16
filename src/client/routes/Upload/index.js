import { injectReducer } from '../../store/reducers'

export default (store) => ({

  path : 'upload',

  getComponent (nextState, cb) {

    require.ensure([], (require) => {

      const container = require('./containers/UploadContainer').default
      const reducer = require('./modules/upload').default

      injectReducer(store, { key: 'upload', reducer })

      cb(null, container)

    }, 'upload')
  }
})

