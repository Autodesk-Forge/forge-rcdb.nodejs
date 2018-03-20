/////////////////////////////////////////////////////////////////////
// Viewing.Extension.ViewerPropertiesExtension
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import ViewerPropertyPanel from './Viewing.Extension.ViewerProperties.Panel'
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import ViewerToolkit from 'Viewer.Toolkit'

class ViewerPropertiesExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.ViewerProperties'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load() {

    console.log('Viewing.Extension.ViewerProperties loaded')

    return true;
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.ViewerProperties unloaded')

    this.panel.off()

    this.off()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded() {

    this.panel = new ViewerPropertyPanel(
      this.viewer, this.options)

    this.panel.on('setProperties', (data) => {

      return this.emit('setProperties', data)
    })

    this.viewer.setPropertyPanel(this.panel)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateProperties (properties) {

    properties.forEach((property) => {

      this.panel.updateProperty(property)
    })

    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ViewerPropertiesExtension.ExtensionId,
  ViewerPropertiesExtension)
