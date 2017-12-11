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
  onNodeChecked (node) {

  }

  /////////////////////////////////////////////////////////
  // parse urn into { bucketKey, objectKey }
  //
  /////////////////////////////////////////////////////////
  parseURN (urn) {

    const parts = atob(urn).split('/')

    const bucketKey = parts[0].split(':').pop()

    const objectKey = parts[1]

    return {
      bucketKey,
      objectKey
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async createScene () {

    let notification = null

    try {

      const sceneId = this.sceneId || this.guid()

      const urn = this.props.model.urn

      const objectId = this.props.hierarchy.data.objects[0].objectid

      const {bucketKey} = this.parseURN(urn)

      const sceneDef = {
        prj: {
          bucketKey,
          objectId,
          urn
        }
      }

      const opts = {

      }

      notification = this.props.notifySvc.add({
        title: 'Creating scene ' + sceneId + '...',
        dismissible: false,
        status: 'loading',
        id: this.guid(),
        dismissAfter: 0,
        position: 'tl'
      })

      await this.toolkitAPI.createScene(
        urn, sceneId, sceneDef, opts)

      await this.toolkitAPI.processScene(
        urn, sceneId)

      notification.title = `Scene ${sceneId} created!`
      notification.dismissAfter = 1500
      notification.status = 'success'

      this.props.notifySvc.update(notification)

    } catch (ex) {

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
