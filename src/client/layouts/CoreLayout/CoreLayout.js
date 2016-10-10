import Header from '../../components/Header'
import '../../styles/core.scss'
import './CoreLayout.scss'
import React from 'react'

class CoreLayout extends React.Component {

  static propTypes = {
    children : React.PropTypes.element.isRequired
  }

  componentDidMount () {

  }

  render () {

    const {children} = this.props

    return (
      <div className='container text-center'>
        <Header {...this.props} />
        <div className='core-layout__viewport'>
          {children}
        </div>
      </div>
    )
  }
}

export default CoreLayout
