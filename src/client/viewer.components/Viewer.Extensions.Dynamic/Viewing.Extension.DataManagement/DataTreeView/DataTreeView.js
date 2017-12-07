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

    this.onUploadComplete = this.onUploadComplete.bind(this)
    this.onInputChanged = this.onInputChanged.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onFilter = this.onFilter.bind(this)

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

    this.delegate.on('load.viewable', (node) => {

      if (this.props.onLoadViewable) {

        this.props.onLoadViewable(node)
      }
    })

    this.delegate.on('folder.upload', (data) => {

      if (this.props.onFolderUpload) {

        this.props.onFolderUpload(data)
      }
    })

    this.delegate.on('folder.search', (data) => {

      if (this.props.onFolderSearch) {

        this.props.onFolderSearch(data)
      }
    })

    this.delegate.on('folder.create', (data) => {

      if (this.props.onCreateFolder) {

        this.props.onCreateFolder(data)
      }
    })

    this.dmEvents = props.dmEvents

    this.dmEvents.on(
      'upload.complete',
      this.onUploadComplete)

    this.state = {
      filter: ''
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

    this.dmEvents.off(
      'upload.complete',
      this.onUploadComplete)
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
      filter: e.target.value
    })

    this.onFilter()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()

      this.onFilter()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onFilter () {

    const {filter} = this.state

    this.delegate.filterNodes(filter)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUploadComplete (data) {

    if (data.hubId === this.props.hub.id) {

      const parentNode = this.tree.getNodeById(data.nodeId)

      if (data.version.attributes.versionNumber === 1) {

        if (parentNode.expanded) {

          const node =
            parentNode.insertChildNode(
              data.item)

          if (this.props.onItemNodeCreated) {

            this.props.onItemNodeCreated(node)
          }
        }
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const {filter} = this.state

    return (
      <div className="datatree-container" ref={
        (div) => this.treeContainer = div
        }>
        <div className="filter">
          <ContentEditable
            onChange={this.onInputChanged}
            onKeyDown={this.onKeyDown}
            data-placeholder="Filter ..."
            className="input-filter"
            html={filter}
          />
        </div>
      </div>
    )
  }
}
