import ViewerCommand from 'Viewer.Command'
import autobind from 'autobind-decorator'
import Toolkit from 'Viewer.Toolkit'

export default class ConfiguratorCommand extends ViewerCommand {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, {
      commandId: options.commandId
    })

    this.configurationMap = {}

    options.configurations.forEach((config) => {

      this.configurationMap[config.id] = config
    })

    this.viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoaded)

    this.activeConfigurations = []

    this.options = options
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.viewer.removeEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoaded)

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  @autobind
  onGeometryLoaded (event) {

    Object.keys(this.configurationMap).forEach((configId) => {

      const config = this.configurationMap[configId]

      if (config.active) {

        this.activateConfiguration(configId)

      } else {

        Toolkit.hide(this.viewer, config.dbIds)
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  activateConfiguration (configId, fireEvent = false) {

    if (this.configurationMap[configId] &&
        !this.activeConfigurations.includes(configId)) {

      const config = this.configurationMap[configId]

      Toolkit.show(this.viewer, config.dbIds)

      this.activeConfigurations.push(configId)

      if (fireEvent) {

        this.emit('configuration.activate', config)
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deactivateConfiguration (configId, fireEvent = false) {

    if (this.configurationMap[configId] &&
        this.activeConfigurations.includes(configId)) {

      const config = this.configurationMap[configId]

      Toolkit.hide(this.viewer, config.dbIds)

      this.activeConfigurations =
        this.activeConfigurations.filter((id) => {
          return id !== configId
        })

      if (fireEvent) {

        this.emit('configuration.activate', config)
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  getState (viewerState) {

    viewerState[this.commandId] = {
      activeConfigurations: this.activeConfigurations
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  restoreState (viewerState, immediate) {

    if (viewerState[this.commandId]) {

      const state = viewerState[this.commandId]

      this.activeConfigurations.forEach((configId) => {

        this.deactivateConfiguration(configId, true)
      })

      state.activeConfigurations.forEach((configId) => {

        this.activateConfiguration(configId, true)
      })
    }
  }
}


