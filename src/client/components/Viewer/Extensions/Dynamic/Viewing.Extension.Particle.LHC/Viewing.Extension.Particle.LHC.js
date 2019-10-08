/// //////////////////////////////////////////////////////////////////
// Viewing.Extension.Particle.LHC
// by Philippe Leefsma, March 2016
//
/// //////////////////////////////////////////////////////////////////
import './Viewing.Extension.Particle.LHC.css'
import ToolPanelBase from 'ToolPanelBase'

class LHCPanel extends ToolPanelBase {
  /// //////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////
  constructor (viewer) {
    super(viewer.container, 'Cameras', {
      shadow: false,
      movable: false,
      closable: false
    })

    this.viewer = viewer

    $(this.container).addClass('LHC')
  }

  /// //////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////
  htmlContent (id) {
    return `
     <div class="container">
        <div id="${id}-views"></div>
      </div>`
  }

  /// //////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////
  addView (name, state) {
    var itemId = ToolPanelBase.guid()

    var item = `
      <div id="${itemId}" class="list-group-item">
        ${name}
      </div>
    `

    $(`#${this.container.id}-views`).append(item)

    $(`#${itemId}`).click(() => {
      this.viewer.restoreState(state)
    })
  }
}

/// //////////////////////////////////////////////////////////////
// Predefined Views
//
/// //////////////////////////////////////////////////////////////
var states = {

  home: '{"viewport":{"name":"","eye":[30.85465633248395,15.070642116564324,13.42283179227598],"target":[1.240365938320366,-1.7052230347706843,-0.3073006668620568],"up":[-0.41469497756517987,0.8894166150711755,-0.19226585868933524],"worldUpVector":[0,1,0],"pivotPoint":[0,-1.1920928955078125e-7,9.5367431640625e-7],"distanceToOrbit":36.80729637212813,"aspectRatio":2.1239732009088375,"projection":"orthographic","isOrthographic":true,"orthographicHeight":36.70084991483306}}',
  leftEmitter: '{"viewport":{"name":"","eye":[-0.712580408418811,0.9206033270913949,27.19591377840937],"target":[46.21211492145469,-24.133192820808205,-16.296894087277614],"up":[0.26742170449041697,0.931154820919068,-0.24786353391860333],"worldUpVector":[0,1,0],"pivotPoint":[0,-1.9049958921968937,-0.0000858306884765625],"distanceToOrbit":18.731414061082695,"aspectRatio":2.510150183974933,"projection":"perspective","isOrthographic":false,"fieldOfView":75}}',
  rightEmitter: '{"viewport":{"name":"","eye":[-1.1858635256511814,2.1892913465398696,-26.656964917517445],"target":[16.776860168003413,-15.124385548821673,-8.13202056512663],"up":[0.38786537921871056,0.8303952147243975,0.40000529367290605],"worldUpVector":[0,1,0],"pivotPoint":[6.432505728071192e-8,-0.01914180224412121,5.540932761505246e-7],"distanceToOrbit":17.80766551729947,"aspectRatio":2.6211981232720585,"projection":"perspective","isOrthographic":false,"fieldOfView":75}}',
  ctrlPoint1: '{"viewport":{"name":"","eye":[-26.80328425486575,2.2389889321118064,4.122100667601969],"target":[-9.694902949842056,-11.791885241102584,25.940310320276733],"up":[0.2786176573725178,0.8922557815798825,0.35531932291605406],"worldUpVector":[0,1,0],"pivotPoint":[16.776860168003413,-15.124385548821673,-8.13202056512663],"distanceToOrbit":23.22986955550632,"aspectRatio":2.1068565641497834,"projection":"perspective","isOrthographic":false,"fieldOfView":74.99999996248387}}',
  ctrlPoint2: '{"viewport":{"name":"","eye":[1.3266399106270939,56.80120150294029,-2.4198473788987584],"target":[1.3266399106270939,1.368272120882608,-2.4198473788987584],"up":[-1,0,0],"worldUpVector":[0,1,0],"pivotPoint":[1.3266399106270939,1.368272120882608,-2.4198473788987584],"distanceToOrbit":55.43292938205767,"aspectRatio":1.7669902450599269,"projection":"orthographic","isOrthographic":true,"orthographicHeight":55.43292938205768}}'
}

class LHCExtension extends Autodesk.Viewing.Extension {
  /// //////////////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.options = options

    this.viewer = viewer

    this.panel = new LHCPanel(viewer)
  }

  /// //////////////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.Particle.LHC'
  }

  /// //////////////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////////////
  load () {
    this.panel.addView('Home',
      JSON.parse(states.home))

    this.panel.addView('Left Emitter',
      JSON.parse(states.leftEmitter))

    this.panel.addView('Right Emitter',
      JSON.parse(states.rightEmitter))

    this.panel.addView('Control Point1',
      JSON.parse(states.ctrlPoint1))

    this.panel.addView('Control Point2',
      JSON.parse(states.ctrlPoint2))

    this.panel.setVisible(true)

    this.viewer.restoreState(JSON.parse(states.home))

    console.log('Viewing.Extension.Particle.LHC loaded')

    return true
  }

  /// //////////////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////////////
  unload () {
    this.panel.setVisible(false)
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  LHCExtension.ExtensionId,
  LHCExtension)
