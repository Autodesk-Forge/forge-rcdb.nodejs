import { difference, keys, forOwn, findKey, clone, omit, sortBy } from 'lodash'
import $ from 'jquery'

import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'

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
      $('body').append('<div id="select-marquee"></div>')
    }
    this.marquee = $('#select-marquee').css({ width: 0, height: 0, display: 'none', 'background-color': 'rgba(208, 255, 242, 0.5)', border: 'dotted 1px #9a9a9a', 'z-index': 100, position: 'absolute' })
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
    const instanceTree = viewer.model.getInstanceTree()
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

    let ids = []
    const isolateDbIds = this.viewer.getIsolatedNodes()
    const hiddenDbIds = this.viewer.getHiddenNodes()
    if (!isolateDbIds.length && !hiddenDbIds.length) {
      return Object.values(mappings)
    }
    // TODO: caculate the shown dbIds
    if (isolateDbIds.length > 0) {
      const isolatedToShowDbIds = this.getIdsByExternalId(mappings, isolateDbIds, true)
      ids = isolatedToShowDbIds
    } else {
      const toShowIds = this.getIdsByExternalId(mappings, hiddenDbIds, false)
      ids = toShowIds
    }
    return ids
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
    if (!(event.ctrlKey && event.altKey)) {
      return
    }
    this.mousedown = true
    this.mousedowncoords.x = event.clientX;
    this.mousedowncoords.y = event.clientY;

    const { viewer } = this
    const { canvas } = viewer
    this.lockViewport()
    const cRect = canvas.getBoundingClientRect()
    this.offset = { x: cRect.left, y: cRect.top }
    const pos = {}
    pos.x = (((event.clientX - cRect.left) / canvas.width) * 2) - 1
    pos.y = (-((event.clientY - cRect.top) / canvas.height) * 2) + 1
    const vector = new THREE.Vector3(pos.x, pos.y, 1)
    vector.unproject(viewer.getCamera())
  }

  async calcDbidPP(defaultShownDbIds) {
    const dbIdPP = {}
    const { viewer } = this
    defaultShownDbIds.forEach(async (dbId) => { // eslint-disable-line
      const bounds = await this.enumNodeFragments(dbId)
      const { max, min } = bounds
      const pivotPoint = { x: (max.x + min.x) / 2, y: (max.y + min.y) / 2, z: (max.z + min.z) / 2 }
      const pivotPointMin = { x: (min.x), y: (min.y), z: (min.z) }
      const pivotPointMax = { x: (max.x), y: (max.y), z: (max.z) }
      dbIdPP[dbId] = {}
      dbIdPP[dbId].max = viewer.impl.worldToClient(pivotPointMax)
      dbIdPP[dbId].min = viewer.impl.worldToClient(pivotPointMin)
      dbIdPP[dbId].pivot = viewer.impl.worldToClient(pivotPoint)
    });
    this.dbIdPP = dbIdPP
  }

  async onMouseUp(event) { // eslint-disable-line
    this.marquee.fadeOut()
    setTimeout(() => {
      this.unlockViewport()
    }, 100)

    if (!(event.ctrlKey && event.altKey)) {
      return
    }

    if (!this.mousedown) {
      return
    }

    const { viewer } = this
    const hiddenDbIds = this.viewer.getHiddenNodes()
    const showDbIds = await this.getShowIds()
    await this.calcDbidPP(showDbIds)

    const dbIds = keys(this.dbIdPP)
    const dbInBounds = []
    dbIds.forEach((dbId) => {
      if (+dbId === this.viewer.model.getRootId()) {
        return
      }
      const { min, max } = this.dbIdPP[dbId]
      // const isInBounds = this.withinBounds(pivot, this.bounds)
      const isMaxInBounds = this.withinBounds(max, this.bounds)
      const isMinInBounds = this.withinBounds(min, this.bounds)
      if (isMaxInBounds && isMinInBounds) {
        dbInBounds.push(+dbId)
      }
    })
    const defaultShownDbIds = difference(dbInBounds, hiddenDbIds);
    this.viewer.select(defaultShownDbIds)
    this.mousedown = false
  }

  onMouseMove = (event) => {
    if (!(event.ctrlKey && event.altKey && this.mousedown)) {
      return
    }
    this.marquee.show()
    const pos = {};
    pos.x = event.clientX - this.mousedowncoords.x;
    pos.y = event.clientY - this.mousedowncoords.y;
    if (pos.x < 0 && pos.y < 0) {
      this.marquee.css({ left: `${event.clientX}px`, width: `${-pos.x}px`, top: `${event.clientY}px`, height: `${-pos.y}` })
    } else if (pos.x >= 0 && pos.y <= 0) {
      this.marquee.css({ left: `${this.mousedowncoords.x}px`, width: `${pos.x}px`, top: `${event.clientY}px`, height: `${-pos.y}px` })
    } else if (pos.x >= 0 && pos.y >= 0) {
      this.marquee.css({ left: `${this.mousedowncoords.x}px`, width: `${pos.x}px`, height: `${pos.y}px`, top: `${this.mousedowncoords.y}px` })
    } else if (pos.x < 0 && pos.y >= 0) {
      this.marquee.css({ left: `${event.clientX}px`, width: `${-pos.x}px`, height: `${pos.y}px`, top: `${this.mousedowncoords.y}px` })
    }
    this.findCubesByVertices({ x: event.clientX, y: event.clientY })
  }

  findCubesByVertices = (location) => {
    const currentMouse = {}
    const mouseInitialDown = {}
    currentMouse.x = location.x - this.offset.x
    currentMouse.y = location.y - this.offset.y
    mouseInitialDown.x = (this.mousedowncoords.x - this.offset.x);
    mouseInitialDown.y = (this.mousedowncoords.y - this.offset.y);
    this.findBounds(currentMouse, this.mousedowncoords)
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
    window.bounds = bounds
    return bounds
  }

  withinBounds = (pos, bounds) => {
    const ox = bounds.origin.x
    const dx = (bounds.origin.x + bounds.delta.x)
    const oy = bounds.origin.y
    const dy = (bounds.origin.y + bounds.delta.y)

    if ((pos.x >= ox) && (pos.x <= dx) && (pos.y >= oy) && (pos.y <= dy)) {
      return true;
    }
    return false;
  }

  load() {
    const { canvas } = this.viewer
    canvas.addEventListener('mousedown', this.onMouseDown, true)
    canvas.addEventListener('mouseup', this.onMouseUp, false)
    canvas.addEventListener('mousemove', this.onMouseMove, false)
    console.log('Viewing.Extension.MarqueeSelect loaded'); // eslint-disable-line
    return true
  }

  unload() {
    const { canvas } = this.viewer
    canvas.removeEventListener('mousedown', this.onMouseDown)
    canvas.removeEventListener('mouseup', this.onMouseUp)
    canvas.removeEventListener('mousemove', this.onMouseMove)
    this.init()
    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(MarqueeSelect.ExtensionId, MarqueeSelect);
