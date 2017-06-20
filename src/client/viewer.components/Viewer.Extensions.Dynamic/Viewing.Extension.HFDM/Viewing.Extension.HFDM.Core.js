/////////////////////////////////////////////////////////
// Viewing.Extension.ModelLoader
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'
import Types from './Types'

class HFDMCoreExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onCameraChanged = _.throttle(
      this.onCameraChanged.bind(this), 250)

    this.entityManager =
      new this.options.HFDMAppFramework.EntityManager()

    this.hfdm = new this.options.HFDM_SDK.HFDM()

    this.hfdmFactory =
      this.options.HFDM_SDK.PropertyFactory

    this.eventSink = new EventsEmitter()

    this.eventSink.on('entity.created', (data) => {

      switch (data.entityType) {

        case 'Vector3d':

          if (data.property._id === 'position') {

            this.position = data.property
            break
          }

          if (data.property._id === 'target') {

            this.target = data.property
            break
          }

          if (data.property._id === 'up') {

            this.up = data.property
            break
          }
      }
    })
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

    this.hfdmFactory.register(Type.json)

    const {BaseEntity} = this.options.HFDMAppFramework

    const entityParams = {
      eventSink: this.eventSink,
      viewer: this.viewer
    }

    this.entityManager.registerEntity(
      Type.name,
      Type.typeId,
      Type.Entity(BaseEntity, entityParams))
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

      this.registerType(Types.Vector3d)

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
      this.createTypeInstance(
        Types.Vector3d)

    const cameraPosition =
      this.viewer.navigation.getPosition()

    position.get('x').value = cameraPosition.x
    position.get('y').value = cameraPosition.y
    position.get('z').value = cameraPosition.z

    this.workspace.insert(
      'position', position)


    const target =
      this.createTypeInstance(
        Types.Vector3d)

    const cameraTarget =
      this.viewer.navigation.getTarget()

    target.get('x').value = cameraTarget.x
    target.get('y').value = cameraTarget.y
    target.get('z').value = cameraTarget.z

    this.workspace.insert(
      'target', target)


    const up =
      this.createTypeInstance(
        Types.Vector3d)

    const cameraUp =
      this.viewer.navigation.getCameraUpVector()

    up.get('x').value = cameraUp.x
    up.get('y').value = cameraUp.y
    up.get('z').value = cameraUp.z

    this.workspace.insert(
      'up', up)

    this.workspace.commit()

    this.viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  initializeAsParticipant () {

    console.log('Initialize as PARTICIPANT')

    this.viewer.addEventListener(
      Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      this.onCameraChanged)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onCameraChanged (event) {

      const nav = this.viewer.navigation

      const position = nav.getPosition()

      const target = nav.getTarget()

      this.position.get('x').value = position.x
      this.position.get('y').value = position.y
      this.position.get('z').value = position.z

      this.target.get('x').value = target.x
      this.target.get('y').value = target.y
      this.target.get('z').value = target.z

      this.workspace.commit()
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  HFDMCoreExtension.ExtensionId,
  HFDMCoreExtension)

export default HFDMCoreExtension.ExtensionId
