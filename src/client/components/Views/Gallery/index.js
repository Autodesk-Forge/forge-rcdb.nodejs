import UploadView from './components/GalleryView'

import { connect } from 'react-redux'

import {
  setNavbarState
} from '../../../store/app'

const mapDispatchToProps = {
  setNavbarState
}

const mapStateToProps = (state) => (
  Object.assign({}, state.gallery, {
    appState: state.app
  })
)

export default connect(
  mapStateToProps,
  mapDispatchToProps)(UploadView)
