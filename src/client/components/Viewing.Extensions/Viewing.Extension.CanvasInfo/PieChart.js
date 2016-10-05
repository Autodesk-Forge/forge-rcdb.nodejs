/////////////////////////////////////////////////////////////////////
// PieChart
// by Philippe Leefsma, April 2016
//
// Simple PieChart using d3Pie API
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
  constructor (selector, parentSize, data, opts = {}) {

    super()

    this.selector = selector

    const size = Math.min(
       (parentSize.height - 33) * 30/100,
       (parentSize.width) * 20/100)

    const options =  Object.assign({}, {

      size: {
        canvasHeight: size,
        canvasWidth: size,
        pieInnerRadius: '40%',
        pieOuterRadius: '90%'
      },

      data: {
        content: data
      },

      tooltips: {
        enabled: true,
        type: "placeholder",
        placeholderParser: (index, replacements) => {
          Object.assign(replacements, {unit: data[index].unit})
        },
        string: `{label}: {percentage}% ({value} {unit})`,
        styles: {
          fadeInSpeed: 250,
          backgroundColor: "#efcb34",
          backgroundOpacity: 1.0,
          color: "#00",
          borderRadius: 2,
          font: "arial",
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
          this.emit('segment.click', {
            dbIds: event.expanded? [] : event.data.dbIds
          });
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
      transform: `translate(0px, ${-6}%)`,
      overflow: 'visible',
      width: '100%'
    })
  }
}
