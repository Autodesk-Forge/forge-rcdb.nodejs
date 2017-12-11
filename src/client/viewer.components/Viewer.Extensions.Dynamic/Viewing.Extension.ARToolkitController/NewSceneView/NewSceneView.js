import HierarchyTreeView from './HierarchyTreeView'
import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import React from 'react'

export default class NewSceneView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onRootNodeCreated = this.onRootNodeCreated.bind(this)
    this.onInputChanged = this.onInputChanged.bind(this)
    this.onNodeChecked = this.onNodeChecked.bind(this)
    this.createScene = this.createScene.bind(this)

    this.toolkitAPI = this.props.arvrToolkitAPI
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInputChanged (e) {

    this.sceneId = e.target.value
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onRootNodeCreated (tree, node) {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onNodeChecked (node) {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async createScene () {

    const sceneId = this.sceneId || this.guid()

    const notification = this.props.notifySvc.add({
      title: 'Creating scene ' + sceneId + ' ...',
      dismissible: false,
      status: 'loading',
      id: this.guid(),
      dismissAfter: 0,
      position: 'tl'
    })

    try {

      console.log(this.getEnabledDbIds())

      const objectId = this.props.hierarchy.data.objects[0].objectid

      const {urn, projectId, versionId} = this.props.model

      const sceneDef = {
        prj: {
          objectId,
          urn
        }
      }

      const opts = {

      }

      if (projectId) {

        await this.toolkitAPI.createScene3Legged(
          projectId, versionId,
          sceneId, sceneDef, opts)

      } else {

        await this.toolkitAPI.createScene(
          urn, sceneId, sceneDef, opts)
      }

      await this.toolkitAPI.processScene(
        urn, sceneId)

      notification.title = `Scene ${sceneId} created!`
      notification.dismissAfter = 1500
      notification.status = 'success'

      this.props.notifySvc.update(notification)

      this.props.onSceneCreated()

    } catch (ex) {

      console.log(ex)

      notification.title = `Scene ${sceneId} failed :(`
      notification.dismissAfter = 1500
      notification.status = 'error'

      this.props.notifySvc.update(notification)
    }
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
  componentWillReceiveProps (props) {

    if (props.hierarchy && (this.props.guid !== props.guid)) {
      
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  buildDbIdMapRec (node) {

    const childrenIds = node.objects
      ? node.objects.map((obj) => obj.objectid)
      : []

    this.dbIdMap[node.objectid] = {
      enabled : true,
      childrenIds
    }

    if (node.objects) {

      node.objects.forEach((object) => {

        this.buildDbIdMapRec(object)
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setdDbIdMapRec (dbId, enabled) {

    const node = this.dbIdMap[dbId]

    if (enabled) {

      node.enabled = enabled
    }

    node.childrenIds.forEach((childId) => {

    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getEnabledDbIds () {

    return Object.keys(this.dbIdMap).filter((dbId) => {

      return this.dbIdMap[dbId].enabled
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const {guid, hierarchy} = this.props

    return(
      <div className="new-scene">
        <ReactLoader show={!hierarchy}/>
        {
          this.props.hierarchy &&
          <div className="content">
            <div className="controls">
              <input
                onChange={this.onInputChanged}
                placeholder="Scene name..."
                type="text"
              />
              <button onClick={this.createScene}>
                <span className="fa fa-cloud-upload"/>
                Create scene ...
              </button>
            </div>
            <HierarchyTreeView
              onRootNodeCreated={this.onRootNodeCreated}
              onNodeChecked={this.onNodeChecked}
              hierarchy={hierarchy}
              showSwitch={true}
              guid={guid}
            />
          </div>
        }
      </div>
    )
  }
}
