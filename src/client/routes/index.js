import React from 'react'
import { Route, Switch } from 'react-router'
import loadable from '@loadable/component'
import { ReactLoader } from '../components/Loader'
import CoreLayout from '../components/Views/layouts/CoreLayout'
import { history } from 'BrowserContext'
import { ConnectedRouter } from 'connected-react-router'
const loadableOptions = {
  fallback: <ReactLoader />
}
export default () => (
  <ConnectedRouter history={history}>
    <CoreLayout>

      <Switch>
        <Route exact path='/' component={loadable(() => import('../components/Views/Home'), loadableOptions)} />
        <Route path='/gallery' component={loadable(() => import('../components/Views/Gallery'), loadableOptions)} />
        <Route path='/database' component={loadable(() => import('../components/Views/Database'), loadableOptions)} />
        <Route path='/configurator' component={loadable(() => import('../components/Views/Configurator'), loadableOptions)} />
        <Route component={loadable(() => import('../components/Views/PageNotFound'), loadableOptions)} />
      </Switch>
    </CoreLayout>
  </ConnectedRouter>

)
