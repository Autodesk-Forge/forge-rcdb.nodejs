import UploadView from '../components/GalleryView'

import { connect } from 'react-redux'

import {
  setNavbarState,
  setViewerEnv
  } from '../../../store/app'

import {
  removeNotifications,
  updateNotification,
  addNotification
  } from 'reapop'

const mapDispatchToProps = {
  removeNotifications,
  updateNotification,
  addNotification,
  setNavbarState,
  setViewerEnv
}

const mapStateToProps = (state) => (
  Object.assign({}, state.gallery, {
    appState: state.app
  })
)

export default connect(
  mapStateToProps,
  mapDispatchToProps)(UploadView)
