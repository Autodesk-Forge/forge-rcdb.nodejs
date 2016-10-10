import AppNavbar from '../Navbar/AppNavbar'
import React from 'react'
import './Header.scss'

class Header extends React.Component {

  componentDidMount () {

  }

  render () {

    return (
      <div>
        <AppNavbar {...this.props}/>
      </div>
    )
  }
}

export default Header
