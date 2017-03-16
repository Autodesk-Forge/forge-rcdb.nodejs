/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CustomPropertyExtension
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import MetaPropertyPanel from './Viewing.Extension.MetaProperty.Panel'
import ExtensionBase from 'Viewer.ExtensionBase'
import ViewerToolkit from 'Viewer.Toolkit'

class MetaPropertyExtension extends ExtensionBase {

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

    return 'Viewing.Extension.MetaProperty';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this.panel = new MetaPropertyPanel(
      this.viewer, this.options)

    this.panel.on('setProperties', (data) => {

      return this.emit('setProperties', data)
    })

    this.viewer.setPropertyPanel(
      this.panel)

    console.log('Viewing.Extension.MetaProperty loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.MetaProperty unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  addProperties (properties) {

    //suppress "no properties" in panel
    if(properties.length) {

      $('div.noProperties', this.panel.container).remove()
    }

    properties.forEach((property) => {

      this.panel.addProperty(property)
    })

    this.panel.resizeToContent()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  updateProperties (properties) {

    properties.forEach((property) => {

      this.panel.updateProperty(property)
    })

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  MetaPropertyExtension.ExtensionId,
  MetaPropertyExtension)
