import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js'
import EventsEmitter from 'EventsEmitter'
import './Legend.scss'

class Legend extends EventsEmitter {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (container, data, options = {}) {

    super()

    this.svgId = this.guid()

    this.options = Object.assign({}, options, {
      textStrokeColor: '#727272',
      textFillColor: '#727272',
      textHorizontalSpacing: 32,
      textVerticalAlign: 13,
      verticalSpacing: 20,
      textStrokeWidth: 0.1,
      textMaxLength: 25,
      circleRadius: 6,
      fontSize: 13,
      fontName: 'ArtifaktElementRegular',
      strokeWidth: 3
    })

    $(container).append(`
      <svg class="legend" id="${this.svgId}">
      </svg>
      `
    )

    this.snap = Snap($(`#${this.svgId}`)[0])

    data.forEach((entry, idx) => {

      this.drawElement(entry, idx)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  drawElement(element, idx) {

    var circle = this.snap.paper.circle(
      2 * this.options.circleRadius,
      this.options.strokeWidth +
        this.options.circleRadius +
        idx * this.options.verticalSpacing,
      this.options.circleRadius)

    circle.attr({
      fill: element.color,
      fillOpacity: 0.5,
      stroke: element.color,
      strokeWidth: this.options.strokeWidth
    })

    circle.click(() => {

      this.emit('legend.click', {
        item: element.item,
        index: idx
      })
    })

    circle.addClass('clickable')

    element.legendLabel.forEach((label) => {

      var txt = this.snap.paper.text(
        this.options.textHorizontalSpacing +
          label.spacing,
        this.options.textVerticalAlign +
          idx * this.options.verticalSpacing,
        this.getFormattedText(label.text))

      txt.attr({
        font: `${this.options.fontSize}px ${this.options.fontName}`,
        fill: this.options.textStrokeColor,
        stroke: this.options.textFillColor,
        strokeWidth: this.options.textStrokeWidth
      })

      txt.click(() => {

        this.emit('legend.click', {
          item: element.item,
          index: idx
        })
      })

      txt.addClass('clickable')
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getFormattedText(label) {

    return label.length > this.options.textMaxLength ?
      label.substring(0, this.options.textMaxLength) + ' ...' :
      label
  }
}

export default Legend
