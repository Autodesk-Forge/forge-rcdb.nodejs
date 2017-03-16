/////////////////////////////////////////////////////////////////////
// PieChart
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'
import d3pie from 'd3pie'
import d3 from 'd3'

export default class PieChart extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (selector, data, opts = {}) {

    super()

    this.selector = selector

    const size = Math.min(
       $(this.selector).height(),
       $(this.selector).width())

    const options =  Object.assign({}, {

      size: {
        canvasHeight: size,
        canvasWidth: size,
        pieInnerRadius: '40%',
        pieOuterRadius: '98%'
      },

      data: {
        content: data
      },

      tooltips: {
        enabled: true,
        type: "placeholder",
        placeholderParser: (index, replacements) => {
          Object.assign(replacements, {
            unit: data[index].unit
          })
        },
        string: '{label}',
        styles: {
          fadeInSpeed: 250,
          backgroundColor: "#bababa",
          backgroundOpacity: 0.85,
          color: "#00",
          borderRadius: 2,
          font: "ArtifaktElementRegular",
          fontSize: 10,
          padding: 4
        }
      },

      labels: {
        outer: {
          format: 'none',
          hideWhenLessThanPercentage: 5,
          pieDistance: 32
        },
        inner: {
          hideWhenLessThanPercentage: 5
        }
      },

      callbacks: {
        onClickSegment: (event) => {
          this.emit('pieSegment.click',
            event.expanded ? null : event.data.item)
        }
      },

      misc: {
        gradient: {
          enabled: false,
          percentage: 100
        }
      }
    }, opts)

    this.pie = new d3pie(
      $(this.selector)[0],
      options)

    this.applyCustomProps()
  }

  updateProp (propName, value) {

    this.pie.updateProp(
      'effects.load.effect',
      'none')

    this.pie.updateProp(
      propName,
      value)

    this.applyCustomProps()
  }

  applyCustomProps () {

    $(`${this.selector} > svg`).css({
      transform: `translate(0px, -2px)`,
      overflow: 'visible'
    })

    setTimeout(()=> {

      const $path = $(`g[class*="_arc"] > path`,
        `${this.selector}`)

      $path.css({
        'stroke-width': '0'
      })
    }, 100)
  }

  destroy () {

    if(this.pie) {

      this.pie.destroy()
    }
  }
}
