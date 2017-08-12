import {OverlayTrigger, Popover} from 'react-bootstrap'
import EventsEmitter from 'EventsEmitter'
import ReactTooltip from 'react-tooltip'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

export default class DataTreeNode extends EventsEmitter {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super ()

    this.onVersionSelected = this.onVersionSelected.bind(this)
    this.onLoadItem = this.onLoadItem.bind(this)
    this.onReload = this.onReload.bind(this)
    this.onExpand = this.onExpand.bind(this)

    this.on('expand', this.onExpand)

    this.delegate     = props.delegate
    this.parent       = props.parent
    this.level        = props.level
    this.group        = props.group
    this.name         = props.name
    this.type         = props.type
    this.api          = props.api
    this.id           = props.id

    this.children = null

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
  setViewerUrn (urn) {

    this.parentDomElement.classList.add('derivated')

    this.viewerUrn = urn

    this.render({
      onLoadItem: this.onLoadItem,
      viewerUrn: urn
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setThumbnail (thumbnail) {

    this.render({
      thumbnail
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setName (name) {

    this.props.name = this.name = name

    this.render({
      name
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setActiveVersion (activeVersion) {

    this.activeVersion = activeVersion

    this.render({
      activeVersion
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setVersions (versions) {

    this.versions = versions

    this.render({
      onVersionSelected: this.onVersionSelected,
      versions
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  showLoader (show) {

    this.render({
      showLoader: show
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setLoaded (loaded) {

    this.render({
      onReload: this.onReload,
      loaded
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  getNodeName(node) {

    return node.attributes.displayName
      || node.attributes.name
      || ''
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  render (props = {}) {

    this.renderProps = Object.assign(
      this.renderProps || {}, this.props, props)

    this.reactNode = ReactDOM.render(
      <ReactTreeNode {...this.renderProps}/>,
      this.domContainer)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  mount (domContainer) {

    domContainer.className = 'click-trigger'

    this.domContainer = domContainer

    this.collapse()

    this.render()
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
  onReload () {

    if (this.children) {

      this.children.forEach((child) => {

        child.destroy ()
      })

      this.loadChildren()
    }
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
  async loadChildren () {

    this.showLoader(true)

    this.children = []

    switch (this.type) {

      case 'hubs':
        await this.loadHubChildren()
        break

      case 'projects':
        await this.loadProjectChildren()
        break

      case 'folders':
        await this.loadFolderChildren()
        break

      default: break
    }

    this.showLoader(false)

    this.setLoaded(true)
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
        return this.getNodeName(project).toLowerCase()
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
            name: this.getNodeName(project),
            projectId: project.id,
            level: this.level + 1,
            type: project.type,
            details: project,
            folderId: rootId,
            id: this.guid(),
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
          return this.getNodeName(folderItem).toLowerCase()
        })

      const foldersTasks = folders.map((folder) => {

        return new Promise((resolve) => {

          const childProps = Object.assign({}, this.props, {
            name: this.getNodeName(folder),
            projectId: folder.projectId,
            level: this.level + 1,
            folderId: folder.id,
            type: folder.type,
            details: folder,
            id: this.guid(),
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
        return this.getNodeName(folderItem).toLowerCase()
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
          name: this.getNodeName(folder),
          level: this.level + 1,
          folderId: folder.id,
          type: folder.type,
          details: folder,
          id: this.guid(),
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
          name: this.getNodeName(item),
          level: this.level + 1,
          type: item.type,
          itemId: item.id,
          id: this.guid(),
          details: item,
          parent: this
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
        return this.getNodeName(folderItem).toLowerCase()
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
          name: this.getNodeName(folder),
          level: this.level + 1,
          folderId: folder.id,
          type: folder.type,
          details: folder,
          id: this.guid(),
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
          name: this.getNodeName(item),
          level: this.level + 1,
          type: item.type,
          itemId: item.id,
          id: this.guid(),
          details: item,
          parent: this
        })

        const childNode = new DataTreeNode(childProps)

        this.delegate.emit('item.created', childNode)

        this.children.push(childNode)

        this.addChild(childNode)

        childNode.showLoader(true)
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

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onVersionSelected (version) {

    this.setActiveVersion(version)
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
      <div className="treenode click-trigger">
        <Label className="name"
          text={this.props.name}
        />
        {
          this.props.showLoader &&
          <div className="node-loader">
            <span/>
          </div>
        }
        {
          this.props.loaded &&
          <div>
            <span className="fa fa-refresh"
              data-for={`reload-${this.props.id}`}
              style={{marginRight:'162px'}}
              onClick={this.props.onReload}
              data-tip
            />
            <ReactTooltip id={`reload-${this.props.id}`}
              className="tooltip-text"
              effect="solid">
              <div>
                  {`Reload child nodes ...`}
              </div>
            </ReactTooltip>
          </div>
        }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderProjectNode() {

    return (
      <div className="treenode click-trigger">
        <Label className="name"
          text={this.props.name}
        />
        {
          this.props.showLoader &&
          <div className="node-loader">
            <span/>
          </div>
        }
        {
          this.props.loaded &&
          <div>
            <span className="fa fa-refresh"
              data-for={`reload-${this.props.id}`}
              onClick={this.props.onReload}
              data-tip
            />
            <ReactTooltip id={`reload-${this.props.id}`}
              className="tooltip-text"
              effect="solid">
              <div>
                  {`Reload child nodes ...`}
              </div>
            </ReactTooltip>
          </div>
        }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderFolderNode() {

    return (
      <div className="treenode click-trigger">
        <Label className="name"
          text={this.props.name}
        />
        {
          this.props.showLoader &&
          <div className="node-loader">
            <span/>
          </div>
        }
        {
          this.props.loaded &&
          <div>
            <span className="fa fa-refresh"
              data-for={`reload-${this.props.id}`}
              onClick={this.props.onReload}
              data-tip
            />
            <ReactTooltip id={`reload-${this.props.id}`}
              className="tooltip-text"
              effect="solid">
              <div>
                {`Reload child nodes ...`}
              </div>
            </ReactTooltip>
          </div>
        }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItemNode() {

    return (
      <div className="treenode click-trigger">
        <Label className="name"
          text={this.props.name}
        />
        {
          this.props.showLoader &&
          <div className="node-loader">
            <span/>
          </div>
        }
        {
          this.props.viewerUrn &&
          <div>
            <span className="fa fa-eye"
              data-for={`load-${this.props.id}`}
              onClick={this.props.onLoadItem}
              data-tip
            />
            <ReactTooltip id={`load-${this.props.id}`}
              className="tooltip-text"
              effect="solid">
              <div>
                  {`Load ${this.props.name} in viewer ...`}
              </div>
            </ReactTooltip>
          </div>
        }
        {
          this.props.versions &&
          <div>
            <OverlayTrigger trigger="click"
              overlay={this.renderVersionsControl()}
              placement="right"
              rootClose>
              <span className="fa fa-clock-o"
                data-for={`versions-${this.props.id}`}
                data-tip
              />
            </OverlayTrigger>
            <ReactTooltip id={`versions-${this.props.id}`}
              className="tooltip-text"
              effect="solid">
              <div>
                Versions control
              </div>
            </ReactTooltip>
          </div>
        }
        {
          this.props.thumbnail &&
          <div>
            <span className="fa fa-file-image-o"
              data-for={`thumbnail-${this.props.id}`}
              data-tip
            />
            <ReactTooltip id={`thumbnail-${this.props.id}`}
              className="tooltip-thumbnail"
              effect="solid">
              <div>
                <img src={this.props.thumbnail}
                  height="120"
                />
              </div>
            </ReactTooltip>
          </div>
        }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderVersionsControl () {

    const activeVersionId = this.props.activeVersion.id

    const versions = this.props.versions.map(
      (version, idx) => {

        const isActive = (version.id === activeVersionId)

        const verNum = this.props.versions.length - idx

        const name = version.attributes.displayName

        return (
          <div
            className={`version ${isActive ? 'active':''}`}
            onClick={() => this.props.onVersionSelected(version)}
            key={version.id}>
            {
              isActive &&
              <span className="fa fa-check"/>
            }
            <label>
              {`v${verNum} - ${name}`}
            </label>
          </div>
        )
      })

    return (
      <Popover className="data-management"
        title="Versions Control"
        id="versions-ctrl">

        <label>
          Select active version:
        </label>

        <div className="versions">
          { versions }
        </div>

      </Popover>
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
