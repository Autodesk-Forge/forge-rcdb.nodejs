/////////////////////////////////////////////////////////
// Viewing.Extension.Filter
// by Philippe Leefsma, January 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import WidgetContainer from 'WidgetContainer'
import './Viewing.Extension.Filter.scss'
import ServiceManager from 'SvcManager'
import { ReactLoader } from 'Loader'
import Toolkit from 'Viewer.Toolkit'
import sortBy from 'lodash/sortBy'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

class FilterExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'filter'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Filter'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      levelBoxes: []

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.Filter loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Filter unloaded')

    this.react.popViewerPanel(this)

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelCompletedLoad (event) {

    this.getComponentsByParentName(
      'Floors', this.viewer.model).then((floorsIds) => {

        const boxes = floorsIds.map((dbId) => {
          return this.getComponentBoundingBox(dbId)
        })

        const mergedBoxes = this.mergeBoxes(
          sortBy(boxes, (box) => {
            return box.min.z
          }))

        const levelBoxes = []

        for (let idx = mergedBoxes.length-2; idx >= 0 ; --idx) {

          levelBoxes.push({
            max: mergedBoxes[idx + 1].min,
            min: mergedBoxes[idx].max
          })
        }

        this.react.setState({
          levelBoxes
        })
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getComponentsByParentName (name, model) {

    const instanceTree = model.getData().instanceTree

    const rootId = instanceTree.getRootId()

    let parentId = 0

    instanceTree.enumNodeChildren(rootId,
      (childId) => {

        const nodeName = instanceTree.getNodeName(childId)

        if (nodeName.indexOf(name) > -1) {

          parentId = childId
        }
      })

    return parentId > 0
      ? Toolkit.getLeafNodes(model, parentId)
      : []
  }

  /////////////////////////////////////////////////////////
  //returns bounding box as it appears in the viewer
  // (transformations could be applied)
  //
  /////////////////////////////////////////////////////////
  getModifiedWorldBoundingBox (fragIds, fragList) {

    const fragbBox = new THREE.Box3()
    const nodebBox = new THREE.Box3()

    fragIds.forEach(function(fragId) {

      fragList.getWorldBounds(fragId, fragbBox)

      nodebBox.union(fragbBox)
    })

    return nodebBox
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getComponentBoundingBox (dbId) {

    const model = this.viewer.model

    const fragIds = Toolkit.getLeafFragIds(
      model, dbId)

    const fragList = model.getFragmentList()

    return this.getModifiedWorldBoundingBox(
      fragIds, fragList)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  mergeBoxes (boxes, threshold = 0.5) {

    const mergedBoxes = []

    let height = -Number.MAX_VALUE

    for (let idx = 0; idx < boxes.length; ++idx) {

      const box = boxes[idx]

      const diff = box.max.z - height

      if (diff > threshold) {

        height = box.max.z

        mergedBoxes.push(box)

      } else {

        const lastBox = mergedBoxes[mergedBoxes.length-1]

        lastBox.max.x = Math.max(lastBox.max.x, box.max.x)
        lastBox.max.y = Math.max(lastBox.max.y, box.max.y)

        lastBox.min.x = Math.min(lastBox.min.x, box.min.x)
        lastBox.min.y = Math.min(lastBox.min.y, box.min.y)
      }
    }

    return mergedBoxes
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onLevelClick (levelBox) {

    // plane equation:
    // ax + by + cz + d = 0

    const pMin = new THREE.Vector4 (0, 0, -1, levelBox.min.z)
    const pMax = new THREE.Vector4 (0, 0,  1, -levelBox.max.z)

    this.viewer.setCutPlanes([pMin, pMax])

    console.log(levelBox)
  }

  /////////////////////////////////////////////////////////
  // React method - render panel title
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Filter
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  // React method - render panel controls
  //
  /////////////////////////////////////////////////////////
  renderControls () {

    const {levelBoxes} = this.react.getState()

    const levels = levelBoxes.map((levelBox, idx) => {

      return (
        <div key={`level-${idx}`} className="level"
          onClick={() => this.onLevelClick(levelBox)}>
          <div className="color"/>
          <Label text={`Level ${levelBoxes.length-idx}`}/>
        </div>
      )
    })

    return (
      <div className="ui-controls">
        <div className="levels">
          { levels }
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  // React method - render extension UI
  //
  /////////////////////////////////////////////////////////
  render (opts) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle()}
        showTitle={opts.showTitle}
        className={this.className}>
        {this.renderControls()}
      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  FilterExtension.ExtensionId,
  FilterExtension)
