
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
      <Navbar className="forge-rcdb-navbar">
        <Navbar.Header>
          <Navbar.Brand>
            <NavItem className="forge-rcdb-brand-item"
              href="https://forge.autodesk.com"
              target="_blank">
              <img height="56" width="56" src="/resources/img/forge.png"/>
              <b>Forge</b> | RCDB
            </NavItem>
          </Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>

        <Navbar.Collapse>

          <Nav>
            <NavItem eventKey={1} href="/#">
              <span className="forge-rcdb-span fa fa-home"></span>
              &nbsp; Home
            </NavItem>
          </Nav>

          <Nav pullRight>

            <NavDropdown eventKey={3} id="basic-nav-dropdown"
              title={
                <div className="dropdown-div">
                  <span className="forge-rcdb-span fa fa-gear"></span>
                  &nbsp; Options &nbsp;
                </div>
              }>
              <MenuItem eventKey={3.1}>
                <span className="fa fa-database"></span>
                &nbsp; Select Database
              </MenuItem>
              <MenuItem divider/>
              <MenuItem eventKey={3.3}>
                <span className="fa fa-th-large"></span>
                &nbsp; Layout Settings
              </MenuItem>
            </NavDropdown>

            <NavItem eventKey={4} onSelect={this.logout}>
              <span className="forge-rcdb-span fa fa-question-circle"></span>
              &nbsp; About ...
            </NavItem>
          </Nav>

        </Navbar.Collapse>
      </Navbar>
    );
  }
}
