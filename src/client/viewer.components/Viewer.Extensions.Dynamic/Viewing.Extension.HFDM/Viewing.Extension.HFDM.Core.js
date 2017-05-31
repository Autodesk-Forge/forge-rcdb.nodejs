/////////////////////////////////////////////////////////
// Viewing.Extension.ModelLoader
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import Toolkit from 'Viewer.Toolkit'
import Types from './Types'

class HFDMCoreExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.hfdm = new this.options.HFDM_SDK.HFDM()

    this.entityManager =
      new this.options.HFDMAppFramework.EntityManager()

    this.hfdmFactory =
      this.options.HFDM_SDK.PropertyFactory
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

    this.entityManager.registerEntity(
      Type.name,
      Type.typeId,
      Type.Entity(BaseEntity))
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

    await this.hfdm.connect({
      getBearerToken: this.options.getBearerToken,
      serverUrl: this.options.serverUrl
    })

    console.log('Successfully connected to HFDM')

    const initParameters = {
      urn: this.options.hfdmURN
    }

    await this.workspace.initialize(initParameters)

    this.entityManager.bind(this.workspace)

    const branchGUID =
      this.workspace.getActiveBranch().getGuid()

    const inspectorURL =
      `${this.options.serverUrl}/PropertyInspector.html?` +
      `branchGuid=${branchGUID}`
      //`token=${branchGUID}`

    console.log('------- inspectorURL -------')
    console.log(inspectorURL)

    if (!this.options.hfdmURN) {

      const colaborateURL =
        window.location.href + '&hfdmURN=' +
        this.workspace.getActiveUrn()

      console.log('------- colaborateURL -------')
      console.log(colaborateURL)

    } else {

      console.log('------- colaborateURL -------')
      console.log(window.location.href)
    }

    this.registerType(Types.Vector2d)

    const pos1 =
      this.createTypeInstance(
        Types.Vector2d)

    const pos2 =
      this.createTypeInstance(
        Types.Vector2d)

    //setInterval(() => {
    //
    //  vector2d.get('x').value = Math.random()
    //
    //}, 1000)

    this.workspace.insert(
      'pos1', pos1)

    this.workspace.insert(
      'pos2', pos2)

    this.workspace.commit()

  } catch (ex) {

    console.log(ex)
  }

  return true
}
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  HFDMCoreExtension.ExtensionId,
  HFDMCoreExtension)

export default HFDMCoreExtension.ExtensionId
