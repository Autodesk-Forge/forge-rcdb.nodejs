/////////////////////////////////////////////////////////////
// TabManager
// By Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////
import UIComponent from 'UIComponent'
import 'dragula/dist/dragula.min.css'
import dragula from 'dragula'
import './TabManager.scss'

export default class TabManager extends UIComponent {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (container, opts = {}) {

    super()

    this.tabsHeaderId = this.guid()
    this.containerId = this.guid()
    this.class = this.guid()
    this.nbTabs = 0

    var html = `
      <div id="${this.containerId}" class="c${this.class} tabs">
        <ul id="${this.tabsHeaderId}" class="headers">
        </ul>
      </div>
    `

    $(container).append(html)

    if (opts.allowDrag) {

      this.drake = dragula(
        [$(`#${this.tabsHeaderId}`)[0]],
        {removeOnSpill: false})

      var drakeEvents = [
        'drag', 'dragend', 'drop', 'cancel', 'remove'
      ]

      drakeEvents.forEach((event) => {

        this.drake.on(event, () => {

          this.emit('drake.' + event, arguments)
        })
      })
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  addTab(tabInfo) {

    this.nbTabs ++

    var tabHeaderLinkId = this.guid()
    var tabHeaderId = this.guid()

    var tabId = this.guid()

    var tabHtml = `
      <li id="${tabHeaderId}" tabId="${tabId}">
        <a id="${tabHeaderLinkId}" tabId="${tabId}" class="tab-link">
          <label tabId="${tabId}">
            ${tabInfo.name}
          </label>
        </a>
      </li>
    `

    $('#' + this.tabsHeaderId).append(tabHtml)

    var nbTabs = this.nbTabs

    $(`#${this.tabsHeaderId} > li`).each(function(idx){

      $(this).css({
        width: `calc(${99/nbTabs}% - 2px)`,
        left: `calc(${idx * (99/nbTabs)}% + 2px)`
      })
    })

    var containerHtml = `

      <div id="${tabId}">
        ${tabInfo.html}
      </div>
    `

    $('#' + this.containerId).append(containerHtml)

    if(tabInfo.active)
      this.setActiveTab(tabId)

    $('#' + tabHeaderLinkId).click((e)=>{

      var id = $(e.target).attr('tabId')

      this.setActiveTab(id)
    })

    return tabId
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setActiveTab(tabId) {

    var _this = this

    $(`.c${this.class} .tab-link`).each((idx, element)=>{

      var id = $(element).attr('tabId')

      if(id != tabId) {

        $(element).removeClass('active')
        $('#' + id).css('display', 'none')

        _this.emit('tab.visible', {
          id: id,
          name: $(element).text()
        })
      }
      else{

        $(element).addClass('active')
        $('#' + id).css('display', 'block')
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  clear() {

    $(`#${this.tabsHeaderId} > li`).remove()
    $(`#${this.containerId} > div`).remove()

    this.nbTabs = 0
  }
}
