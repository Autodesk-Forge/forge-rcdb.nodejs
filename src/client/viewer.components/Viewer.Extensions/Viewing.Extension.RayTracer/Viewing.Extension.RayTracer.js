/////////////////////////////////////////////////////////////////
// Raytracer Viewer Extension
// By Philippe Leefsma, Autodesk Inc, April 2017
//
/////////////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'
import WidgetContainer from 'WidgetContainer'
import EventTool from 'Viewer.EventTool'
import RayTreeView from './RayTreeView'
import Toolkit from 'Viewer.Toolkit'
import { ReactLoader } from 'Loader'
import ReactDOM from 'react-dom'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

class RaytracerExtension extends ExtensionBase {

	/////////////////////////////////////////////////////////////////
	// Class constructor
  //
	/////////////////////////////////////////////////////////////////
	constructor (viewer, options) {

		super (viewer, options)

    this.onNodeChecked = this.onNodeChecked.bind(this)
    this.onSelection = this.onSelection.bind(this)
    this.renderTitle = this.renderTitle.bind(this)

    this.eventTool = new EventTool(this.viewer)

    this.react = options.react

    this.leafNodesMap = {}
	}

	/////////////////////////////////////////////////////////
	// Load callback
  //
  /////////////////////////////////////////////////////////
	load () {

    this.viewer.addEventListener(
      Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (e) => {

        if (this.options.loader) {

          this.options.loader.hide()
        }
      })

    this.on('loaded', (args) => this.onLoaded(args))

    this.viewerEvent([

      Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT

    ]).then((args) => this.onModelLoaded(args))

    this.viewerEvent(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT
    ).then((args) => this.onGeometryLoaded(args))

    this.react.setState({

      model: null

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.RayTracer loaded')

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'ray-tracer'
  }

  /////////////////////////////////////////////////////////
	// Extension Id
  //
  /////////////////////////////////////////////////////////
	static get ExtensionId () {

		return 'Viewing.Extension.RayTracer'
	}

  /////////////////////////////////////////////////////////
	// Unload callback
  //
  /////////////////////////////////////////////////////////
	unload () {

    this.viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.eventTool.deactivate()

    console.log('Viewing.Extension.RayTracer loaded')

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelLoaded (args) {

    this.emit('loaded', args)
  }

  onGeometryLoaded (args) {

    this.emit('loaded', args)
  }

  async onLoaded (args) {

    const model = args[0].model

    this.off('loaded')

    this.react.setState({
      model
    })

    Toolkit.getLeafNodes (model).then((dbIds) => {

      dbIds.forEach((dbId) => {
        this.leafNodesMap[dbId] = true
      })
    })

    this.eventTool.activate()

    this.eventTool.on ('buttondown', () => {

      this.mouseDown = true

      return false
    })

    this.eventTool.on ('buttonup', (event) => {

      this.mouseDown = false

      return false
    })

    this.eventTool.on ('mousemove', (event) => {

      // model.rayIntersect cannot be used in this scenario
      // because needs to check for every component
      // for intersection

      //const raycaster = this.pointerToRaycaster(event)
      //const hitTest = this.viewer.model.rayIntersect(
      //  raycaster, true, dbIds)

      if (!this.mouseDown) {

        const hitTest = this.viewer.clientToWorld(
          event.canvasX,
          event.canvasY,
          true)

        if (hitTest) {

          const {model} = this.react.getState()

          if (model === hitTest.model) {

            return !this.leafNodesMap[hitTest.dbId]
          }
        }
      }

      return false
    })

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu', {
        buildMenu: (menu, dbId) => {

          if (!dbId || this.leafNodesMap[dbId]) {

            return menu
          }

          return []
        }
      })

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setModel (model, params) {

    switch (params.source) {

      case 'loaded':

        return this.viewerEvent([
          Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT
        ]).then(() => { })

      case 'dropdown':

        this.react.setState({
          model
        })

        this.leafNodesMap = {}

        Toolkit.getLeafNodes (model).then((dbIds) => {

          dbIds.forEach((dbId) => {
            this.leafNodesMap[dbId] = true
          })
        })

      default:
        return
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelection (e) {

    if (e.selections.length) {

      const dbId = e.selections[0].dbIdArray[0]

      if (!this.leafNodesMap[dbId]) {

        this.viewer.clearSelection()
      }
    }
  }

  /////////////////////////////////////////////////////////
  // Creates Raycastser object from the pointer
  //
  /////////////////////////////////////////////////////////
  pointerToRaycaster (pointer) {

    const camera = this.viewer.navigation.getCamera()
    const domContainer = this.viewer.container
    const pointerVector = new THREE.Vector3()
    const pointerDir = new THREE.Vector3()
    const raycaster = new THREE.Raycaster()

    const r = domContainer.getBoundingClientRect()

    const x =  ((pointer.clientX - r.left) / r.width)  * 2 - 1
    const y = -((pointer.clientY - r.top)  / r.height) * 2 + 1

    if (camera.isPerspective) {

      pointerVector.set(x, y, 0.5)

      pointerVector.unproject(camera)

      raycaster.set(camera.position,
        pointerVector.sub(
          camera.position).normalize())

    } else {

      pointerVector.set(x, y, -1)

      pointerVector.unproject(camera)

      pointerDir.set(0, 0, -1)

      raycaster.set(pointerVector,
        pointerDir.transformDirection(
          camera.matrixWorld))
    }

    return raycaster
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onNodeChecked (node) {

    const {model} = this.react.getState()

    Toolkit.getLeafNodes (model, node.id).then((dbIds) => {

      dbIds.forEach((dbId) => {

        this.leafNodesMap[dbId] = node.checked
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = RaytracerExtension.ExtensionId

    if (docked) {

      await this.react.popRenderExtension(id)

      this.react.pushViewerPanel(this, {
        height: 250,
        width: 350
      })

    } else {

      await this.react.popViewerPanel(id)

      this.react.pushRenderExtension(this)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle (docked) {

    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className="title">
        <label>
          Ray Tracer
        </label>
        <div className="ray-tracer-controls">
          <button onClick={() => this.setDocking(docked)}
            title="Toggle docking mode">
            <span className={spanClass}/>
          </button>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const { model } = this.react.getState()

    const treeView = model
      ? <RayTreeView onNodeChecked={this.onNodeChecked}
          viewer={this.viewer}
          model={model}/>
      : <div/>

    return (
      <div className="content">
        <ReactLoader show={!model}/>
        { treeView }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>

        { this.renderContent () }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  RaytracerExtension.ExtensionId,
  RaytracerExtension)

export default 'Viewing.Extension.RayTracer'
