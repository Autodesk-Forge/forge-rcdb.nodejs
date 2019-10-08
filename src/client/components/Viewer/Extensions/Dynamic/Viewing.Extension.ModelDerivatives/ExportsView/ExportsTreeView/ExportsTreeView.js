/// ///////////////////////////////////////////////////////////////////////
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
/// //////////////////////////////////////////////////////////////////
import ExportsTreeDelegate from './ExportsTreeDelegate'
import BaseComponent from 'BaseComponent'
import { TreeView } from 'TreeView'
import ReactDOM from 'react-dom'
import './ExportsTreeView.scss'
import React from 'react'

export default class ExportsTreeView extends BaseComponent {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super(props)

    this.delegate = new ExportsTreeDelegate({
      derivativesAPI: props.derivativesAPI,
      menuContainer: props.menuContainer,
      dmAPI: props.dmAPI
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getVersionsNode (nbVersions) {
    if (!this.versionsNode && nbVersions) {
      this.versionsNode = this.delegate.createNode({
        name: `Versions (${nbVersions})`,
        id: 'versions',
        type: 'node',
        level: 1
      })

      this.rootNode.addChildNode(this.versionsNode)
    }

    return this.versionsNode
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getItemsNode (nbItems) {
    if (!this.itemsNode && nbItems) {
      this.itemsNode = this.delegate.createNode({
        name: `Items (${nbItems})`,
        type: 'node',
        id: 'items',
        level: 1
      })

      this.rootNode.addChildNode(this.itemsNode)
    }

    return this.itemsNode
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  loadTree (searchResults) {
    this.delegate.on('node.destroy', (nodeId) => {
      this.tree.destroyNode(nodeId)
    })

    this.delegate.on('load.viewable', (node) => {
      if (this.props.onLoadViewable) {
        this.props.onLoadViewable(node)
      }
    })

    this.rootNode = this.delegate.createNode({
      name: `Search Results (${searchResults.length})`,
      type: 'node',
      id: 'root',
      level: 0
    })

    this.tree = new TreeView(
      this.delegate, this.rootNode,
      this.treeContainer, {
        excludeRoot: false
      })

    const items = searchResults.filter((res) => {
      return res.type === 'items'
    })

    const itemsNode = this.getItemsNode(
      items.length)

    items.forEach((res) => {
      const itemNode = this.delegate.createNode({
        name: res.attributes.displayName,
        projectId: this.props.projectId,
        folderId: this.props.folderId,
        itemId: res.id,
        type: res.type,
        id: res.id,
        level: 2
      })

      itemsNode.addChildNode(itemNode)

      this.props.onItemNodeCreated(itemNode)
    })

    const versions = searchResults.filter((res) => {
      return res.type === 'versions'
    })

    const versionsNode = this.getVersionsNode(
      versions.length)

    versions.forEach((res) => {
      const versionNode = this.delegate.createNode({
        name: res.attributes.displayName,
        projectId: this.props.projectId,
        folderId: this.props.folderId,
        versionId: res.id,
        type: res.type,
        id: res.id,
        level: 2
      })

      versionsNode.addChildNode(versionNode)

      this.props.onVersionNodeCreated(versionNode)
    })

    this.rootNode.expand()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillReceiveProps (props) {
    if (props.guid !== this.guid) {
      this.delegate.destroy()

      this.tree.destroy()

      this.versionsNode = null

      this.itemsNode = null

      this.loadTree(
        props.searchResults)

      this.guid = props.guid
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentDidMount () {
    this.loadTree(this.props.searchResults)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillUnmount () {
    this.delegate.destroy()

    this.tree.destroy()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  shouldComponentUpdate () {
    return false
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    return (
      <div
        className='ExportsTree-container' ref={
          (div) => this.treeContainer = div
        }
      />
    )
  }
}
