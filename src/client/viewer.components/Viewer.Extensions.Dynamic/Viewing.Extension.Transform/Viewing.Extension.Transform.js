/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CSSTVExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import TranslateTool from './Viewing.Tool.Translate'
import ExtensionBase from 'Viewer.ExtensionBase'
import RotateTool from './Viewing.Tool.Rotate'
import ViewerToolkit from 'Viewer.Toolkit'
import Stopwatch from 'Stopwatch'
import easing from 'easing-js'

class TransformExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, options)

    this.translateTool = new TranslateTool(viewer)

    this.rotateTool = new RotateTool(viewer)

    this.transformedFragIdMap = {}

    this.translateTool.on('selection', (selection) => {

      const translateSelection = selection
        ? Object.assign({}, selection, {
            type: 'translate'
          })
        : null

      this.emit('selection', translateSelection)
    })

    this.translateTool.on('translate', (data) => {

      data.fragIds.forEach((fragId) => {

        this.transformedFragIdMap[fragId] = true
      })

      this.emit('transform', {
        transform: {
          translation: data.translation
        },
        fragIds: data.fragIds,
        model: data.model,
        dbIds: data.dbIds
      })
    })

    this.translateTool.on('deactivate', () => {

      this._txControl.container.classList.remove('active')
      this._comboCtrl.container.classList.remove('active')

      this.emit('deactivate')
    })

    this.rotateTool.on('selection', (selection) => {

      const rotateSelection = selection
        ? Object.assign({}, selection, {
            type: 'rotate'
          })
        : null

      this.emit('selection', rotateSelection)
    })

    this.rotateTool.on('rotate', (data) => {

      data.fragIds.forEach((fragId) => {

        this.transformedFragIdMap[fragId] = true
      })

      this.emit('transform', {
        transform: {
          rotation: data.rotation
        },
        fragIds: data.fragIds,
        model: data.model,
        dbIds: data.dbIds
      })
    })

    this.rotateTool.on('deactivate', () => {

      this._rxControl.container.classList.remove('active')
      this._comboCtrl.container.classList.remove('active')

      this.emit('deactivate')
    })
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.Transform'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load () {

    this._txControl = ViewerToolkit.createButton(
      'toolbar-translate',
      'fa fa-arrows-alt',
      'Translate Tool', () => {

        if (this.translateTool.active) {

          this.translateTool.deactivate()
          this._txControl.container.classList.remove('active')
          this._comboCtrl.container.classList.remove('active')

        } else {

          this.translate()
        }
      })

    this._rxControl = ViewerToolkit.createButton(
      'toolbar-rotate',
      'fa fa-refresh',
      'Rotate Tool', () => {

        if (this.rotateTool.active) {

          this.rotateTool.deactivate()
          this._rxControl.container.classList.remove('active')
          this._comboCtrl.container.classList.remove('active')

        } else {

          this.rotate()
        }
      })

    this.parentControl = this._options.parentControl

    if (typeof this.parentControl === 'string') {

      var viewerToolbar = this._viewer.getToolbar(true)

      this.parentControl = viewerToolbar.getControl(
        this.parentControl)
    }

    if (!this.parentControl && !this._options.hideControls) {

      var viewerToolbar = this._viewer.getToolbar(true)

      this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
        'transform')

      viewerToolbar.addControl(this.parentControl)
    }

    this._comboCtrl = new Autodesk.Viewing.UI.ComboButton(
      'toolbar-transform')

    this._comboCtrl.setToolTip('Transform Tools')

    this._comboCtrl.icon.style.fontSize = '24px'
    this._comboCtrl.icon.style.transform = 'rotateY(180Deg)'

    this._comboCtrl.icon.className =
      'glyphicon glyphicon-wrench'

    this._comboCtrl.addControl(this._txControl)
    this._comboCtrl.addControl(this._rxControl)

    var openCombo = this._comboCtrl.onClick

    this._comboCtrl.onClick = (e) => {

      if(this._comboCtrl.container.classList.contains('active')) {

        this.deactivate ()

      } else {

        openCombo()
      }
    }

    if(!this._options.hideControls) {

      this.parentControl.addControl(this._comboCtrl)
    }

    console.log('Viewing.Extension.Transform loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.parentControl.removeControl(
      this._comboCtrl)

    this.translateTool.deactivate()

    this.rotateTool.deactivate()

    console.log('Viewing.Extension.Transform unloaded')
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  translate () {

    this.translateTool.activate()
    this._txControl.container.classList.add('active')

    this.rotateTool.deactivate()
    this._rxControl.container.classList.remove('active')

    this._comboCtrl.container.classList.add('active')
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  rotate () {

    this.rotateTool.activate()
    this._rxControl.container.classList.add('active')

    this.translateTool.deactivate()
    this._txControl.container.classList.remove('active')

    this._comboCtrl.container.classList.add('active')
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deactivate () {

    this._txControl.container.classList.remove('active')
    this._rxControl.container.classList.remove('active')

    this._comboCtrl.container.classList.remove('active')

    this.translateTool.deactivate()
    this.rotateTool.deactivate()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setFullTransform (fullTransform) {

    this.translateTool.setFullTransform(fullTransform)

    this.rotateTool.setFullTransform(fullTransform)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  pickPosition () {

    this.translateTool.onPick()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  clearSelection () {

    this.translateTool.clearSelection()

    this.rotateTool.clearSelection()
  }

  /////////////////////////////////////////////////////////////////
  //
  //  From viewer.getState:
  //  Allow extensions to inject their state data
  //
  //  for (var extensionName in viewer.loadedExtensions) {
  //    viewer.loadedExtensions[extensionName].getState(
  //      viewerState);
  //  }
  /////////////////////////////////////////////////////////////////
  getState (viewerState) {

    this.currentExplodeScale =
      this.currentExplodeScale ||
      this._viewer.getExplodeScale()

    viewerState.explodeScale = this.currentExplodeScale

    viewerState.transforms = {}

    for (let fragId in this.transformedFragIdMap) {

      const fragProxy = this._viewer.impl.getFragmentProxy(
        this._viewer.model,
        fragId)

      fragProxy.getAnimTransform()

      viewerState.transforms[fragId] = {
        quaternion: fragProxy.quaternion,
        position: fragProxy.position
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //    From viewer.restoreState:
  //    Allow extensions to restore their data
  //
  //    for (var extensionName in viewer.loadedExtensions) {
  //      viewer.loadedExtensions[extensionName].restoreState(
  //        viewerState, immediate);
  //    }
  /////////////////////////////////////////////////////////////////
  restoreState (viewerState, immediate) {

    this.translateTool.clearSelection()

    this.rotateTool.clearSelection()

    if (viewerState.transforms) {

      //this.restoreTransform(viewerState)

      const period = 1.8

      const easingFunc = (t) => {
        //b: begging value, c: change in value, d: duration
        return easing.easeInOutExpo(t, 0, 1, period * 0.7)
      }

      this.animateTransform(
        viewerState, easingFunc, period).then(() => {

          this.currentExplodeScale =
            viewerState.explodeScale
        })

      this.transformedFragIdMap = Object.assign({},
        viewerState.transforms)

      this.viewer.impl.sceneUpdated(true)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  restoreTransform (targetState) {

    const currentFragIds = Object.keys(
      this.transformedFragIdMap)

    const targetFragIds = Object.keys(
      targetState.transforms)

    const fullFragIds = [
      ...currentFragIds,
      ...targetFragIds
    ]

    fullFragIds.forEach((fragId) => {

      const transform = targetState.transforms[ fragId ] || {
          quaternion: { _x: 0, _y: 0, _z: 0, _w: 1 },
          position: { x: 0, y: 0, z: 0 }
        }

      const fragProxy = viewer.impl.getFragmentProxy(
        this._viewer.model,
        fragId)

      fragProxy.getAnimTransform()

      fragProxy.position.x = transform.position.x
      fragProxy.position.y = transform.position.y
      fragProxy.position.z = transform.position.z

      fragProxy.quaternion._x = transform.quaternion._x
      fragProxy.quaternion._y = transform.quaternion._y
      fragProxy.quaternion._z = transform.quaternion._z
      fragProxy.quaternion._w = transform.quaternion._w

      fragProxy.updateAnimTransform()
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  animateTransform (targetState, easing, period = 2.0) {

    return new Promise (async(resolve, reject) => {

      const viewer = this._viewer

      const currentFragIds = Object.keys(
        this.transformedFragIdMap)

      const targetFragIds = Object.keys(
        targetState.transforms)

      const fullFragIds = [
        ...currentFragIds,
        ...targetFragIds
      ]

      const fragProxyTasks = fullFragIds.map((fragId) => {

        const fragProxy = viewer.impl.getFragmentProxy(
          viewer.model,
          fragId)

        fragProxy.getAnimTransform()

        const targetTransform = targetState.transforms[fragId] || {
            quaternion: { _x: 0, _y:0, _z:0, _w:1 },
            position: { x: 0, y: 0, z: 0 }
          }

        fragProxy.step = {

          dx: (targetTransform.position.x - fragProxy.position.x) / period,
          dy: (targetTransform.position.y - fragProxy.position.y) / period,
          dz: (targetTransform.position.z - fragProxy.position.z) / period,

          dQx: (targetTransform.quaternion._x - fragProxy.quaternion._x) / period,
          dQy: (targetTransform.quaternion._y - fragProxy.quaternion._y) / period,
          dQz: (targetTransform.quaternion._z - fragProxy.quaternion._z) / period,
          dQw: (targetTransform.quaternion._w - fragProxy.quaternion._w) / period
        }

        fragProxy.initialTransform = {
          quaternion: {
            _x: fragProxy.quaternion._x,
            _y: fragProxy.quaternion._y,
            _z: fragProxy.quaternion._z,
            _w: fragProxy.quaternion._w
          },
          position: {
            x: fragProxy.position.x,
            y: fragProxy.position.y,
            z: fragProxy.position.z
          }
        }

        fragProxy.targetTransform = targetTransform

        return fragProxy
      });

      const fragProxies = await Promise.all(fragProxyTasks)

      // Create all fragment animation tasks
      const animationTasks = fragProxies.map((fragProxy) => {

        return {

          step: (dt) => {

            //fragProxy.quaternion.slerp(
            //  fragProxy.transform.quaternion,
            //  dt/tStep)

            fragProxy.quaternion._x += fragProxy.step.dQx * dt
            fragProxy.quaternion._y += fragProxy.step.dQy * dt
            fragProxy.quaternion._z += fragProxy.step.dQz * dt
            fragProxy.quaternion._w += fragProxy.step.dQw * dt

            fragProxy.position.x += fragProxy.step.dx * dt
            fragProxy.position.y += fragProxy.step.dy * dt
            fragProxy.position.z += fragProxy.step.dz * dt

            fragProxy.updateAnimTransform()
          },

          ease: (t) => {

            //fragProxy.quaternion.slerp(
            //  fragProxy.transform.quaternion,
            //  dt/tStep)

            const eased = easing(t/period)

            const _targetQuat = fragProxy.targetTransform.quaternion
            const _initQuat = fragProxy.initialTransform.quaternion

            const initQuat = new THREE.Quaternion(
              _initQuat._x,
              _initQuat._y,
              _initQuat._z,
              _initQuat._w)

            const targetQuat = new THREE.Quaternion(
              _targetQuat._x,
              _targetQuat._y,
              _targetQuat._z,
              _targetQuat._w)

            initQuat.slerp(targetQuat, eased)

            fragProxy.quaternion._x = initQuat.x
            fragProxy.quaternion._y = initQuat.y
            fragProxy.quaternion._z = initQuat.z
            fragProxy.quaternion._w = initQuat.w

            //fragProxy.quaternion._x = eased * targetQuat._x + (1 - eased) * initQuat._x
            //fragProxy.quaternion._y = eased * targetQuat._y + (1 - eased) * initQuat._y
            //fragProxy.quaternion._z = eased * targetQuat._z + (1 - eased) * initQuat._z
            //fragProxy.quaternion._w = eased * targetQuat._z + (1 - eased) * initQuat._z

            const targetPos = fragProxy.targetTransform.position
            const initPos = fragProxy.initialTransform.position

            fragProxy.position.x = eased * targetPos.x + (1 - eased) * initPos.x
            fragProxy.position.y = eased * targetPos.y + (1 - eased) * initPos.y
            fragProxy.position.z = eased * targetPos.z + (1 - eased) * initPos.z

            fragProxy.updateAnimTransform()
          },

          finalStep: () => {

            fragProxy.quaternion._x = fragProxy.targetTransform.quaternion._x
            fragProxy.quaternion._y = fragProxy.targetTransform.quaternion._y
            fragProxy.quaternion._z = fragProxy.targetTransform.quaternion._z
            fragProxy.quaternion._w = fragProxy.targetTransform.quaternion._w

            fragProxy.position.copy(fragProxy.targetTransform.position)

            fragProxy.updateAnimTransform()
          }
        }
      })

      // create explode animation task

      let scale = parseFloat(this.currentExplodeScale)

      const targetScale = parseFloat(
        targetState.explodeScale)

      if (targetScale != scale) {

        var scaleStep = (targetScale - scale) / period

        animationTasks.push({

          step: (dt) => {

            scale += scaleStep * dt

            ViewerToolkit.selectiveExplode(
              viewer,
              scale,
              fullFragIds)
          },

          ease: (t) => {

            const eased = easing(t/period)

            const easedScale = scale +
              eased * (targetScale - scale)

            ViewerToolkit.selectiveExplode(
              viewer,
              easedScale,
              fullFragIds)
          },

          finalStep: () => {

            ViewerToolkit.selectiveExplode(
              viewer,
              targetScale,
              fullFragIds)

            viewer.explodeSlider.value = targetScale
          }
        })
      }


      let animationId = 0
      let elapsed = 0

      const stopwatch = new Stopwatch()

      const animateTransformStep = () => {

        const dt = stopwatch.getElapsedMs() * 0.001

        elapsed += dt

        if (elapsed < period) {

          animationTasks.forEach((task) => {

            task.ease(elapsed)
          })

          animationId = requestAnimationFrame(
            animateTransformStep)

        } else {

          //end of animation
          animationTasks.forEach((task) => {

            task.finalStep()
          })

          cancelAnimationFrame(animationId)

          viewer.autocam.shotParams.duration = 1.0
        }

        viewer.impl.sceneUpdated(true)

        resolve()
      }

      viewer.autocam.shotParams.duration = period

      animationId = requestAnimationFrame(
        animateTransformStep)
    })
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  TransformExtension.ExtensionId,
  TransformExtension)

