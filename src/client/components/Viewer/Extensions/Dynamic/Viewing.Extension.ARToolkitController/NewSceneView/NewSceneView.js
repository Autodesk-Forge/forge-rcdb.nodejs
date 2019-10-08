import HierarchyTreeView from './HierarchyTreeView'
import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import React from 'react'

export default class NewSceneView extends BaseComponent {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super(props)

    this.onRootNodeCreated = this.onRootNodeCreated.bind(this)
    this.onInputChanged = this.onInputChanged.bind(this)
    this.onNodeChecked = this.onNodeChecked.bind(this)
    this.createScene = this.createScene.bind(this)

    this.toolkitAPI = this.props.arvrToolkitAPI
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onInputChanged (e) {
    this.sceneId = e.target.value
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onRootNodeCreated (tree, node) {

  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onNodeChecked (node) {
    const nodeId = node.id.toString()

    if (node.checked) {
      this.includedDbIds.push(nodeId)

      this.removedDbIds =
        this.removedDbIds.filter((id) => {
          return id !== nodeId
        })
    } else {
      this.removedDbIds.push(nodeId)

      this.includedDbIds =
        this.includedDbIds.filter((id) => {
          return id !== nodeId
        })
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
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
      const { urn, projectId, versionId } = this.props.model

      const opts = {

      }

      if (projectId) {
        const sceneDef3Legged = {
          prj: {
            projectId,
            versionId,
            urn
          },
          remove: this.removedDbIds,
          list: this.includedDbIds
        }

        await this.toolkitAPI.createScene3Legged(
          projectId, versionId,
          sceneId, sceneDef3Legged, opts)
      } else {
        const sceneDef2Legged = {
          prj: {
            urn
          },
          remove: this.removedDbIds,
          list: this.includedDbIds
        }

        await this.toolkitAPI.createScene(
          urn, sceneId, sceneDef2Legged, opts)
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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  shouldComponentUpdate (nextProps) {
    if (nextProps.guid !== this.props.guid) {
      this.includedDbIds = []

      this.removedDbIds = []

      return true
    }

    return false
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const { guid, hierarchy } = this.props

    return (
      <div className='new-scene'>
        <ReactLoader show={!hierarchy} />
        {
          this.props.hierarchy &&
            <div className='content'>
              <div className='controls'>
                <input
                  onChange={this.onInputChanged}
                  placeholder='Scene name...'
                  type='text'
                />
                <button onClick={this.createScene}>
                  <span className='fa fa-cloud-upload' />
                Create scene ...
                </button>
              </div>
              <HierarchyTreeView
                onRootNodeCreated={this.onRootNodeCreated}
                onNodeChecked={this.onNodeChecked}
                hierarchy={hierarchy}
                showSwitch
                guid={guid}
              />
            </div>
        }
      </div>
    )
  }
}
