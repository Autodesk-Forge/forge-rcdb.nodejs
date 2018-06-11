import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Tabs from 'react-bootstrap/lib/Tabs'
import Tab from 'react-bootstrap/lib/Tab'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import { ReactLoader } from 'Loader'
import Measure from 'react-measure'
import ClientAPI from 'ClientAPI'
import QRCode from 'qrcode.react'
import JSONView from 'JSONView'
import React from 'react'

class TokenAPI extends ClientAPI {

  constructor (baseUrl) {

    super (baseUrl)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getToken (auth) {

    const url = `/${auth}`

    return this.ajax({
      rawBody: true,
      url
    })
  }
}

export default class ScenesView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.showQrCodeDlg = this.showQrCodeDlg.bind(this)
    this.onTabSelected = this.onTabSelected.bind(this)
    this.refreshToken = this.refreshToken.bind(this)
    this.deleteScene = this.deleteScene.bind(this)

    this.tokenAPI = new TokenAPI('/api/forge/token')

    this.toolkitAPI = this.props.arvrToolkitAPI

    this.dialogSvc =
      ServiceManager.getService('DialogSvc')

    this.state = {
      activeTabKey: 'scene-info',
      instanceTree: null,
      sceneInfo: null,
      tabsWidth: 0,
      scene: null,
      token: null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.refreshToken()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onTabSelected (tabKey) {

    this.assignState({
      activeTabKey: tabKey
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTabs () {

    const {activeTabKey, sceneInfo, tabsWidth} = this.state

    const nbTabs = 4

    const style = {
      width:
        `${Math.floor((tabsWidth-8)/nbTabs-15)}px`
    }

    const tabTitle = (title) => {
      return (
        <label style={style}>
          {title}
        </label>
      )
    }

    return (
      <div className={`scene-tabs${sceneInfo ? '':' disabled'}`}>
        <Measure bounds onResize={(rect) => {
          this.assignState({
            tabsWidth: rect.bounds.width
          })
        }}>
        {
          ({ measureRef }) =>
            <div ref={measureRef} className="tabs-container">
              <Tabs activeKey={activeTabKey}
                onSelect={this.onTabSelected}
                id="scene-tabs"
                className="tabs">
                <Tab className="tab-container"
                  title={tabTitle('Scene Info')}
                  eventKey="scene-info"
                  key="scene-info">
                  {
                    (activeTabKey === 'scene-info') &&
                    this.renderSceneInfo()
                  }
                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('Instance Tree')}
                  eventKey="instanceTree"
                  key="instanceTree">
                  {
                    (activeTabKey === 'instanceTree') &&
                    this.renderInstanceTree()
                  }
                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('Resources')}
                  eventKey="resources"
                  key="resources">
                  {
                    (activeTabKey === 'resources') &&
                    this.renderResources()
                  }
                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('QR Code')}
                  eventKey="qr-code"
                  key="qr-code">
                  {
                    (activeTabKey === 'qr-code') &&
                    this.renderQRCode()
                  }
                </Tab>
              </Tabs>
            </div>
          }
        </Measure>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  guid (format = 'xxxx-xxxx-xxxx') {

    var d = new Date().getTime()

    const guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async deleteScene () {

    const {urn, projectId, versionId} = this.props.model

    const {scene} = this.state

    const sceneId = scene.name

    const notification = this.props.notifySvc.add({
      title: 'Deleting scene ' + sceneId + ' ...',
      dismissible: false,
      status: 'loading',
      id: this.guid(),
      dismissAfter: 0,
      position: 'tl'
    })

    if (projectId) {

      await this.toolkitAPI.deleteScene3Legged (
        projectId, versionId, sceneId)

    } else {

      await this.toolkitAPI.deleteScene (
        urn, sceneId)
    }

    this.assignState({
      instanceTree: null,
      sceneInfo: null,
      scene: null
    })

    notification.title = `Scene ${sceneId} deleted!`
    notification.dismissAfter = 1500
    notification.status = 'success'

    this.props.notifySvc.update(notification)

    this.props.onSceneDeleted()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async refreshToken () {

    await this.setState({
      token: null
    })

    const token =
      await this.tokenAPI.getToken(
      this.props.auth)

    this.setState({
      token
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderSceneInfo () {

    const {scene, sceneInfo} = this.state

    const showLoader = !sceneInfo && scene

    return (
      <div>
        <ReactLoader show={showLoader}/>
        {
          sceneInfo &&
          <JSONView src={sceneInfo}/>
        }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderInstanceTree () {

    const {scene, instanceTree} = this.state

    const showLoader = !instanceTree && scene

    return (
      <div>
        <ReactLoader show={showLoader}/>
        {
          instanceTree &&
          <JSONView src={instanceTree}/>
        }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderResources () {

    return (
      <div>
        NOT IMPLEMENTED
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  showQrCodeDlg (qrCodeStr) {

    const size = window.innerHeight - 110

    this.dialogSvc.setState({
      className: 'qr-code-dlg',
      title: 'QR Code ...',
      showCancel: false,
      search: '',
      content:
        <div className="qr-code-dlg-content">
          <QRCode value={qrCodeStr} size={size}/>
        </div>,
      open: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderQRCode () {

    const { scene, sceneInfo, token } = this.state
    
    const qrCode = {
      model_id: this.props.model.id,
      token: token.access_token,
      urn: sceneInfo.prj.urn,
      scene_id: scene.name
    }

    const qrCodeStr = JSON.stringify(qrCode)

    return (
      <div className="qr-code">
        <button
          className="btn-refresh"
          onClick={this.refreshToken}>
          <span className="fa fa-refresh"/>
        </button>
        <ReactLoader show={!token}/>
        <div onClick={() => this.showQrCodeDlg(qrCodeStr)}>
          <QRCode value={qrCodeStr} size={256}/>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const { scene, sceneInfo } = this.state

    const { model, scenes } = this.props

    const menuItems = !scenes
      ? null : scenes.map((sc, idx) => {
      return (
        <MenuItem eventKey={idx} key={idx}
          onClick={() => {

            this.assignState({
              instanceTree: null,
              sceneInfo: null,
              scene: sc
            })

            const urn = model.urn

            if (model.projectId) {

              const { projectId, versionId } = model

              this.toolkitAPI.getScene3Legged(
                projectId, versionId, sc.name).then(
                (sceneInfo) => {

                  this.assignState({
                    sceneInfo
                  })
                })

            } else {

              this.toolkitAPI.getScene(
                urn, sc.name).then(
                (sceneInfo) => {

                  this.assignState({
                    sceneInfo
                  })
                })
            }

            this.toolkitAPI.getInstanceTree(
              urn, sc.name).then(
              (instanceTree) => {

                this.assignState({
                  instanceTree
                })
              })
          }}>
          { sc.name }
        </MenuItem>
      )
    })

    return(
      <div className="scenes">
        <ReactLoader show={!scenes}/>
        <div className="controls">
          <DropdownButton
            title={`Select scene: ${scene ? scene.name : ''}`}
            disabled={!scenes || !scenes.length}
            key={'dropdown-scenes'}
            id={'dropdown-scenes'}>
              { menuItems }
          </DropdownButton>
          <button
            onClick={this.deleteScene}
            disabled={!sceneInfo}
            className="del-btn">
            <span className="fa fa-times"/>
            Delete scene ...
          </button>
        </div>
          { this.renderTabs() }
      </div>
    )
  }
}
