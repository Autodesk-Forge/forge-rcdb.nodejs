import GraphicMarker from 'GraphicMarker';

export default class PinMarker extends GraphicMarker {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, worldPoint) {

    super(viewer.container, {x: 28, y: 28});

    this.svgId = this.guid();

    this.setContent(
      `<svg id="${this.svgId}"></svg>`
    );

    var snap = Snap($(`#${this.svgId}`)[0]);

    var circle = snap.paper.circle(14, 14, 12);

    circle.attr({
      fill: "#FF8888",
      fillOpacity: 0.6,
      stroke: "#FF0000",
      strokeWidth: 3
    });

    this.activateLock3d(viewer);
    this.setWorldPoint(worldPoint);

    this.timeoutId = 0;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setVisible (show) {

    if (show) {

      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(()=>{
        super.setVisible(true)
      }, 400)

    } else {

      clearTimeout(this.timeoutId)
      this.timeoutId = 0
      super.setVisible(false)
    }
  }
}
