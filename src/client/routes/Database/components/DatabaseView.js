import MetaPropertyExtension from 'Viewing.Extension.MetaProperty'
import StateManagerExtension from 'Viewing.Extension.StateManager'
import VisualReportExtension from 'Viewing.Extension.VisualReport'
import ContextMenuExtension from 'Viewing.Extension.ContextMenu'
import TransformExtension from 'Viewing.Extension.Transform'
import Markup3DExtension from 'Viewing.Extension.Markup3D'

import ServiceManager from 'SvcManager'
import FlexLayout from './FlexLayout'
import GridLayout from './GridLayout'
import Toolkit from 'Viewer.Toolkit'
import { Loader } from 'Loader'
import './DatabaseView.scss'
import React from 'react'
import d3 from 'd3'

class DatabaseView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()

    this.onUpdatedDbItem = this.onUpdatedDbItem.bind(this)

    this.state = {
      selectedDbItem: null,
      filteredDbItems:[],
      legendData:[],
      pieData: []
    }

    this.materialSvc = ServiceManager.getService(
      'MaterialSvc')

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    this.props.setNavbarState({
      links: {
        settings: true
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    try {

      this.mounted = true

      this.socketSvc.on('update.dbItem',
        this.onUpdatedDbItem)

      this.materialSvc.getMaterials(
        'rcdb').then((materials) => {

          this.props.loadDbItems(materials)
        })

    } catch(ex) {

      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUpdatedDbItem (dbItem) {

    this.updateDbItem(dbItem)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    this.socketSvc.off('update.dbItem',
      this.onUpdatedDbItem)

    this.materialSvc.off()

    this.mounted = false
  }

  ///////////////////////////////////////////////////////////////////
  // Async viewer event: returns a promise that resolves when the
  // specified event is fired.
  // Removes event handler automatically
  //
  ///////////////////////////////////////////////////////////////////
  viewerEvent (viewer, event) {

    return new Promise((resolve, reject) => {

      const handler = (e) => {
        viewer.removeEventListener(event, handler)
        resolve(e)
      }

      viewer.addEventListener(event, handler)
    })
  }

  /////////////////////////////////////////////////////////
  // Initialize viewer environment
  //
  /////////////////////////////////////////////////////////
  initialize (options) {

    return new Promise((resolve, reject) => {

      Autodesk.Viewing.Initializer (options, () => {

        resolve ()

      }, (error) => {

        reject (error)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUpdateDbItem (updatedDbItem) {

    this.materialSvc.postMaterial(
      'rcdb',
      updatedDbItem)

    this.socketSvc.broadcast(
      'update.dbItem',
      updatedDbItem)

    this.updateDbItem(updatedDbItem)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateDbItem (updatedDbItem) {

    if (updatedDbItem && this.mounted) {

      let entry = this.materialMap[ updatedDbItem.name ]

      entry.dbMaterial = updatedDbItem

      entry.totalCost = entry.totalMass * this.toUSD(
        entry.dbMaterial.price,
        entry.dbMaterial.currency)

      const legendData = this.buildLegendData(
        this.materialMap,
        'totalCost')

      const pieData = this.groupDataSmallerThan(
        legendData,
        5.0)

      const filteredDbItems = this.state.filteredDbItems.map(
        (dbItem) => {

          return dbItem._id === updatedDbItem._id ?
            updatedDbItem : dbItem
        })

      this.setState(Object.assign({}, this.state, {
        filteredDbItems,
        legendData,
        pieData
      }))

      const dbProperties = this.buildViewerPanelProperties(
        updatedDbItem)

      const metaPropExtension =
        this.viewer.getExtension(MetaPropertyExtension)

      if (metaPropExtension) {

        metaPropExtension.updateProperties(
          dbProperties)
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectDbItem (selectedDbItem, propagate = true) {

    if (selectedDbItem) {

      const item = this.materialMap[selectedDbItem.name]

      const dbIds = item
        ? item.components
        : (selectedDbItem.components || [])

      this.viewer.fitToView(dbIds)

      Toolkit.isolateFull(
        this.viewer,
        dbIds)

      if (item && propagate) {

        this.setState(Object.assign({}, this.state, {
          selectedDbItem
        }))
      }

    } else {

      Toolkit.isolateFull(
        this.viewer)

      this.viewer.fitToView()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onFullScreenMode (e) {

    console.log(e)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (viewer) {

    try {

      this.loader = new Loader(viewer.container, {
        autoLoad: true
      })

      viewer.addEventListener(
        Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (e) => {

          this.loader.show(false)
        })

      const events = [

        this.viewerEvent(viewer,
          Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT),

        this.viewerEvent(viewer,
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT)
      ]

      Promise.all(events).then(() => {

        this.onModelLoaded(viewer)
      })

      viewer.addEventListener(
        Autodesk.Viewing.FULLSCREEN_MODE_EVENT, (e) => {

          this.onFullScreenMode(e)
      })

      const modelId = this.props.location.query.id

      this.dbModel = await this.modelSvc.getModel(
        'rcdb', modelId)

      if(!this.props.appState.viewerEnv) {

        await this.initialize({
          env: this.dbModel.env,
          useConsolidation: true
        })

        this.props.setViewerEnv(this.dbModel.env)

        Autodesk.Viewing.setEndpointAndApi(
          window.location.origin + '/lmv-proxy-2legged',
          'modelDerivativeV2')

        Autodesk.Viewing.Private.memoryOptimizedSvfLoading = true
      }

      viewer.start()

      viewer.prefs.tag('ignore-producer')

      switch (this.dbModel.env) {

        case 'Local':

          viewer.loadModel(this.dbModel.path)

          break

        case 'AutodeskProduction':

          const doc = await Toolkit.loadDocument(
            'urn:' + this.dbModel.urn)

          const items = Toolkit.getViewableItems(doc)

          if (items.length) {

            const path = doc.getViewablePath(items[0])

            viewer.loadModel(path)
          }

          break
      }

      this.viewer = viewer

    } catch(ex) {

      console.log('Viewer Initialization Error: ')
      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onModelLoaded (viewer) {

    try {

      //this.listMaterials (false) //["Brick", "Concrete", "Steel", "Wood", "Aluminum", "Glass", "Copper"])

      const modelOptions = this.dbModel.options || {
          removedControls: [
            '#navTools',
            '#toolbar-settingsTool'
          ],
          retargetedControls: [

          ]
        }

      const removedControls =
        modelOptions.removedControls || []

      $(removedControls.join(',')).css({
        display:'none'
      })

      const retargetedControls =
        modelOptions.retargetedControls || []

      retargetedControls.forEach((ctrl) => {

        var $ctrl = $(ctrl.id).detach()

        $(ctrl.parentId).append($ctrl)
      })

      var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
      ' forge-rcdb-toolbar')

      var viewerToolbar = viewer.getToolbar(true)

      viewerToolbar.addControl(ctrlGroup)

      viewer.resize()

      viewer.loadExtension(ContextMenuExtension, {

        buildMenu: (menu, selectedDbId) => {

          if (!selectedDbId) {

            return [{
              title: 'Show all objects',
              target: () => {

                Toolkit.isolateFull(viewer)
              }
            }]

          } else {

            return menu
          }
        }
      })

      viewer.loadExtension(MetaPropertyExtension)

      const metaPropExtension = viewer.getExtension(
        MetaPropertyExtension)

      metaPropExtension.on('setProperties', (data) => {

        return this.onSetComponentProperties(
          data.properties,
          data.nodeId)
      })

      viewer.loadExtension(VisualReportExtension,
        Object.assign({}, {
          container: $('.viewer-view')[0],
          parentControl: ctrlGroup
        }, modelOptions.visualReport))

      viewer.setLightPreset(1)

      const appState = this.props.appState

      const bgClr = appState.storage.theme.viewer.backgroundColor

      viewer.setBackgroundColor(
        bgClr[0], bgClr[1], bgClr[2],
        bgClr[3], bgClr[4], bgClr[5])

      viewer.loadExtension(StateManagerExtension, {
        parentControl: ctrlGroup,
        dbModel: this.dbModel,
        database: 'rcdb',
        apiUrl: `/api`
      })

      viewer.loadExtension(TransformExtension,
        Object.assign({}, {
          container: $('.viewer-view')[0],
          parentControl: ctrlGroup
        }, modelOptions.transform))

      viewer.loadExtension(Markup3DExtension,
        Object.assign({}, {
          parentControl: ctrlGroup
        }, modelOptions.markup3D))

      if (!this.materialMap) {

        this.materialMap = await this.buildMaterialMap (
          viewer, this.props.dbItems)

        const filteredDbItems =
          this.props.dbItems.filter((item) => {
            return (this.materialMap[item.name] != null)
          })

        const legendData = this.buildLegendData(
          this.materialMap,
          'totalCost')

        const pieData = this.groupDataSmallerThan(
          legendData,
          5.0)

        this.setState(Object.assign({}, this.state, {
          filteredDbItems,
          legendData,
          pieData
        }))
      }

    } catch(ex) {

      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onSetComponentProperties (viewerProps, nodeId) {

    let materialName = null

    // filter out all 'Material' props because
    // it is added in 'Database' category
    let properties = _.filter(viewerProps, (prop)=> {

      const included =
        this.dbModel.materialCategories.includes(
          prop.displayName)

      if (included) {

        materialName = materialName || prop.displayValue
      }

      return !included
    })

    //console.log(viewerProps.map((p) => p.displayName))
    //console.log(materialName)

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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  buildMaterialMap (viewer, dbMaterials) {

    return new Promise(async(resolve, reject) => {

      try {

        let materialMap = {}

        const componentIds = await Toolkit.getLeafNodes(viewer.model)

        const materialPropResults = await Toolkit.getBulkPropertiesAsync(
          viewer.model, componentIds,
          this.dbModel.materialCategories)

        const materialResults = materialPropResults.map((result) => {

          return Object.assign({}, result.properties[0], {
            dbId: result.dbId
          })
        })

        const massPropResults = await Toolkit.getBulkPropertiesAsync(
          viewer.model, componentIds, ['Mass'])

        const massResults = massPropResults.map((result) => {

          return Object.assign({}, result.properties[0], {
            dbId: result.dbId
          })
        })

        componentIds.forEach((dbId) => {

          const materialProp = _.find(materialResults, { dbId })

          const materialName = materialProp ?
            materialProp.displayValue :
            null

          if(materialName !== 'undefined') {

            const dbMaterial = _.find(dbMaterials, {
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

                const massProp = _.find(massResults, { dbId })

                const mass = massProp ? massProp.displayValue : 1.0

                item.totalMass += mass

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
  buildLegendData (materialMap, fieldName) {

    const keys = Object.keys (materialMap)

    const colors = d3.scale.linear()
      .domain([0, keys.length * .33, keys.length * .66, keys.length])
      .range(['#FCB843', '#C2149F', '#0CC4BD', '#0270E9'])

    let totalCost = 0.0
    let totalMass = 0.0

    for (let key in materialMap) {

      const item = materialMap[key]

      totalCost += item.totalCost
      totalMass += item.totalMass
    }

    const legendData = keys.map((key, idx) => {

      const item = materialMap[key]

      const cost = item.totalCost.toFixed(2)
      const mass = item.totalMass.toFixed(2)

      const costPercent = (item.totalCost * 100 / totalCost).toFixed(2)
      const massPercent = (item.totalMass * 100 / totalMass).toFixed(2)

      const label = fieldName === 'totalCost' ?
        `${key}: ${costPercent}% (${cost} USD)` :
        `${key}: ${massPercent}% (${mass} Kg)`

      const legendLabel = [
        {text: key, spacing: 0},
        {text: `% ${costPercent}`, spacing: 190},
        {text: `$USD ${cost}`, spacing: 250}
      ]

      return {
        value: parseFloat(item[fieldName].toFixed(2)),
        percent: item.totalCost * 100 / totalCost,
        color: colors(idx),
        legendLabel,
        label,
        item
      }
    })

    return _.sortBy(legendData,
      (entry) => {
        return entry.value * -1.0
      })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  groupDataSmallerThan (data, threshold) {

    const groupedData = []

    let otherData = {
      value: 0,
      percent: 0,
      item: {
        components: []
      }
    }

    data.forEach((entry) => {

      if (entry.percent < threshold) {

        const components = [
          ...otherData.item.components,
          ...entry.item.components
        ]

        const percent = otherData.percent + entry.percent

        const value = otherData.value + entry.value

        const label = `Other materials: ` +
          `${percent.toFixed(2)}% ` +
          `(${value.toFixed(2)} USD)`

        otherData = Object.assign({}, entry, {
          percent,
          label,
          value,
          item: {
            components
          }
        })

      } else {

        groupedData.push(entry)
      }
    })

    if (otherData.value > 0) {

      groupedData.push(otherData)
    }

    return groupedData
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
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
  render() {

    const { layoutType } = this.props.appState.storage

    switch (layoutType) {

      case 'gridLayout':

        return (
          <div className="viewer-view">
            <GridLayout
              onSelectDbItem={(dbItem, src) => this.onSelectDbItem(dbItem, src)}
              onViewerCreated={(viewer) => this.onViewerCreated(viewer)}
              onUpdateDbItem={(dbItem) => this.onUpdateDbItem(dbItem)}
              onChartClicked={(data) => this.onSelectDbItem(data)}
              filteredDbItems={this.state.filteredDbItems}
              selectedDbItem={this.state.selectedDbItem}
              legendData={this.state.legendData}
              pieData={this.state.pieData}
              dbItems={this.props.dbItems}
            />
          </div>
        )

      case 'flexLayoutRight':
      case 'flexLayoutLeft':
      default:

        return (
          <div className="viewer-view">
            <FlexLayout
              onSelectDbItem={(dbItem, propagate) => this.onSelectDbItem(dbItem, propagate)}
              onViewerCreated={(viewer) => this.onViewerCreated(viewer)}
              onUpdateDbItem={(dbItem) => this.onUpdateDbItem(dbItem)}
              onChartClicked={(data) => this.onSelectDbItem(data)}
              filteredDbItems={this.state.filteredDbItems}
              selectedDbItem={this.state.selectedDbItem}
              legendData={this.state.legendData}
              pieData={this.state.pieData}
              dbItems={this.props.dbItems}
              layoutType={layoutType}
            />
          </div>
        )
    }
  }

  async listMaterials(create = false, materials = null) {

    const componentIds = await Toolkit.getLeafNodes(
      this.viewer.model)

    var componentsMap = await Toolkit.mapComponentsByProp(
      this.viewer.model, 'Material', componentIds)

    const keys = Object.keys(componentsMap)

    console.log(keys)

    if (create) {

      const materialSvc = ServiceManager.getService('MaterialSvc')

      keys.forEach((key) => {

        if(!materials || materials.indexOf(key) > -1) {

          materialSvc.postMaterial('rcdb', {
            name: key,
            supplier: 'Autodesk',
            currency: 'USD',
            price: 1.0
          })
        }
      })
    }
  }
}

export default DatabaseView


