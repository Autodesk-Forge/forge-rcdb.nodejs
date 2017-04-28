import ConfiguratorCommand from 'Configurator.Command'
import ToolSelectorPanel from './ToolSelector.Panel'
import Toolkit from 'Viewer.Toolkit'
import Stopwatch from 'Stopwatch'

export default class CATCommand extends ConfiguratorCommand {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super (viewer, {
      commandId: 'CATCommand',
      configurations: options.configurations
    })

    this.panel = new ToolSelectorPanel(viewer.container)

    this.panel.on('item.selected', (config) => {

      this.onConfigurationSelected(config)
    })

    this.onConfigurationSelected =
      this.onConfigurationSelected.bind(this)



    this.panel.loadItems(this.options.configurations)

    this.on('configuration.activate', (config) => {

      this.onConfigurationSelected (config)
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onConfigurationSelected (tool) {

    if (this.activeTool !== tool) {

      this.moveToolIn(tool).then(() => {

        if (this.activeTool) {

          this.moveToolOut (this.activeTool)
        }

        this.activeTool = tool
      })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  rotateTool (fragIds, angle) {

    const axis = new THREE.Vector3(0, -1, 0)

    const center = new THREE.Vector3(-1000, 0, -1000)

    const angleRad = angle * Math.PI / 180

    Toolkit.rotateFragments(
      this.viewer,
      fragIds, axis, angleRad, center)

    this.viewer.impl.sceneUpdated(true)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  moveToolIn (tool) {

    return new Promise (async(resolve) => {

      const fragIds = await Toolkit.getFragIds(
        this.viewer.model,
        tool.dbIds)

      this.rotateTool (fragIds, 90)

      this.activateConfiguration(tool.id)

      await this.animate(0, -90, 200.0, (dAngle, angle) => {

        if ((angle / -90) > 0.6) {

          resolve()
        }

        this.rotateTool (fragIds, dAngle)
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  moveToolOut (tool) {

    return new Promise (async(resolve) => {

      const fragIds = await Toolkit.getFragIds(
        this.viewer.model,
        tool.dbIds)

      await this.animate(0, -45, 200.0, (dAngle) => {

        this.rotateTool (fragIds, dAngle)
      })

      this.deactivateConfiguration(tool.id)

      this.rotateTool (fragIds, 45)
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  animate (start, end, speed, onProgress) {

    return new Promise((resolve) => {

      const stopwatch = new Stopwatch()

      const sign = Math.sign(end - start)

      const stepFn = () => {

        const dt = stopwatch.getElapsedMs() * 0.001

        const step = sign * speed * dt

        start += step

        if (Math.sign(end - start) === sign) {

          onProgress (step, start)

          requestAnimationFrame (stepFn)

        } else {

          onProgress (end - start + step, end)

          resolve ()
        }
      }

      stepFn ()
    })
  }
}
