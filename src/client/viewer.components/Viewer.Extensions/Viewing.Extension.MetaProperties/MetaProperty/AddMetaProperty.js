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

    this.state = {
      type: 'Text'
    }
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
        resolve()
      })
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
  onInputChanged (e, key) {

    const state = this.state

    state[key] = e.target.value

    this.setState(state)

    const disableOK =
      !state.category ||
      !state.name ||
      !state.value

    this.props.disableOK (disableOK)

    this.props.onChanged({
      metaType: state.type.toLowerCase(),
      displayCategory: state.category,
      displayValue: state.value,
      displayName: state.name
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    switch (this.state.type.toLowerCase()) {

      case 'text':
      case 'link':
        return (
          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'value')}
            onKeyDown={(e) => this.onKeyDown(e)}
            data-placeholder="Property value ..."
            className="input meta-value"
            html={''}
          />
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
            title={"Type: " +  this.state.type}
            className="type-dropdown"
            key="type-dropdown"
            id="type-dropdown">
            <MenuItem eventKey={1} key={1} onClick={() => {
                this.setReactState({
                  type: 'Text'
                })
            }}>
              Text
            </MenuItem>
            <MenuItem eventKey={2} key={2} onClick={() => {
              this.setReactState({
                type: 'Link'
              })
            }}>
              Link
            </MenuItem>
          </DropdownButton>

            <ContentEditable
              onChange={(e) => this.onInputChanged(e, 'category')}
              onKeyDown={(e) => this.onKeyDown(e)}
              data-placeholder="Property category ..."
              className="input meta-category"
              html={''}
            />
        </div>

        <div className="row">
          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'name')}
            onKeyDown={(e) => this.onKeyDown(e)}
            data-placeholder="Property name ..."
            className="input meta-name"
            html={''}
          />
        </div>

        <div className="row">
          { this.renderContent () }
        </div>

      </div>
    )
  }
}
