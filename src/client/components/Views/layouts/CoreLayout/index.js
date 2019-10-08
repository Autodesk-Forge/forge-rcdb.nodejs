import { connect } from 'react-redux'

import CoreLayout from './CoreLayout'

import {
  layoutChange,
  themeChange,
  saveAppState,
  // fetchUser,
  setUser
} from '../../../../store/app'

// import {
//   removeNotifications,
//   updateNotification,
//   addNotification
//   } from 'reapop'

const mapDispatchToProps = {
  // removeNotifications,
  // updateNotification,
  // addNotification,
  layoutChange,
  saveAppState,
  themeChange,
  // fetchUser,
  setUser
}

const mapStateToProps = (state) => ({
  appState: state.app
})

export default connect(
  mapStateToProps,
  mapDispatchToProps)(CoreLayout)
