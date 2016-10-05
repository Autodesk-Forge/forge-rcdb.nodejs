import StateManagerExtension from 'Viewing.Extension.StateManager'
import VisualReportExtension from 'Viewing.Extension.VisualReport'
import CanvasInfoExtension from 'Viewing.Extension.CanvasInfo'
import Markup3DExtension from 'Viewing.Extension.Markup3D'
import ViewerToolkit from 'Viewer.Toolkit'
import ServiceManager from 'SvcManager'
import React from 'react'
import './Viewer.scss'


class Viewer extends React.Component {

  constructor () {

    super()

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.eventSvc = ServiceManager.getService(
      'EventSvc')
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  getSize (viewer) {
    return {
      height: $(viewer.container).height(),
      width: $(viewer.container).width()
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  viewerEvent (event) {
    return new Promise((resolve, reject) => {
      this.viewer.addEventListener(event, () => {
        resolve()
      })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  initialize (env) {

    return new Promise((resolve, reject) => {

      if(this.initialized) {

        resolve()

      } else {

        const options = {
          env: env,
          getAccessToken: (callback) => {
            $.get('/api/forge/token/2legged', (tokenResponse) => {
              callback(
                tokenResponse.access_token,
                tokenResponse.expires_in)
            })
          }
        }

        Autodesk.Viewing.Initializer (options, () => {
          this.initialized = true
          resolve()
        });
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  loadDocument (urn) {

    return new Promise((resolve, reject) => {

      Autodesk.Viewing.Document.load(urn, (doc) => {
          resolve (doc)

        },(errCode) => {

          reject (errCode)
        })
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  async componentDidMount () {

    try {

      const model = await this.modelSvc.getModel(
        'forge-rcdb',
        this.props.modelId)

      await this.initialize(model.env)

      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(
        this.viewerContainer)

      this.viewer.start()

      this.viewerSize = this.getSize(this.viewer)

      var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
        'forge-rcdb-toolbar');

      var viewerToolbar = this.viewer.getToolbar(true)

      viewerToolbar.addControl(ctrlGroup)

      const events = [
        this.viewerEvent(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT),
        this.viewerEvent(Autodesk.Viewing.GEOMETRY_LOADED_EVENT)
      ]

      Promise.all(events).then(async() => {

        this.viewer.resize()

        this.viewer.loadExtension(VisualReportExtension, {
          container: $('.viewer-view')[0],
          parentControl: ctrlGroup
        })

        this.viewer.setLightPreset(1)

        setTimeout(()=> {
          this.viewer.setLightPreset(0)
          this.viewer.setBackgroundColor(
            122, 198, 255,
            219, 219, 219)
        }, 600)

        this.viewer.loadExtension(StateManagerExtension, {
          apiUrl: `/api/models/${'forge-rcdb'}`,
          container: $('.viewer-view')[0],
          parentControl: ctrlGroup,
          model: model
        })

        this.viewer.loadExtension(Markup3DExtension, {
          parentControl: ctrlGroup
        })

        const removedControls = [
          '#navTools',
          '#toolbar-panTool',
          '#toolbar-zoomTool',
          '#toolbar-firstPersonTool',
          '#toolbar-cameraSubmenuTool'
        ]

        $(removedControls.join(',')).css({display:'none'})

        this.viewer.loadExtension(CanvasInfoExtension, {
          materials: this.props.dbItems,
          parentControl: ctrlGroup,
          autoShow: true,
          onMaterialMapLoaded: (materialMap) => {

            this.props.onFilterDbItems(
              this.props.dbItems.filter((item) => {
                return (materialMap[item.name] != null)
              }))
          }
        })

        this.eventSvc.on('updateDbItem', (updatedDbItem) => {

          const canvasInfoExt = this.viewer.getExtension(
            CanvasInfoExtension)

          canvasInfoExt.updateMaterial(updatedDbItem)
        })

        //setInterval(()=> {
        //
        //  var idx = Math.floor((Math.random() * 100)%this.props.dbItems.length)
        //
        //  var m = this.props.dbItems[idx]
        //
        //  m.price = Math.random() * 100
        //
        //  this.updateMaterial(m)
        //
        //}, 1000)

        //const componentIds = await ViewerToolkit.getLeafNodes(
        //  this.viewer.model)
        //
        //var componentsMap = await ViewerToolkit.mapComponentsByProp(
        //  this.viewer.model,
        //  'Material',
        //  componentIds);
        //
        //const materialSvc = ServiceManager.getService(
        //  'MaterialSvc')
        //
        //Object.keys(componentsMap).forEach(async(key) => {
        //
        //  const res = await materialSvc.postMaterial('forge-rcdb', {
        //    name: key,
        //    supplier: 'Autodesk',
        //    currency: 'USD',
        //    price: 1.0
        //  })
        //
        //  console.log(res)
        //})
      })

      switch (model.env) {

        case 'Local':

          this.viewer.load(model.path)
          break

        case 'AutodeskProduction':

          const doc = await this.loadDocument(
            'urn:' + model.urn)

          const path = ViewerToolkit.getDefaultViewablePath(
            doc)

          this.viewer.loadModel(path)

          break
      }

    } catch (ex) {

      console.log('Viewer Initialization Error: ')
      console.log(ex)
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  componentWillUnmount () {

    if(this.viewer) {

      this.viewer.finish()
      this.viewer = null
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  onResize () {

    const canvasInfoExt = this.viewer.getExtension(
      CanvasInfoExtension)

    canvasInfoExt.resize()
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  render() {

    if (this.viewer) {

      this.viewer.resize()

      const viewerSize = this.getSize(this.viewer)

      if(this.viewerSize.width  !== viewerSize.width ||
         this.viewerSize.height !== viewerSize.height) {

        this.viewerSize = viewerSize

        this.onResize()
      }
    }

    return (
      <div className="viewer" ref={
        (div)=> {this.viewerContainer = div
        }}>
      </div>
    )
  }
}

export default Viewer
