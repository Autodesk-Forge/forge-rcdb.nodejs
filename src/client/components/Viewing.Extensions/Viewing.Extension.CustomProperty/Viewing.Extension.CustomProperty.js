/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CustomPropertyExtension
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import CustomPropertyPanel from './Viewing.Extension.CustomProperty.Panel'
import ExtensionBase from 'Viewer.ExtensionBase'
import ViewerToolkit from 'Viewer.Toolkit'

class CustomPropertyExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.CustomProperty';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this._panel = new CustomPropertyPanel(
      this._viewer)

    this._viewer.setPropertyPanel(
      this._panel)

    console.log('Viewing.Extension.CustomProperty loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.CustomProperty unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  CustomPropertyExtension.ExtensionId,
  CustomPropertyExtension)
