import { TimeSeries, SmoothieChart } from './smoothie'
import Popover from 'Popover'

export default class PredixPopover extends Popover {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (options) {

    super (options)

    this.chart = new SmoothieChart()
    this.ts = new TimeSeries()
    this.intervalId = 0

    this.ts.append(new Date().getTime(), Math.random() * 100)

    this.chart.addTimeSeries(this.ts, {
      strokeStyle: 'rgba(0, 255, 0, 1)',
      fillStyle: 'rgba(0, 255, 0, 0.2)',
      lineWidth: 1
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  popoverHtml (popoverId) {

    return  `
      <div id="${popoverId}" class="hide predix"> 
        <div class="popoverTitle">
          Component Temperature
        </div> 
        <div class="graph-container"> 
          <canvas class="graph" width="192" height="138"> 
          </canvas> 
        </div>
       </div>
    `
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  popoverContent () {

    const $content = super.popoverContent()

    clearInterval(this.intervalId)

    this.intervalId = setInterval(() => {
      this.ts.append(
        new Date().getTime(),
        Math.random() * 100)
    }, 1000)

    this.chart.streamTo(
      $content.find('.graph')[0],
      100)

    return $content
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setVisible (show) {

    super.setVisible (show)

    if (!show) {

      clearInterval(this.intervalId)

      this.chart.stop()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onClick () {

    super.onClick()

    clearInterval(this.intervalId)

    this.chart.stop()
  }
}
