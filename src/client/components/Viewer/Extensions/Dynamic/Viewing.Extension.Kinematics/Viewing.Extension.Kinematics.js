/// //////////////////////////////////////////////////////
// Viewing.Extension.Kinematics
// by Philippe Leefsma, January 2017
//
/// //////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import './Viewing.Extension.Kinematics.scss'
import WidgetContainer from 'WidgetContainer'
import EventTool from 'Viewer.EventTool'
import 'rc-tooltip/assets/bootstrap.css'
import ScriptLoader from 'ScriptLoader'
import { ServiceContext } from 'ServiceContext'
import { ReactLoader } from 'Loader'
import Toolkit from 'Viewer.Toolkit'
import 'rc-slider/assets/index.css'
import Stopwatch from 'Stopwatch'
import ReactDOM from 'react-dom'
import Tooltip from 'rc-tooltip'
import Slider from 'rc-slider'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

class KinematicsExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.eventTool = new EventTool(this.viewer)

    this.react = options.react

    this.meshMap = {}
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  get className () {
    return 'kinematics'
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.Kinematics'
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    this.viewer.setQualityLevel(false, false)
    this.viewer.setGroundReflection(true)
    this.viewer.setGroundShadow(true)

    this.react.setState({

      UIHierarchy: null,
      showLoader: true

    }).then(() => {
      this.react.pushRenderExtension(this)
    })

    this.eventTool.on('singleclick', (event) => {
      const hitTest = this.viewer.clientToWorld(
        event.canvasX, event.canvasY, true)

      if (hitTest) {
        console.log(hitTest)
      }
    })

    // this.eventTool.activate()

    console.log('Viewing.Extension.Kinematics loaded')

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  toVector3 (xyz) {
    return new THREE.Vector3(xyz.x, xyz.y, xyz.z)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  loadHierarchy (component) {
    const mesh = Toolkit.buildComponentMesh(
      this.viewer,
      this.viewer.model,
      component.dbId, null, null)

    this.meshMap[component.dbId] = mesh

    mesh.origin = this.toVector3(mesh.position)

    const children = component.children || []

    children.forEach((child) => {
      mesh.add(this.loadHierarchy(child))
    })

    return mesh
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getComponent (dbId, parent) {
    if (parent.dbId === dbId) {
      return parent
    }

    if (parent.children) {
      for (const component of parent.children) {
        const res = this.getComponent(
          dbId, component)

        if (res) {
          return res
        }
      }
    }

    return null
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.Kinematics unloaded')

    this.react.popViewerPanel(this)

    super.unload()

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onModelRootLoaded (event) {
    super.onModelRootLoaded()

    this.options.loader.show(false)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onModelCompletedLoad (event) {
    this.hierarchy = this.options.hierarchy

    const rootMesh = this.loadHierarchy(
      this.hierarchy)

    this.viewer.impl.scene.add(rootMesh)

    rootMesh.visible = false

    this.react.setState({
      UIHierarchy: this.hierarchy,
      showLoader: false
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onSelection (event) {
    if (event.selections.length) {

      // const dbId = event.selections[0].dbIdArray[0]

      // const component = this.getComponent(dbId)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  rotateMesh (mesh, { axis, centre, angle }) {
    const quaternion = new THREE.Quaternion()

    quaternion.setFromAxisAngle(axis, angle)

    mesh.rotation.x = axis.x * angle
    mesh.rotation.y = axis.y * angle
    mesh.rotation.z = axis.z * angle

    const position = new THREE.Vector3(
      mesh.origin.x - centre.x,
      mesh.origin.y - centre.y,
      mesh.origin.z - centre.z)

    position.applyQuaternion(quaternion)

    position.add(centre)

    mesh.position.x = position.x
    mesh.position.y = position.y
    mesh.position.z = position.z
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  assignMeshTransform (mesh, dbId) {
    const quaternion = new THREE.Quaternion()
    const position = new THREE.Vector3()
    const scale = new THREE.Vector3()

    mesh.matrixWorld.decompose(
      position, quaternion, scale)

    const fragIds =
      Toolkit.getLeafFragIds(
        this.viewer.model, dbId)

    fragIds.forEach((fragId) => {
      const fragProxy =
        this.viewer.impl.getFragmentProxy(
          this.viewer.model, fragId)

      fragProxy.getAnimTransform()

      fragProxy.position = position
      fragProxy.quaternion = quaternion

      fragProxy.updateAnimTransform()
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  assignMeshTransformRec (mesh, component) {
    this.assignMeshTransform(
      mesh, component.dbId)

    const children = component.children || []

    children.forEach((child) => {
      this.assignMeshTransformRec(
        this.meshMap[child.dbId], child)
    })
  }

  /// //////////////////////////////////////////////////////
  // Animation: {
  //  onUpdate,
  //  duration,
  //  easing
  // }
  //
  /// //////////////////////////////////////////////////////
  animate ({ onComplete, onUpdate, duration, easing }) {
    const stopwatch = new Stopwatch()

    let dt = 0.0

    const animationStep = () => {
      dt += stopwatch.getElapsedMs()

      if (dt >= duration) {
        onUpdate(1.0)
      } else {
        const param = dt / duration

        const animParam = easing
          ? easing(param, duration / 1000)
          : param

        onUpdate(animParam)
      }

      if (dt < duration) {
        requestAnimationFrame(animationStep)
      } else {
        onComplete()
      }
    }

    animationStep()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  restoreHierarchy (targetHierarchy, param = 1.0) {
    const restoreTransformRec = (targetComp) => {
      const mesh = this.meshMap[targetComp.dbId]

      const component = this.getComponent(
        targetComp.dbId, this.hierarchy)

      const angle =
        (1.0 - param) * component.angle +
        param * targetComp.angle

      this.rotateMesh(mesh, {
        centre: this.toVector3(component.centre),
        axis: this.toVector3(component.axis),
        angle
      })

      this.assignMeshTransformRec(
        mesh, component)

      const children = targetComp.children || []

      children.forEach((child) => {
        restoreTransformRec(child)
      })
    }

    restoreTransformRec(targetHierarchy)

    this.viewer.impl.sceneUpdated(true)
  }

  /// //////////////////////////////////////////////////////
  //
  //  From viewer.getState:
  //  Allow extensions to inject their state data
  //
  //  for (var extensionName in viewer.loadedExtensions) {
  //    viewer.loadedExtensions[extensionName].getState(
  //      viewerState);
  //  }
  /// //////////////////////////////////////////////////////
  getState (state) {
    state.kinematics = {
      hierarchy: this.hierarchy
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //    From viewer.restoreState:
  //    Allow extensions to restore their data
  //
  //    for (var extensionName in viewer.loadedExtensions) {
  //      viewer.loadedExtensions[extensionName].restoreState(
  //        viewerState, immediate);
  //    }
  /// //////////////////////////////////////////////////////
  restoreState (state, immediate) {
    if (state.kinematics) {
      const targetHierarchy = state.kinematics.hierarchy

      if (immediate) {
        this.restoreHierarchy(targetHierarchy)

        this.hierarchy = targetHierarchy

        this.react.setState({
          UIHierarchy: this.hierarchy
        })
      } else {
        this.animate({

          onUpdate: (param) => {
            this.restoreHierarchy(
              targetHierarchy,
              param)
          },
          onComplete: () => {
            this.hierarchy = targetHierarchy

            this.react.setState({
              UIHierarchy: this.hierarchy
            })
          },
          duration: 900,
          easing: null
        })
      }
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onSliderChanged (props, dbId) {
    const { value, dragging, offset } = props

    const component = this.getComponent(
      dbId, this.hierarchy)

    component.angle = value * Math.PI / 180

    const mesh = this.meshMap[dbId]

    this.rotateMesh(mesh, {
      centre: this.toVector3(component.centre),
      axis: this.toVector3(component.axis),
      angle: component.angle
    })

    this.assignMeshTransformRec(
      mesh, component)

    this.viewer.impl.sceneUpdated(true)

    return (
      <Tooltip
        prefixCls='rc-slider-tooltip'
        visible={dragging}
        overlay={value}
        placement='top'
      >
        <Slider.Handle
          className='rc-slider-handle'
          offset={offset}
        />
      </Tooltip>
    )
  }

  /// //////////////////////////////////////////////////////
  // React method - render panel title
  //
  /// //////////////////////////////////////////////////////
  renderTitle () {
    return (
      <div className='title'>
        <label>
          Kinematics
        </label>
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  hierarchyToArray (root) {
    const result = []

    const hierarchyToArrayRec = (component) => {
      result.push(component)

      const children = component.children || []

      children.forEach((child) => {
        hierarchyToArrayRec(child)
      })
    }

    hierarchyToArrayRec(root)

    return result.reverse()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderSliders () {
    const { UIHierarchy } = this.react.getState()

    const items = this.hierarchyToArray(UIHierarchy)

    // forces a re-render of new sliders
    const guid = this.guid()

    const sliderItems = items.map((item) => {
      return (
        <Slider
          handle={(props) => this.onSliderChanged(props, item.dbId)}
          defaultValue={item.angle * 180.0 / Math.PI}
          key={guid + item.dbId}
          min={item.bounds.min}
          max={item.bounds.max}
          step={0.1}
        />
      )
    })

    return (
      <div className='sliders'>
        {sliderItems}
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  // React method - render panel controls
  //
  /// //////////////////////////////////////////////////////
  renderControls () {
    const { showLoader } = this.react.getState()

    return (
      <div className='ui-controls'>
        <ReactLoader show={showLoader} />
        <label>
            Controls:
        </label>
        {!showLoader && this.renderSliders()}
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  // React method - render extension UI
  //
  /// //////////////////////////////////////////////////////
  render (opts) {
    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle()}
        showTitle={opts.showTitle}
        className={this.className}
      >
        {this.renderControls()}
      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  KinematicsExtension.ExtensionId,
  KinematicsExtension)
