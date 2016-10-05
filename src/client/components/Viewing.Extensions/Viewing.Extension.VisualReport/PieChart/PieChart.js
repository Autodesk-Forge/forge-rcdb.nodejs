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
  constructor(selector, data) {

     super();

     let $container = $(selector)

     this.chart = new d3pie($container[0], {

      //header: {
      //  title: {
      //    text: "Title"
      //  }
      //},

       effects: {
         load: {
           //effect: "none"
         }
       },

       labels: {
         inner: {
           hideWhenLessThanPercentage: 5
         }
       },

      size: {
        canvasHeight: $('.tabs-container').height(),
        canvasWidth: $('.tabs-container').width(),
        "pieInnerRadius": "39%",
        "pieOuterRadius": "80%"
      },

      data: {
        content: data
        //sortOrder: "label-asc"
        //smallSegmentGrouping: {
        //  valueType: "percentage",
        //  label: "Other",
        //  enabled: true,
        //  value: 3
        //}
      },

      tooltips: {
        enabled: true,
        type: "placeholder",
        string: "{label}: {percentage}%",
        styles: {
          fadeInSpeed: 250,
          backgroundColor: "#000000",
          backgroundOpacity: 0.5,
          color: "#efefef",
          borderRadius: 2,
          font: "arial",
          fontSize: 10,
          padding: 4
        }
      },

      callbacks: {
        onClickSegment: (event)=> {
          this.emit('segment.click', {
            dbIds: event.expanded? [] : event.data.dbIds
          });
        }
      }
    });

    $(`${selector} > svg`).css('transform', `translate(15px, -30px)`);
  }
}
