
import { DropdownButton, NavDropdown, MenuItem, NavItem, Navbar, Button, Modal, Nav } from 'react-bootstrap'
import LayoutSettingsDlg from './dialogs/LayoutSettingsDlg'
import ThemeSettingsDlg from './dialogs/ThemeSettingsDlg'
import AboutDlg from './dialogs/AboutDlg'
import React, { PropTypes } from 'react'
import SpinningImg from './SpinningImg'
import './dialogs/dialogs.scss'
import './AppNavbar.scss'

export default class AppNavbar extends React.Component {

  state= {
    databaseOpen: false,
    themesOpen: false,
    layoutOpen: false,
    aboutOpen: false
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onSelectDatabase () {

    this.setState(Object.assign({}, this.state, {
      databaseOpen: true
    }))
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onSelectLayout () {

    this.setState(Object.assign({}, this.state, {
      layoutOpen: true
    }))
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onSelectTheme () {

    this.setState(Object.assign({}, this.state, {
      themesOpen: true
    }))
  }

  themeChange (theme) {

  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onAbout () {

    this.setState(Object.assign({}, this.state, {
      aboutOpen: true
    }))
  }

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
              <MenuItem eventKey={3.1} onClick={() => {this.onSelectDatabase()}}>
                <span className="fa fa-database"></span>
                &nbsp; Select database ...
              </MenuItem>
              <MenuItem divider/>
              <MenuItem eventKey={3.2} onClick={() => {this.onSelectLayout()}}>
                <span className="fa fa-th-large"></span>
                &nbsp; Select layout ...
              </MenuItem>
              <MenuItem eventKey={3.3} onClick={() => {this.onSelectTheme()}}>
                <span className="fa fa-paint-brush"></span>
                &nbsp; Select theme ...
              </MenuItem>
            </NavDropdown>

            <NavItem eventKey={4} onClick={() => {this.onAbout()}}>
              <span className="forge-rcdb-span fa fa-question-circle"></span>
              &nbsp; About ...
            </NavItem>
          </Nav>

        <LayoutSettingsDlg
          close={()=>{ this.setState(Object.assign({}, this.state, {
            layoutOpen: false
          }))}}
          layoutChange={this.props.layoutChange}
          open={this.state.layoutOpen}
        />

        <ThemeSettingsDlg
          close={()=>{ this.setState(Object.assign({}, this.state, {
            themesOpen: false
          }))}}
          onSelectItem={(theme) => this.themeChange(theme)}
          open={this.state.themesOpen}
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
