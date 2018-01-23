
export default class TestExtension
  extends Autodesk.Viewing.Extension {

  constructor (viewer, options) {

    super()

    this.viewer = viewer
  }

  load () {

    return true
  }

  unload () {

    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Viewing.Extension.Test', TestExtension)




