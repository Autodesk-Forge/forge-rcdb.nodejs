import CustomPropertyExtension from 'Viewing.Extension.CustomProperty'
import StateManagerExtension from 'Viewing.Extension.StateManager'
import VisualReportExtension from 'Viewing.Extension.VisualReport'
import Markup3DExtension from 'Viewing.Extension.Markup3D'
import ViewerToolkit from 'Viewer.Toolkit'
import JQueryLayout from './JQueryLayout'
import ServiceManager from 'SvcManager'
import SplitLayout from './SplitLayout'
import FlexLayout from './FlexLayout'
import GridLayout from './GridLayout'
import './ViewerView.scss'
import React from 'react'
import d3 from 'd3'

class ViewerView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()

    this.materialSvc = ServiceManager.getService(
      'MaterialSvc')

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.eventSvc = ServiceManager.getService(
      'EventSvc')

    this.viewerEnvInitialized = false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  state = {
    selectedDbItem: null,
    filteredDbItems:[],
    chartData:[]
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentDidMount () {

    try {

      this.socketSvc.connect().then(() => {

        this.socketSvc.on('update.dbItem',
          (updatedDbItem) => {

            this.updateDbItem(updatedDbItem)
          })
      })

      this.materialSvc.getMaterials(
        'forge-rcdb').then((materials) => {

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
  onUpdateDbItem (updatedDbItem) {

    this.materialSvc.postMaterial(
      'forge-rcdb',
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

    let entry = this.materialMap[updatedDbItem.name]

    entry.dbMaterial = updatedDbItem

    entry.totalCost = entry.totalMass * this.toUSD(
      entry.dbMaterial.price,
      entry.dbMaterial.currency)

    const chartData = this.buildChartData(
      this.materialMap,
      'totalCost')

    const filteredDbItems = this.state.filteredDbItems.map(
      (dbItem) => {

        return dbItem._id === updatedDbItem._id ?
          updatedDbItem : dbItem
      })

    this.setState(Object.assign({}, this.state, {
      filteredDbItems,
      chartData
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectDbItem (selectedDbItem, propagate = true) {

    const item = this.materialMap[selectedDbItem.name]

    const dbIds = item ? item.components : []

    this.viewer.fitToView(dbIds)
    this.viewer.isolate(dbIds)

    if(propagate) {

      this.setState(Object.assign({}, this.state, {
        selectedDbItem
      }))
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onChartClicked (item) {

    const dbIds = item ? item.components : []

    this.viewer.fitToView(dbIds)
    this.viewer.isolate(dbIds)
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
  async onViewerCreated (data) {

    try {

      const { viewer, initialize, loadDocument } = data

      viewer.addEventListener(
        Autodesk.Viewing.FULLSCREEN_MODE_EVENT, (e) => {

          this.onFullScreenMode(e)
      })

      const modelId = this.props.location.query.id

      this.model = await this.modelSvc.getModel(
        'forge-rcdb',
        modelId)

      if(!this.viewerEnvInitialized) {

        this.viewerEnvInitialized = true

        await initialize(
          this.model.env,
          '/api/forge/token/2legged')
      }

      viewer.start()

      switch (this.model.env) {

        case 'Local':

          viewer.load(this.model.path)

          break

        case 'AutodeskProduction':

          const doc = await loadDocument(
            'urn:' + this.model.urn)

          const path = ViewerToolkit.getDefaultViewablePath(doc)

          viewer.loadModel(path)

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

      const removedControls = [
        '#navTools',
        '#toolbar-panTool',
        '#toolbar-zoomTool',
        '#toolbar-settingsTool',
        '#toolbar-firstPersonTool',
        '#toolbar-cameraSubmenuTool'
      ]

      $(removedControls.join(',')).css({display:'none'})

      var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
      ' forge-rcdb-toolbar')

      var viewerToolbar = viewer.getToolbar(true)

      viewerToolbar.addControl(ctrlGroup)

      viewer.resize()

      viewer.loadExtension(CustomPropertyExtension, {
        getCustomProperties: (nodeId) => {
          return this.getCustomProperties(nodeId)
        }
      })

      viewer.loadExtension(VisualReportExtension, {
        container: $('.viewer-view')[0],
        parentControl: ctrlGroup
      })

      viewer.setLightPreset(1)

      console.log()

      setTimeout(()=> {
        viewer.setLightPreset(0)

        const appState = this.props.appState

        const bgClr = appState.theme.viewer.backgroundColor

        viewer.setBackgroundColor(
          bgClr[0], bgClr[1], bgClr[2],
          bgClr[0], bgClr[1], bgClr[2])
      }, 600)

      viewer.loadExtension(StateManagerExtension, {
        apiUrl: `/api/models/${'forge-rcdb'}`,
        container: $('.viewer-view')[0],
        parentControl: ctrlGroup,
        model: this.model
      })

      viewer.loadExtension(Markup3DExtension, {
        parentControl: ctrlGroup
      })

      if (!this.materialMap) {

        this.materialMap = await this.buildMaterialMap (
          viewer, this.props.dbItems)

        //console.log(this.materialMap)

        const filteredDbItems =
          this.props.dbItems.filter((item) => {
            return (this.materialMap[item.name] != null)
          })

        const chartData = this.buildChartData(
          this.materialMap,
          'totalCost')

        this.setState(Object.assign({}, this.state, {
          filteredDbItems,
          chartData
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
  getCustomProperties (nodeId) {

    return new Promise(async(resolve, reject) => {

      try {

        const prop = await ViewerToolkit.getProperty(
          this.viewer.model, nodeId, 'Material')

        const material = this.materialMap[
          prop.displayValue].dbMaterial

        resolve([ {
            name: 'Material',
            value: material.name,
            dataType: 'text',
            category: 'Database'
          },{
            name: 'Supplier',
            value: material.supplier,
            dataType: 'text',
            category: 'Database'
          },{
            name: 'Price',
            value: material.price,
            dataType: 'text',
            category: 'Database'
          },{
            name: 'Currency',
            value: material.currency,
            dataType: 'text',
            category: 'Database'
          }
        ])

      } catch (ex) {

        reject(ex)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  buildMaterialMap (viewer, dbMaterials) {

    return new Promise(async(resolve, reject) => {

      try {

        let materialMap = {}

        const componentIds = await ViewerToolkit.getLeafNodes(
          viewer.model)

        let materialTasks = componentIds.map((dbId) => {

          return ViewerToolkit.getProperty(
            viewer.model, dbId, (propName) => {
              return (propName.indexOf('Material') > -1)
            }, 'undefined')
        })

        let materials = await Promise.all(materialTasks)

        let massTasks = componentIds.map((dbId) => {

          return ViewerToolkit.getProperty(
            viewer.model, dbId, 'Mass', 1.0)
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
  buildChartData (materialMap, fieldName) {

    var keys = Object.keys (materialMap)

    var colors = d3.scale.linear()
      .domain([0, keys.length * .33, keys.length * .66, keys.length])
      .range(['#B58929', '#C61C6F', '#268BD2', '#85992C'])

    let totalCost = 0.0
    let totalMass = 0.0

    for(let key in materialMap) {

      const item = materialMap[key]

      totalCost += item.totalCost
      totalMass += item.totalMass
    }

    const chartData = keys.map((key, idx) => {

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
        {text: `% ${costPercent}`, spacing: 160},
        {text: `$USD ${cost}`, spacing: 210},
      ]

      return {
        value: parseFloat(item[fieldName].toFixed(2)),
        color: colors(idx),
        legendLabel,
        label,
        item
      }
    })

    return _.sortBy(chartData,
      (entry) => {
        return entry.value * -1.0
      })
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

    const {layoutType} = this.props.appState

    switch (layoutType) {

      case 'gridLayout':

        return (
          <div className="viewer-view">
            <GridLayout
              onSelectDbItem={(dbItem, src) => this.onSelectDbItem(dbItem, src)}
              onUpdateDbItem={(dbItem) => this.onUpdateDbItem(dbItem)}
              onModelLoaded={(viewer) => this.onModelLoaded(viewer)}
              onViewerCreated={(data) => this.onViewerCreated(data)}
              onChartClicked={(data) => this.onChartClicked(data)}
              filteredDbItems={this.state.filteredDbItems}
              selectedDbItem={this.state.selectedDbItem}
              chartData={this.state.chartData}
              dbItems={this.props.dbItems}
            />
          </div>
        )

      case 'splitLayoutRight':
      case 'splitLayoutLeft':

        return (
          <div className="viewer-view">
            <SplitLayout
              onSelectDbItem={(dbItem, propagate) => this.onSelectDbItem(dbItem, propagate)}
              onUpdateDbItem={(dbItem) => this.onUpdateDbItem(dbItem)}
              onModelLoaded={(viewer) => this.onModelLoaded(viewer)}
              onViewerCreated={(data) => this.onViewerCreated(data)}
              onChartClicked={(data) => this.onChartClicked(data)}
              filteredDbItems={this.state.filteredDbItems}
              selectedDbItem={this.state.selectedDbItem}
              chartData={this.state.chartData}
              dbItems={this.props.dbItems}
              layoutType={layoutType}
            />
          </div>
        )

      case 'flexLayoutRight':
      case 'flexLayoutLeft':

        return (
          <div className="viewer-view">
            <FlexLayout
              onSelectDbItem={(dbItem, propagate) => this.onSelectDbItem(dbItem, propagate)}
              onUpdateDbItem={(dbItem) => this.onUpdateDbItem(dbItem)}
              onModelLoaded={(viewer) => this.onModelLoaded(viewer)}
              onViewerCreated={(data) => this.onViewerCreated(data)}
              onChartClicked={(data) => this.onChartClicked(data)}
              filteredDbItems={this.state.filteredDbItems}
              selectedDbItem={this.state.selectedDbItem}
              chartData={this.state.chartData}
              dbItems={this.props.dbItems}
              layoutType={layoutType}
            />
          </div>
        )

      case 'jqueryLayoutRight':
      case 'jqueryLayoutLeft':

        return (
          <div className="viewer-view">
            <JQueryLayout
              onSelectDbItem={(dbItem, propagate) => this.onSelectDbItem(dbItem, propagate)}
              onUpdateDbItem={(dbItem) => this.onUpdateDbItem(dbItem)}
              onModelLoaded={(viewer) => this.onModelLoaded(viewer)}
              onViewerCreated={(data) => this.onViewerCreated(data)}
              onChartClicked={(data) => this.onChartClicked(data)}
              filteredDbItems={this.state.filteredDbItems}
              selectedDbItem={this.state.selectedDbItem}
              chartData={this.state.chartData}
              dbItems={this.props.dbItems}
              layoutType={layoutType}
            />
          </div>
        )
    }
  }
}

export default ViewerView


//  //this.viewer.loadExtension(CanvasInfoExtension, {
//  //  materials: this.props.dbItems,
//  //  parentControl: ctrlGroup,
//  //  autoShow: true
//  //})
//
//  this.eventSvc.on('updateDbItem', (updatedDbItem) => {
//
//    const canvasInfoExt = this.viewer.getExtension(
//      CanvasInfoExtension)
//
//    canvasInfoExt.updateMaterial(updatedDbItem)
//  })
//
//  //setInterval(()=> {
//  //
//  //  var idx = Math.floor((Math.random() * 100)%this.props.dbItems.length)
//  //
//  //  var m = this.props.dbItems[idx]
//  //
//  //  m.price = Math.random() * 100
//  //
//  //  this.updateMaterial(m)
//  //
//  //}, 1000)
//
//  //const componentIds = await ViewerToolkit.getLeafNodes(
//  //  this.viewer.model)
//  //
//  //var componentsMap = await ViewerToolkit.mapComponentsByProp(
//  //  this.viewer.model,
//  //  'Material',
//  //  componentIds);
//  //
//  //const materialSvc = ServiceManager.getService(
//  //  'MaterialSvc')
//  //
//  //Object.keys(componentsMap).forEach(async(key) => {
//  //
//  //  const res = await materialSvc.postMaterial('forge-rcdb', {
//  //    name: key,
//  //    supplier: 'Autodesk',
//  //    currency: 'USD',
//  //    price: 1.0
//  //  })
//  //
//  //  console.log(res)
//  //})
//})

