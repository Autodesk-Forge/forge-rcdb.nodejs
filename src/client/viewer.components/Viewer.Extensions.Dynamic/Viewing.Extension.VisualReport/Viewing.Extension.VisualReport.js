/////////////////////////////////////////////////////////////////////
// Viewing.Extension.VisualReport
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import VisualReportPanel from './Viewing.Extension.VisualReport.Panel'
import ViewerToolkit from 'Viewer.Toolkit'

class VisualReportExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.VisualReport'
  }
  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    console.log('Viewing.Extension.VisualReport loaded')

    this.createUI ()

    return true
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async getParentCtrl(ctrl) {

    return new Promise ((resolve) => {

      if (typeof ctrl === 'string') {

        var viewerToolbar = this.viewer.getToolbar(true)
        const parentControl = viewerToolbar.getControl(ctrl)
        return resolve(parentControl)
      }

      resolve(ctrl)
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async createUI () {

    this.parentControl =
      await this.getParentCtrl(
        this.options.parentControl)

    this.control = ViewerToolkit.createButton(
      'toolbar-visual-report',
      'glyphicon glyphicon-tasks',
      'Visual Report', () => {

        this.panel = this.panel || this.createPanel()

        this.panel.toggleVisibility()
      })

    this.parentControl.addControl(this.control)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createPanel () {

    const panel = new VisualReportPanel(
      this.viewer,
      this.options.properties,
      this.componentIds,
      this.control.container)

    panel.on('close', () => {

      for(let fragId in this.fragIdToMaterial) {

        let material = this.fragIdToMaterial[fragId]

        let fragList = this.viewer.model.getFragmentList()

        fragList.setMaterial(fragId, material)
      }

      ViewerToolkit.isolateFull(
        this.viewer)

      this.viewer.impl.invalidate(
        true, false, false)
    })

    return panel
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async onModelCompletedLoad() {

    this.viewer.setQualityLevel(false, true)

    var componentIds = await ViewerToolkit.getLeafNodes(
      this.viewer.model);

    this.fragIdToMaterial = {}

    componentIds.forEach(async(dbId) => {

      var fragIds = await ViewerToolkit.getFragIds(
        this.viewer.model, dbId)

      fragIds.forEach((fragId) => {

        let fragList = this.viewer.model.getFragmentList()

        let material = fragList.getMaterial(fragId)

        if(material) {

          this.fragIdToMaterial[fragId] = material
        }
      })
    })

    this.componentIds = componentIds
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.VisualReport unloaded')

    if (this.panel) {

      this.panel.setVisible(false)
    }

    if (this.control) {

      this.parentControl.removeControl(
        this.control)
    }

    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  VisualReportExtension.ExtensionId,
  VisualReportExtension)
