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
import DataTreeDelegate from './DataTreeDelegate'
import BaseComponent from 'BaseComponent'
import { TreeView } from 'TreeView'
import ReactDOM from 'react-dom'
import './DataTreeView.scss'
import React from 'react'

export default class DataTreeView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onInputChanged = this.onInputChanged.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSearch = this.onSearch.bind(this)

    this.delegate = new DataTreeDelegate({
      derivativesAPI: props.derivativesAPI,
      menuContainer: props.menuContainer,
      dmAPI: props.dmAPI
    })

    this.delegate.on('node.destroy', (nodeId) => {

      this.tree.destroyNode(nodeId)
    })

    this.delegate.on('item.created', (node) => {

      if (this.props.onItemNodeCreated) {

        this.props.onItemNodeCreated(node)
      }
    })

    this.delegate.on('item.delete', (node) => {

      if (this.props.onDeleteItem) {

        this.props.onDeleteItem(node)
      }
    })

    this.delegate.on('item.load', (node) => {

      if (this.props.onLoadItem) {

        this.props.onLoadItem(node)
      }
    })

    this.delegate.on('folder.upload', (data) => {

      if (this.props.onFolderUpload) {

        this.props.onFolderUpload(data)
      }
    })

    this.state = {
      search: ''
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadHub (hub) {

    const hubType = hub.attributes.extension.type

    const rootNode = this.delegate.createRootNode({
      name: hub.attributes.name,
      delegate: this.delegate,
      dmAPI: this.props.dmAPI,
      type: hub.type,
      hubId: hub.id,
      details: hub,
      group: true,
      id: hub.id,
      level: 0,
      hubType
    })

    this.tree = new TreeView (
      this.delegate, rootNode, this.treeContainer, {
        excludeRoot: false
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.loadHub (this.props.hub)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    this.delegate.destroy()

    this.tree.destroy()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  shouldComponentUpdate () {

    return false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onInputChanged (e) {

    await this.assignState({
      search: e.target.value
    })

    this.onSearch()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()

      this.onSearch()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSearch () {

    const {search} = this.state

    this.delegate.filterNodes(search)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const {search} = this.state

    return (
      <div className="datatree-container" ref={
        (div) => this.treeContainer = div
        }>
        <div className="search">
          <ContentEditable
            onChange={this.onInputChanged}
            onKeyDown={this.onKeyDown}
            data-placeholder="Search ..."
            className="input-search"
            html={search}
          />
        </div>
      </div>
    )
  }
}
