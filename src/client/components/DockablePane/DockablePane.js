/*
 * @author https://twitter.com/blurspline / https://github.com/zz85
 * See post @ http://www.lab4games.net/zz85/blog/2014/11/15/resizing-moving-snapping-windows-with-js-css/
 * Copyright (c) 2016 by zz85 (http://codepen.io/zz85/pen/gbOoVP)

 Permission is hereby granted, free of charge, to any person obtaining a
 copy of this software and associated documentation files (the "Software"),
 to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var e, b, x, y

class DockablePane {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (container) {
    this.FULLSCREEN_MARGINS = -10
    this.MARGINS = 4

    // Minimum resizable area
    this.minWidth = 60
    this.minHeight = 40

    // End of what's configurable.
    this.clicked = null
    this.onRightEdge = null
    this.onBottomEdge = null
    this.onLeftEdge = null
    this.onTopEdge = null

    this.rightScreenEdge = null
    this.bottomScreenEdge = null

    this.preSnapped = null

    this.pane = document.getElementById('pane')
    this.ghostpane = document.getElementById('ghostpane')

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMove = this.onMove.bind(this)
    this.onUp = this.onUp.bind(this)

    this.onTouchDown = this.onTouchDown.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)

    // Mouse events
    this.pane.addEventListener('mousedown', this.onMouseDown)
    document.addEventListener('mousemove', this.onMove)
    document.addEventListener('mouseup', this.onUp)

    // Touch events
    this.pane.addEventListener('touchstart', onTouchDown)
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onTouchEnd)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setBounds (element, x, y, w, h) {
    element.style.left = x + 'px'
    element.style.top = y + 'px'
    element.style.width = w + 'px'
    element.style.height = h + 'px'
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  hintHide () {
    this.setBounds(this.ghostpane, b.left, b.top, b.width, b.height)
    this.ghostpane.style.opacity = 0
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onTouchDown (e) {
    this.onDown(e.touches[0])
    e.preventDefault()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onTouchMove (e) {
    this.onMove(e.touches[0])
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onTouchEnd (e) {
    if (e.touches.length === 0) {
      this.onUp(e.changedTouches[0])
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onMouseDown (e) {
    this.onDown(e)
    e.preventDefault()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onDown (event) {
    this.calc(event)

    const isResizing = this.onRightEdge ||
      this.onBottomEdge ||
      this.onTopEdge ||
      this.onLeftEdge

    this.clicked = {
      x: x,
      y: y,
      cx: event.clientX,
      cy: event.clientY,
      w: b.width,
      h: b.height,
      isResizing: isResizing,
      isMoving: !isResizing && canMove(),
      onTopEdge: this.onTopEdge,
      onLeftEdge: this.onLeftEdge,
      onRightEdge: this.onRightEdge,
      onBottomEdge: this.onBottomEdge
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  canMove () {
    return x > 0 && x < b.width && y > 0 && y < b.height && y < 30
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  calc (event) {
    b = this.pane.getBoundingClientRect()

    x = event.clientX - b.left
    y = event.clientY - b.top

    this.onTopEdge = y < this.MARGINS
    this.onLeftEdge = x < this.MARGINS
    this.onRightEdge = x >= b.width - this.MARGINS
    this.onBottomEdge = y >= b.height - this.MARGINS

    this.rightScreenEdge = window.innerWidth - this.MARGINS
    this.bottomScreenEdge = window.innerHeight - this.MARGINS
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onMove (ee) {
    this.calc(ee)

    e = ee

    this.update()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onUp (e) {
    this.calc(e)

    if (this.clicked && this.clicked.isMoving) {
      // Snap
      var snapped = {
        width: b.width,
        height: b.height
      }

      if (b.top < this.FULLSCREEN_MARGINS ||
        b.left < this.FULLSCREEN_MARGINS ||
        b.right > window.innerWidth - this.FULLSCREEN_MARGINS ||
        b.bottom > window.innerHeight - this.FULLSCREEN_MARGINS) {
        // hintFull();
        this.setBounds(this.pane, 0, 0, window.innerWidth, window.innerHeight)
        this.preSnapped = snapped
      } else if (b.top < this.MARGINS) {
        // hintTop();
        this.setBounds(this.pane, 0, 0, window.innerWidth, window.innerHeight / 2)
        this.preSnapped = snapped
      } else if (b.left < this.MARGINS) {
        // hintLeft();
        this.setBounds(this.pane, 0, 0, window.innerWidth / 2, window.innerHeight)
        this.preSnapped = snapped
      } else if (b.right > this.rightScreenEdge) {
        // hintRight();
        this.setBounds(this.pane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight)
        this.preSnapped = snapped
      } else if (b.bottom > this.bottomScreenEdge) {
        // hintBottom();
        this.setBounds(this.pane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2)
        this.preSnapped = snapped
      } else {
        this.preSnapped = null
      }

      this.hintHide()
    }

    this.clicked = null
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  update () {
    if (this.clicked && this.clicked.isResizing) {
      if (this.clicked.this.onRightEdge) {
        this.pane.style.width = Math.max(x, this.minWidth) + 'px'
      }

      if (this.clicked.this.onBottomEdge) {
        this.pane.style.height = Math.max(y, this.minHeight) + 'px'
      }

      if (this.clicked.this.onLeftEdge) {
        var currentWidth =
          Math.max(this.clicked.cx - e.clientX + this.clicked.w, this.minWidth)

        if (currentWidth > this.minWidth) {
          this.pane.style.width = currentWidth + 'px'
          this.pane.style.left = e.clientX + 'px'
        }
      }

      if (this.clicked.this.onTopEdge) {
        var currentHeight =
          Math.max(this.clicked.cy - e.clientY + this.clicked.h, this.minHeight)

        if (currentHeight > this.minHeight) {
          this.pane.style.height = currentHeight + 'px'
          this.pane.style.top = e.clientY + 'px'
        }
      }

      this.hintHide()

      return
    }

    if (this.clicked && this.clicked.isMoving) {
      if (b.top < this.FULLSCREEN_MARGINS ||
        b.left < this.FULLSCREEN_MARGINS ||
        b.right > window.innerWidth - this.FULLSCREEN_MARGINS ||
        b.bottom > window.innerHeight - this.FULLSCREEN_MARGINS) {
        this.setBounds(this.ghostpane, 0, 0,
          window.innerWidth,
          window.innerHeight)

        this.ghostpane.style.opacity = 0.2
      } else if (b.top < this.MARGINS) {
        // hintTop();
        this.setBounds(this.ghostpane, 0, 0,
          window.innerWidth, window.innerHeight / 2)

        this.ghostpane.style.opacity = 0.2
      } else if (b.left < this.MARGINS) {
        // hintLeft();
        this.setBounds(this.ghostpane, 0, 0,
          window.innerWidth / 2, window.innerHeight)

        this.ghostpane.style.opacity = 0.2
      } else if (b.right > this.rightScreenEdge) {
        // hintRight();
        this.setBounds(this.ghostpane,
          window.innerWidth / 2, 0, window.innerWidth / 2,
          window.innerHeight)

        this.ghostpane.style.opacity = 0.2
      } else if (b.bottom > this.bottomScreenEdge) {
        // hintBottom();
        this.setBounds(this.ghostpane, 0,
          window.innerHeight / 2,
          window.innerWidth,
          window.innerWidth / 2)

        this.ghostpane.style.opacity = 0.2
      } else {
        this.hintHide()
      }

      if (this.preSnapped) {
        this.setBounds(this.pane,
          e.clientX - this.preSnapped.width / 2,
          e.clientY - Math.min(this.clicked.y, this.preSnapped.height),
          this.preSnapped.width,
          this.preSnapped.height)

        return
      }

      // moving
      this.pane.style.top = (e.clientY - this.clicked.y) + 'px'
      this.pane.style.left = (e.clientX - this.clicked.x) + 'px'

      return
    }

    // This code executes when mouse moves without clicking

    // style cursor
    if (this.onRightEdge && this.onBottomEdge ||
      this.onLeftEdge && this.onTopEdge) {
      this.pane.style.cursor = 'nwse-resize'
    } else if (this.onRightEdge && this.onTopEdge ||
      this.onBottomEdge && this.onLeftEdge) {
      this.pane.style.cursor = 'nesw-resize'
    } else if (this.onRightEdge || this.onLeftEdge) {
      this.pane.style.cursor = 'ew-resize'
    } else if (this.onBottomEdge || this.onTopEdge) {
      this.pane.style.cursor = 'ns-resize'
    } else if (this.canMove()) {
      this.pane.style.cursor = 'move'
    } else {
      this.pane.style.cursor = 'default'
    }
  }
}

export default DockablePane
