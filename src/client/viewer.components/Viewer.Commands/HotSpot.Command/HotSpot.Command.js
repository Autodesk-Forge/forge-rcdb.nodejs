import ViewerCommand from 'Viewer.Command'
import HotSpot from './HotSpot'

export default class HotSpotCommand extends ViewerCommand {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, {
      commandId: 'HotSpot'
    })

    if (options.parentControl) {

      this.control = this.createButtonControl({
        parentControl: options.parentControl,
        caption: 'Toggle hotspots',
        icon: 'fa fa-podcast',
        id: 'toolbar-hotspot',
        handler: () => {
          this.commandTool.active
            ? this.commandTool.deactivate()
            : this.commandTool.activate()
        }
      })
    }

    this.commandTool.on('activate', () => {

      this.control.container.classList.add('active')

      if (options.hotspots) {

        options.hotspots.forEach((data) => {

          this.createHotSpot (data)
        })
      }
    })

    this.commandTool.on('deactivate', () => {

      this.control.container.classList.remove('active')

      this.removeHotSpots()
    })

    this.hotspots = []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createHotSpot (data) {

    const hotSpot = new HotSpot(
      this.viewer, data)

    hotSpot.on('singleclick', (event) => {

      setTimeout(() => {
        $('.tooltip').css({display:'none'})
      }, 850)

      this.emit('hotspot.clicked', hotSpot)
    })

    hotSpot.on('tracker.modified', (event) => {

      $('.tooltip').css({display:'none'})

      this.emit('hotspot.updated', hotSpot, event)
    })

    hotSpot.on('visible', () => {

      this.emit('hotspot.visible', hotSpot)
    })

    this.emit('hotspot.created', hotSpot)

    this.hotspots.push(hotSpot)

    return hotSpot
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  removeHotSpots () {

    this.hotspots.forEach((hotSpot) => {

      hotSpot.remove()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  toArray (obj) {

    return obj ? (Array.isArray(obj) ? obj : [obj]) : []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  isolate (ids) {

    this.hotspots.forEach((hotSpot) => {

      const idArray = this.toArray(ids)

      const show =
        !idArray.length ||
        idArray.includes(hotSpot.id)

      if (!hotSpot.hidden) {

        hotSpot.skipOcclusion = !show

        hotSpot.setVisible(show)
      }
    })
  }
}
