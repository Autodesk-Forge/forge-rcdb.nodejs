(function($) {

  var drg_h, drg_w, pos_y, pos_x, priorCursor, options, $panes

  function onMouseDown (e) {

    const splitterIdx = ($(this).index() - 1) / 2

    $panes.forEach(($pane) => {

      let flexStr = $pane.css('flex')

      const flex = parseFloat(flexStr.split(' ')[0])

      console.log(flex)
    })

    console.log('Index: ' + splitterIdx)

    priorCursor = $('body').css('cursor')

    $('body').css('cursor', options.cursor)

    var $drag = $(this).addClass('draggable')

    drg_h = $drag.outerHeight()
    drg_w = $drag.outerWidth()

    pos_y = $drag.offset().top + drg_h - e.pageY
    pos_x = $drag.offset().left + drg_w - e.pageX

    $drag.parents().on("mousemove", onMouseMove)

    e.preventDefault()
  }

  function onMouseMove (e) {

    var prevPane = $('.draggable').prev()
    var nextPane = $('.draggable').next()

    var total = prevPane.outerHeight() + nextPane.outerHeight()

    var prevFlex = ((e.pageY - prevPane.offset().top) +
      (pos_y - drg_h / 2)) / total

    var nextFlex = 1 - prevFlex

    prevFlex *= 0.5
    nextFlex *= 0.5

    prevPane.css('flex', prevFlex.toString())
    nextPane.css('flex', nextFlex.toString())
  }

  $.fn.draggable = function (opts) {

    options = $.extend({
      cursor: 'ns-resize',
      min: 10
    }, opts)

    var $splitters = this

    $panes = []

    $splitters.each(function(idx) {

      $panes.push($(this).prev())

      if(idx === $splitters.length -1) {

        $panes.push($(this).next())
      }
    })

    $splitters.css('cursor', options.cursor)

    $splitters.on('mousedown', onMouseDown)

    $(document).on('mouseup', function () {

      $('body').css('cursor', priorCursor)

      $('.draggable').parents().off(
        'mousemove')

      $('.draggable').removeClass(
        'draggable')
    });
  }

})(jQuery)
