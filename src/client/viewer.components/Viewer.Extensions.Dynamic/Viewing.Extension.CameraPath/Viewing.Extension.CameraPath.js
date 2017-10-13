/////////////////////////////////////////////////////////////////
// CameraPath Viewer Extension
// By Philippe Leefsma, Autodesk Inc, October 2017
//
/////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import WidgetContainer from 'WidgetContainer'
import './Viewing.Extension.CameraPath.scss'
import Toolkit from 'Viewer.Toolkit'
import ReactDOM from 'react-dom'
import React from 'react'


class CameraPathExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.react = options.react
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {

    this.react.setState({

    }).then (() => {

      this.react.pushRenderExtension(this)
    })

    console.log('Viewing.Extension.CameraPath loaded')

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className () {

    return 'camera-path'
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.CameraPath'
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    console.log('Viewing.Extension.CameraPath unloaded')

    super.unload ()

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onModelRootLoaded () {

    this.options.loader.show (false)
  }

  tweenCamera () {


  }

  /////////////////////////////////////////////////////////
  // React method - render panel title
  //
  /////////////////////////////////////////////////////////
  renderTitle (docked) {

    return (
      <div className="title">
        <label>
          Camera Path
        </label>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    return (
      <div className="content">
        <button onClick={() => this.tweenCamera()}

        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts) {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        showTitle={opts.showTitle}
        className={this.className}>

        { this.renderContent () }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  CameraPathExtension.ExtensionId,
  CameraPathExtension)

export default 'Viewing.Extension.CameraPath'








