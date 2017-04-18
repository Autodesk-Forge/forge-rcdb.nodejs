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
import RayTreeDelegate from './RayTreeDelegate'
import { TreeView } from 'TreeView'
import ReactDOM from 'react-dom'
import './RayTreeView.scss'
import React from 'react'

export default class RayTreeView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.delegate = new RayTreeDelegate(props.model)

    this.delegate.on('node.checked', (node) => {

      this.props.onNodeChecked(node)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    const model = this.props.model

    const instanceTree = model.getData().instanceTree

    const rootNode = this.delegate.buildNode({
      id: instanceTree.getRootId(),
      checked: false,
      type: 'root',
      parent: null
    })

    this.tree = new TreeView (
      this.delegate, rootNode, this.treeContainer, {
        excludeRoot: false
      })

    rootNode.expand ()
    rootNode.onChecked (false)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className="raytree-container" ref={
        (div) => this.treeContainer = div
        }
      />
    )
  }
}
