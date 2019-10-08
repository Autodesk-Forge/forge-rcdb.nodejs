/// //////////////////////////////////////////////////////
// Viewing.Extension.HFDM
// by Philippe Leefsma, June 2017
//
/// //////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import EntityClassFactory from './HFDM/HFDM.Entity.ClassFactory'
import HandlerManager from './HFDM/Handlers/Handler.Manager'
import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'

// Types
import Vector3d from './HFDM/Types/Math.Vector3d'
import Camera from './HFDM/Types/Viewer.Camera'

// Handlers
import CameraHandler from './HFDM/Handlers/Handler.Camera'

class HFDMCoreExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.entityManager =
      new this.options.HFDMAppFramework.EntityManager()

    this.hfdm = new this.options.HFDM_SDK.HFDM()

    this.hfdmFactory =
      this.options.HFDM_SDK.PropertyFactory

    this.CameraHandler = new CameraHandler(viewer)

    this.handlerManager = new HandlerManager()

    this.handlerManager.registerHandler(
      'camera', this.CameraHandler)

    this.registerType(Vector3d, 'LMV')
    this.registerType(Camera, 'LMV')
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.HFDM.Core'
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    console.log('Viewing.Extension.HFDM.Core loaded')

    this.initializeHFDM()

    return true
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.HFDM.Core unloaded')

    super.unload()

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  registerType (Type, name) {
    this.hfdmFactory.register(Type.template)

    const { BaseEntity } = this.options.HFDMAppFramework

    const EntityClass = EntityClassFactory(
      BaseEntity, this.handlerManager)

    this.entityManager.registerEntity(
      name, Type.typeId, EntityClass)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createTypeInstance (Type) {
    return this.hfdmFactory.create(Type.typeId)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async initializeHFDM () {
    try {
      this.workspace = this.hfdm.createWorkspace()

      this.workspace.on('modified', (changeSet) => {

        // console.log(changeSet)
      })

      console.log('Connecting to HFDM ...')

      await this.hfdm.connect({
        getBearerToken: this.options.getToken,
        serverUrl: this.options.serverUrl
      })

      console.log('Successfully connected to HFDM')

      const initParameters = {
        urn: this.options.branchUrn
      }

      await this.workspace.initialize(initParameters)

      this.handlerManager.bind(this.workspace)

      this.entityManager.bind(this.workspace)

      const branchGUID =
        this.workspace.getActiveBranch().getGuid()

      this.options.getToken((err, token) => {
        const inspectorURL =
          'http://ecs-master-opt.ecs.ads.autodesk.com:3501/HFDMInspector.html?' +
          `branchGuid=${branchGUID}&` +
          `token=${token}`

        this.emit('inspectorURL', inspectorURL)
      })

      if (!this.options.branchUrn) {
        const branchUrn = this.workspace.getActiveUrn()

        // share workspace for write to everybody *

        await this.hfdm.share([branchUrn], ['*'])

        const colaborateURL =
          `${window.location.href}&branchUrn=${branchUrn}`

        this.emit('colaborateURL', colaborateURL)

        this.initializeAsHost()
      } else {
        const colaborateURL = window.location.href

        this.emit('colaborateURL', colaborateURL)

        this.initializeAsParticipant()
      }

      this.CameraHandler.activate()
    } catch (ex) {
      console.log(ex)
    }

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  initializeAsHost () {
    const position =
      this.viewer.navigation.getPosition()

    const target =
      this.viewer.navigation.getTarget()

    const upVector =
      this.viewer.navigation.getCameraUpVector()

    const cameraProperty =
      this.createTypeInstance(Camera)

    this.setVectorProperty(
      cameraProperty,
      'position',
      position)

    this.setVectorProperty(
      cameraProperty,
      'target',
      target)

    this.setVectorProperty(
      cameraProperty,
      'upVector',
      upVector)

    this.workspace.insert(
      'camera', cameraProperty)

    this.workspace.commit()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setVectorProperty (parentProperty, name, v) {
    const vectorProperty = parentProperty.get(name)

    vectorProperty.get('x').value = v.x
    vectorProperty.get('y').value = v.y
    vectorProperty.get('z').value = v.z
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  initializeAsParticipant () {

  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  HFDMCoreExtension.ExtensionId,
  HFDMCoreExtension)

export default HFDMCoreExtension.ExtensionId
