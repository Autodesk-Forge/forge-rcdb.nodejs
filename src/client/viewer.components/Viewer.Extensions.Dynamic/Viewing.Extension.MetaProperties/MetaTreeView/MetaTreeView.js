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
import MetaTreeDelegate from './MetaTreeDelegate'
import { TreeView } from 'TreeView'
import ReactDOM from 'react-dom'
import './MetaTreeView.scss'
import React from 'react'

export default class MetaTreeView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.delegate = new MetaTreeDelegate(
      props.menuContainer)

    this.delegate.on('property.edit',
      (metaProperty, isModelOverride) => {

        if (this.props.onEditProperty) {

          return this.props.onEditProperty (
            metaProperty, isModelOverride)
        }
      })

    this.delegate.on('property.delete',
      (metaProperty, isModelOverride) => {

        if (this.props.onDeleteProperty) {

          return this.props.onDeleteProperty (
            metaProperty, isModelOverride)
        }
      })

    this.delegate.on('node.update', (metaProperty) => {

      const nodeId = metaProperty.id

      const node = this.tree.nodeIdToNode[nodeId]

      if (node) {

        node.update(metaProperty)
      }
    })

    this.delegate.on('node.destroy', (nodeId) => {

      const node = this.tree.nodeIdToNode[nodeId]

      if (node && node.parent) {

        node.parent.children =
          node.parent.children.filter((child) => {
            return child.id !== nodeId
          })

        node.parent.children.length
          ? this.tree.destroyNode(nodeId)
          : node.parent.destroy()
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadTree (data) {

    const propsMap = this.delegate.mapPropsByCategory(
      data.properties)

    const rootNode = this.delegate.createRootNode({
      displayName: data.displayName,
      component: data.displayName,
      externalId: data.externalId,
      dbId: data.dbId,
      propsMap
    })

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

    this.loadTree ({
      displayName: this.props.displayName,
      properties: this.props.properties,
      externalId: this.props.externalId,
      component: this.props.displayName,
      dbId: this.props.dbId
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  shouldComponentUpdate (nextProps) {

    return false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    if (props.guid !== this.props.guid) {

      this.delegate.destroy()

      this.tree.destroy()

      this.loadTree ({
        displayName: props.displayName,
        properties: props.properties,
        externalId: props.externalId,
        component: props.displayName,
        dbId: props.dbId
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidUpdate () {

    this.delegate.destroy()

    this.tree.destroy()
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
      <div className="metatree-container" ref={
        (div) => this.treeContainer = div
        }
      />
    )
  }
}
