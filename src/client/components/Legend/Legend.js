import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js'
import EventsEmitter from 'EventsEmitter'
import './Legend.scss'

class Legend  extends EventsEmitter {

  constructor (container, data) {

    super()

    this.svgId = this.guid()

    this.options = {
      textStrokeColor: '#727272',
      textFillColor: '#727272',
      textHorizontalSpacing: 32,
      textVerticalAlign: 13,
      verticalSpacing: 20,
      textMaxLength: 50,
      circleRadius: 6,
      fontSize: 12,
      fontName: 'Artifakt',
      strokeWidth: 3
    }

    $(container).append(`
      <svg class="legend" id="${this.svgId}">
      </svg>
      `
    )

    this.snap = Snap($(`#${this.svgId}`)[0])

    data.forEach((entry, idx) => {

      this.drawElement(idx, entry)
    })
  }

  drawElement(idx, element) {

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

      this.emit('legend.click', element.item)
    })

    circle.addClass('clickable')

    var txt = this.snap.paper.text(
      this.options.textHorizontalSpacing,
      this.options.textVerticalAlign +
        idx * this.options.verticalSpacing,
      this.getFormattedText(element.label))

    txt.attr({
      font: `${this.options.fontSize}px ${this.options.fontName}`,
      fill: this.options.textStrokeColor,
      stroke: this.options.textFillColor
    })

    txt.click(() => {

      this.emit('legend.click', element.item)
    })

    txt.addClass('clickable')
  }

  getFormattedText(label) {

    return label.length > this.options.textMaxLength ?
      label.substring(0, this.options.textMaxLength) + ' ...' :
      label
  }

  guid(format = 'xxxxxxxxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }
}

export default Legend
