import { connect } from 'react-redux'

import CoreLayout from './CoreLayout'

import {
  databaseChange,
  layoutChange,
  themeChange,
  saveAppState,
  setUser,
  } from '../../store/app'

import {
  removeNotifications,
  updateNotification,
  addNotification
  } from 'reapop'

const mapDispatchToProps = {
  removeNotifications,
  updateNotification,
  addNotification,
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
