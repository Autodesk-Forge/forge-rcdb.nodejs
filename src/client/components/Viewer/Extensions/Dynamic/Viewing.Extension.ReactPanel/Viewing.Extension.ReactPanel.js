/// //////////////////////////////////////////////////////////////
// ReactPanel Viewer Extension
// By Philippe Leefsma, Autodesk Inc, Feb 2018
//
/// //////////////////////////////////////////////////////////////
import ReactPanel from './ReactPanel'

class ReactPanelExtension extends Autodesk.Viewing.Extension {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    options.loader.show(false)

    this.panel = new ReactPanel(viewer, {
      id: 'react-panel-id',
      title: 'React Panel'
    })
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    console.log('Viewing.Extension.ReactPanel loaded')

    this.panel.setVisible(true)

    return true
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.ReactPanel'
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.ReactPanel unloaded')

    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ReactPanelExtension.ExtensionId,
  ReactPanelExtension)

export default 'Viewing.Extension.ReactPanel'
