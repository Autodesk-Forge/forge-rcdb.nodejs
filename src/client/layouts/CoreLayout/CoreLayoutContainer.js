import {layoutChange} from '../../store/app'
import { connect } from 'react-redux'
import CoreLayout from './CoreLayout'

const mapDispatchToProps = {
  layoutChange
}

const mapStateToProps = (state) => ({
  appState: state.app
})

export default connect(
  mapStateToProps,
  mapDispatchToProps)(CoreLayout)
