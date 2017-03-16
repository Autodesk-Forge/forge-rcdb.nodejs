import AppNavbar from '../Navbar/AppNavbar'
import React from 'react'
import './Header.scss'

class Header extends React.Component {

  render () {

    return (
      <div>
        <AppNavbar {...this.props}/>
      </div>
    )
  }
}

export default Header
