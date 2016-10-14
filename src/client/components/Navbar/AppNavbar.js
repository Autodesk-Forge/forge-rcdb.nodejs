
import DatabaseDlg from './dialogs/DatabaseDlg'
import LayoutDlg from './dialogs/LayoutDlg'
import ThemeDlg from './dialogs/ThemeDlg'
import AboutDlg from './dialogs/AboutDlg'
import React, { PropTypes } from 'react'
import SpinningImg from './SpinningImg'
import './dialogs/dialogs.scss'
import './AppNavbar.scss'
import {
  DropdownButton,
  NavDropdown,
  MenuItem,
  NavItem,
  Navbar,
  Button,
  Modal,
  Nav
  } from 'react-bootstrap'

export default class AppNavbar extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  state = {
    databaseOpen: false,
    layoutOpen: false,
    themeOpen: false,
    aboutOpen: false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  openDatabaseDlg () {

    this.setState(Object.assign({}, this.state, {
      databaseOpen: true
    }))
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  openLayoutDlg () {

    this.setState(Object.assign({}, this.state, {
      layoutOpen: true
    }))
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  openThemeDlg () {

    this.setState(Object.assign({}, this.state, {
      themeOpen: true
    }))
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  openAboutDlg () {

    this.setState(Object.assign({}, this.state, {
      aboutOpen: true
    }))
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    const { appState } = this.props;

    return (

      <Navbar className="forge-rcdb-navbar">
        <Navbar.Header>
          <Navbar.Brand>
            <NavItem className="forge-rcdb-brand-item"
              href="https://forge.autodesk.com"
              target="_blank">
              <img height="56" width="56" src="/resources/img/forge.png"/>
              &nbsp;<b>Forge</b> | RCDB
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
                  &nbsp; Settings &nbsp;
                </div>
              }>
              <MenuItem eventKey={3.1} onClick={() => {this.openDatabaseDlg()}}>
                <span className="fa fa-database"></span>
                &nbsp; Select database ...
              </MenuItem>
              <MenuItem divider/>
              <MenuItem eventKey={3.2} onClick={() => {this.openLayoutDlg()}}>
                <span className="fa fa-th-large"></span>
                &nbsp; Select layout ...
              </MenuItem>
              <MenuItem divider/>
              <MenuItem eventKey={3.3} onClick={() => {this.openThemeDlg()}}>
                <span className="fa fa-paint-brush"></span>
                &nbsp; Select theme ...
              </MenuItem>
            </NavDropdown>

            <NavItem eventKey={4} onClick={() => {this.openAboutDlg()}}>
              <span className="forge-rcdb-span fa fa-question-circle"></span>
              &nbsp; About ...
            </NavItem>
          </Nav>

          <DatabaseDlg
            close={()=>{ this.setState(Object.assign({}, this.state, {
              databaseOpen: false
            }))}}
            databaseChange={this.props.databaseChange}
            open={this.state.databaseOpen}
          />

          <LayoutDlg
            close={()=>{ this.setState(Object.assign({}, this.state, {
              layoutOpen: false
            }))}}
            layoutChange={this.props.layoutChange}
            open={this.state.layoutOpen}
          />

          <ThemeDlg
            close={()=>{ this.setState(Object.assign({}, this.state, {
              themeOpen: false
            }))}}
            themeChange={this.props.themeChange}
            open={this.state.themeOpen}
          />

          <AboutDlg
            close={()=>{ this.setState(Object.assign({}, this.state, {
              aboutOpen: false
            }))}}
            open={this.state.aboutOpen}
          />

        </Navbar.Collapse>
      </Navbar>
    )
  }
}
