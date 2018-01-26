/////////////////////////////////////////////////////////
// EventsEmitter
// by Philippe Leefsma, November 2017
//
/////////////////////////////////////////////////////////
(function(){

  AutodeskNamespace('Viewing.Extension.ConstrainedPlacement')

  'use strict';

  function EventsEmitter() {

    this._events = {}
  }

  /////////////////////////////////////////////////////////
  // Supports multiple events space-separated
  //
  /////////////////////////////////////////////////////////
  EventsEmitter.prototype.on = function (events, fct) {

    var _this = this

    events.split(' ').forEach(function(event) {

      _this._events[event] = _this._events[event]	|| []
      _this._events[event].push(fct)
    })

    return this
  }

  /////////////////////////////////////////////////////////
  // Supports multiple events space-separated
  //
  /////////////////////////////////////////////////////////
  EventsEmitter.prototype.off = function (events, fct) {

    var _this = this

    if(events == undefined){
      _this._events = {}
      return
    }

    events.split(' ').forEach(function(event) {

      if (event in _this._events === false)
        return;

      if (fct) {

        _this._events[event].splice(
          _this._events[event].indexOf(fct), 1)

      } else {

        _this._events[event] = []
      }
    })

    return this
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  EventsEmitter.prototype.emit = function (event /* , args... */) {

    if(this._events[event] === undefined)
      return null;

    var tmpArray = this._events[event].slice()

    for (var i = 0; i < tmpArray.length; ++i) {

      var result = tmpArray[i].apply(this,
        Array.prototype.slice.call(arguments, 1));

      if(result !== undefined) {
        return result
      }
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  EventsEmitter.prototype.guid = function (format = 'xxxxxxxxxxxx') {

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

  Viewing.Extension.ConstrainedPlacement.EventsEmitter = EventsEmitter

})()


