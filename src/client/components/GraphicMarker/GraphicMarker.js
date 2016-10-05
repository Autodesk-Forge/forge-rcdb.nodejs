/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
import PointTracker from 'Viewer.PointTracker'
import EventsEmitter from 'EventsEmitter'

export default class GraphicMarker extends EventsEmitter {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor(parent, size = {x: 32, y: 32}) {

    super();

    this._markerId = this.guid();

    var htmlMarker = `
      <div id="${this._markerId}"
      </div>
    `;

    $(parent).append(htmlMarker);

    $(`#${this._markerId}`).css({
      'pointer-events': 'none',
      'width': `${size.x}px`,
      'height': `${size.y}px`,
      'position': 'absolute',
      'overflow': 'visible',
      'display': 'none'
    });

    this.onTrackerModifiedHandler =
      (screenPoint)=> this.onTrackerModified(screenPoint);
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setContent(html) {

    $(`#${this._markerId}`).append(html);
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setSelectable(selectable) {

    var _this = this;

    function _click(e) {

      if(e.target.id == _this._markerId){

        _this.emit('_click', e);
      }
    }

    if(selectable){

      $(`#${this._markerId}`).css({
        'cursor': 'pointer',
        'pointer-events': 'auto'
      });

      $(`#${this._markerId}`).on(
        'click', _click);
    }
    else {

      $(`#${this._markerId}`).css({
        'cursor': 'auto',
        'pointer-events': 'none'
      });

      $(`#${this._markerId}`).off(
        'click', _click);
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  activateLock3d(viewer) {

    this._tracker = new PointTracker(viewer);

    this._tracker.on('modified',
      this.onTrackerModifiedHandler);

    this._tracker.activate();
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onTrackerModified(screenPoint) {

    var $container = $(`#${this._markerId}`);

    $container.css({
      'left': screenPoint.x - $container.width()/2,
      'top': screenPoint.y -  $container.height()/2
    });

    this.emit('tracker.modified', screenPoint);
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setScreenPoint(screenPoint) {

    $(`#${this._markerId}`).css({
      'left': screenPoint.x,
      'top': screenPoint.y
    });
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getScreenPoint() {

    return {
      x: $(`#${this._markerId}`).left(),
      y: $(`#${this._markerId}`).top()
    };
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getWorldPoint() {

    if(this._tracker) {
      return this._tracker.getWorldPoint();
    }

    return null;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setWorldPoint(worldPoint) {

    if(this._tracker) {
      this._tracker.setWorldPoint(worldPoint);
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setVisible(show) {

    $(`#${this._markerId}`).css({
      display: (show ? 'block' : 'none')
    });
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

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  remove() {

    $(`#${this._markerId}`).remove();
  }
}
