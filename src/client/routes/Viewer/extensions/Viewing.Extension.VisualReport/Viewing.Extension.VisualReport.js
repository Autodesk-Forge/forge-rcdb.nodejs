/////////////////////////////////////////////////////////////////////
// Viewing.Extension.VisualReport
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import VisualReportPanel from './Viewing.Extension.VisualReport.Panel'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class VisualReportExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.VisualReport';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    var componentIds = await ViewerToolkit.getLeafNodes(
      this._viewer.model);

    var fragIdToMaterial = {}

    componentIds.forEach(async(dbId) => {

      var fragIds = await ViewerToolkit.getFragIds(
        this._viewer.model, dbId)

      fragIds.forEach((fragId) => {

        let fragList = this._viewer.model.getFragmentList()

        fragIdToMaterial[fragId] = fragList.getMaterial(fragId)
      })
    })

    var properties = await ViewerToolkit.getPropertyList(
      this._viewer.model,
      componentIds);

    this._control = ViewerToolkit.createButton(
      'toolbar-visual-report',
      'glyphicon glyphicon-tasks',
      'Visual Report', () => {

      this._panel.toggleVisibility()
    })

    this._panel = new VisualReportPanel(
      this._viewer,
      properties,
      componentIds,
      this._control.container)

    this.parentControl = this._options.parentControl

    if (!this.parentControl) {

      var viewerToolbar = this._viewer.getToolbar(true)

      this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
        'visual-report')

      viewerToolbar.addControl(this.parentControl)
    }

    this._panel.on('close', () => {

      for(let fragId in fragIdToMaterial) {

        let material = fragIdToMaterial[fragId]

        let fragList = this._viewer.model.getFragmentList()

        fragList.setMaterial(fragId, material)
      }

      this._viewer.isolate()

      this._viewer.impl.invalidate(
        true, false, false);
    })

    this.parentControl.addControl(
      this._control)

    console.log('Viewing.Extension.VisualReport loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._panel.setVisible(false);

    this.parentControl.removeControl(
      this._control)

    console.log('Viewing.Extension.VisualReport unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  VisualReportExtension.ExtensionId,
  VisualReportExtension);
