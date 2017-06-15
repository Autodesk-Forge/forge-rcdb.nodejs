import { injectReducer } from '../../store/reducers'

export default (store) => ({

  path : 'gallery',

  getComponent (nextState, cb) {

    require.ensure([], (require) => {

      const container = require('./containers/GalleryContainer').default
      const reducer = require('./modules/gallery').default

      injectReducer(store, { key: 'gallery', reducer })

      cb(null, container)

    }, 'gallery')
  }
})

