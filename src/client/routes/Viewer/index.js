import { injectReducer } from '../../store/reducers'
import ViewerView from './components/ViewerView'

export default (store) => ({
  path : 'viewer',
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
     and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
       dependencies for bundling   */
      const container = require('./containers/ViewerContainer').default
      const reducer = require('./modules/viewer').default

      /*  Add the reducer to the store on key 'counter'  */
      injectReducer(store, { key: 'viewer', reducer })

      /*  Return getComponent   */
      cb(null, container)

      /* Webpack named bundle   */
    }, 'viewer')
  }
})
