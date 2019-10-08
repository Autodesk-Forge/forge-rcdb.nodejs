/// //////////////////////////////////////////////////////////////
// Markup2D Viewer Extension
// By Philippe Leefsma, Autodesk Inc, August 2017
//
/// //////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import ContentEditable from 'react-contenteditable'
import WidgetContainer from 'WidgetContainer'
import { ReactLoader } from 'Loader'
import ReactDOM from 'react-dom'
import Switch from 'Switch'
import Label from 'Label'
import React from 'react'
import {
  DropdownButton,
  MenuItem
} from 'react-bootstrap'

class Markup2DExtension extends MultiModelExtensionBase {
  /// //////////////////////////////////////////////////////////////
  // Class constructor
  //
  /// //////////////////////////////////////////////////////////////
  constructor (viewer, options) {
    super(viewer, options)

    this.onSequenceDeleted = this.onSequenceDeleted.bind(this)
    this.onStateDeleted = this.onStateDeleted.bind(this)
    this.onStateToggled = this.onStateToggled.bind(this)
    this.renderTitle = this.renderTitle.bind(this)

    this.react = options.react
  }

  /// //////////////////////////////////////////////////////
  // Load callback
  //
  /// //////////////////////////////////////////////////////
  load () {
    this.react.setState({

      markupsMode: { name: 'Disabled', id: 'markupModeDisabled' },
      modes: [
        { name: 'Disabled', id: 'markupsModeDisabled' },
        { name: 'View Markups', id: 'markupsModeView' },
        { name: 'Edit Markups', id: 'markupsModeEdit' }
      ],
      configManager: null,
      markupsCore: null,
      showLoader: true,
      markupsUi: null

    }).then(async () => {
      const markupsCore =
        await this.viewer.loadExtension(
          'Autodesk.Viewing.MarkupsCore')

      const markupsUi =
        await this.viewer.loadExtension(
          'Autodesk.MarkupsUi', {
            markupsCore
          })

      markupsUi.panel.addVisibilityListener((show) => {
        if (!show) {
          this.onEditMarkupsClosed()
        }
      })

      const configManagerReactOptions = {
        pushRenderExtension: () => {
          return Promise.resolve()
        },
        popRenderExtension: () => {
          return Promise.resolve()
        }
      }

      const configManager =
        await this.viewer.loadDynamicExtension(
          'Viewing.Extension.ConfigManager', {
            emptyStateNameCaption: 'Layer Name ...',
            react: configManagerReactOptions,
            restoreImmediate: true,
            itemToggling: true,
            disabled: true
          })

      configManager.on('sequence.deleted',
        this.onSequenceDeleted)

      configManager.on('state.toggled',
        this.onStateToggled)

      configManager.on('state.deleted',
        this.onStateDeleted)

      this.react.setState({
        showLoader: false,
        configManager,
        markupsCore,
        markupsUi
      })

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.Markup2D loaded')

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  get className () {
    return 'markup-2d'
  }

  /// //////////////////////////////////////////////////////
  // Extension Id
  //
  /// //////////////////////////////////////////////////////
  static get ExtensionId () {
    return 'Viewing.Extension.Markup2D'
  }

  /// //////////////////////////////////////////////////////
  // Unload callback
  //
  /// //////////////////////////////////////////////////////
  unload () {
    console.log('Viewing.Extension.Markup2D unloaded')

    super.unload()

    return true
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onModelRootLoaded (event) {
    const nav = this.viewer.navigation

    nav.toPerspective()

    this.viewer.autocam.setHomeViewFrom(
      nav.getCamera())

    this.options.loader.show(false)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async setMarkupsMode (markupsMode) {
    const { configManager, markupsCore, markupsUi } =
      this.react.getState()

    await this.react.setState({
      markupsMode
    })

    switch (markupsMode.id) {
      case 'markupsModeDisabled':

        const { items } = configManager.react.getState()

        await configManager.react.setState({
          items: items.map((item) => {
            return Object.assign({}, item, {
              active: false
            })
          }),
          stateSelection: true,
          stateCreation: true,
          disabled: true
        })
        markupsUi.panel.setVisible(false)
        markupsCore.hide()
        break

      case 'markupsModeView':

        await configManager.react.setState({
          stateSelection: true,
          stateCreation: false,
          disabled: false
        })
        markupsUi.panel.setVisible(false)
        markupsCore.show()
        break

      case 'markupsModeEdit':

        await configManager.react.setState({
          stateSelection: false,
          stateCreation: true,
          disabled: false
        })
        markupsUi.panel.setVisible(true)
        markupsCore.show()
        break
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onEditMarkupsClosed () {
    const { markupsMode } = this.react.getState()

    if (markupsMode.id === 'markupsModeEdit') {
      this.setMarkupsMode({
        id: 'markupsModeView',
        name: 'View Markups'
      })
    }
  }

  /// //////////////////////////////////////////////////////////////
  //
  //  From viewer.getState:
  //  Allow extensions to inject their state data
  //
  //  for (var extensionName in viewer.loadedExtensions) {
  //    viewer.loadedExtensions[extensionName].getState(
  //      viewerState);
  //  }
  /// //////////////////////////////////////////////////////////////
  getState (viewerState) {
    const { markupsCore, markupsMode } = this.react.getState()

    if (markupsMode.id === 'markupsModeEdit') {
      viewerState.Markup2D = {
        data: markupsCore.generateData()
      }
    }
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  // restoreState (viewerState) {
  //
  //  if (viewerState.Markup2D) {
  //
  //    const {markupsCore} = this.react.getState()
  //
  //    const onStateRestored = () => {
  //
  //      //markupsCore.show()
  //
  //      this.viewer.removeEventListener(
  //        Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT,
  //        onStateRestored)
  //    }
  //
  //    this.viewer.addEventListener(
  //      Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT,
  //      onStateRestored)
  //
  //    //markupsCore.hide()
  //  }
  // }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  onSequenceDeleted (sequence) {
    const { markupsCore } = this.react.getState()

    sequence.stateIds.forEach((id) => {
      markupsCore.unloadMarkups(id)
    })
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  onStateDeleted (stateId) {
    const { markupsCore } = this.react.getState()

    markupsCore.unloadMarkups(stateId)
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  onStateToggled (viewerState) {
    if (viewerState.Markup2D) {
      const { markupsCore } = this.react.getState()

      const { data } = viewerState.Markup2D

      viewerState.active
        ? markupsCore.loadMarkups(data, viewerState.id)
        : markupsCore.unloadMarkups(viewerState.id)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async setDocking (docked) {
    const id = Markup2DExtension.ExtensionId

    if (docked) {
      await this.react.popRenderExtension(id)

      this.react.pushViewerPanel(this, {
        height: 250,
        width: 350
      })
    } else {
      await this.react.popViewerPanel(id)

      this.react.pushRenderExtension(this)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderTitle () {
    const state = this.react.getState()

    const menuItems = state.modes.map((item) => {
      return (
        <MenuItem
          eventKey={item.id} key={item.id}
          onClick={() => {
            this.setMarkupsMode(item)
          }}
        >
          {item.name}
        </MenuItem>
      )
    })

    return (
      <div className='title'>
        <label>
          Markups 2D
        </label>

        <DropdownButton
          title={'Mode: ' + state.markupsMode.name}
          key='markup-2d-dropdown'
          id='markup-2d-dropdown'
        >
          {menuItems}
        </DropdownButton>

      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderContent () {
    const { configManager, showLoader } =
      this.react.getState()

    const opts = {
      showTitle: false
    }

    return (
      <div className='content'>
        <ReactLoader show={showLoader} />

        {configManager && configManager.render(opts)}

      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render (opts) {
    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}
      >

        {this.renderContent()}

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  Markup2DExtension.ExtensionId,
  Markup2DExtension)

export default 'Viewing.Extension.Markup2D'
