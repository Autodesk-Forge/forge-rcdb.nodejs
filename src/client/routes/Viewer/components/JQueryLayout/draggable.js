(function($) {

  var drg_h, drg_w, pos_y, pos_x, priorCursor, options

  function onMouseDown (e) {

    priorCursor = $('body').css('cursor')

    $('body').css('cursor', options.cursor)

    var $drag = $(this).addClass(
      'jquery-layout-draggable')

    drg_h = $drag.outerHeight()
    drg_w = $drag.outerWidth()

    pos_y = $drag.offset().top + drg_h - e.pageY
    pos_x = $drag.offset().left + drg_w - e.pageX

    $drag.parents().on("mousemove", onMouseMove)

    e.preventDefault()
  }

  function onMouseMove (e) {

    var prev = $('.jquery-layout-draggable').prev();
    var next = $('.jquery-layout-draggable').next();

    // Assume 50/50 split between prev and next then adjust to
    // the next X for prev

    var total = prev.outerHeight() + next.outerHeight()

    var leftPercentage =
      ((e.pageY - prev.offset().top) +
      (pos_y - drg_h / 2)) / total

    var rightPercentage = 1 - leftPercentage;

    if(leftPercentage  * 100 < options.min ||
       rightPercentage * 100 < options.min) {
      return;
    }

    //console.log('l: ' + leftPercentage + ', r:' + rightPercentage);

    prev.css('flex', leftPercentage.toString());
    next.css('flex', rightPercentage.toString());
  }

  $.fn.drags = function (opts) {

    options = $.extend({
      cursor: 'ns-resize',
      min: 10
    }, opts)

    var $el = this;

    $el.css('cursor', options.cursor)

    $el.on('mousedown', onMouseDown)

    $(document).on('mouseup', function () {

      $('body').css('cursor', priorCursor)

      $('.jquery-layout-draggable').parents().off(
        'mousemove')

      $('.jquery-layout-draggable').removeClass(
        'jquery-layout-draggable')
    });
  }

})(jQuery)
