import CoreLayout from '../layouts/CoreLayout'
import PageNotFoundRoute from './PageNotFound'
import ConfiguratorRoute from './Configurator'
import DatabaseRoute from './Database'
import GalleryRoute from './Gallery'
import ViewerRoute from './Viewer'
import HomeRoute from './Home'
import TestRoute from './Test'

export const createRoutes = (store) => ({
  defaultRoute  : HomeRoute(store),
  indexRoute  : HomeRoute(store),
  component   : CoreLayout,
  path        : '/',
  childRoutes : [
    ConfiguratorRoute(store),
    DatabaseRoute(store),
    GalleryRoute(store),
    ViewerRoute(store),
    TestRoute(store),
    PageNotFoundRoute(store)
  ]
})

/*  Note: childRoutes can be chunked or otherwise loaded programmatically
    using getChildRoutes with the following signature:

    getChildRoutes (location, cb) {
      require.ensure([], (require) => {
        cb(null, [
          // Remove imports!
          require('./Counter').default(store)
        ])
      })
    }

    However, this is not necessary for code-splitting! It simply provides
    an API for async route definitions. Your code splitting should occur
    inside the route `getComponent` function, since it is only invoked
    when the route exists and matches.
*/

export default createRoutes
