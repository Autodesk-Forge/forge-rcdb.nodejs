import EventsEmitter from 'EventsEmitter'
import Spinner from 'react-spinkit'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
export default class DataTreeNode extends EventsEmitter {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (props) {

    super ()

    this.onLoadItem = this.onLoadItem.bind(this)
    this.onExpand = this.onExpand.bind(this)

    this.on('expand', this.onExpand)

    this.delegate     = props.delegate
    this.parent       = props.parent
    this.level        = props.level
    this.group        = props.group
    this.type         = props.type
    this.api          = props.api
    this.id           = props.id

    this.children = []

    this.props = props
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  onExpand () {

    this.off('expand', this.onExpand)

    this.loadChildren()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  mount (domContainer) {

    domContainer.className = 'treenode-container'

    this.domContainer = domContainer

    this.reactNode = ReactDOM.render(
      <ReactTreeNode
        onLoadItem={this.onLoadItem}
        {...this.props}
      />,
      this.domContainer)

    this.collapse()
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  destroy () {

    if (this.children) {

      this.children.forEach((child) => {

        child.destroy ()
      })
    }

    ReactDOM.unmountComponentAtNode(
      this.domContainer)

    this.delegate.emit(
      'node.destroy', this.id)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  expand () {

    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('collapsed')
    target.classList.add('expanded')

    this.expanded = true

    this.emit('expand')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  collapse () {

    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('expanded')
    target.classList.add('collapsed')

    this.expanded = false
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadChildren () {

    switch (this.type) {

      case 'hubs':
        return this.loadHubChildren()

      case 'projects':
        return this.loadProjectChildren()

      case 'folders':
        return this.loadFolderChildren()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async loadHubChildren () {

    const projectsRes =
      await this.api.getProjects(this.props.hubId)

    const projects = _.sortBy(projectsRes.data,
      (project) => {
        return project.attributes.name.toLowerCase()
      })

    const hubType =
      this.props.details.attributes.extension.type

    const showProjects =
      (hubType === 'hubs:autodesk.bim360:Account')

    if (showProjects) {

      const projectTasks = projects.map((project) => {

        return new Promise((resolve) => {

          const rootId = project.relationships.rootFolder.data.id

          const childProps = Object.assign({}, this.props, {
            name: project.attributes.name,
            projectId: project.id,
            level: this.level + 1,
            type: project.type,
            details: project,
            folderId: rootId,
            id: project.id,
            parent: this
          })

          const childNode = new DataTreeNode(childProps)

          this.children.push(childNode)

          this.addChild(childNode)
        })
      })

    } else {

      const projectTasks = projects.map((project) => {

        return new Promise(async(resolve) => {

          const folderItemsRes =
            await this.api.getProjectTopFolders(
              this.props.hubId, project.id)

          folderItemsRes.data.forEach((folder) => {
            folder.projectId = project.id
          })

          return resolve(folderItemsRes.data)
        })
      })

      const folderArrays = await Promise.all(projectTasks)

      const folders = _.sortBy(_.flatten(folderArrays),
        (folderItem) => {
          return folderItem.attributes.displayName.toLowerCase()
        })

      const foldersTasks = folders.map((folder) => {

        return new Promise((resolve) => {

          const childProps = Object.assign({}, this.props, {
            name: folder.attributes.displayName,
            projectId: folder.projectId,
            level: this.level + 1,
            folderId: folder.id,
            type: folder.type,
            details: folder,
            id: folder.id,
            parent: this
          })

          const childNode = new DataTreeNode(childProps)

          this.children.push(childNode)

          this.addChild(childNode)
        })
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async loadProjectChildren () {

    const folderItemsRes =
      await this.api.getProjectTopFolders(
        this.props.hubId, this.props.projectId)

    const folderItems = _.sortBy(folderItemsRes.data,
      (folderItem) => {
        return folderItem.attributes.displayName.toLowerCase()
      })

    const folders = folderItems.filter((folderItem) => {

      return (folderItem.type === 'folders')
    })

    const items = folderItems.filter((folderItem) => {

      return (folderItem.type === 'items')
    })

    const folderTasks = folders.map((folder) => {

      return new Promise((resolve) => {

        const childProps = Object.assign({}, this.props, {
          name: folder.attributes.displayName,
          level: this.level + 1,
          folderId: folder.id,
          type: folder.type,
          details: folder,
          id: folder.id,
          parent: this
        })

        const childNode = new DataTreeNode(childProps)

        this.children.push(childNode)

        this.addChild(childNode)
      })
    })

    const itemTasks = items.map((item) => {

      return new Promise((resolve) => {

        const childProps = Object.assign({}, this.props, {
          name: item.attributes.displayName,
          level: this.level + 1,
          type: item.type,
          itemId: item.id,
          details: item,
          parent: this,
          id: item.id
        })

        const childNode = new DataTreeNode(childProps)

        this.delegate.emit('item.created', childNode)

        this.children.push(childNode)

        this.addChild(childNode)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async loadFolderChildren () {

    const folderItemsRes =
      await this.api.getFolderContent(
        this.props.projectId, this.props.folderId)

    const folderItems = _.sortBy(folderItemsRes.data,
      (folderItem) => {
        return folderItem.attributes.displayName.toLowerCase()
      })

    const folders = folderItems.filter((folderItem) => {

      return (folderItem.type === 'folders')
    })

    const items = folderItems.filter((folderItem) => {

      return (folderItem.type === 'items')
    })

    const folderTasks = folders.map((folder) => {

      return new Promise((resolve) => {

        const childProps = Object.assign({}, this.props, {
          name: folder.attributes.displayName,
          level: this.level + 1,
          folderId: folder.id,
          type: folder.type,
          details: folder,
          id: folder.id,
          parent: this
        })

        const childNode = new DataTreeNode(childProps)

        this.children.push(childNode)

        this.addChild(childNode)
      })
    })

    const itemTasks = items.map((item) => {

      return new Promise((resolve) => {

        const childProps = Object.assign({}, this.props, {
          name: item.attributes.displayName,
          level: this.level + 1,
          type: item.type,
          itemId: item.id,
          details: item,
          parent: this,
          id: item.id
        })

        const childNode = new DataTreeNode(childProps)

        this.delegate.emit('item.created', childNode)

        this.children.push(childNode)

        this.addChild(childNode)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onLoadItem () {

    this.delegate.emit('item.load', this)
  }
}

class ReactTreeNode extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.renderers = {
      projects: this.renderProjectNode.bind(this),
      folders: this.renderFolderNode.bind(this),
      items: this.renderItemNode.bind(this),
      hubs: this.renderHubNode.bind(this)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderHubNode() {

    return (
      <div className="treenode">
        <Label className="name"
          text={this.props.name}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderProjectNode() {

    return (
      <div className="treenode">
        <Label className="name"
          text={this.props.name}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderFolderNode() {

    return (
      <div className="treenode">
        <Label className="name"
          text={this.props.name}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItemNode() {

    return (
      <div className="treenode">
        <Label className="name"
          text={this.props.name}
        />
        <span className="fa fa-caret-square-o-right"
          onClick={this.props.onLoadItem}
        />
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return this.renderers[this.props.type]()
  }
}
