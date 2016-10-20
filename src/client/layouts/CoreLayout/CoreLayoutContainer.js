import { connect } from 'react-redux'
import CoreLayout from './CoreLayout'
import {
  databaseChange,
  layoutChange,
  loadStorage
  } from '../../store/app'

const mapDispatchToProps = {
  databaseChange,
  layoutChange,
  loadStorage
}

const mapStateToProps = (state) => ({
  appState: state.app
})

export default connect(
  mapStateToProps,
  mapDispatchToProps)(CoreLayout)
