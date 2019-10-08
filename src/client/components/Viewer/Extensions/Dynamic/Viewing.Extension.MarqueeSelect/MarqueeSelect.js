import { difference, keys, forOwn, findKey, clone, omit, sortBy } from 'lodash'
import $ from 'jquery'

import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'

import ViewerToolkit from 'Viewer.Toolkit'

const { Autodesk, THREE } = window

export default class MarqueeSelect extends MultiModelExtensionBase {
  constructor(viewer, options) {
    super(viewer, options)
    this.viewer = viewer
    this.options = options || {}
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.init()
  }

  static get ExtensionId() {
    return 'Viewing.Extension.MarqueeSelect'
  }

  init() {
    this.mousedown = false
    this.mousedowncoords = {}
    this.dbIdPP = {}
    this.offset = { x: 0, y: 0 }
    this.bounds = {
      origin: { x: 0, y: 0 },
      delta: { x: 0, y: 0 },
    }
    if (!document.getElementById('select-marquee')) {
      $('.canvas-wrap').append('<div id="select-marquee"></div>')
    }
    this.marquee = $('#select-marquee').css({ width: 0, height: 0, display: 'none', 'background-color': 'rgba(208, 255, 242, 0.5)', border: 'dotted 1px #9a9a9a', 'z-index': 100, position: 'absolute' })

    this._control = ViewerToolkit.createButton(
      'marquee-select-icon',
      'glyphicon glyphicon-unchecked',
      'Marquee Select',
      () => {
        this.toggleActiveButton()
      }
    )

    this.buzzParentControl = new Autodesk.Viewing.UI.ControlGroup('marquee-select')
    this.buzzParentControl.addControl(this._control)

    const viewerToolbar = this.viewer.getToolbar(true)

    viewerToolbar.addControl(this.buzzParentControl)
  }

  toggleActiveButton() {
    if (this._control.isActivated) {
      this._control.isActivated = false
      this._control.container.classList.remove('active')
    } else {
      this._control.isActivated = true
      this._control.container.classList.add('active')
    }
  }

  lockViewport = () => {
    this.viewer.setNavigationLock(true);
  }

  unlockViewport = () => {
    this.viewer.setNavigationLock(false);
  }

  getExternalIdMapping = () => {
    const { viewer } = this
    return new Promise((resolve) => {
      viewer.model.getExternalIdMapping((mapping) => {
        resolve(mapping)
      })
    })
  }

  enumNodeFragments = (dbId) => {
    const { viewer } = this
    const instanceTree = viewer.model.getData().instanceTree
    const fragList = viewer.model.getFragmentList()
    const bounds = new THREE.Box3()
    const box = new THREE.Box3()
    return new Promise((resolve) => {
      instanceTree.enumNodeFragments(dbId, (fragId) => {
        fragList.getWorldBounds(fragId, box);
        bounds.union(box)
        resolve(bounds)
      }, true)
    })
  }

  async getShowIds() {
    const mappings = await this.getExternalIdMapping()
    return Object.values(mappings)

    // let ids = []
    // const isolateDbIds = this.viewer.getIsolatedNodes()
    // const hiddenDbIds = this.viewer.getHiddenNodes()
    // if (!isolateDbIds.length && !hiddenDbIds.length) {
    //   return Object.values(mappings)
    // }
    // // TODO: caculate the shown dbIds
    // if (isolateDbIds.length > 0) {
    //   const isolatedToShowDbIds = this.getIdsByExternalId(mappings, isolateDbIds, true)
    //   ids = isolatedToShowDbIds
    // } else {
    //   const toShowIds = this.getIdsByExternalId(mappings, hiddenDbIds, false)
    //   ids = toShowIds
    // }
    // return ids
  }

  getIdsByExternalId(mappings, dbIds, isExclude) {
    const ids = []
    const rootId = this.viewer.model.getRootId()
    if (!dbIds.length) {
      return ids
    }
    if (dbIds[0] === rootId && isExclude === false) {
      return ids
    }

    if (dbIds[0] === rootId && isExclude) {
      return Object.values(mappings)
    }

    let mapping = clone(mappings)
    dbIds.forEach((id) => {
      const extId = findKey(mapping, (dbId) => id === dbId)
      forOwn(mapping, (dbId, eId) => {
        if (eId.startsWith(extId) === isExclude) {
          mapping = omit(mapping, extId)
          ids.push(dbId)
        }
      })
    })
    return ids
  }

  async onMouseDown(event) {
    if (!this._control.isActivated) {
      return
    }

    this.lockViewport()
    this.marquee.show()

    this.mousedown = true
    this.mousedowncoords.x = event.clientX
    this.mousedowncoords.y = event.clientY

    const { viewer } = this
    const { canvas } = viewer
    const cRect = canvas.getBoundingClientRect()
    this.offset = { x: cRect.left, y: cRect.top }
  }

