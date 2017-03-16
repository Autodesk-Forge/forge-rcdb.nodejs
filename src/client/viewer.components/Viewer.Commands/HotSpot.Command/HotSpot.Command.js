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

    this.commandTool.on('activate', () => {

      this.control.container.classList.add('active')

      options.hotSpots.forEach((data) => {

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

        this.hotSpots.push(hotSpot)
      })
    })

    this.commandTool.on('deactivate', () => {

      this.control.container.classList.remove('active')

      this.hotSpots.forEach((hotSpot) => {

        hotSpot.remove()
      })
    })

    this.hotSpots = []
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  toArray (obj) {

    return obj ? (Array.isArray(obj) ? obj : [obj]) : []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  isolate (ids) {

    this.hotSpots.forEach((hotSpot) => {

      const idArray = this.toArray(ids)

      const show =
        !idArray.length ||
        idArray.includes(hotSpot.id)

      hotSpot.skipOcclusion = !show

      hotSpot.setVisible(show)
    })
  }
}
