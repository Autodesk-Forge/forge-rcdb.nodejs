/////////////////////////////////////////////////////////////////
// Configurator.ToolSelector
// By Philippe Leefsma, February 2016
//
/////////////////////////////////////////////////////////////////
import UIComponent from 'UIComponent'

export default class ToolSelectorPanel extends UIComponent {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (container) {

    super ()

    this.panelId = this.guid()

    const html = `
      <div id=${this.panelId} class="tool-selector">
      </div>
    `

    $(container).append(html)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  loadItems (items) {

    items.forEach((item) => {

      const itemId = this.guid()

      const html = `
        <div id=${itemId} class="tool-item">
          <div id=${itemId}-img class="tool-item-img ${item.id}">
          </div>
          <div id=${itemId}-info class="tool-item-info">
            <label>${item.name}</label>
          </div>
        </div>
      `

      $('#' + this.panelId).append(html)

      $('#' + itemId).click(() => {

        this.emit('item.selected', item)
      })
    })
  }
}
