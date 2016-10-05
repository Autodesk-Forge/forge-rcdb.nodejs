
export default class EventsEmitter {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor() {

    this._events = {};
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  on(event, fct) {

    this._events[event] = this._events[event]	|| [];
    this._events[event].push(fct);

    return this;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  off(event, fct) {

    if(event == undefined){
      this._events = {};
      return;
    }

    if(event in this._events === false)
      return;

    if(fct){
      this._events[event].splice(
        this._events[event].indexOf(fct), 1);
    }
    else {
      this._events[event] = [];
    }

    return this;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  emit(event /* , args... */) {

    if(this._events[event] === undefined)
      return;

    var tmpArray = this._events[event].slice();

    for(var i = 0; i < tmpArray.length; ++i) {

      var result	= tmpArray[i].apply(this,
        Array.prototype.slice.call(arguments, 1));

      if(result !== undefined )
        return result;
    }

    return undefined;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  guid(format='xxxxxxxxxxxx') {

    var d = new Date().getTime();

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });

    return guid;
  }
}


export const EventsEmitterComposer =

    (BaseClass) => class extends BaseClass {

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    constructor (args) {

      super(args)

      this._events = {};
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    on(event, fct) {

      this._events[event] = this._events[event]	|| [];
      this._events[event].push(fct);

      return this;
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    off (event, fct) {

      if(event == undefined){
        this._events = {};
        return;
      }

      if(event in this._events === false)
        return;

      if(fct){
        this._events[event].splice(
          this._events[event].indexOf(fct), 1);
      }
      else {
        this._events[event] = [];
      }

      return this;
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    emit(event /* , args... */) {

      if(this._events[event] === undefined)
        return;

      var tmpArray = this._events[event].slice();

      for(var i = 0; i < tmpArray.length; ++i) {

        var result	= tmpArray[i].apply(this,
          Array.prototype.slice.call(arguments, 1));

        if(result !== undefined )
          return result;
      }

      return undefined;
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    guid(format='xxxxxxxxxxxx') {

      var d = new Date().getTime();

      var guid = format.replace(
        /[xy]/g,
        function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });

      return guid;
    }
  }


