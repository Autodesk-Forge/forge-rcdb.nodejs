import UIComponent from 'UIComponent'

export default class Popover extends UIComponent {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (options) {

    super ()

    this.onClick = this.onClick.bind (this)

    this.popoverId = this.guid()

    this.options = options

    const popoverHtml =
      this.popoverHtml(this.popoverId)

    $(options.container).append(popoverHtml)

    const $target = $(options.target)

    $target.attr(
      'data-popover-content',
      '#' + this.popoverId)

    $target.popover({
      placement: 'auto left',
      container: 'body',
      trigger: 'focus',
      html: true,
      content: () => {
        return this.popoverContent()
      }
    })

    this.visible = false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  popoverHtml (popoverId) {

    return  `
      <div id="${popoverId}" class="hide">
      </div>
    `
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  popoverContent () {

    const $target = $(this.options.target)
    const content = $target.data('popover-content')
    const $clone = $(content).clone(true)

    $clone.removeClass('hide')

    $clone.click(this.onClick)

    return $clone
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setPosition (screenPoint) {

    if (this.visible) {

      const data = $(this.options.target).data()

      const $tip = data['bs.popover'].tip()

      const tipOffset = $tip.offset()

      const offset = {
        x: screenPoint.x - this.screenPoint.x,
        y: screenPoint.y - this.screenPoint.y
      }

      $tip.offset({
        left: tipOffset.left + offset.x,
        top: tipOffset.top + offset.y
      })

      this.screenPoint = screenPoint
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setVisible (show) {

    const $target = $(this.options.target)

    $target.popover(show
      ? 'show'
      : 'hide')

    this.visible = show
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onClick () {

    const $target = $(this.options.target)

    $target.popover('hide')

    this.visible = false
  }
}
