/////////////////////////////////////////////////////////
// Viewing.Extension.Filter
// by Philippe Leefsma, January 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import WidgetContainer from 'WidgetContainer'
import './Viewing.Extension.LevelFilter.scss'
import ServiceManager from 'SvcManager'
import { ReactLoader } from 'Loader'
import Toolkit from 'Viewer.Toolkit'
import sortBy from 'lodash/sortBy'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'
import d3 from 'd3'

class LevelFilterExtension extends MultiModelExtensionBase {

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

    return 'level-filter'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.LevelFilter'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      activeLevelId: -1,
      levels: []

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.LevelFilter loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.LevelFilter unloaded')

    this.react.popViewerPanel(this)

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async getModelBoundingBox (model) {

    const instanceTree = model.getData().instanceTree

    const rootId = instanceTree.getRootId()

    const fragIds = await Toolkit.getFragIds(
      model, rootId)

    const fragList = model.getFragmentList()

    const boundingBox =
      this.getModifiedWorldBoundingBox(
        fragIds, fragList)

    return boundingBox
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onModelCompletedLoad (event) {

    const model = this.viewer.model

    const modelBox = 
      await this.getModelBoundingBox (model)

    const floorsIds = 
      await this.getComponentsByParentName(
        'Floors', this.viewer.model)

    const boxes = floorsIds.map((dbId) => {
      return this.getComponentBoundingBox(dbId)
    })

    const mergedBoxes = this.mergeBoxes(
      sortBy(boxes, (box) => {
        return box.min.z
      }))

    const levels = []

    const nbLevels = mergedBoxes.length

    const colors = d3.scale.linear()
    .domain([0, nbLevels * .33, nbLevels * .66, nbLevels])
    .range(['#FCB843', '#C2149F', '#0CC4BD', '#0270E9'])

    levels.push({
      min: mergedBoxes[mergedBoxes.length-1].max,
      color: colors(mergedBoxes.length-1),
      max: modelBox.max
    })  

    for (let idx = mergedBoxes.length-2; idx >= 0 ; --idx) {

      levels.push({
        max: mergedBoxes[idx + 1].min,
        min: mergedBoxes[idx].max,
        color: colors(idx)
      })
    }

    this.react.setState({
      levels
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
  onLevelClick (levelId, level) {

    const {activeLevelId} = this.react.getState()

    if (levelId === activeLevelId) {

      this.viewer.setCutPlanes([])

      this.react.setState({
        activeLevelId: -1
      })

    } else {

      // plane equation:
      // ax + by + cz + d = 0

      const pMin = new THREE.Vector4 (0, 0, -1,  level.min.z)
      const pMax = new THREE.Vector4 (0, 0,  1, -level.max.z)

      this.viewer.setCutPlanes([pMin, pMax])

      this.react.setState({
        activeLevelId: levelId
      })
    }
  }

  /////////////////////////////////////////////////////////
  // React method - render panel title
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Level Filter
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  hexToRgbA (hex, alpha) {

    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {

      var c = hex.substring(1).split('')

      if (c.length == 3) {

        c = [c[0], c[0], c[1], c[1], c[2], c[2]]
      }

      c = '0x' + c.join('')

      return `rgba(${(c>>16)&255},${(c>>8)&255},${c&255},${alpha})`
    }

    throw new Error('Bad Hex Number: ' + hex)
  }

  /////////////////////////////////////////////////////////
  // React method - render panel controls
  //
  /////////////////////////////////////////////////////////
  renderControls () {

    const {activeLevelId, levels} = this.react.getState()

    const levelItems = levels.map((level, idx) => {

      const active = (activeLevelId === idx) ? ' active':''

      const style = {
        backgroundColor: this.hexToRgbA(level.color, 0.3),
        border: `2px solid ${level.color}`
      }

      return (
        <div key={`level-${idx}`} className={`level${active}`}
          onClick={() => this.onLevelClick(idx, level)}>
          <div className="color" style={style}/>
          <Label text={`Level ${levels.length-idx}`}/>
        </div>
      )
    })

    return (
      <div className="ui-controls">
      <ReactLoader show={!levels.length}/>
        <div className="levels">
          { levelItems }
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
  LevelFilterExtension.ExtensionId,
  LevelFilterExtension)
