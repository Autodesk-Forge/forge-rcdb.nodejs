import CommandTool from './Viewer.Command.Tool'
import ViewerToolkit from 'Viewer.Toolkit'
import EventsEmitter from 'EventsEmitter'

export default class ViewerCommand extends EventsEmitter {

  constructor (viewer, options = {}) {

    super ()

    this.commandTool = new CommandTool(viewer, options)

    this.commandId = options.commandId

    this.options = options

    this.viewer = viewer
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  activate () {

    if (!this.commandTool.active) {

      this.commandTool.activate()

      this.commandTool.on('activate', (tool) => {

        this.emit('command.activate', this)
      })

      this.commandTool.on('deactivate', (tool) => {

        this.emit('command.deactivate', this)
      })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deactivate () {

    if (this.commandTool.active) {

      this.commandTool.deactivate()

      this.commandTool.off()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createButtonControl (options) {

    const control = ViewerToolkit.createButton(
      options.id,
      options.icon,
      options.caption,
      options.handler)

    var parentControl = options.parentControl

    if (!parentControl) {

      const viewerToolbar = this.viewer.getToolbar(true)

      parentControl = new Autodesk.Viewing.UI.ControlGroup(
        options.id)

      viewerToolbar.addControl(parentControl)
    }

    parentControl.addControl(control)

    return control
  }
}
