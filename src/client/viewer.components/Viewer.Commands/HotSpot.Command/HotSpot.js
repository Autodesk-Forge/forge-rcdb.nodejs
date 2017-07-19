import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js'
import GraphicMarker from 'GraphicMarker'

export default class HotSpot extends GraphicMarker {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, data) {

    super (viewer.container, {x: 34, y: 34})

    this.occlusionDist = data.occlusionDist || 10000.0

    this.occlusion = data.occlusion

    this.id = data.id || this.guid()

    this.svgId = this.guid()

    this.dbId = data.dbId

    this.viewer = viewer

    this.data = data

    this.setContent(`
      <svg id="${this.svgId}"
        data-placement="right"
        data-toggle="tooltip"
        data-delay='{"show":"800", "hide":"100"}'
        title="">
      </svg>
    `)

    $(`#${this.svgId}`).css({
      height:'100%',
      width:'100%'
    })

    var snap = Snap($(`#${this.svgId}`)[0])

    this.circle = snap.paper.circle(17, 17, 12)

    this.circle.attr({
      stroke: data.strokeColor || "#FF0000",
      fill: data.fillColor || "#FF8888",
      fillOpacity: 0.1,
      strokeWidth: 3
    })

    var offset = $(viewer.container).offset()

    this.offset = {
      x: offset.left,
      y: offset.top
    }

    this.activateLock3d (viewer)
    this.setWorldPoint (data.worldPoint)
    this.setSelectable (true)

    const show = !(this.occlusion && this.checkOcclusion())

    this.setVisible(show)

    if (data.tooltip) {

      $(`#${this.svgId}`).tooltip({
        openOn: 'hover click',
        container: 'body',
        animated: 'fade',
        html: true
      })
        .data('bs.tooltip').tip().addClass(data.tooltip.class)

      const htmlTooltipContent = `
        <div class="hotspot-item">
          <div class="hotspot-item-img"
            style="background-image:url(${data.tooltip.imgUrl})">
          </div>
          <label>
            ${data.tooltip.caption}
          </label>
        </div>
      `

      $(`#${this.svgId}`)
        .attr('title', htmlTooltipContent)
        .tooltip('fixTitle')
        .tooltip('setContent')
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  hide () {

    this.skipOcclusion = true

    this.hidden = true

    super.setVisible(false)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  show () {

    this.skipOcclusion = false

    this.hidden = false

    if (this.occlusion) {

      if (!this.checkOcclusion()) {

        super.setVisible(true)
      }

    } else {

      super.setVisible(true)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setVisible (show) {

    super.setVisible(show)

    this.emit('visible', show)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setData (data) {

    this.data = Object.assign({}, this.data, data)

    this.circle.attr({
      stroke: data.strokeColor || "#FF0000",
      fill: data.fillColor || "#FF8888",
      fillOpacity: data.fillOpacity || 0.1,
      strokeWidth: data.strokeWidth || 3
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  animate () {

    return new Promise((resolve) => {

      this.circle.attr({
        fillOpacity: 0.95,
        opacity: 1,
        r: 0
      })

      this.circle.animate({
          fillOpacity: 0.5,
          opacity: 0.85,
          r: 15
        },
        3000,
        mina.easein, () => {

          resolve(this)
        })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  remove () {

    this.setVisible (false)

    this.removed = true

    super.remove()
  }

  /////////////////////////////////////////////////////////
  // Return hit data
  // {
  //  dbId: nb
  //  face: THREE.Face3
  //  fragId: nb
  //  intersectPoint: THREE.Vector3
  //  model: RenderModel
  // }
  /////////////////////////////////////////////////////////
  getHitData (x, y) {

    y = 1.0 - y

    x = x * 2.0 - 1.0
    y = y * 2.0 - 1.0

    var vpVec = new THREE.Vector3(x, y, 1)

    var result = this.viewer.impl.hitTestViewport(
      vpVec, false)

    return result ? result : null
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onTrackerModified (screenPoint) {

    super.onTrackerModified (screenPoint)

    this.screenPoint = screenPoint

    if (!this.skipOcclusion) {

      const show = !(this.occlusion && this.checkOcclusion())

      this.setVisible(show)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  normalize (screenPoint) {

    var viewport = this.viewer.navigation.getScreenViewport()

    var n = {
      x: (screenPoint.x - viewport.left) / viewport.width,
      y: (screenPoint.y - viewport.top) / viewport.height
    }

    return n
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  checkOcclusion () {

    var n = this.normalize({
      x: this.screenPoint.x + this.offset.x,
      y: this.screenPoint.y + this.offset.y
    })

    var hitData = this.getHitData(n.x, n.y)

    if (hitData) {

      if (hitData.dbId != this.dbId) {

        return true
      }

      var worldPoint = this.getWorldPoint()

      var dist = {
        x: hitData.intersectPoint.x - worldPoint.x,
        y: hitData.intersectPoint.y - worldPoint.y,
        z: hitData.intersectPoint.z - worldPoint.z
      }

      var d =
        dist.x * dist.x +
        dist.y * dist.y +
        dist.z * dist.z

      if (d > this.occlusionDist) {

        return true
      }
    }

    return false
  }
}
