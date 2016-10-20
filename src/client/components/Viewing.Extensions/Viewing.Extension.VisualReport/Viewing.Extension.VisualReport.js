/////////////////////////////////////////////////////////////////////
// Viewing.Extension.VisualReport
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import VisualReportPanel from './Viewing.Extension.VisualReport.Panel'
import ExtensionBase from 'Viewer.ExtensionBase'
import ViewerToolkit from 'Viewer.Toolkit'

class VisualReportExtension extends ExtensionBase {

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
  async load() {

    var componentIds = await ViewerToolkit.getLeafNodes(
      this._viewer.model);

    var fragIdToMaterial = {}

    componentIds.forEach(async(dbId) => {

      var fragIds = await ViewerToolkit.getFragIds(
        this._viewer.model, dbId)

      fragIds.forEach((fragId) => {

        let fragList = this._viewer.model.getFragmentList()

        let material = fragList.getMaterial(fragId)

        if(material) {

          fragIdToMaterial[fragId] = material
        }
      })
    })

    let properties = this._options.properties

    if (!properties) {

      properties = await ViewerToolkit.getPropertyList(
        this._viewer.model,
        componentIds)
    }

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


    AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

    function getLeafNodes(model, nodeId) {

      return new Promise((resolve, reject)=>{

        try{

          var leafIds = [];

          var instanceTree = model.getData().instanceTree

          nodeId = nodeId || instanceTree.getRootId()

          function _getLeafNodesRec(id){

            var childCount = 0;

            instanceTree.enumNodeChildren(id,
              function(childId) {
                _getLeafNodesRec(childId)
                ++childCount
              })

            if(childCount == 0){
              leafIds.push(id)
            }
          }

          _getLeafNodesRec(nodeId)

          return resolve(leafIds)

        } catch(ex){

          return reject(ex)
        }
      })
    }

    function nodeIdToFragIds(model, nodeId) {

      var instanceTree = model.getData().instanceTree

      var fragIds = []

      instanceTree.enumNodeFragments(
        nodeId, (fragId) => {
          fragIds.push(fragId)
        });

      return fragIds
    }


    Autodesk.ADN.Viewing.Extension.Basic = function (viewer, options) {

      Autodesk.Viewing.Extension.call(this, viewer, options);

      var _this = this;

      _this.load = function () {

        var fragList = viewer.model.getFragmentList()

        getLeafNodes(viewer.model).then((dbIds) => {

          dbIds.forEach((dbId) => {

            const fragIds = nodeIdToFragIds(
              viewer.model, dbId)

            fragIds.forEach((fragId) => {

              var material = fragList.getMaterial(fragId)

              if(material) {

                material.opacity = 0.5
                material.transparent = true
                material.needsUpdate = true
              }
            })
          })

          viewer.impl.invalidate(true, true, true)
        })


        return true;
      };

      _this.unload = function () {

        Autodesk.Viewing.theExtensionManager.unregisterExtension(
          "Autodesk.ADN.Viewing.Extension.Basic");

        return true;
      };
    };

    Autodesk.ADN.Viewing.Extension.Basic.prototype =
      Object.create(Autodesk.Viewing.Extension.prototype);

    Autodesk.ADN.Viewing.Extension.Basic.prototype.constructor =
      Autodesk.ADN.Viewing.Extension.Basic;

    Autodesk.Viewing.theExtensionManager.registerExtension(
      "Autodesk.ADN.Viewing.Extension.Basic",
      Autodesk.ADN.Viewing.Extension.Basic);
