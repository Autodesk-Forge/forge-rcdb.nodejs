import ConfiguratorView from './ConfiguratorView'
import { connect } from 'react-redux'

import {
  setNavbarState,
  setViewerEnv
} from '../../../store/app'

const mapDispatchToProps = {
  setNavbarState,
  setViewerEnv
}

const mapStateToProps = (state) => (
  Object.assign({}, state.configurator, {
    appState: state.app
  })
)

export default connect(
  mapStateToProps,
  mapDispatchToProps)(ConfiguratorView)
