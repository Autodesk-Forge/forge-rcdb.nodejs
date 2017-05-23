/////////////////////////////////////////////////////////
// Viewing.Extension.ModelLoader
// by Philippe Leefsma, April 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import Toolkit from 'Viewer.Toolkit'

class HFDMCoreExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.hfdm = new this.options.HFDM_SDK.HFDM()
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
