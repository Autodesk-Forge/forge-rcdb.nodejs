import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js'
import EventsEmitter from 'EventsEmitter'
import './Legend.scss'

class Legend  extends EventsEmitter {

  constructor(container, data) {

    super()

    this.svgId = this.guid()

    this.options = {
      textStrokeColor: '#424242',
      textFillColor: '#424242',
      textVerticalAlign: 17,
      horizontalSpacing: 36,
      verticalSpacing: 28,
      textMaxLength: 25,
      circleRadius: 10,
      fontSize: 12,
      stokeWidth: 3
    }

    $(container).append(
      `<svg class="legend" id="${this.svgId}"></svg>`
    )

    this.snap = Snap($(`#${this.svgId}`)[0])

    data.forEach((entry, idx) => {

      this.drawElement(idx, entry)
    })
  }

  drawElement(idx, element) {

    var circle = this.snap.paper.circle(
      2 * this.options.circleRadius,
      this.options.stokeWidth + this.options.circleRadius + idx * this.options.verticalSpacing,
      this.options.circleRadius)

    circle.attr({
      fill: element.color,
      fillOpacity: 0.5,
      stroke: element.color,
      strokeWidth: 3
    })

    circle.click(() => {

      this.emit('legend.click', element)
    })

    circle.addClass('clickable')

    var txt = this.snap.paper.text(
      this.options.horizontalSpacing,
      this.options.textVerticalAlign + idx * this.options.verticalSpacing,
      this.getFormattedText(element.label))

    txt.attr({
      fontSize: this.options.fontSize + 'px',
      fill: this.options.textStrokeColor,
      stroke: this.options.textFillColor
    })

    txt.click(() => {

      this.emit('legend.click', element)
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
