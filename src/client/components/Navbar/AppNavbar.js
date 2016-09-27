
import { DropdownButton, NavDropdown, MenuItem, NavItem, Navbar, Button, Modal, Nav } from 'react-bootstrap'
import React, { PropTypes } from 'react'
import SpinningImg from './SpinningImg'
import './AppNavbar.scss'

export default class AppNavbar extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    const {appState} = this.props;

    return (
      <Navbar className="navbar-lmv">
        <Navbar.Header>
          <Navbar.Brand>
            <img height="56" width="56" src="/resources/img/forge.png"/>
            <b>Forge</b> | RCDB
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>

          <Nav pullRight>
            <NavItem eventKey={1} onSelect={this.logout}>
              <span className="glyphicon glyphicon-user" aria-hidden="true"></span>
               &nbsp; Logged in as {'dude'} (Lougout)
            </NavItem>
          </Nav>

        </Navbar.Collapse>
      </Navbar>
    );
  }
}
