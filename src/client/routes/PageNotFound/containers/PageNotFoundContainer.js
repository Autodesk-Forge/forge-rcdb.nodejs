import PageNotFoundView from '../components/PageNotFoundView'

import { connect } from 'react-redux'

import {
  setNavbarState
  } from '../../../store/app'

const mapDispatchToProps = {
  setNavbarState
}

const mapStateToProps = (state) => (
  Object.assign({}, state.pageNotFound, {

  })
)

export default connect(
  mapStateToProps,
  mapDispatchToProps)(PageNotFoundView)
