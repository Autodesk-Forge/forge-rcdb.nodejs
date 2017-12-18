/////////////////////////////////////////////////////////
// Viewing.Extension.PointCloudMarkup
// by Philippe Leefsma, Dec 2017
//
/////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import PointCloudMarkupItem from './PointCloudMarkupItem'
import {OverlayTrigger, Popover} from 'react-bootstrap'
import './Viewing.Extension.PointCloudMarkup.scss'
import PointCloudMarkup from './PointCloudMarkup'
import WidgetContainer from 'WidgetContainer'
import {ReactLoader as Loader} from 'Loader'
import ViewerTooltip from 'Viewer.Tooltip'
import EventTool from 'Viewer.EventTool'
import 'rc-tooltip/assets/bootstrap.css'
import 'rc-slider/assets/index.css'
import Tooltip from 'rc-tooltip'
import Slider from 'rc-slider'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'

class PointCloudMarkupExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onMarkupSettingsChanged = this.onMarkupSettingsChanged.bind(this)
    this.onMarkupSizeChanged = this.onMarkupSizeChanged.bind(this)
    this.onMarkupOcclusion = this.onMarkupOcclusion.bind(this)
    this.onMarkupsUpdated = this.onMarkupsUpdated.bind(this)
    this.onMarkupRemoved = this.onMarkupRemoved.bind(this)
    this.onMarkupClicked = this.onMarkupClicked.bind(this)
    this.onMarkupVisible = this.onMarkupVisible.bind(this)
    this.onClick = this.onClick.bind(this)

    this.tooltip = new ViewerTooltip(this.viewer, {
      stroke: 'orange',
      fill: 'orange'
    })

    this.tooltip.setContent(`
      <div id="pointcloud-tooltipId" class="pointcloud-tooltip">
          Specify markup position ...
      </div>`, '#pointcloud-tooltipId')

    this.eventTool = new EventTool(
      this.viewer)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'pointcloud-markup'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.PointCloudMarkup'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.options.loader.show(false)

    this.react.setState({

      showLoader: true,
      markups: []

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    this.eventTool.on ('singleclick', this.onClick)

    this.eventTool.activate()

    console.log('Viewing.Extension.PointCloudMarkup loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.PointCloudMarkup unloaded')

    this.pointCloudMarkup.destroy ()

    this.eventTool.deactivate ()

    this.eventTool.off ()

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onObjectTreeCreated () {

    this.pointCloudMarkup = new PointCloudMarkup(
      this.viewer, this.options.pointCloudMarkup)

    this.pointCloudMarkup.on(
      'markup.created',
      this.onMarkupsUpdated)

    this.pointCloudMarkup.on(
      'markup.deleted',
      this.onMarkupsUpdated)

    this.react.setState({
      showLoader: false
    })

    this.tooltip.activate()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onClick (event) {

    const hitTest = this.viewer.clientToWorld(
      event.canvasX,
      event.canvasY,
      true)

    if (hitTest) {

      const markupInfo = {
        fragId: hitTest.fragId,
        point: hitTest.point,
        dbId: hitTest.dbId
      }

      this.pointCloudMarkup.addMarkup(
        markupInfo)

      return true
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMarkupsUpdated () {

    this.react.setState({
      markups: this.pointCloudMarkup.markups
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //  From viewer.getState:
  //  Allow extensions to inject their state data
  //
  //  for (var extensionName in viewer.loadedExtensions) {
  //    viewer.loadedExtensions[extensionName].getState(
  //      viewerState);
  //  }
  /////////////////////////////////////////////////////////////////
  getState (state) {

    state.pointCloudMarkup =
      this.pointCloudMarkup.getState()
  }

  /////////////////////////////////////////////////////////////////
  //
  //    From viewer.restoreState:
  //    Allow extensions to restore their data
  //
  //    for (var extensionName in viewer.loadedExtensions) {
  //      viewer.loadedExtensions[extensionName].restoreState(
  //        viewerState, immediate);
  //    }
  /////////////////////////////////////////////////////////////////
  restoreState (state, immediate) {

    if (immediate) {

      this.pointCloudMarkup.restoreState(
        state.pointCloudMarkup)

    } else {

      const onCameraTransitionCompleted = () => {

        this.pointCloudMarkup.restoreState(
          state.pointCloudMarkup)

        this.viewer.removeEventListener(
          Autodesk.Viewing.CAMERA_TRANSITION_COMPLETED,
          onCameraTransitionCompleted)
      }

      this.viewer.addEventListener(
        Autodesk.Viewing.CAMERA_TRANSITION_COMPLETED,
        onCameraTransitionCompleted)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMarkupClicked (markupId) {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMarkupSizeChanged (markupId, size) {

    this.pointCloudMarkup.setMarkupSize (
      markupId, size)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMarkupVisible (markupId, show) {

    this.pointCloudMarkup.setMarkupVisibility (
      markupId, show)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMarkupOcclusion (markupId, occlusion) {

    this.pointCloudMarkup.setMarkupOcclusion (
      markupId, occlusion)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMarkupRemoved (markupId) {

    this.pointCloudMarkup.removeMarkup(markupId)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onMarkupSettingsChanged () {

    this.react.setState({
      markups: this.pointCloudMarkup.markups
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderMarkups () {

    const { markups } = this.react.getState()

    const items = markups.map((markup) => {

      return (
        <PointCloudMarkupItem
          onHideSettings={this.onMarkupSettingsChanged}
          onSizeChanged={this.onMarkupSizeChanged}
          onOcclusion={this.onMarkupOcclusion}
          onVisible={this.onMarkupVisible}
          onRemove={this.onMarkupRemoved}
          onClick={this.onMarkupClicked}
          key={markup.id}
          markup={markup}
        />
      )
    })

    return (
      <div className="items">
        { items }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          PointCloud Markups
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts = {showTitle: true}) {

    const {showLoader} = this.react.getState()

    return (
      <WidgetContainer renderTitle={this.renderTitle}
        showTitle={opts.showTitle}
        className={this.className}>

        <Loader show={showLoader}/>

        { this.renderMarkups() }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  PointCloudMarkupExtension.ExtensionId,
  PointCloudMarkupExtension)
