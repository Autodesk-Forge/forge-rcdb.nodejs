///////////////////////////////////////////////////////////
// DataManagement Viewer Extension
// By Philippe Leefsma, Autodesk Inc, July 2017
//
///////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import FolderSearchPanel from './FolderSearchPanel'
import DerivativesAPI from './Derivatives.API'
import WidgetContainer from 'WidgetContainer'
import { browserHistory } from 'react-router'
import { Tabs, Tab } from 'react-bootstrap'
import DataTreeView from './DataTreeView'
import ServiceManager from 'SvcManager'
import DMUploader from './DMUploader'
import { ReactLoader } from 'Loader'
import Measure from 'react-measure'
import DOMPurify from 'dompurify'
import ReactDOM from 'react-dom'
import DMAPI from './DM.API'
import Label from 'Label'
import React from 'react'

class DataManagementExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////
	// Class constructor
  //
  /////////////////////////////////////////////////////////
	constructor (viewer, options) {

		super (viewer, options)

    this.onVersionSelected = this.onVersionSelected.bind(this)
    this.onItemNodeCreated = this.onItemNodeCreated.bind(this)
    this.onUploadComplete = this.onUploadComplete.bind(this)
    this.onUploadProgress = this.onUploadProgress.bind(this)
    this.onFolderSearch = this.onFolderSearch.bind(this)
    this.onFolderUpload = this.onFolderUpload.bind(this)
    this.onCreateFolder = this.onCreateFolder.bind(this)
    this.onLoadViewable = this.onLoadViewable.bind(this)
    this.onTabSelected = this.onTabSelected.bind(this)
    this.onInitUpload = this.onInitUpload.bind(this)
    this.onDeleteItem = this.onDeleteItem.bind(this)

    this.socketSvc =
      ServiceManager.getService(
        'SocketSvc')

    this.notifySvc =
      ServiceManager.getService(
      'NotifySvc')

    this.dialogSvc =
      ServiceManager.getService(
        'DialogSvc')

    this.forgeSvc =
      ServiceManager.getService(
        'ForgeSvc')

    this.derivativesAPI = new DerivativesAPI({
      apiUrl: '/api/derivatives/3legged'
    })

    this.dmAPI = new DMAPI({
      apiUrl: '/api/dm'
    })

    this.react = options.react
	}

	/////////////////////////////////////////////////////////
	// Load callback
  //
  /////////////////////////////////////////////////////////
	load () {

    if (!this.viewer.model) {

      this.viewer.container.classList.add('empty')
    }

    this.react.setState({

      user: this.options.appState.user,
      activeTabKey: null,
      showTitle: false,
      tabsWidth: 0,
      hubs: null

    }).then (async() => {

      await this.react.pushRenderExtension(this)

      if (!this.options.appState.user) {

        try {

          const user = await this.forgeSvc.getUser()

          this.react.setState({
            user
          })

        } catch (ex) {

          return this.showLogin()
        }
      }

      this.options.loader.show(false)

      const hubsRes = await this.dmAPI.getHubs()

      this.react.setState({
        hubs: hubsRes.data
      })
    })

    this.socketSvc.on(
      'dm.upload.complete',
      this.onUploadComplete)

    console.log('Viewing.Extension.DataManagement loaded')

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get className() {

    return 'data-management'
  }

  /////////////////////////////////////////////////////////
	// Extension Id
  //
  /////////////////////////////////////////////////////////
	static get ExtensionId () {

		return 'Viewing.Extension.DataManagement'
	}

  /////////////////////////////////////////////////////////
	// Unload callback
  //
  /////////////////////////////////////////////////////////
	unload () {

    console.log('Viewing.Extension.DataManagement loaded')

    this.socketSvc.off(
      'dm.upload.complete',
      this.onUploadComplete)

    super.unload ()

		return true
	}

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setNodeViewerUrn (node, urn) {

    try {

      if (urn) {

        const manifest =
          await this.derivativesAPI.getManifest(urn)

        if (this.derivativesAPI.hasDerivative (
            manifest, { type: 'geometry'})) {

          node.setViewerUrn(urn)
        }
      }

    } catch (ex) {

      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setNodeThumbnail (node, urn) {

    try {

      const thumbnail =
        await this.derivativesAPI.getThumbnail(urn, {
        size: 200, base64: true
      })

      const base64 = `data:image/png;base64,${thumbnail}`

      node.setThumbnail(base64)

    } catch (ex) {

      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onDeleteItem (node) {

    const onClose = (result) => {

      this.dialogSvc.off('dialog.close', onClose)

      if (result === 'OK') {

        this.dmAPI.deleteItem(
          node.projectId,
          node.itemId)
      }
    }

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      className: 'item-delete-dlg',
      title: 'Delete Item ...',
      content:
        <div>
          Are you sure you want to delete
          <br/>
          {node.name} ?
        </div>,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onItemNodeCreated (node) {

    node.showLoader(true)

    const versionsRes =
      await this.dmAPI.getItemVersions(
        node.props.projectId,
        node.props.itemId)

    const versions = versionsRes.data

    if (versions.length) {

      const version = versions[0]

      node.setActiveVersion(version)

      const urn = encodeURIComponent(
        this.dmAPI.getVersionURN(version))

      // fix for BIM Docs:
      // displayName doesn't appear in item

      if (!node.name.length) {

        const {displayName} = version.attributes

        node.setName(displayName)
      }

      await this.setNodeViewerUrn(node, urn)

      node.setVersions(versions)

      await this.setNodeThumbnail(node, urn)

      this.emit('item.created', node)
    }

    node.showLoader(false)

    node.setLoaded(true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onVersionNodeCreated (node) {

    node.showLoader(true)

    const versionRes =
      await this.dmAPI.getVersion(
        node.props.projectId,
        node.props.versionId)

    const version = versionRes.data

    node.setActiveVersion(version)

    const urn = this.dmAPI.getVersionURN(version)

    // fix for BIM Docs:
    // displayName doesn't appear in item

    if (!node.name.length) {

      const {displayName} = version.attributes

      node.setName(displayName)
    }

    await this.setNodeViewerUrn(node, urn)

    await this.setNodeThumbnail(node, urn)

    node.showLoader(false)

    node.setLoaded(true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onVersionSelected (node) {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getVersionFileType (version) {

    if (version.attributes.fileType) {

      return version.attributes.fileType

    } else if (version.relationships.storage) {

      const fileId = version.relationships.storage.data.id

      return fileId.split('.').pop(-1)

    } else if (version.attributes.name) {

      return version.attributes.name.split('.').pop(-1)
    }

    return 'unknown'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onLoadViewable (node) {

    try {

      node.showLoader(true)

      const extId = 'Viewing.Extension.ModelLoader'

      const options = Object.assign({},
        this.options, {
          database: 'gallery'
        })

      const loader =
        this.viewer.getExtension(extId) ||
        await this.viewer.loadDynamicExtension(
          extId, options)

      const version = node.activeVersion

      await loader.loadModel({
        fileType: this.getVersionFileType(version),
        name: node.props.name.split('.')[0],
        _id : this.options.dbModel._id,
        env: 'AutodeskProduction',
        database: 'configurator',
        model: {
          proxy: 'lmv-proxy-3legged',
          urn: node.viewerUrn
        }
      })

    } catch (ex) {

      console.log(ex)

    } finally {

      node.showLoader(false)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInitUpload (data) {

    this.dialogSvc.setState({
      open: false
    })

    const notification = this.notifySvc.add({
      title: 'Uploading ' + data.file.name,
      message: 'progress: 0%',
      dismissible: false,
      status: 'loading',
      id: data.uploadId,
      dismissAfter: 0,
      position: 'tl'
    })

    notification.buttons = [{
      name: 'Hide',
      onClick: () => {
        notification.dismissAfter = 1
        this.notifySvc.update(notification)
      }
    }]

    this.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUploadProgress (data) {

    const notification =
      this.notifySvc.getNotification(data.uploadId)

    if (!notification.forgeUpload) {

      const progress = data.percent * 0.5

      notification.message =
        `progress: ${progress.toFixed(2)}%`

      this.notifySvc.update(notification)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUploadComplete (data) {

    this.emit('upload.complete', data)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onFolderSearch (data) {

    const panel = new FolderSearchPanel(data, {
      menuContainer: this.options.appContainer,
      derivativesAPI: this.derivativesAPI,
      dmAPI: this.dmAPI
    })

    panel.on('panel.close', (panelId) => {

      this.react.popViewerPanel(panelId)
    })

    panel.on('version.created', (node) => {

      this.onVersionNodeCreated(node)
    })

    panel.on('item.created', (node) => {

      this.onItemNodeCreated(node)
    })

    panel.on('load.viewable', (node) => {

      this.onLoadViewable(node)
    })

    this.react.pushViewerPanel(panel, {
      className: panel.className,
      minWidth: 435,
      height: 480,
      width: 450
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onFolderUpload (data) {

    const onClose = (result) => {

      this.dialogSvc.off('dialog.close', onClose)

      if (result === 'OK') {

      }
    }

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      className: 'folder-upload-dlg',
      title: 'Upload to Folder ...',
      content:
        <DMUploader
          onProgress={this.onUploadProgress}
          onInitUpload={this.onInitUpload}
          projectId={data.projectId}
          folderId={data.folderId}
          hubId={data.hubId}
          nodeId={data.id}
          api={this.dmAPI}
        />,
      showOK: false,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onCreateFolder (data) {

    const onClose = (result) => {

      this.dialogSvc.off('dialog.close', onClose)

      if (result === 'OK') {

      }
    }

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      className: 'folder-create-dlg',
      title: 'Create Folder ...',
      content:
        <div
        />,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async setDocking (docked) {

    const id = DataManagementExtension.ExtensionId

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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  showLogin () {

    const onClose = (result) => {

      this.dialogSvc.off('dialog.close', onClose)

      if (result === 'OK') {

        this.forgeSvc.login()
        return
      }

      browserHistory.push('/configurator')
    }

    this.dialogSvc.on('dialog.close', onClose)

    this.dialogSvc.setState({
      onRequestClose: () => {},
      className: 'login-dlg',
      title: 'Forge Login required ...',
      content:
        <div>
          Press OK to login ...
        </div>,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle (docked) {

    const spanClass = docked
      ? 'fa fa-chain-broken'
      : 'fa fa-chain'

    return (
      <div className="title">
        <label>
          Data Management
        </label>
        <div className="data-management-controls">
          <button onClick={() => this.setDocking(docked)}
            title="Toggle docking mode">
            <span className={spanClass}/>
          </button>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onTabSelected (tabKey) {

    this.react.setState({
      activeTabKey: tabKey
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderHubs (hubs) {

    const {activeTabKey, tabsWidth} = this.react.getState()

    const tabs = hubs.map((hub) => {

      const hubHeader = this.dmAPI.getHubHeader(hub)

      const style = {
        width:
          `${Math.floor((tabsWidth-8)/hubs.length-15)}px`
      }

      const title =
        <label style={style}>
          {`${hubHeader}: ${hub.attributes.name}`}
        </label>

      return (
        <Tab className="tab-container"
          eventKey={hub.id}
          title={title}
          key={hub.id}>
          {
            <DataTreeView
              onItemNodeCreated={this.onItemNodeCreated}
              menuContainer={this.options.appContainer}
              onFolderUpload={this.onFolderUpload}
              onFolderSearch={this.onFolderSearch}
              onCreateFolder={this.onCreateFolder}
              derivativesAPI={this.derivativesAPI}
              onLoadViewable={this.onLoadViewable}
              onDeleteItem={this.onDeleteItem}
              dmAPI={this.dmAPI}
              dmEvents={this}
              hub={hub}
            />
          }
        </Tab>
      )
    })

    return (
      <Measure bounds onResize={(rect) => {
        this.react.setState({
          tabsWidth: rect.bounds.width
        })
      }}>
        {
          ({ measureRef }) =>
          <div ref={measureRef} className="tabs-container">
            <Tabs activeKey={activeTabKey || hubs[0].id}
              onSelect={this.onTabSelected}
              className="tabs"
              id="hubs-tab">
              { tabs }
            </Tabs>
          </div>
        }
      </Measure>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const {hubs} = this.react.getState()

    const showLoader = !hubs

    return (
      <div className="content">
        <ReactLoader show={showLoader}/>
        { hubs && hubs.length && this.renderHubs(hubs) }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render (opts) {

    const {showTitle} = this.react.getState()

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle(opts.docked)}
        className={this.className}
        showTitle={showTitle}>

        { this.renderContent () }

      </WidgetContainer>
    )
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension (
  DataManagementExtension.ExtensionId,
  DataManagementExtension)

export default 'Viewing.Extension.DataManagement'
