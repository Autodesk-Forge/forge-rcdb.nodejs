/////////////////////////////////////////////////////////
// Viewing.Extension.ModelLoader
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import EntityClassFactory from './HFDM/HFDM.Entity.ClassFactory'
import HandlerManager from './HFDM/Handlers/Handler.Manager'
import Camera from './HFDM/Types/Camera'
import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'

// Handlers
import CameraHandler from './HFDM/Handlers/Handler.Camera'

class HFDMCoreExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.entityManager =
      new this.options.HFDMAppFramework.EntityManager()

    this.hfdm = new this.options.HFDM_SDK.HFDM()

    this.hfdmFactory =
      this.options.HFDM_SDK.PropertyFactory

    this.handlerManager = new HandlerManager()

    this.handlerManager.registerHandler(
      'camera', new CameraHandler(viewer))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'hfdm-core'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.HFDM.Core'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    console.log('Viewing.Extension.HFDM.Core loaded')

    this.initializeHFDM()

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.HFDM.Core unloaded')

    viewer.removeEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  registerType (Type) {

    this.hfdmFactory.register(Type.template)

    const {BaseEntity} = this.options.HFDMAppFramework

    const EntityClass = EntityClassFactory(
      BaseEntity, this.handlerManager)

    this.entityManager.registerEntity(
      Type.name,
      Type.typeId,
      EntityClass)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createTypeInstance (Type) {

    return this.hfdmFactory.create(Type.typeId)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async initializeHFDM() {

    try {

      this.workspace = this.hfdm.createWorkspace()

      this.workspace.on('modified', (changeSet) => {

        console.log(changeSet)
      })

      console.log('Connecting to HFDM ...')

      await this.hfdm.connect({
        getBearerToken: this.options.getToken,
        serverUrl: this.options.serverUrl
      })

      console.log('Successfully connected to HFDM')

      const initParameters = {
        urn: this.options.hfdmURN
      }

      await this.workspace.initialize(initParameters)

      this.registerType(Camera)

      this.handlerManager.bind(this.workspace)

      this.entityManager.bind(this.workspace)

      const branchGUID =
        this.workspace.getActiveBranch().getGuid()

      this.options.getToken((err, token) => {

        const inspectorURL =
          `${this.options.serverUrl}/PropertyInspector.html?` +
          `branchGuid=${branchGUID}&` +
          `token=${token}`

        this.emit('inspectorURL', inspectorURL)
      })

      if (!this.options.hfdmURN) {

        const colaborateURL =
          window.location.href + '&hfdmURN=' +
          this.workspace.getActiveUrn()

        this.emit('colaborateURL', colaborateURL)

        this.initializeAsHost()

      } else {

        const colaborateURL = window.location.href

        this.emit('colaborateURL', colaborateURL)

        this.initializeAsParticipant()
      }

    } catch (ex) {

      console.log(ex)
    }

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  initializeAsHost () {

    console.log('Initialize as HOST')

    const position =
      this.viewer.navigation.getPosition()

    const target =
      this.viewer.navigation.getTarget()

    const up =
      this.viewer.navigation.getCameraUpVector()

    const cameraProperty =
      this.createTypeInstance(Camera)

    cameraProperty.get('position.x').value = position.x
    cameraProperty.get('position.y').value = position.y
    cameraProperty.get('position.z').value = position.z

    cameraProperty.get('target.x').value = target.x
    cameraProperty.get('target.y').value = target.y
    cameraProperty.get('target.z').value = target.z

    cameraProperty.get('up.x').value = up.x
    cameraProperty.get('up.y').value = up.y
    cameraProperty.get('up.z').value = up.z

    this.workspace.insert(
      'camera', cameraProperty)

    this.workspace.commit()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  initializeAsParticipant () {

    console.log('Initialize as PARTICIPANT')
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  HFDMCoreExtension.ExtensionId,
  HFDMCoreExtension)

export default HFDMCoreExtension.ExtensionId
