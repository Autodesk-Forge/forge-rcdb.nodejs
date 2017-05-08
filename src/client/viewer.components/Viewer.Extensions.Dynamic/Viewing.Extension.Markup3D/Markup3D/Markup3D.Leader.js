import Stopwatch from 'Stopwatch'

export default class Leader {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(container, startPoint) {

    var snap = Snap(container)

    this.line = snap.paper.line(
      startPoint.x, startPoint.y,
      startPoint.x, startPoint.y)

    this.line.attr({
      fill: 'none',
      strokeWidth: 1,
      stroke: '#000000',
      strokeLinecap: "round",
      strokeDasharray: "1 5 1 5"
    })

    var pts = [startPoint.x, startPoint.y]

    this.arrow = snap.paper.polygon(pts)

    this.arrow.attr({
      fill:"#B80000"
    })

    this.leader = snap.group(
      this.line,
      this.arrow
    )

    this.leader.attr({
      visibility: 'hidden'
    })

    this.timer = new Stopwatch()

    this.scaleFactor = 1.0
    this.animationId = 0
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setVisible (show) {

    return new Promise((resolve, reject)=> {

      if (show) {

        this.leader.attr({
          visibility: 'visible'
        })
      }

      cancelAnimationFrame(
        this.animationId)

      var step = (show ? 0.002 : -0.002)

      const _animation = ()=> {

        this.scaleFactor += step * Math.max(
          this.timer.getElapsedMs(), 1)

        if (this.scaleFactor >= 1.0) {

          this.scaleFactor = 1.0
          this.draw()
          return resolve()
        }
        else if (this.scaleFactor <= 0.0) {

          this.scaleFactor = 0.0

          this.leader.attr({
            visibility: 'hidden'
          })

          this.draw()
          return resolve()
        }

        this.draw()

        this.animationId = requestAnimationFrame(
          _animation)
      }

      this.timer.getElapsedMs()

      _animation()
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  update (startPoint, endPoint) {

    this.startPoint = startPoint
    this.endPoint = endPoint

    this.dir = {
     x: endPoint.x - startPoint.x,
     y: endPoint.y - startPoint.y
    }

    this.draw()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  draw () {

    var startPoint = {
      x: this.endPoint.x - this.scaleFactor * this.dir.x,
      y: this.endPoint.y - this.scaleFactor * this.dir.y
    }

    var norm = Math.sqrt(
      this.dir.x * this.dir.x +
      this.dir.y * this.dir.y)

    var nDir = {
      x: this.dir.x,
      y: this.dir.y
    }

    if(norm > 0){
      nDir.x /= norm
      nDir.y /= norm
    }

    this.line.attr({

      x1: startPoint.x,
      y1: startPoint.y,

      x2: this.endPoint.x,
      y2: this.endPoint.y
    })

    var orthoDir = {
      x:  nDir.y * this.scaleFactor,
      y: -nDir.x * this.scaleFactor
    }

    var pts = [
      startPoint.x - 3  * nDir.x,
      startPoint.y - 3  * nDir.y,
      startPoint.x + 20 * nDir.x + 5 * orthoDir.x,
      startPoint.y + 20 * nDir.y + 5 * orthoDir.y,
      startPoint.x + 20 * nDir.x - 5 * orthoDir.x,
      startPoint.y + 20 * nDir.y - 5 * orthoDir.y
    ]

    this.arrow.attr({
      points: pts
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  remove() {

    this.leader.remove()
  }
}