  async calcDbidPP(defaultShownDbIds) {
    const dbIdPP = {}
    const { viewer } = this
    defaultShownDbIds.forEach(async (dbId) => {
      const bounds = await this.enumNodeFragments(dbId)
      const { max, min } = bounds
      const pivotPoint = { x: (max.x + min.x) / 2, y: (max.y + min.y) / 2, z: (max.z + min.z) / 2 }
      const pivotPointMin = { x: (min.x), y: (min.y), z: (min.z) }
      const pivotPointMax = { x: (max.x), y: (max.y), z: (max.z) }
      dbIdPP[dbId] = {}
      dbIdPP[dbId].max = viewer.impl.worldToClient(pivotPointMax)
      dbIdPP[dbId].min = viewer.impl.worldToClient(pivotPointMin)
      dbIdPP[dbId].pivot = viewer.impl.worldToClient(pivotPoint)
    })
    this.dbIdPP = dbIdPP
  }

  async onMouseUp(event) {
    this.marquee.fadeOut()
    setTimeout(() => {
      this.unlockViewport()
      this.marquee.css({ width: 0, height: 0 })
    }, 100)

    if (!this.mousedown) {
      return
    }

    const { viewer } = this
    const hiddenDbIds = this.viewer.getHiddenNodes()
    const showDbIds = await this.getShowIds()
    await this.calcDbidPP(showDbIds)

    const dbIds = keys(this.dbIdPP)
    const dbInBounds = []

    const modelRootId = this.viewer.model.getRootId()
    dbIds.forEach((dbId) => {
      if (+dbId === modelRootId) {
        return
      }
      const { min, max } = this.dbIdPP[dbId]
      const isMaxInBounds = this.withinBounds({ x: max.x + this.offset.x, y: max.y + this.offset.y }, this.bounds)
      const isMinInBounds = this.withinBounds({ x: min.x + this.offset.x, y: min.y + this.offset.y }, this.bounds)
      if (isMaxInBounds && isMinInBounds) {
        dbInBounds.push(+dbId)
      }
    })

    const defaultShownDbIds = difference(dbInBounds, hiddenDbIds)
    this.viewer.select(defaultShownDbIds)
    this.mousedown = false

    window.ttt = this
  }

  onMouseMove = (event) => {
    const pos = {}
    pos.x = event.clientX - this.mousedowncoords.x;
    pos.y = event.clientY - this.mousedowncoords.y;

    if (!this._control.isActivated || !this.mousedown || Math.abs(pos.y) < 50 || Math.abs(pos.x) < 50) {
      return
    }

    if (pos.x < 0 && pos.y < 0) {// rb -> lt
      this.marquee.css({ left: `${event.clientX - this.offset.x}px`, width: `${-pos.x}px`, top: `${event.clientY - this.offset.y}px`, height: `${-pos.y}` })
    } else if (pos.x >= 0 && pos.y <= 0) {// lb -> rt
      this.marquee.css({ left: `${this.mousedowncoords.x - this.offset.x}px`, width: `${pos.x}px`, top: `${event.clientY - this.offset.y}px`, height: `${-pos.y}px` })
    } else if (pos.x >= 0 && pos.y >= 0) {// lt -> rb
      this.marquee.css({ left: `${this.mousedowncoords.x - this.offset.x}px`, width: `${pos.x}px`, height: `${pos.y}px`, top: `${this.mousedowncoords.y - this.offset.y}px` })
    } else if (pos.x < 0 && pos.y >= 0) {// rt -> lb
      this.marquee.css({ left: `${event.clientX - this.offset.x}px`, width: `${-pos.x}px`, height: `${pos.y}px`, top: `${this.mousedowncoords.y - this.offset.y}px` })
    }
    this.findCubesByVertices({ x: event.clientX, y: event.clientY })
  }

  findCubesByVertices = (location) => {
    this.findBounds(location, this.mousedowncoords)
  }

  findBounds = (pos1, pos2) => {
    const origin = {}
    const delta = {}

    if (pos1.y < pos2.y) {
      origin.y = pos1.y
      delta.y = pos2.y - pos1.y
    } else {
      origin.y = pos2.y
      delta.y = pos1.y - pos2.y
    }

    if (pos1.x < pos2.x) {
      origin.x = pos1.x
      delta.x = pos2.x - pos1.x
    } else {
      origin.x = pos2.x
      delta.x = pos1.x - pos2.x
    }
    const bounds = { origin, delta }
    this.bounds = bounds
    return bounds
  }

  withinBounds = (pos, bounds) => {
    const ox = bounds.origin.x
    const dx = (bounds.origin.x + bounds.delta.x)
    const oy = bounds.origin.y
    const dy = (bounds.origin.y + bounds.delta.y)

    if ((pos.x >= ox) && (pos.x <= dx) && (pos.y >= oy) && (pos.y <= dy)) {
      return true
    }
    return false
  }

  load() {
    $('.canvas-wrap').on('mousedown', this.onMouseDown)
    $('.canvas-wrap').on('mouseup', this.onMouseUp)
    $('.canvas-wrap').on('mousemove', this.onMouseMove)
    console.log('Viewing.Extension.MarqueeSelect loaded') 
    return true
  }

  unload() {
    $('.canvas-wrap').off('mousedown', this.onMouseDown)
    $('.canvas-wrap').off('mouseup', this.onMouseUp)
    $('.canvas-wrap').off('mousemove', this.onMouseMove)
    this.init()
    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(MarqueeSelect.ExtensionId, MarqueeSelect)
