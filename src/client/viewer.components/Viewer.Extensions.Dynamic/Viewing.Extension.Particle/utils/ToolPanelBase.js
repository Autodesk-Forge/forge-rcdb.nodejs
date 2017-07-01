/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
import './ToolPanelBase.css'

function getDefaultOptions () {

  return {
    shadow: true,
    movable: true,
    closable: true
  }
}

export default class ToolPanelBase extends
  Autodesk.Viewing.UI.DockingPanel {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  static guid(format = 'xxxxxxxxxx') {

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

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor(container, title, options = {}) {

    super(container,
      ToolPanelBase.guid(),
      title,
      Object.assign(getDefaultOptions(), options))

    this._dialogResult = 'CANCEL'

    this._events = {}

    this._isVisible = false
    this._isMinimized = false

    this._btnElement = options.buttonElement
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    return '<div></div>'
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  unload() {

    this.setVisible(false)

    $(this.container).remove()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  isVisible() {

    return this._isVisible
  }

  /////////////////////////////////////////////////////////////
  // setVisible override
  //
  /////////////////////////////////////////////////////////////
  setVisible(show = false) {

    if(show !== this._isVisible){

      if(typeof this._events !== 'undefined') {

        this.emit((show ? 'open' : 'close'), {
          result: this._dialogResult
        })
      }
    }

    this._isVisible = show

    if(this._btnElement) {

      if(show)
        this._btnElement.classList.add('active')
      else
        this._btnElement.classList.remove('active')
    }

    super.setVisible(show)
  }

  /////////////////////////////////////////////////////////////
  // Toggles panel visibility
  //
  /////////////////////////////////////////////////////////////
  toggleVisibility () {

    this.setVisible(!this._isVisible)
  }

  /////////////////////////////////////////////////////////////
  // initialize override
  //
  /////////////////////////////////////////////////////////////
  initialize() {

    this.title = this.createTitleBar(
      this.titleLabel || this.container.id)

    $(this.container).append(this.title)

    this.setTitle(
      this.titleLabel || this.container.id,
      this.options)

    if(this.options.movable) {
      this.initializeMoveHandlers(this.title)
    }

    if(this.options.closable){
      this.closer = this.createCloseButton()
      $(this.title).append(this.closer)
    }

    var $content = $(this.htmlContent(
      this.container.id))

    this.content = $content[0]

    $(this.container).append($content)

    this.container.classList.add('toolPanelBase')
  }

  /////////////////////////////////////////////////////////////
  // createTitleBar override
  //
  /////////////////////////////////////////////////////////////
  createTitleBar (title) {
    
    var titleBar = document.createElement("div")

    titleBar.className = "dockingPanelTitle"

    this.titleTextId = ToolPanelBase.guid()

    this.titleImgId = ToolPanelBase.guid()

    var html = `
      <img id="${this.titleImgId}"></img>
      <div id="${this.titleTextId}" class="dockingPanelTitleText">
        ${title}
      </div>
    `

    $(titleBar).append(html)

    this.addEventListener(titleBar, 'click', (event)=> {
      
      if (!this.movedSinceLastClick) {
        
        this.onTitleClick(event)
      }
      
      this.movedSinceLastClick = false
    })

    this.addEventListener(titleBar, 'dblclick', (event) => {
      
      this.onTitleDoubleClick(event)
    })

    return titleBar
  }

  /////////////////////////////////////////////////////////////
  // setTitle override
  //
  /////////////////////////////////////////////////////////////
  setTitle (text, options) {
  
    if (options && options.localizeTitle) {

      $(`#${this.titleTextId}`).attr('data-i18n', text)

      text = Autodesk.Viewing.i18n.translate(text)
      
    } else {

      $(`#${this.titleTextId}`).removeAttr('data-i18n')
    }

    $(`#${this.titleTextId}`).text(text)
  }

  /////////////////////////////////////////////////////////////
  // onTitleDoubleClick override
  //
  /////////////////////////////////////////////////////////////
  onTitleDoubleClick(event) {

    this._isMinimized = !this._isMinimized

    if(this._isMinimized) {

      this._height = $(this.container).css('height')

      $(this.container).css({
        'height':'32px',
        'min-height':'32px'
      })
    }
    else {

      $(this.container).css({
        'height':this._height,
        'min-height':'100px'
      })
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  on(event, fct) {

    this._events[event] = this._events[event]	|| []
    this._events[event].push(fct)
    return fct
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  off(event, fct) {

    if(event in this._events === false)
      return

    this._events[event].splice(
      this._events[event].indexOf(fct), 1)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  emit(event /* , args... */) {

    if(this._events[event] === undefined)
      return

    var handlers = this._events[event].slice()

    for(var i = 0; i < handlers.length; ++i) {

      var result = handlers[i].apply(this,
        Array.prototype.slice.call(arguments, 1))

      if(result !== undefined )
        return result
    }

    return undefined
  }
}