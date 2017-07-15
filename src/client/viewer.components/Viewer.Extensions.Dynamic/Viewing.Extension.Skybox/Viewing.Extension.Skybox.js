/////////////////////////////////////////////////////////////////////
// Viewing.Extension.Skybox
// by Philippe Leefsma, July 2017
//
/////////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import xpos from './img/bridge/skybox-xpos.png'
import xneg from './img/bridge/skybox-xneg.png'
import ypos from './img/bridge/skybox-ypos.png'
import yneg from './img/bridge/skybox-yneg.png'
import zpos from './img/bridge/skybox-zpos.png'
import zneg from './img/bridge/skybox-zneg.png'
import Skybox from 'Viewer.Skybox'

class SkyboxExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super (viewer, options)

    const imageList = [
      xpos, xneg,
      ypos, yneg,
      zpos, zneg
    ]

    const size = new THREE.Vector3()

    size.fromArray(options.size || [10000, 10000, 10000])

    this.skybox = new Skybox(viewer, {
      imageList,
      size
    })
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Skybox'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load() {

    console.log('Viewing.Extension.Skybox loaded')

    this.loadContainer().then(() => {

      this.options.loader.show(false)
    })

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelCompletedLoad () {

    this.viewer.navigation.toPerspective()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadContainer () {

    return new Promise(async(resolve) => {

      const doc = await this.options.loadDocument(
        this.options.containerURN)

      const path = this.options.getViewablePath(doc)

      this.viewer.loadModel(path, {}, (model) => {

        resolve(model)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.Skybox unloaded')
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  SkyboxExtension.ExtensionId,
  SkyboxExtension)
