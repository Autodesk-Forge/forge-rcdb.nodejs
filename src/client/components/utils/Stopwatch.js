///////////////////////////////////////////////////////////////////////////
// A stopwatch
//
///////////////////////////////////////////////////////////////////////////
export default class Stopwatch {

  constructor(){

   this._lastTime = performance.now();
  }

  start(){

    this._lastTime = performance.now();
  }

  getElapsedMs(){

    var time = performance.now();

    var elapsedMs = time - this._lastTime;

    this._lastTime = time;

    return elapsedMs;
  }
}