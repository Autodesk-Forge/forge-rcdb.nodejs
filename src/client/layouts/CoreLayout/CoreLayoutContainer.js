import { connect } from 'react-redux'
import CoreLayout from './CoreLayout'
import {
  databaseChange,
  layoutChange,
  themeChange,
  saveAppState
  } from '../../store/app'

const mapDispatchToProps = {
  databaseChange,
  layoutChange,
  saveAppState,
  themeChange
}

const mapStateToProps = (state) => ({
  appState: state.app
})

export default connect(
  mapStateToProps,
  mapDispatchToProps)(CoreLayout)
