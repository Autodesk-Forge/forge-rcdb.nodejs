
import HomeView from '../components/HomeView'

import { connect } from 'react-redux'

import {
  setNavbarState
  } from '../../../store/app'

const mapDispatchToProps = {
  setNavbarState
}

const mapStateToProps = (state) => ({

})

export default connect(
  mapStateToProps,
  mapDispatchToProps)(HomeView)
