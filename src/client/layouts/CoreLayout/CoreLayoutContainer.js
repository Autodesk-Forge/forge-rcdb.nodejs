import { connect } from 'react-redux'
import CoreLayout from './CoreLayout'
import {
  databaseChange,
  layoutChange,
  themeChange,
  saveAppState,
  setUser,
  } from '../../store/app'

const mapDispatchToProps = {
  databaseChange,
  layoutChange,
  saveAppState,
  themeChange,
  setUser
}

const mapStateToProps = (state) => ({
  appState: state.app
})

export default connect(
  mapStateToProps,
  mapDispatchToProps)(CoreLayout)
