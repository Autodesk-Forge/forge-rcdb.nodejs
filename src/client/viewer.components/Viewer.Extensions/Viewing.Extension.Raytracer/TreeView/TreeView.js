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
import TreeDelegate from './TreeDelegate'
import ReactDOM from 'react-dom'
import React from 'react'
import './TreeView.scss'

export default class TreeView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.delegate = new TreeDelegate(props.model)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    const model = this.props.model

    const instanceTree = model.getData().instanceTree

    const rootId = instanceTree.getRootId()

    const rootNode = {
      name: instanceTree.getNodeName(rootId),
      type: 'model.root',
      group: true,
      id: rootId
    }

    this.tree = new Autodesk.Viewing.UI.Tree(
      this.delegate, rootNode, this.treeContainer, {
        excludeRoot: false
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className="model-tree-container" ref={
        (div) => this.treeContainer = div
        }
      />
    )
  }
}
