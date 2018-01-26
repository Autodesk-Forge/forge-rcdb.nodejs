import { LinkContainer } from 'react-router-bootstrap'
import { browserHistory } from 'react-router'
import DatabaseDlg from 'Dialogs/DatabaseDlg'
import LayoutDlg from 'Dialogs/LayoutDlg'
import ThemeDlg from 'Dialogs/ThemeDlg'
import AboutDlg from 'Dialogs/AboutDlg'
import ServiceManager from 'SvcManager'
import PropTypes from 'prop-types'
import './AppNavbar.scss'
import React from 'react'
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

import { intlShape } from 'react-intl'
import messages from 'translations/messages'

export default class AppNavbar extends React.Component {

  static contextTypes = {
    intl: intlShape
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props, context) {

    super(props, context)

    this.state = {
      databaseOpen: false,
      layoutOpen:   false,
      themeOpen:    false,
      aboutOpen:    false,
      menuIcons:    false
    }

    this.forgeSvc = ServiceManager.getService(
      'ForgeSvc')

    this.formatMessage = this.context.intl.formatMessage
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  openDatabaseDlg () {

    this.setState(Object.assign({}, this.state, {
      databaseOpen: true
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  openLayoutDlg () {

    this.setState(Object.assign({}, this.state, {
      layoutOpen: true
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  openThemeDlg () {

    this.setState(Object.assign({}, this.state, {
      themeOpen: true
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  openAboutDlg () {

    this.setState(Object.assign({}, this.state, {
      aboutOpen: true
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  login () {

    const { appState } = this.props

    if (appState.user) {

      this.props.setUser(null)

      this.forgeSvc.logout().then(() => {

        window.location.reload()
      })

    } else {

      this.forgeSvc.login()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const { appState } = this.props

    const {user} = appState

    const username = user
      ? `${user.firstName} ${user.lastName}`
      : ''

    return appState.navbar.visible && (

      <Navbar className="forge-rcdb-navbar">
        <Navbar.Header>
          <Navbar.Brand>
            <NavItem className="forge-rcdb-brand-item"
              href="https://forge.autodesk.com"
              target="_blank">
              <img height="30" src="/resources/img/logos/adsk-forge.png"/>
            </NavItem>
          </Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>

        <Navbar.Collapse>

          {
            appState.navbar.links.home &&

            <Nav>
              <LinkContainer to={{ pathname: '/', query: { } }}>
                <NavItem eventKey={1}>
                  <label className="nav-label">
                    &nbsp; {this.formatMessage(messages.home)}
                  </label>
                </NavItem>
              </LinkContainer>
            </Nav>
          }

          {
            appState.navbar.links.demos &&

            <Nav>
              <LinkContainer to={{ pathname: '/configurator'}}>
                <NavItem eventKey={2}>
                  <label className="nav-label">
                    &nbsp;{this.formatMessage(messages.demo)}
                  </label>
                </NavItem>
              </LinkContainer>
            </Nav>
          }

          {
            appState.navbar.links.gallery &&

            <Nav>
              <LinkContainer to={{ pathname: '/gallery', query: { } }}>
                <NavItem eventKey={3}>
                  <label className="nav-label">
                    &nbsp;{this.formatMessage(messages.gallery)}
                  </label>
                </NavItem>
              </LinkContainer>
            </Nav>
          }

          <Nav pullRight>

            {

              appState.navbar.links.login &&

              <NavItem eventKey={4} onClick={() => {this.login()}}>
                  {
                    !appState.user &&
                    <span className="a360-logo"/>
                  }
                  {
                    appState.user &&
                    <img className="avatar" src={appState.user.profileImages.sizeX80}/>
                  }
                <label className="nav-label">
                  &nbsp; { appState.user ? username : this.formatMessage(messages.login)}
                </label>
              </NavItem>
            }

            {
              appState.navbar.links.settings &&

              <NavDropdown id="settings-dropdown" eventKey={5}
                title={
                  <div className="dropdown-div">
                    <label className="nav-label">
                    &nbsp; Settings &nbsp;
                    </label>
                  </div>
                  }>
                <MenuItem eventKey={5.1} onClick={() => {
                  this.openLayoutDlg()
                }}>
                  <span className="fa fa-th-large"/>
                  &nbsp; Select layout ...
                </MenuItem>
                <MenuItem divider/>
                <MenuItem eventKey={5.2} onClick={() => {
                  this.openThemeDlg()
                }}>
                  <span className="fa fa-paint-brush">
                  </span>
                  &nbsp; Select theme ...
                </MenuItem>
              </NavDropdown>
            }

            {
              appState.navbar.links.about &&

              <NavItem eventKey={6} onClick={() => {this.openAboutDlg()}}>
                <label className="nav-label">
                  &nbsp; {this.formatMessage(messages.about)} ...
                </label>
              </NavItem>
            }
          </Nav>

          {
            false &&
            <DatabaseDlg
              close={()=> {
                this.setState(Object.assign({}, this.state, {
                  databaseOpen: false
                }))
              }}
              databaseChange={this.props.databaseChange}
              open={this.state.databaseOpen}
            />
          }

          <LayoutDlg
            close={()=>{ this.setState(Object.assign({}, this.state, {
              layoutOpen: false
            }))}}
            saveAppState={this.props.saveAppState}
            layoutChange={this.props.layoutChange}
            open={this.state.layoutOpen}
          />

          <ThemeDlg
            close={()=>{ this.setState(Object.assign({}, this.state, {
              themeOpen: false
            }))}}
            saveAppState={this.props.saveAppState}
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
