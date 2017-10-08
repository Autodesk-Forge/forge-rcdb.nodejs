/////////////////////////////////////////////////////////
// Viewing.Extension.Database.Table
// by Philippe Leefsma, September 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import DatabaseAPI from './Viewing.Extension.Database.API'
import './Viewing.Extension.Database.Table.scss'
import WidgetContainer from 'WidgetContainer'
import {ReactLoader as Loader} from 'Loader'
import ServiceManager from 'SvcManager'
import throttle from 'lodash/throttle'
import Toolkit from 'Viewer.Toolkit'
import sortBy from 'lodash/sortBy'
import find from 'lodash/find'
import DBTable from 'DBTable'
import React from 'react'

class DatabaseTableExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onUpdateItemSocket = this.onUpdateItemSocket.bind(this)
    this.onUpdateItem = this.onUpdateItem.bind(this)
    this.onSelectItem = this.onSelectItem.bind(this)

    this.onResize = throttle(this.onResize, 250)

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.dbAPI = new DatabaseAPI(
      this.options.apiUrl)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'database-table'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.Database.Table'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

      selectedItem: null,
      guid: null,
      items: []

    }).then (() => {

      this.react.pushRenderExtension(this)

      this.react.setState({
        guid: this.guid()
      })
    })

    this.socketSvc.on('material.update',
      this.onUpdateItemSocket)

    this.socketSvc.connect()

    this.viewer.loadDynamicExtension(
      'Viewing.Extension.ContextMenu', {
        buildMenu: (menu) => {
          return menu.map((item) => {
            const title = item.title.toLowerCase()
            if (title === 'show all objects') {
              return {
                title: 'Show All objects',
                target: () => {
                  Toolkit.isolateFull(this.viewer)
                  this.viewer.fitToView()
                }
              }
            }
            return item
          })
        }
      })

    console.log('Viewing.Extension.Database.Table loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.Database.Table unloaded')

    this.socketSvc.off('material.update',
      this.onUpdateItemSocket)

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  buildMaterialMap (model, dbMaterials) {

    return new Promise(async(resolve, reject) => {

      try {

        const materialMap = {}

        const componentIds =
          await Toolkit.getLeafNodes(model)

        const materialPropResults =
          await Toolkit.getBulkPropertiesAsync(
            model, componentIds,
            this.options.materialCategories)

        const materialResults =
          materialPropResults.map((result) => {

            return Object.assign({},
              result.properties[0], {
                dbId: result.dbId
              })
          })

        const massPropResults =
          await Toolkit.getBulkPropertiesAsync(
            model, componentIds, ['Mass'])

        const massResults =
          massPropResults.map((result) => {

            return Object.assign({}, result.properties[0], {
              dbId: result.dbId
            })
          })

        componentIds.forEach((dbId) => {

          const materialProp = find(materialResults, { dbId })

          const materialName = materialProp ?
            materialProp.displayValue :
            null

          if(materialName !== 'undefined') {

            const dbMaterial = find(dbMaterials, {
              name: materialName
            })

            if (dbMaterial) {

              if (!materialMap[materialName]) {

                materialMap[materialName] = {
                  dbMaterial: dbMaterial,
                  components: [],
                  totalMass: 0.0,
                  totalCost: 0.0
                }
              }

              let item = materialMap[materialName]

              if (item) {

                const massProp = find(massResults, { dbId })

                const mass = massProp ? massProp.displayValue : 1.0

                item.totalMass += mass

                item.components.push(dbId)

                item.totalCost =
                  item.totalMass * this.toUSD(
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  toUSD (price, currency) {

    var pricef = parseFloat(price)

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
      default: return 0.0; //Unknown
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUpdateItem (item, externalUpdate) {

    if (item) {

      const state = this.react.getState()

      if (!externalUpdate) {

        this.dbAPI.postItem('rcdb', item)

        this.socketSvc.broadcast(
          'material.update',
          item)
      }

      const entry = this.materialMap[item.name]

      entry.dbMaterial = item

      entry.totalCost = entry.totalMass * this.toUSD(
        entry.dbMaterial.price,
        entry.dbMaterial.currency)

      const items = state.items.map((dbItem) => {

        return dbItem._id !== item._id
          ? dbItem
          : item
      })

      const guid = externalUpdate
          ? this.guid()
          : state.guid

      this.react.setState({ 
        items,
        guid
      })

      this.costBreakDownExtension.computeCost(
        this.materialMap)

      const dbProperties =
        this.buildViewerPanelProperties(
          item)

      this.viewerPropertiesExtension.updateProperties(
        dbProperties)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUpdateItemSocket (item) {

    this.onUpdateItem(item, true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectItem (item, propagate) {

    if (item) {

      const material = this.materialMap[item.name]

      const dbIds = material
        ? material.components
        : (item.components || [])

      this.viewer.fitToView(dbIds)

      Toolkit.isolateFull(
        this.viewer,
        dbIds)

    } else {

      Toolkit.isolateFull(
        this.viewer)

      this.viewer.fitToView()
    }

    this.react.setState({
      selectedItem: item
    })

    if (propagate) {

      this.costBreakDownExtension.setSelectedItem(item)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onModelCompletedLoad () {

    const materials =
      await this.dbAPI.getItems(
        this.options.database)

    this.materialMap = await this.buildMaterialMap (
      this.viewer.model,
      materials)

    const filteredMaterials =
      materials.filter((material) => {

        return (this.materialMap[material.name] != null)
      })

    this.react.setState({
      items: filteredMaterials,
      guid: this.guid()
    })

    this.costBreakDownExtension =
      this.viewer.getExtension(
        'Viewing.Extension.Database.CostBreakdown')

    this.costBreakDownExtension.on(
      'item.selected',
      this.onSelectItem)

    this.costBreakDownExtension.computeCost(
      this.materialMap)

    this.viewerPropertiesExtension =
      this.viewer.getExtension(
        'Viewing.Extension.ViewerProperties')

    this.viewerPropertiesExtension.on(
      'setProperties', (data) => {

        return this.onSetComponentProperties(
          data.properties,
          data.nodeId)
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSetComponentProperties (viewerProps, nodeId) {

    let materialName = null

    // filter out all 'Material' props because
    // it is added in 'Database' category
    let properties = viewerProps.filter((prop)=> {

      const included =
        this.options.materialCategories.includes(
          prop.displayName)

      if (included) {

        materialName = materialName || prop.displayValue
      }

      return !included
    })

    if (this.materialMap[materialName]) {

      const material = this.materialMap[
        materialName].dbMaterial

      const dbProperties =
        this.buildViewerPanelProperties(
          material)

      properties = [
        ...properties,
        ...dbProperties
      ]
    }

    return Promise.resolve(properties)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  buildViewerPanelProperties (material) {

    return [ {
      id: material._id + '-material',
      displayName: 'Material',
      displayValue: material.name,
      dataType: 'text',
      displayCategory: 'Database'
    },{
      id: material._id + '-supplier',
      displayName: 'Supplier',
      displayValue: material.supplier,
      dataType: 'text',
      displayCategory: 'Database'
    },{
      id: material._id + '-price',
      displayName: 'Price',
      displayValue: material.price,
      dataType: 'text',
      displayCategory: 'Database'
    },{
      id: material._id + '-currency',
      displayName: 'Currency',
      displayValue: material.currency,
      dataType: 'text',
      displayCategory: 'Database'
    }]
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Database
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onResize () {

    this.react.setState({
      guid: this.guid()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {guid, items, selectedItem} =
      this.react.getState()

    const showLoader = !items.length

    return (
      <div className="content">
        <Loader show={showLoader}/>
        <DBTable
          onSelectItem={this.onSelectItem}
          onUpdateItem={this.onUpdateItem}
          selectedItem={selectedItem}
          items={items}
          guid={guid}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts = {showTitle: true}) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>

        { this.renderContent() }

      </WidgetContainer>
    )
  }

  //async listMaterials(create = false, materials = null) {
  //
  //  const componentIds = await Toolkit.getLeafNodes(
  //    this.viewer.model)
  //
  //  var componentsMap = await Toolkit.mapComponentsByProp(
  //    this.viewer.model, 'Material', componentIds)
  //
  //  const keys = Object.keys(componentsMap)
  //
  //  console.log(keys)
  //
  //  if (create) {
  //
  //    keys.forEach((key) => {
  //
  //      if(!materials || materials.indexOf(key) > -1) {
  //
  //        this.dbAPI.postItem(this.options.database, {
  //          name: key,
  //          supplier: 'Autodesk',
  //          currency: 'USD',
  //          price: 1.0
  //        })
  //      }
  //    })
  //  }
  //}
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  DatabaseTableExtension.ExtensionId,
  DatabaseTableExtension)
