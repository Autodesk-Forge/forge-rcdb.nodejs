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
