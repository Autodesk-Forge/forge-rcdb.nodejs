import View from '../components/DatabaseView'

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
  Object.assign({}, state.viewer, {
    appState: state.app
  })
)

export default connect(
  mapStateToProps,
  mapDispatchToProps)(View)
