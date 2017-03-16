/////////////////////////////////////////////////////////////////////
// ToolPanelModal
// by Philippe Leefsma, July 2016
//
/////////////////////////////////////////////////////////////////////
import ToolPanelBase from 'ToolPanelBase/ToolPanelBase'
import './ToolPanelModal.scss'

export default class ToolPanelModal extends ToolPanelBase {

  constructor (container, options = {}) {

    super(container, options.title || '', {
      closable: true,
      movable: false,
      shadow: true
    })

    this.options = Object.assign({}, {
      showCancel: true,
      showOK: true
    }, options)

    $(this.container).addClass('tool-panel-modal')

    if(options.height) {

      $(this.container).height(options.height)
    }

    if(options.width) {

      $(this.container).width(options.width)
    }

    $(window).resize(() => {

      var h = $(this.container).height()
      var w = $(this.container).width()

      $(this.container).css({
        left: `calc(50% - ${w/2}px)`,
        top: `calc(40% - ${h/2}px)`
      })
    })

    $('#' + this.btnCancelId).css({

      display: this.options.showCancel ? 'inline-block' : 'none'
    })

    $('#' + this.btnOkId).css({

      display: this.options.showOK ? 'inline-block' : 'none'
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent (id) {

    this.btnCancelId = ToolPanelBase.guid()

    this.btnOkId = ToolPanelBase.guid()

    this.bodyId = ToolPanelBase.guid()

    var footer =  `
      <div class="tool-panel-modal-footer">
        <div style="float: right; margin-right: 10px">
          <button id="${this.btnCancelId}" class="btn">
            <span style="top:2px;" class="glyphicon glyphicon-remove">
            </span>
            Cancel
          </button>
          <button id="${this.btnOkId}" class="btn">
            <span class="glyphicon glyphicon-ok">
            </span>
            OK
          </button>
         </div>
      </div>
    `

    $(this.container).append(footer)

    $('#' + this.btnCancelId).click(() => {

      this.setVisible(false)
    })

    $('#' + this.btnOkId).click(() => {

      this._dialogResult = 'OK'

      this.setVisible(false)
    })

    return `
      <div class="container">
        <div id=${this.bodyId} class="tool-panel-modal-body">
        </div>
      </div>
    `
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  bodyContent (bodyContent) {

    $('#' + this.bodyId).append(bodyContent)
  }

  /////////////////////////////////////////////////////////////
  // onTitleDoubleClick override
  //
  /////////////////////////////////////////////////////////////
  onTitleDoubleClick (event) {

  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  createBackground () {

    this.backgroundId = ToolPanelBase.guid()

    var html = `
      <div id=${this.backgroundId}
        class="tool-panel-modal-background">
      </div>
    `

    $(html).insertBefore(this.container)

    $('#' + this.backgroundId).click(() => {

      this.setVisible (false)
    })
  }

  /////////////////////////////////////////////////////////////
  // setVisible override
  //
  /////////////////////////////////////////////////////////////
  setVisible (show = false) {

    if (show) {

      var h = $(this.container).height()
      var w = $(this.container).width()

      $(this.container).css({
        left: `calc(50% - ${w/2}px)`,
        top: `calc(50% - ${h/2}px)`
      })

      this.createBackground()

    } else {

      $('#' + this.backgroundId).remove()
    }

    super.setVisible(show)
  }
}






