/// //////////////////////////////////////////////////////
// Viewing.Extension.PlantFactory
// by Philippe Leefsma, March 2017
//
/// //////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import './Viewing.Extension.PlantFactory.scss'
import WidgetContainer from 'WidgetContainer'
import { ReactLoader as Loader } from 'Loader'
import transform from 'lodash/transform'
import Toolkit from 'Viewer.Toolkit'
import React from 'react'
import d3 from 'd3'

import PropertyBarChart from './PropertyBarChart'
import PropertyPieChart from './PropertyPieChart'
import PropertyList from './PropertyList'

const stateInit = {
  viewport: {
    eye: [-1030.0044002713657, 689.6647995313627, 23.252165301460103],
    target: [-996.3266755707967, 710.4723026870788, -1.3707349423499071],
    up: [0.4493194129425462, 0.277608276267206, 0.849144104437472],
    worldUpVector: [0, 0, 1],
    pivotPoint: [-925.7424926757812, 757.1752319335938, -43.030099868774414],
    distanceToOrbit: 140.45651469798588,
    aspectRatio: 1.7655609631147542,
    projection: 'perspective',
    isOrthographic: false,
    fieldOfView: 48.981823953438095
  }
}

class PlantFactoryExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.onStopResize = this.onStopResize.bind(this)

    this.render = this.render.bind(this)

    this.react = options.react
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  get className () {
    return 'plant-factory'
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.PlantFactory'
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    this.viewer.setProgressiveRendering(true)

    window.addEventListener(
      'resize', this.onStopResize)

    this.react.setState({

      showLoader: true,

      // Project
      projectAreaData: [],
      projectDisciplineData: [],

      // Piping
      pipingSystemData: [],
      pipingPriorityData: [],
      pipingFabricationStatusData: [],
      pipingMaterialStatusData: [],
      pipingProgressData: [],
      pipingIWPData: [],

      // Foundation
      foundationStatusData: [],
      foundationIWPData: [],

      // Structure
      structureStatusData: [],
      structureProgressData: [],

      // Equipment
      equipmentTagData: [],
      equipmentROSData: [],

      // Instrumentation
      instrumentationTagData: [],

      // Electrical
      electricalStatusData: [],

      // Schedule
      scheduleActivitiesData: []

    }).then(() => {
      this.react.pushRenderExtension(this)
    })

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

    console.log('Viewing.Extension.PlantFactory loaded')

    return true
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.PlantFactory unloaded')

    window.removeEventListener(
      'resize', this.onStopResize)

    super.unload()

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onModelRootLoaded () {
    this.options.loader.show(false)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onToolbarCreated () {
    this.viewer.restoreState(stateInit)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async onModelCompletedLoad () {
    this.componentIds = await Toolkit.getLeafNodes(
      this.viewer.model)

    // const chartProperties =
    //  this.options.chartProperties ||
    //  await Toolkit.getPropertyList(
    //  this.viewer, this.componentIds)

    /// ////////////////////////////////////////////////
    // Project
    //
    /// ////////////////////////////////////////////////
    // Area - USER Yara : Yara Area (Pie)
    this.buildPropertyData('Yara Area').then(
      (projectAreaData) => {
        this.react.setState({
          projectAreaGuid: this.guid(),
          projectAreaData
        })
      })

    // Discipline - USER Yara : Yara Discipline (Pie)
    this.buildPropertyData('Yara Discipline').then(
      (projectDisciplineData) => {
        this.react.setState({
          projectDisciplineGuid: this.guid(),
          projectDisciplineData
        })
      })

    /// ////////////////////////////////////////////////
    // piping
    //
    /// ////////////////////////////////////////////////
    // System - WP : SystemName (Pie)
    this.buildPropertyData('SystemName').then(
      (pipingSystemData) => {
        this.react.setState({
          pipingSystemGuid: this.guid(),
          pipingSystemData
        })
      })

    // Priority - WP : ISO_Priority (Pie)
    this.buildPropertyData('ISO_Priority').then(
      (pipingPriorityData) => {
        this.react.setState({
          pipingPriorityGuid: this.guid(),
          pipingPriorityData
        })
      })

    // Fabrication Status - WP : Fab Status (Pie)
    this.buildPropertyData('Fab Status').then(
      (pipingFabricationStatusData) => {
        this.react.setState({
          pipingFabricationStatusGuid: this.guid(),
          pipingFabricationStatusData
        })
      })

    // Material Status - WP : PipeFieldMats (Pie)
    this.buildPropertyData('PipeFieldMats').then(
      (pipingMaterialStatusData) => {
        this.react.setState({
          pipingMaterialStatusGuid: this.guid(),
          pipingMaterialStatusData
        })
      })

    // Progress - WP : Cobra_AG_Pipe_P3 (Pie)
    this.buildPropertyData('Cobra_AG_Pipe_P3').then(
      (pipingProgressData) => {
        this.react.setState({
          pipingProgressGuid: this.guid(),
          pipingProgressData
        })
      })

    // IWP - WP : WorkPackName (List)
    this.buildPropertyData('WorkPackName').then(
      (pipingIWPData) => {
        this.react.setState({
          pipingIWPGuid: this.guid(),
          pipingIWPData
        })
      })

    /// ////////////////////////////////////////////////
    // foundation
    //
    /// ////////////////////////////////////////////////
    // Status - WP : Foundation_Status (Pie)
    this.buildPropertyData('Foundation_Status').then(
      (foundationStatusData) => {
        this.react.setState({
          foundationStatusGuid: this.guid(),
          foundationStatusData
        })
      })

    // IWP - WP : Foundation_IWP (List)
    this.buildPropertyData('Foundation_IWP').then(
      (foundationIWPData) => {
        this.react.setState({
          foundationIWPGuid: this.guid(),
          foundationIWPData
        })
      })

    /// ////////////////////////////////////////////////
    // Structure
    //
    /// ////////////////////////////////////////////////
    // Status - WP : Cobra_Sequence_Percent (Pie)
    this.buildPropertyData('Cobra_Sequence_Percent').then(
      (structureStatusData) => {
        this.react.setState({
          structureStatusGuid: this.guid(),
          structureStatusData
        })
      })

    // Progress - WP : Cobra_Sequence_ROC (Pie)
    this.buildPropertyData('Cobra_Sequence_ROC').then(
      (structureProgressData) => {
        this.react.setState({
          structureProgressGuid: this.guid(),
          structureProgressData
        })
      })

    /// ////////////////////////////////////////////////
    // Equipment
    //
    /// ////////////////////////////////////////////////
    // Tag - WP : Tag Number (List)
    this.buildPropertyData('Tag Number').then(
      (equipmentTagData) => {
        this.react.setState({
          equipmentTagGuid: this.guid(),
          equipmentTagData
        })
      })

    // ROS - WP : ActualReceipt (Line or Bar)
    this.buildPropertyData('ActualReceipt').then(
      (equipmentROSData) => {
        this.react.setState({
          equipmentROSGuid: this.guid(),
          equipmentROSData
        })
      })

    /// ////////////////////////////////////////////////
    // Instrumentation
    //
    /// ////////////////////////////////////////////////
    // Tag - WP : TAG NUMBER (List)
    this.buildPropertyData('TAG NUMBER').then(
      (instrumentationTagData) => {
        this.react.setState({
          instrumentationTagGuid: this.guid(),
          instrumentationTagData
        })
      })

    /// ////////////////////////////////////////////////
    // Electrical
    //
    /// ////////////////////////////////////////////////
    // Status - WP: Cobra_Tray (Pie)
    this.buildPropertyData('Cobra_Tray').then(
      (electricalStatusData) => {
        this.react.setState({
          electricalStatusGuid: this.guid(),
          electricalStatusData
        })
      })

    /// ////////////////////////////////////////////////
    // Schedule
    //
    /// ////////////////////////////////////////////////
    // Activities - WP : Activity Name (List)
    this.buildPropertyData('Activity Name').then(
      (scheduleActivitiesData) => {
        this.react.setState({
          scheduleActivitiesGuid: this.guid(),
          scheduleActivitiesData
        })
      })

    this.react.setState({
      showLoader: false
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  createMaterial (clrStr) {
    const clr = parseInt(clrStr.replace('#', ''), 16)

    const props = {
      shading: THREE.FlatShading,
      name: this.guid(),
      specular: clr,
      shininess: 0,
      emissive: 0,
      diffuse: 0,
      color: clr
    }

    const material = new THREE.MeshPhongMaterial(props)

    this.viewer.impl.matman().addMaterial(
      props.name, material, true)

    return material
  }

  /// //////////////////////////////////////////////////////
  // Group object map for small values:
  // If one entry of the map is smaller than minPercent,
  // this entry will be merged in the "group" entry
  //
  /// //////////////////////////////////////////////////////
  groupMap (map, group, totalValue, minPercent) {
    return transform(map, (result, value, key) => {
      if (value.length * 100 / totalValue < minPercent) {
        result[group] = (result[group] || []).concat(value)
      } else {
        result[key] = value
      }
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async buildPropertyData (propName) {
    var componentsMap = await Toolkit.mapComponentsByProp(
      this.viewer.model, propName,
      this.componentIds)

    for (const key in componentsMap) {
      if (!key.length || key.indexOf('<') > -1) {
        delete componentsMap[key]
      }
    }

    var groupedMap = this.groupMap(componentsMap, 'Other',
      this.componentIds.length, 2.0)

    var keys = Object.keys(groupedMap)

    var colors = d3.scale.linear()
      .domain([0, keys.length * 0.33, keys.length * 0.66, keys.length])
      .range(['#FCB843', '#C2149F', '#0CC4BD', '#0270E9'])

    const data = keys.map((key, index) => {
      var dbIds = groupedMap[key]

      var color = colors(index)

      const percent = 100 * dbIds.length / this.componentIds.length

      return {
        label: `${key}: ${percent.toFixed(2)}% (${dbIds.length})`,
        material: this.createMaterial(color),
        value: dbIds.length,
        shortLabel: key,
        percent,
        dbIds,
        color,
        index
      }
    })

    return data
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onStopResize () {
    this.react.setState({

      // project
      projectAreaGuid: this.guid(),
      projectDisciplineGuid: this.guid(),

      // piping
      pipingSystemGuid: this.guid(),
      pipingPriorityGuid: this.guid(),
      pipingFabricationStatusGuid: this.guid(),
      pipingMaterialStatusGuid: this.guid(),
      pipingProgressGuid: this.guid(),
      pipingIWPGuid: this.guid(),

      // foundation
      foundationStatusGuid: this.guid(),
      foundationIWPGuid: this.guid(),

      // Structure
      structureStatusGuid: this.guid(),
      structureProgressGuid: this.guid(),

      // Equipment
      equipmentTagGuid: this.guid(),
      equipmentROSGuid: this.guid(),

      // Instrumentation
      instrumentationTagGuid: this.guid(),

      // Electrical
      electricalStatusGuid: this.guid(),

      // Schedule
      scheduleActivitiesGuid: this.guid()
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const state = this.react.getState()

    const style = state.showLoader ? {
      overflow: 'hidden',
      height: '100%'
    } : {}

    return (
      <div className={this.className} style={style}>

        <Loader show={state.showLoader} />

        <WidgetContainer title='Project'>
          <PropertyPieChart
            title='Area'
            style={{ float: 'left', width: '50%' }}
            guid={state.projectAreaGuid}
            data={state.projectAreaData}
            viewer={this.viewer}
          />

          <PropertyPieChart
            title='Discipline'
            style={{ float: 'left', width: '50%' }}
            guid={state.projectDisciplineGuid}
            data={state.projectDisciplineData}
            viewer={this.viewer}
          />
        </WidgetContainer>

        <WidgetContainer title='Piping'>
          <PropertyPieChart
            title='System'
            style={{ float: 'left', width: '50%' }}
            guid={state.pipingSystemGuid}
            data={state.pipingSystemData}
            viewer={this.viewer}
          />

          <PropertyPieChart
            title='Priority'
            style={{ float: 'left', width: '50%' }}
            guid={state.pipingPriorityGuid}
            data={state.pipingPriorityData}
            viewer={this.viewer}
          />

          <PropertyPieChart
            title='Fabrication Status'
            style={{ float: 'left', width: '50%' }}
            guid={state.pipingFabricationStatusGuid}
            data={state.pipingFabricationStatusData}
            viewer={this.viewer}
          />

          <PropertyPieChart
            title='Material Status'
            style={{ float: 'left', width: '50%' }}
            guid={state.pipingMaterialStatusGuid}
            data={state.pipingMaterialStatusData}
            viewer={this.viewer}
          />

          <PropertyPieChart
            title='Progress'
            style={{ float: 'left', width: '50%' }}
            guid={state.pipingProgressGuid}
            data={state.pipingProgressData}
            viewer={this.viewer}
          />

          <PropertyList
            title='IWP'
            style={{
              width: 'calc(50% - 0px)',
              position: 'relative',
              float: 'left',
              left: '-10px'
            }}
            guid={state.pipingIWPGuid}
            data={state.pipingIWPData}
            viewer={this.viewer}
          />
        </WidgetContainer>

        <WidgetContainer title='Foundation'>
          <PropertyPieChart
            title='Status'
            style={{ float: 'left', width: '50%' }}
            guid={state.foundationStatusGuid}
            data={state.foundationStatusData}
            viewer={this.viewer}
          />

          <PropertyList
            title='IWP'
            style={{
              width: 'calc(50% - 0px)',
              position: 'relative',
              float: 'left',
              left: '-10px'
            }}
            guid={state.foundationIWPGuid}
            data={state.foundationIWPData}
            viewer={this.viewer}
          />
        </WidgetContainer>

        <WidgetContainer title='Structure'>
          <PropertyPieChart
            title='Status'
            style={{ float: 'left', width: '50%' }}
            guid={state.structureStatusGuid}
            data={state.structureStatusData}
            viewer={this.viewer}
          />

          <PropertyPieChart
            title='Progress'
            style={{ float: 'left', width: '50%' }}
            guid={state.structureProgressGuid}
            data={state.structureProgressData}
            viewer={this.viewer}
          />
        </WidgetContainer>

        <WidgetContainer title='Equipment'>
          <PropertyList
            title='Tag'
            style={{
              width: 'calc(100% - 20px)',
              position: 'relative',
              float: 'left',
              left: '10px'
            }}
            guid={state.equipmentTagGuid}
            data={state.equipmentTagData}
            viewer={this.viewer}
          />

          <PropertyBarChart
            title='ROS'
            style={{ float: 'left', width: '100%' }}
            guid={state.equipmentROSGuid}
            data={state.equipmentROSData}
            viewer={this.viewer}
          />
        </WidgetContainer>

        <WidgetContainer
          title='Instrumentation'
          style={{
            float: 'left',
            width: '50%'
          }}
        >
          <PropertyPieChart
            title='Tag'
            guid={state.instrumentationTagGuid}
            data={state.instrumentationTagData}
            viewer={this.viewer}
          />
        </WidgetContainer>

        <WidgetContainer
          title='Electrical'
          style={{
            float: 'left',
            width: '50%'
          }}
        >
          <PropertyPieChart
            title='Status'
            guid={state.electricalStatusGuid}
            data={state.electricalStatusData}
            viewer={this.viewer}
          />
        </WidgetContainer>

        <WidgetContainer title='Schedule'>
          <PropertyList
            title='Activities'
            style={{
              width: 'calc(100% - 20px)',
              position: 'relative',
              float: 'left',
              left: '10px'
            }}
            guid={state.scheduleActivitiesGuid}
            data={state.scheduleActivitiesData}
            viewer={this.viewer}
          />
        </WidgetContainer>
      </div>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  PlantFactoryExtension.ExtensionId,
  PlantFactoryExtension)
