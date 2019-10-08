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
import HierarchyTreeDelegate from './HierarchyTreeDelegate'
import { TreeView } from 'TreeView'
import ReactDOM from 'react-dom'
import './HierarchyTreeView.scss'
import React from 'react'

export default class HierarchyTreeView extends React.Component {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super(props)

    this.delegate = new HierarchyTreeDelegate()

    this.delegate.on('node.checked', (node) => {
      if (this.props.onNodeChecked) {
        this.props.onNodeChecked(node)
      }
    })

    this.delegate.on('node.destroy', (node) => {
      this.tree.destroyNode(node.id)
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  loadTree (hierarchy) {
    if (hierarchy.data && hierarchy.data.objects) {
      const hierarchyRoot = hierarchy.data.objects[0]

      this.rootNode = this.delegate.createRootNode(
        hierarchyRoot)

      this.tree = new TreeView(
        this.delegate, this.rootNode, this.treeContainer, {
          excludeRoot: false
        })

      this.rootNode.expand()
      this.rootNode.setChecked(true)

      this.props.onRootNodeCreated(
        this.tree, this.rootNode)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentDidMount () {
    this.loadTree(this.props.hierarchy)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  shouldComponentUpdate (nextProps) {
    if (nextProps.guid !== this.props.guid) {
      return true
    }

    return false
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillReceiveProps (props) {
    if (this.props.guid !== props.guid) {
      this.delegate.destroy()

      this.tree.destroy()

      this.loadTree(
        props.hierarchy)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillUnmount () {
    this.delegate.destroy()

    this.delegate.off()

    if (this.tree) {
      this.tree.destroy()
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    return (
      <div
        className='hierarchy-tree-container' ref={
          (div) => this.treeContainer = div
        }
      />
    )
  }
}
