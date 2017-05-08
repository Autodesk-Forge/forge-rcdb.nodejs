//////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
import ContentEditable from 'react-contenteditable'
import ReactDOM from 'react-dom'
import React from 'react'
import {
  DropdownButton,
  MenuItem
  } from 'react-bootstrap'

export default class CreateMetaProperty
  extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.state = Object.assign({}, {
        metaType: 'Text'
      }, props)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.updateOK()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setReactState (state) {

    return new Promise((resolve) => {

      const newState = Object.assign(
        {}, this.state, state)

      this.setState(newState, () => {

        this.updateOK()

        resolve()
      })

      switch (state.metaType) {

        case 'Text':

          return this.props.onChanged({
            displayCategory: newState.displayCategory,
            displayValue: newState.displayValue,
            displayName: newState.displayName,
            metaType: newState.metaType
          })

        case 'Link':

          return this.props.onChanged({
            displayCategory: newState.displayCategory,
            displayValue: newState.displayValue,
            displayName: newState.displayName,
            metaType: newState.metaType,
            link: newState.link
          })
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onInputChanged (e, key) {

    const state = this.state

    state[key] = e.target.value

    await this.setReactState(state)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateOK () {

    switch (this.state.metaType) {

      case 'Text':
      {
        const disableOK =
          !this.state.displayCategory ||
          !this.state.displayValue ||
          !this.state.displayName

        this.props.disableOK (disableOK)

        break
      }

      case 'Link':
      {
        const disableOK =
          !this.state.displayCategory ||
          !this.state.displayValue ||
          !this.state.displayName ||
          !this.state.link

        this.props.disableOK (disableOK)

        break
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    switch (this.state.metaType) {

      case 'Text':
        return (
            <ContentEditable
              onChange={(e) => this.onInputChanged(e, 'displayValue')}
              data-placeholder="Property value ..."
              onKeyDown={(e) => this.onKeyDown(e)}
              html={this.state.displayValue}
              className="input meta-value"
            />
        )
      case 'Link':
        return (
          <div>
            <div className="row">
              <ContentEditable
                onChange={(e) => this.onInputChanged(e, 'displayValue')}
                data-placeholder="Property value ..."
                onKeyDown={(e) => this.onKeyDown(e)}
                html={this.state.displayValue}
                className="input meta-value"
              />
            </div>
            <div className="row">
              <ContentEditable
                onChange={(e) => this.onInputChanged(e, 'link')}
                onKeyDown={(e) => this.onKeyDown(e)}
                className="input meta-value"
                data-placeholder="Link ..."
                html={this.state.link}
              />
            </div>
          </div>
      )
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className="add-meta-property">

        <div className="row">

          <DropdownButton
            title={"Type: " +  this.state.metaType}
            className="type-dropdown"
            key="type-dropdown"
            id="type-dropdown">
            <MenuItem eventKey={1} key={1} onClick={() => {
                this.setReactState({
                  metaType: 'Text'
                })
            }}>
              Text
            </MenuItem>
            <MenuItem eventKey={2} key={2} onClick={() => {
              this.setReactState({
                metaType: 'Link'
              })
            }}>
              Link
            </MenuItem>
          </DropdownButton>

            <ContentEditable
              onChange={(e) => this.onInputChanged(e, 'displayCategory')}
              onKeyDown={(e) => this.onKeyDown(e)}
              data-placeholder="Property category ..."
              html={this.state.displayCategory}
              className="input meta-category"
              disabled={this.state.editMode}
            />
        </div>

        <div className="row">
          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'displayName')}
            onKeyDown={(e) => this.onKeyDown(e)}
            data-placeholder="Property name ..."
            html={this.state.displayName}
            className="input meta-name"
          />
        </div>

        <div className="row">
          { this.renderContent () }
        </div>

      </div>
    )
  }
}
