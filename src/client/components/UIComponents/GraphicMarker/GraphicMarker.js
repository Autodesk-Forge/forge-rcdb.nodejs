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
      <div id="${this._markerId}">
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
    })

    this._visible = false

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

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  get element () {

    return $(`#${this._markerId}`)[0]
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setSelectable(selectable) {

    var _this = this;

    const onClick = (event) => {

      _this.emit('singleclick', event)
    }

    if(selectable){

      $(`#${this._markerId}`).css({
        'cursor': 'pointer',
        'pointer-events': 'auto'
      });

      $(`#${this._markerId}`).on(
        'click', onClick);
    }
    else {

      $(`#${this._markerId}`).css({
        'cursor': 'auto',
        'pointer-events': 'none'
      });

      $(`#${this._markerId}`).off(
        'click', onClick);
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
  onTrackerModified (screenPoint) {

    var $container = $(`#${this._markerId}`);

    $container.css({
      left: screenPoint.x - $container.width()/2,
      top: screenPoint.y -  $container.height()/2
    });

    this.emit('tracker.modified', {
      screenPoint
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setScreenPoint(screenPoint) {

    $(`#${this._markerId}`).css({
      left: screenPoint.x,
      top: screenPoint.y
    });
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getScreenPoint() {

    const $offset = $(`#${this._markerId}`).offset()

    return {
      x: $offset.left,
      y: $offset.top
    }
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
  setVisible (show) {

    this._visible = show

    $(`#${this._markerId}`).css({
      display: (show ? 'block' : 'none')
    })
  }

  get visible () {

    return this._visible
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  remove() {

    $(`#${this._markerId}`).remove();
  }
}
