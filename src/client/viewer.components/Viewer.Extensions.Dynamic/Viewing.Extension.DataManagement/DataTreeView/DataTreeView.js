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
import DataTreeDelegate from './DataTreeDelegate'
import { TreeView } from 'TreeView'
import ReactDOM from 'react-dom'
import './DataTreeView.scss'
import React from 'react'

export default class DataTreeView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.delegate = new DataTreeDelegate(
      props.menuContainer)

    this.delegate.on('item.created', (node) => {

      if (this.props.onItemNodeCreated) {

        this.props.onItemNodeCreated(node)
      }
    })

    this.delegate.on('item.load', (node) => {

      if (this.props.onLoadItem) {

        this.props.onLoadItem(node)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadHub (hub) {

    const rootNode = this.delegate.createRootNode({
      name: hub.attributes.name,
      delegate: this.delegate,
      api: this.props.api,
      type: hub.type,
      hubId: hub.id,
      details: hub,
      group: true,
      id: hub.id,
      level: 0
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
  render() {

    return (
      <div className="datatree-container" ref={
        (div) => this.treeContainer = div
        }
      />
    )
  }
}
