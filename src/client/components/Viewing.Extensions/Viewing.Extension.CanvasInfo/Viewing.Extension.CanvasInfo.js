/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CanvasInfo
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import CanvasInfoPanel from './Viewing.Extension.CanvasInfo.Panel'
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class CanvasInfoExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.CanvasInfo'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    this._control = ViewerToolkit.createButton(
      'toolbar-canvas-info',
      'glyphicon glyphicon-usd',
      'Cost Breakdown', () => {

        this.panel.toggleVisibility()
    })

    this.parentControl = this._options.parentControl

    if (!this.parentControl) {

      var viewerToolbar = this._viewer.getToolbar(true)

      this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
        'canvas-info')

      viewerToolbar.addControl(this.parentControl)
    }

    this.parentControl.addControl(
      this._control)

    this.panel = new CanvasInfoPanel(
      this._viewer,
      this._control.container)

    this.buildMaterialMap(this._options.materials).then(
      (materialMap) => {

        this.materialMap = materialMap

        this._options.onMaterialMapLoaded(
          materialMap)

        this.panel.on('open', ()=> {

          this.panel.loadMaterials(
            this.materialMap,
            'totalCost',
            'USD')
        })

        if(this._options.autoShow) {

          this.panel.setVisible(true)
        }
      })

    console.log('Viewing.Extension.CanvasInfo loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this.parentControl.removeControl(
      this._control)

    if (this.panel) {

      this.panel.setVisible(false)
    }

    console.log('Viewing.Extension.CanvasInfo unloaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  resize() {

    if (this.panel) {

      this.panel.redraw()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  buildMaterialMap (dbMaterials) {

    return new Promise(async(resolve, reject) => {

      try {

        let materialMap = { }

        const componentIds = await ViewerToolkit.getLeafNodes(
          this._viewer.model)

        let materialTasks = componentIds.map((dbId) => {

          return ViewerToolkit.getProperty(
            this._viewer.model, dbId, 'Material', 'undefined')
        })

        let materials = await Promise.all(materialTasks)

        let massTasks = componentIds.map((dbId) => {

          return ViewerToolkit.getProperty(
            this._viewer.model, dbId, 'Mass', 1.0)
        })

        let masses = await Promise.all(massTasks)

        componentIds.forEach((dbId, idx) => {

          const materialName = materials[idx].displayValue

          if(materialName !== 'undefined') {

            let dbMaterial = _.find(dbMaterials, {
              name: materialName
            })

            if (dbMaterial) {

              if (!materialMap[materialName]) {

                materialMap[ materialName] = {
                  dbMaterial: dbMaterial,
                  components: [],
                  totalMass: 0.0,
                  totalCost: 0.0
                }
              }

              let item = materialMap[materialName]

              if(item) {

                item.totalMass += masses[idx].displayValue

                item.components.push(dbId)

                item.totalCost = item.totalMass * this.toUSD(
                  item.dbMaterial.price,
                  item.dbMaterial.currency)
              }
            }
          }
        })

        resolve(materialMap)

      } catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  updateMaterial (material) {

    if (this.materialMap[material.name]) {

      let item = this.materialMap[material.name]

      item.dbMaterial = material

      item.totalCost = item.totalMass * this.toUSD(
        item.dbMaterial.price,
        item.dbMaterial.currency)

      if (this.panel.isVisible()) {

        this.panel.updateMaterials(
          this.materialMap,
          'totalCost',
          'USD'
        )
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  toUSD (price, currency) {

    var pricef = parseFloat(price);

    switch (currency) {

      case 'EUR': return pricef * 1.25;
      case 'USD': return pricef * 1.0;
      case 'JPY': return pricef * 0.0085;
      case 'MXN': return pricef * 0.072;
      case 'ARS': return pricef * 0.12;
      case 'GBP': return pricef * 1.58;
      case 'CAD': return pricef * 0.88;
      case 'BRL': return pricef * 0.39;
      case 'CHF': return pricef * 1.04;
      case 'ZAR': return pricef * 0.091;
      case 'INR': return pricef * 0.016;
      case 'PLN': return pricef * 0.30;
      case 'CNY': return pricef * 0.16;
      case 'DKK': return pricef * 0.17;
      case 'RUB': return pricef * 0.019;
      default: return pricef; //'Unknown';
    }
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  CanvasInfoExtension.ExtensionId,
  CanvasInfoExtension)
