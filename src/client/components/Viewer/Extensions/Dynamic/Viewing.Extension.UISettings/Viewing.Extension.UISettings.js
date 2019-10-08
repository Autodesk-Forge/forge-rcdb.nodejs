/// //////////////////////////////////////////////////////////////////
// Viewing.Extension.UISettings
// by Philippe Leefsma, April 2016
//
/// //////////////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'

class UISettingsExtension extends ExtensionBase {
  /// //////////////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)
  }

  /// //////////////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.UISettings'
  }

  /// //////////////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////////////
  load () {
    this.viewer.addEventListener(
      Autodesk.Viewing.TOOLBAR_CREATED_EVENT, () => {
        this.loadToolbarSettings(this.options.toolbar || {})
      })

    console.log('Viewing.Extension.UISettings loaded')

    return true
  }

  /// //////////////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.UISettings unloaded')

    return true
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  loadToolbarSettings (toolbarOpts) {
    const removedControls =
      toolbarOpts.removedControls || []

    $(removedControls.join(',')).css({
      display: 'none'
    })

    const retargetedControls =
        toolbarOpts.retargetedControls || []

    retargetedControls.forEach((ctrl) => {
      var $ctrl = $(ctrl.id).detach()

      $(ctrl.parentId).append($ctrl)
    })
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  UISettingsExtension.ExtensionId,
  UISettingsExtension)
