import { connect } from 'react-redux'

import {
  setViewerEnv
} from '../../../store/app'

import TestView from './components/TestView'

const mapDispatchToProps = {
  setViewerEnv
}

const mapStateToProps = (state) => (
  Object.assign({}, state.test, {
    appState: state.app
  })
)

export default connect(
  mapStateToProps,
  mapDispatchToProps)(TestView)
