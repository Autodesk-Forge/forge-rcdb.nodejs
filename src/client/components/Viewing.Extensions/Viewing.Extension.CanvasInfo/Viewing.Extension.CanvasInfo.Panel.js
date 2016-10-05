import './Viewing.Extension.CanvasInfo.scss'
import ViewerToolkit from 'Viewer.Toolkit'
import ToolPanelBase from 'ToolPanelBase'
import PieChart from './PieChart'
import Legend from 'Legend'

export default class CanvasInfoPanel extends ToolPanelBase {

  constructor (viewer, buttonElement) {

    super(viewer.container, 'Cost Breakdown', {
      shadow: true,
      movable: false,
      closable: false,
      buttonElement
    });

    this.viewer = viewer;

    $(this.container).addClass('canvas-info');
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent (id) {

    return `
      <div class="container">
        <div id="pie-chart-container">
        </div>
        <div id="legend-container">
        </div>
      </div>`;
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  loadMaterials (materialMap, fieldName, unit, opts) {

    var keys = Object.keys(materialMap);

    var colors = d3.scale.linear()
      .domain([0, keys.length * .33, keys.length * .66, keys.length])
      .range(['#B58929','#C61C6F', '#268BD2', '#85992C']) //Orange to Green.

    this.data = keys.map((key, idx) => {

      var entry = materialMap[key]

      return {
        value: parseFloat(entry[fieldName].toFixed(2)),
        dbIds: entry.components,
        color: colors(idx),
        label: key,
        unit
      }
    })

    this.redraw(opts || {
      effects: {
        load: {
          effect: "default",
          speed: 1000
        }
      }
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  updateMaterials (materialMap, fieldName, unit) {

    var keys = Object.keys(materialMap);

    var colors = d3.scale.linear()
      .domain([0, keys.length * .33, keys.length * .66, keys.length])
      .range(['#B58929','#C61C6F', '#268BD2', '#85992C']) //Orange to Green.

    this.data = keys.map((key, idx) => {

      var entry = materialMap[key]

      return {
        value: parseFloat(entry[fieldName].toFixed(2)),
        dbIds: entry.components,
        color: colors(idx),
        label: key,
        unit
      }
    })

    //this.pieChart.updateProp(
    //  'data.content',
    //  this.data)

    this.redraw()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  redraw (opts = { effects: { load: { effect: "none" }}}) {

    $('.canvas-info').css({
      'max-width':'100%'
    })

    $('#pie-chart-container').empty();

    const parentSize = {
      height: $(this.viewer.container).height(),
      width: $(this.viewer.container).width()
    }

    this.pieChart = new PieChart(
      '#pie-chart-container',
      parentSize,
      this.data,
      opts)

    this.pieChart.on('segment.click', (e)=>{

      this.viewer.fitToView(e.dbIds)
      this.viewer.isolate(e.dbIds)
    })

    $('#legend-container').empty()

    this.legends = []

    let dataGroups = _.chunk(this.data, 5)

    const width = Math.min(100/dataGroups.length, 30)

    dataGroups.forEach((dataGroup) => {

      const legendFragmentId = ToolPanelBase.guid()

      $('#legend-container').append(`
        <div id="${legendFragmentId}"
          class="legend-fragment"
          style="width:${width}%;">
        </div>`)

      const legend = new Legend(
        `#${legendFragmentId}`,
        dataGroup)

      this.legends.push(legend)

      legend.on('legend.click', (e) => {

        this.viewer.fitToView(e.dbIds)
        this.viewer.isolate(e.dbIds)
      })
    })
  }
}
