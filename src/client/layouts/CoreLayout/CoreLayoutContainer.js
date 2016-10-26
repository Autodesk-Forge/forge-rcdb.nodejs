import { connect } from 'react-redux'
import CoreLayout from './CoreLayout'
import {
  databaseChange,
  layoutChange,
  saveAppState
  } from '../../store/app'

const mapDispatchToProps = {
  databaseChange,
  layoutChange,
  saveAppState
}

const mapStateToProps = (state) => ({
  appState: state.app
})

export default connect(
  mapStateToProps,
  mapDispatchToProps)(CoreLayout)
