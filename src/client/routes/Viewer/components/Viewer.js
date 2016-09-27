import StateManagerExtension from '../extensions/Viewing.Extension.StateManager'
import VisualReportExtension from '../extensions/Viewing.Extension.VisualReport'
import Markup3DExtension from '../extensions/Viewing.Extension.Markup3D'
import React from 'react'
import './Viewer.scss'


class Viewer extends React.Component {

  async componentDidMount () {

    try {

      await this.initialize()

      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
        this.viewerContainer)

      this.viewer.start()

      this.viewer.addEventListener(
        Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, ()=>{

          this.viewer.loadExtension(VisualReportExtension, {
            container: $('.viewer-view')[0]
          })
        })

      this.viewer.addEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT, ()=>{

          this.viewer.loadExtension(StateManagerExtension, {
            container: $('.viewer-view')[0]
          })

          this.viewer.loadExtension(Markup3DExtension, {

          })
        })

      this.viewer.load('./resources/models/engine/0.svf');

    } catch (ex) {

      console.log('Autodesk.Viewing.Initializer Error: ')
      console.log(ex)
    }
  }

  initialize () {

    return new Promise((resolve, reject) => {

      if(this.initialized) {

        resolve()

      } else {

        Autodesk.Viewing.Initializer ({env: 'Local'}, () => {

          this.initialized = true

          resolve()
        });
      }
    })
  }

  componentWillUnmount () {

    if(this.viewer) {

      this.viewer.finish()
      this.viewer = null
    }
  }

  onMouseDown (e) {

    if(e.target &&
       e.target.className &&
       e.target.className.toLowerCase &&
       e.target.className.toLowerCase () === 'handle') {

      return

    } else {

      e.stopPropagation()
    }
  }

  render() {

    if(this.viewer) {

      this.viewer.resize()
    }

    return (
      <div className="viewer" ref={(c)=>this.viewerContainer=c}>

      </div>
    )
  }
}

export default Viewer
