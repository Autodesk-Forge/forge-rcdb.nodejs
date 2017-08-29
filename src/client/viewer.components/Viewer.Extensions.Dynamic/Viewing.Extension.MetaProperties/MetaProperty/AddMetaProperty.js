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
import Dropzone from 'react-dropzone'
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

    this.onDrop = this.onDrop.bind(this)

    this.state = Object.assign({
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
  assignState (state) {

    return new Promise((resolve) => {

      const newState = Object.assign(
        {}, this.state, state)

      this.setState(newState, () => {
        this.updateOK()
        resolve()
      })

      switch (newState.metaType) {

        case 'Double':
        case 'Text':
        case 'Int':

          return this.props.onChanged({
            displayCategory: newState.displayCategory,
            displayValue: newState.displayValue,
            displayName: newState.displayName,
            metaType: newState.metaType
          })

        case 'Link':

          return this.props.onChanged({
            link: newState.link ? newState.link.trim():null,
            displayCategory: newState.displayCategory,
            displayValue: newState.displayValue,
            displayName: newState.displayName,
            metaType: newState.metaType
          })

        case 'File':

          return this.props.onChanged({
            displayCategory: newState.displayCategory,
            displayValue: newState.displayValue,
            displayName: newState.displayName,
            metaType: newState.metaType,
            filename: newState.filename,
            filesize: newState.filesize,
            filelink: newState.filelink,
            fileId: newState.fileId,
            file: newState.file
          })
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e, type) {

    switch(type) {

      case 'Double': {

        //backspace, ENTER, ->, <-, delete, '.', '-', ',',
        const allowed = [8, 13, 37, 39, 46, 188, 189, 190]

        if (allowed.indexOf(e.keyCode) > -1 ||
          (e.keyCode > 47 && e.keyCode < 58)) {

          return
        }

        e.stopPropagation()
        e.preventDefault()
        break
      }

      case 'Int': {

        //backspace, ENTER, ->, <-, delete, '-'
        const allowed = [8, 13, 37, 39, 46, 189]

        if (allowed.indexOf(e.keyCode) > -1 ||
          (e.keyCode > 47 && e.keyCode < 58)) {

          return
        }

        e.stopPropagation()
        e.preventDefault()
        break
      }

      case 'Text': {

        if (e.keyCode === 13) {

          e.stopPropagation()
          e.preventDefault()
        }

        break
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInputChanged (e, key) {

    const newState = Object.assign({}, this.state)

    newState[key] = !!e.target.value
      ? e.target.value.replace(/&nbsp;/g, '')
      : e.target.value

    this.assignState(newState)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onDrop (files) {

    if (this.state.file) {

      window.URL.revokeObjectURL(this.state.file.preview)
    }

    const file = files[0]

    this.assignState({
      filename: file.name,
      filesize: file.size,
      file
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateOK () {

    switch (this.state.metaType) {

      case 'Double':
      case 'Text':
      case 'Int':
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

      case 'File':
      {
        const disableOK =
          !this.state.displayCategory ||
          !this.state.displayValue ||
          !this.state.displayName ||
          !this.state.filename

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

      case 'Double':
      case 'Text':
      case 'Int':
        return (
          <ContentEditable
            onKeyDown={(e) => this.onKeyDown(e, this.state.metaType)}
            onChange={(e) => this.onInputChanged(e, 'displayValue')}
            data-placeholder="Property value ..."
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

      case 'File':
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
              <Dropzone className="drop-target"
                onDrop={this.onDrop}
                multiple={false} >
                <p>
                  Drop a file here or click to browse ...
                </p>
                <ul>
                {
                  this.state.filename &&
                  <li>
                    <b>{this.state.filename}</b>
                    <br/>
                    {this.state.filesize} bytes
                  </li>
                }
                </ul>
              </Dropzone>
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
                this.assignState({
                  displayValue: '',
                  metaType: 'Text'
                })
            }}>
              Text
            </MenuItem>
            <MenuItem eventKey={2} key={2} onClick={() => {
              this.assignState({
                displayValue: '',
                metaType: 'Double'
              })
            }}>
              Double
            </MenuItem>
            <MenuItem eventKey={3} key={3} onClick={() => {
              this.assignState({
                displayValue: '',
                metaType: 'Int'
              })
            }}>
              Int
            </MenuItem>
            <MenuItem eventKey={4} key={4} onClick={() => {
              this.assignState({
                displayValue: '',
                metaType: 'Link'
              })
            }}>
              Link
            </MenuItem>
            <MenuItem eventKey={5} key={5} onClick={() => {
              this.assignState({
                displayValue: '',
                metaType: 'File'
              })
            }}>
              File
            </MenuItem>
          </DropdownButton>

            <ContentEditable
              onChange={(e) => this.onInputChanged(e, 'displayCategory')}
              onKeyDown={(e) => this.onKeyDown(e)}
              data-placeholder="Property category ..."
              disabled={this.state.disableCategory}
              html={this.state.displayCategory}
              className="input meta-category"

            />
        </div>

        <div className="row">
          <ContentEditable
            onChange={(e) => this.onInputChanged(e, 'displayName')}
            onKeyDown={(e) => this.onKeyDown(e)}
            data-placeholder="Property name ..."
            disabled={this.state.disableName}
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
