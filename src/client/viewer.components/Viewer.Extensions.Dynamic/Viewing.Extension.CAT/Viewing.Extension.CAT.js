/////////////////////////////////////////////////////////////////
// Configurator Extension
// By Philippe Leefsma, February 2016
//
/////////////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'
import EventTool from 'Viewer.EventTool'
import Toolkit from 'Viewer.Toolkit'

// Commands
import OperatorCommand from 'Operator.Command'
import HotSpotCommand from 'HotSpot.Command'
import CATCommand from './CAT.Command'

const initialState = {
  "viewport":{
    "pivotPoint":[-1472.400390625,-10.18829345703125,-1500.0821533203125],
    "target":[-303.1868588883351,1907.2056309117083,-571.8250369698071],
    "up":[-0.18312680430671008,-0.42980211681298697,0.8841576295703655],
    "eye":[1091.6921628418772,5181.013408573601,1308.5288670390182],
    "distanceToOrbit":6423.3258979784805,
    "aspectRatio":1.9645293315143246,
    "projection":"perspective",
    "worldUpVector":[0,0,1],
    "isOrthographic":false,
    "fieldOfView":45
  }
}

const configurations = [
  {
    id: 'config-brushcutter',
    name: 'Brushcutter',
    dbIds: [325]
  },
  {
    id: 'config-mulcher',
    name: 'Mulcher',
    dbIds: [124, 126]
  },
  {
    id: 'config-trencher',
    name: 'Trencher',
    dbIds: [178, 180, 182, 186, 188, 190]
  },
  {
    id: 'config-dozer-blade',
    name: 'Dozer Blade',
    dbIds: [315, 317, 319]
  },
  {
    id: 'config-stump-grinder',
    name: 'Stump Grinder',
    dbIds: [328, 330, 332]
  },
  {
    id: 'config-bucket',
    name: 'Bucket',
    dbIds: [150, 173]
  },
  {
    id: 'config-low-bucket',
    name: 'Low Bucket',
    dbIds: [116]
  },
  {
    id: 'config-palette-fork',
    name: 'Palette Fork',
    dbIds: [119, 121]
  },
  {
    id: 'config-grapple-fork',
    name: 'Grapple Fork',
    dbIds: [322]
  }
]

