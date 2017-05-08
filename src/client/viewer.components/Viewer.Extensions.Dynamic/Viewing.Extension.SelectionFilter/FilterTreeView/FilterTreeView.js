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
import FilterTreeDelegate from './FilterTreeDelegate'
import { TreeView } from 'TreeView'
import ReactDOM from 'react-dom'
import './FilterTreeView.scss'
import React from 'react'

export default class FilterTreeView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.delegate = new FilterTreeDelegate(props.model)

    this.delegate.on('node.dblClick', (node) => {

      this.props.viewer.isolate(node.id, props.model)
    })

    this.delegate.on('node.checked', (node) => {

      this.props.onNodeChecked({
        model: props.model,
        tree: this.tree,
        node
      })
    })

    this.delegate.on('node.destroy', (node) => {

      this.tree.destroyNode(node.id)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.rootNode = this.delegate.createRootNode()

    this.tree = new TreeView (
      this.delegate, this.rootNode, this.treeContainer, {
        excludeRoot: false
      })

    this.rootNode.expand ()
    this.rootNode.setChecked (true)
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
  //shouldComponentUpdate () {
  //
  //  return false
  //}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className="filter-tree-container" ref={
        (div) => this.treeContainer = div
        }
      />
    )
  }
}
