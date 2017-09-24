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
import SelectionTreeDelegate from './SelectionTreeDelegate'
import { TreeView } from 'TreeView'
import ReactDOM from 'react-dom'
import './SelectionTreeView.scss'
import React from 'react'

export default class SelectionTreeView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.delegate = new SelectionTreeDelegate()

    this.delegate.on('node.dblClick', (node) => {

      if (props.onNodeDblClicked) {

        props.onNodeDblClicked(node)
      }
    })

    this.delegate.on('node.click', (node) => {

      if (props.onNodeClicked) {

        props.onNodeClicked(node)
      }
    })

    this.delegate.on('node.destroy', (node) => {

      this.tree.destroyNode(node.id)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadTree (selection) {

    const rootNode =
      this.delegate.createRootNode(
        selection)

    this.tree = new TreeView (
      this.delegate, rootNode, this.treeContainer, {
        excludeRoot: false
      })

    rootNode.expand()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.loadTree(this.props.selection)

    this.guid = this.props.selection
      ? this.props.selection.guid
      : null
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    const newGuid = props.selection
      ? props.selection.guid
      : null

    if (newGuid !== this.guid) {

      this.delegate.destroy()

      this.tree.destroy()

      this.loadTree(
        props.selection)

      this.guid = newGuid
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    this.delegate.destroy()

    this.delegate.off()

    this.tree.destroy()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div ref={(div) => this.treeContainer = div}
        className="selection-tree"
      />
    )
  }
}