const hotspots = [
  {
    id: 1,
    dbId: 97,
    occlusion: true,
    strokeColor: "#FF0000",
    fillColor: "#FF8888",
    worldPoint: {
      x: -707.970923901142,
      y: 612.61181640625,
      z: -1378.0939062706148
    },
    tooltip: {
      class: 'cat',
      imgUrl: 'http://s7d2.scene7.com/is/image/Caterpillar/C10554883?$cc-g$',
      caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque molestie, lorem vel dictum luctus, tortor purus maximus nulla, sit amet porta nulla metus a mauris. In hac habitasse platea dictumst. Vestibulum vestibulum dictum risus, vitae blandit lacus aliquam vitae. Vivamus et purus facilisis, fringilla orci ac, rhoncus turpis. '
    }
  },
  {
    id: 2,
    dbId: 19,
    occlusion: true,
    strokeColor: "#FF0000",
    fillColor: "#FF8888",
    worldPoint: {
      x: -976.0632600732763,
      y: 429.9181734249337,
      z: -599.8206504356555
    },
    tooltip: {
      class: 'cat',
      imgUrl: 'http://s7d2.scene7.com/is/image/Caterpillar/CM20150522-38474-33039?$cc-g$',
      caption: 'Proin fringilla elit ligula, et vestibulum leo lacinia vitae. Praesent vehicula nisl dapibus, dictum elit sit amet, interdum neque. Nunc porttitor, sem ut tincidunt dignissim, purus lacus condimentum nisl, feugiat sollicitudin velit turpis eu justo.'
    }
  },
  {
    id: 3,
    dbId: 94,
    occlusion: true,
    strokeColor: "#FF0000",
    fillColor: "#FF8888",
    worldPoint: {
      x: -2635.9625096214204,
      y: 623.5501629995997,
      z: -566.0477120013625
    },
    tooltip: {
      class: 'cat',
      imgUrl: 'http://s7d2.scene7.com/is/image/Caterpillar/CM20150522-36325-08992?$cc-g$',
      caption: 'Fusce quis diam pharetra, blandit diam vitae, pellentesque nunc. Duis ac sapien sapien. Nullam arcu massa, egestas id magna nec, euismod semper quam. Suspendisse eget arcu ac urna semper vehicula vitae non magna. Nam pharetra ex dolor.'
    }
  },
  {
    id: 4,
    dbId: 832,
    occlusion: true,
    strokeColor: "#FF0000",
    fillColor: "#FF8888",
    worldPoint: {
      x: -1401.475080459008,
      y: -729.0204308324123,
      z: -1795.4018981411405
    },
    tooltip: {
      class: 'cat',
      imgUrl: 'http://s7d2.scene7.com/is/image/Caterpillar/CM20150219-35676-40902?$cc-g$',
      caption: 'In viverra tellus eget dapibus sollicitudin. Suspendisse metus ex, tempus ac ex ac, ultrices pulvinar dolor. Integer porta, dui quis mattis placerat, lorem mauris viverra lacus, nec placerat nisl nisi vel nunc. Aliquam erat volutpat.'
    }
  },
  {
    id: 5,
    dbId: 228,
    occlusion: true,
    strokeColor: "#FF0000",
    fillColor: "#FF8888",
    worldPoint: {
      x: -2688.480848483067,
      y: -1471.2827251586225,
      z: -1685.2904496822068
    },
    tooltip: {
      class: 'cat',
      imgUrl: 'http://s7d2.scene7.com/is/image/Caterpillar/CM20150522-38474-33039?$cc-g$',
      caption: 'Pellentesque iaculis posuere felis eu blandit. Mauris lacinia, erat a fermentum lobortis, nunc ipsum volutpat mauris, in tincidunt risus augue in dolor. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    }
  }
]

class CATExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onGeometryLoaded = this.onGeometryLoaded.bind(this)

    this.onSelection = this.onSelection.bind(this)

    this.hotSpotCommand = new HotSpotCommand (viewer, {
      parentControl: options.parentControl,
      animate: true,
      hotspots
    })

    this.operatorCommand = new OperatorCommand (viewer, {
      parentControl: options.parentControl
    })

    this.configuratorCommand =
      new CATCommand(viewer, {
        configurations
      })

    this.hotSpotCommand.on('hotspot.clicked', (hotspot) => {

    })
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this.viewer.loadDynamicExtension('Viewing.Extension.UISettings', {
      toolbar:{
        removedControls: [
          '#navTools'
        ],
        retargetedControls: [

        ]
      }
    })

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoaded)

    this.eventTool = new EventTool(this._viewer)

    this.eventTool.activate()

    this.eventTool.on('singleclick', (event) => {

      this.pointer = event

      const element = document.elementFromPoint(
        this.pointer.canvasX,
        this.pointer.canvasY)

      //console.log(element)
    })

    this.viewer.setProgressiveRendering(false)
    this.viewer.setQualityLevel(true, false)
    this.viewer.setGroundReflection(true)
    this.viewer.setGroundShadow(true)
    this.viewer.setLightPreset(1)

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.CAT'
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this.viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelection)

    this.viewer.removeEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoaded)

    return true
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onGeometryLoaded (event) {

    const mustHide = [
      143, 145, 147, 153, 155, 157, 160, 162,
      164, 169, 167, 171, 100, 104, 107, 109,
      175, 193, 830, 792, 808, 776, 796, 814,
      798, 816, 772, 788, 806, 770, 800, 828,
      802, 820, 810, 824, 804, 812, 794, 784,
      782, 778, 822, 818, 786, 774, 790, 780,
      826, 102, 129, 184, 132, 135, 139
    ]

    Toolkit.hide(this._viewer, mustHide)

    const fragList = this.viewer.model.getFragmentList()

    Toolkit.getFragIds(this.viewer.model, [17, 26]).then(
      (fragIds) => {
        fragIds.forEach((fragId) => {
          var material = fragList.getMaterial(fragId)
          material.opacity = 0.2
        })
      })

    Toolkit.restoreStateWithPivot(
      this._viewer, initialState, {
        renderOptions: false,
        objectSet: false,
        seedURN: false,
        viewport: true
      }, true)

    this._options.loader.show(false)

    this.hotSpotCommand.activate()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async onSelection (event) {

    if (event.selections && event.selections.length) {

      const selection = event.selections[0]

      const dbIds = selection.dbIdArray

      console.log(dbIds)

      //const data = this._viewer.clientToWorld(
      //  this.pointer.canvasX,
      //  this.pointer.canvasY,
      //  true)
      //
      //console.log(data.point)
      //
      //new HotSpot(this._viewer, data.point)

      //console.log(JSON.stringify(this._viewer.getState()))

      //var instanceTree = model.getData().instanceTree;
      //
      //var rootId = instanceTree.getRootId()
      //
      //const bbox = await Toolkit.getWorldBoundingBox(
      //  this._viewer.model, rootId)
      //
      //Toolkit.drawBox(this._viewer, bbox.min, bbox.max)

      //const center = new THREE.Vector3(
      //  (bbox.max.x + bbox.min.x) * 0.5,
      //  (bbox.max.y + bbox.min.y) * 0.5,
      //  (bbox.max.z + bbox.min.z) * 0.5)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getState (viewerState) {

    this.configuratorCommand.getState (viewerState)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  restoreState (viewerState, immediate) {

    this.configuratorCommand.restoreState(
      viewerState,
      immediate)
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  CATExtension.ExtensionId,
  CATExtension)
