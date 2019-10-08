import { OverlayTrigger, Popover } from 'react-bootstrap'
import EventsEmitter from 'EventsEmitter'
import ReactTooltip from 'react-tooltip'
import flatten from 'lodash/flatten'
import sortBy from 'lodash/sortBy'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

export default class DataTreeNode extends EventsEmitter {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super()

    this.onVersionSelected = this.onVersionSelected.bind(this)
    this.onFolderSearch = this.onFolderSearch.bind(this)
    this.onLoadViewable = this.onLoadViewable.bind(this)
    this.onDeleteItem = this.onDeleteItem.bind(this)
    this.onCreateFolder = this.onCreateFolder.bind(this)
    this.onUpload = this.onUpload.bind(this)
    this.onReload = this.onReload.bind(this)
    this.onExpand = this.onExpand.bind(this)

    const hubType = props.delegate.rootNode
      ? props.delegate.rootNode.props.hubType
      : null

    this.on('expand', this.onExpand)

    this.delegate = props.delegate
    this.parent = props.parent
    this.level = props.level
    this.group = props.group
    this.dmAPI = props.dmAPI
    this.name = props.name
    this.type = props.type
    this.id = props.id

    this.renderProps = {
      onFolderSearch: this.onFolderSearch,
      onCreateFolder: this.onCreateFolder,
      onDeleteItem: this.onDeleteItem,
      onUpload: this.onUpload,
      hubType
    }

    this.children = null

    this.props = props
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onExpand () {
    this.off('expand', this.onExpand)

    this.loadChildren()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setViewerUrn (urn) {
    this.parentDomElement.classList.add('derivated')

    this.viewerUrn = urn

    this.render({
      onLoadViewable: this.onLoadViewable,
      viewerUrn: urn
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setThumbnail (thumbnail) {
    this.render({
      thumbnail
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setName (name) {
    this.props.name = this.name = name

    this.render({
      name
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setActiveVersion (activeVersion) {
    this.activeVersion = activeVersion

    this.render({
      activeVersion
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setVersions (versions) {
    this.versions = versions

    this.render({
      onVersionSelected: this.onVersionSelected,
      versions
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setControl (control) {
    this.render({
      control
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  showLoader (show) {
    this.render({
      showLoader: show
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  setLoaded (loaded) {
    this.render({
      onReload: this.onReload,
      loaded
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getNodeName (node) {
    return node.attributes.displayName ||
      node.attributes.name ||
      ''
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render (props = {}) {
    Object.assign(this.renderProps,
      this.props, props)

    this.reactNode = ReactDOM.render(
      <ReactTreeNode {...this.renderProps} />,
      this.domContainer)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  mount (domContainer) {
    domContainer.className = 'click-trigger'

    this.domContainer = domContainer

    this.collapse()

    this.render()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  destroy () {
    if (this.children) {
      this.children.forEach((child) => {
        child.destroy()
      })
    }

    ReactDOM.unmountComponentAtNode(
      this.domContainer)

    this.delegate.emit(
      'node.destroy', this.id)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onDeleteItem (props) {
    this.delegate.emit(
      'item.delete',
      props)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onFolderSearch () {
    this.delegate.emit(
      'folder.search',
      this.props)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onCreateFolder () {
    this.delegate.emit(
      'folder.create',
      this.props)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onUpload () {
    this.delegate.emit(
      'folder.upload',
      this.props)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onReload () {
    if (this.type === 'items') {
      this.parentDomElement.classList.remove('derivated')

      this.render({
        viewerUrn: null,
        thumbnail: null,
        versions: null,
        loaded: null
      })

      this.delegate.emit('item.created', this)
    } else if (this.children) {
      this.children.forEach((child) => {
        child.destroy()
      })

      this.loadChildren()
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  expand () {
    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('collapsed')
    target.classList.add('expanded')

    this.expanded = true

    this.emit('expand')
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  collapse () {
    const target =
      this.domContainer.parentElement.parentElement

    target.classList.remove('expanded')
    target.classList.add('collapsed')

    this.expanded = false
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async loadChildren () {
    this.showLoader(true)

    this.children = []

    switch (this.type) {
      case 'projects':
        await this.loadProjectChildren()
        break

      case 'folders':
        await this.loadFolderChildren()
        break

      case 'hubs':
        await this.loadHubChildren()
        break

      default: break
    }

    this.showLoader(false)

    this.setLoaded(true)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async loadHubChildren () {
    const projectsRes =
      await this.dmAPI.getProjects(this.props.hubId)

    const projects = sortBy(projectsRes.data,
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
            hubId: this.props.hubId,
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
        return new Promise(async (resolve) => {
          const folderItemsRes =
            await this.dmAPI.getProjectTopFolders(
              this.props.hubId, project.id)

          folderItemsRes.data.forEach((folder) => {
            folder.projectId = project.id
          })

          return resolve(folderItemsRes.data)
        })
      })

      const folderArrays = await Promise.all(projectTasks)

      const folders = sortBy(flatten(folderArrays),
        (folderItem) => {
          return this.getNodeName(folderItem).toLowerCase()
        })

      const foldersTasks = folders.map((folder) => {
        return new Promise((resolve) => {
          const childProps = Object.assign({}, this.props, {
            name: this.getNodeName(folder),
            projectId: folder.projectId,
            hubId: this.props.hubId,
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

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async loadProjectChildren () {
    const folderItemsRes =
      await this.dmAPI.getProjectTopFolders(
        this.props.hubId, this.props.projectId)

    const folderItems = sortBy(folderItemsRes.data,
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
          name: this.getNodeName(item),
          level: this.level + 1,
          type: item.type,
          itemId: item.id,
          details: item,
          parent: this,
          id: item.id
        })

        const childNode = new DataTreeNode(childProps)

        this.children.push(childNode)

        this.addChild(childNode)

        this.delegate.emit(
          'item.created',
          childNode)
      })
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async loadFolderChildren () {
    const folderItemsRes =
      await this.dmAPI.getFolderContent(
        this.props.projectId, this.props.folderId)

    const folderItems = sortBy(folderItemsRes.data,
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
          name: this.getNodeName(item),
          level: this.level + 1,
          type: item.type,
          itemId: item.id,
          details: item,
          parent: this,
          id: item.id
        })

        const childNode = new DataTreeNode(childProps)

        this.children.push(childNode)

        this.addChild(childNode)

        this.delegate.emit(
          'item.created',
          childNode)
      })
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onLoadViewable (props) {
    this.delegate.emit('load.viewable', Object.assign(props, { node: this }))
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onVersionSelected (version, props) {
    this.setActiveVersion(version)

    this.delegate.emit('version.selected', Object.assign(props, { node: this }))
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  insertChildNode (nodeInfo) {
    const childProps =
      Object.assign({}, this.props, {
        name: this.getNodeName(nodeInfo),
        level: this.level + 1,
        type: nodeInfo.type,
        itemId: nodeInfo.id,
        details: nodeInfo,
        id: nodeInfo.id,
        parent: this
      })

    const node = new DataTreeNode(childProps)

    const parentDomElement =
      this.domContainer.parentElement.parentElement

    const $group = $(parentDomElement)

    let index = -1

    $group.find('> group').each(function (idx) {
      if ($(this).find('lmvheader').hasClass(node.type)) {
        const name =
          $(this).find('.label-container').text()
            .replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, '')
            .replace(/(\r\n|\n|\r)/gm, '')

        if (node.name.localeCompare(name) > 0) {
          index = idx
        }
      } else if (node.type === 'items') {
        index = idx
      }
    })

    this.children.push(node)

    this.addChild(node)

    const nodeDomElement =
      node.domContainer.parentElement.parentElement

    const $element = $(nodeDomElement).detach()

    $group.insertAt(index + 2, $element)

    return node
  }
}

class ReactTreeNode extends React.Component {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super(props)

    this.renderers = {
      projects: this.renderProjectNode.bind(this),
      folders: this.renderFolderNode.bind(this),
      items: this.renderItemNode.bind(this),
      hubs: this.renderHubNode.bind(this)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderHubNode (props) {
    return (
      <div className='treenode click-trigger'>
        <Label
          className='name'
          text={this.props.name}
        />
        {
          props.showLoader &&
            <div className='node-loader'>
              <span />
            </div>
        }
        {
          props.loaded &&
            <div>
              <span
                className='fa fa-refresh'
                data-for={`reload-${props.id}`}
                style={{ marginRight: '190px' }}
                onClick={props.onReload}
                data-tip
              />
              <ReactTooltip
                id={`reload-${props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                  {'Reload child nodes ...'}
                </div>
              </ReactTooltip>
            </div>
        }
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderProjectNode (props) {
    return (
      <div className='treenode click-trigger'>
        <Label
          className='name'
          text={props.name}
        />
        {
          props.showLoader &&
            <div className='node-loader'>
              <span />
            </div>
        }
        {
          props.loaded &&
            <div>
              <span
                className='fa fa-refresh'
                data-for={`reload-${props.id}`}
                onClick={props.onReload}
                data-tip
              />
              <ReactTooltip
                id={`reload-${props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                  {'Reload child nodes ...'}
                </div>
              </ReactTooltip>
            </div>
        }
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderFolderNode (props) {
    return (
      <div className='treenode click-trigger'>
        <Label
          className='name'
          text={props.name}
        />
        {
          props.showLoader &&
            <div className='node-loader'>
              <span />
            </div>
        }
        <div>
          <span
            className='fa fa-cloud-upload'
            data-for={`upload-${props.id}`}
            onClick={props.onUpload}
            data-tip
          />
          <ReactTooltip
            id={`upload-${props.id}`}
            className='tooltip-text'
            effect='solid'
          >
            <div>
              {'Upload file to that folder ...'}
            </div>
          </ReactTooltip>
        </div>
        {
          props.loaded &&
            <div>
              <span
                className='fa fa-refresh'
                data-for={`reload-${props.id}`}
                onClick={props.onReload}
                data-tip
              />
              <ReactTooltip
                id={`reload-${props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                  {'Reload child nodes ...'}
                </div>
              </ReactTooltip>
            </div>
        }
        <div>
          <span
            className='fa fa fa-plus'
            data-for={`create-folder-${props.id}`}
            onClick={props.onCreateFolder}
            data-tip
          />
          <ReactTooltip
            id={`create-folder-${props.id}`}
            className='tooltip-text'
            effect='solid'
          >
            <div>
              {'Create folder ...'}
            </div>
          </ReactTooltip>
        </div>
        <div>
          <span
            className='fa fa fa-search'
            data-for={`search-${props.id}`}
            onClick={props.onFolderSearch}
            data-tip
          />
          <ReactTooltip
            id={`search-${props.id}`}
            className='tooltip-text'
            effect='solid'
          >
            <div>
              {'Search that folder ...'}
            </div>
          </ReactTooltip>
        </div>
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderItemNode (props) {
    return (
      <div className='treenode click-trigger'>
        <Label
          className='name'
          text={props.name}
        />
        {
          props.showLoader &&
            <div className='node-loader'>
              <span />
            </div>
        }
        {
          props.viewerUrn &&
            <div>
              <span
                className='fa fa-eye'
                data-for={`load-${props.id}`}
                onClick={() => props.onLoadViewable(props)}
                data-tip
              />
              <ReactTooltip
                id={`load-${props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                  {`Load ${props.name} in viewer ...`}
                </div>
              </ReactTooltip>
            </div>
        }
        {
          props.versions &&
            <div>
              <OverlayTrigger
                trigger='click'
                overlay={this.renderVersionsControl(props)}
                placement='right'
                rootClose
              >
                <span
                  className='fa fa-clock-o'
                  data-for={`versions-${props.id}`}
                  data-tip
                />
              </OverlayTrigger>
              <ReactTooltip
                id={`versions-${props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                Versions control
                </div>
              </ReactTooltip>
            </div>
        }
        {
          props.thumbnail &&
            <div>
              <span
                className='fa fa-file-image-o'
                data-for={`thumbnail-${props.id}`}
                data-tip
              />
              <ReactTooltip
                id={`thumbnail-${props.id}`}
                className='tooltip-thumbnail'
                effect='solid'
              >
                <div>
                  <img
                    src={props.thumbnail}
                    height='120'
                  />
                </div>
              </ReactTooltip>
            </div>
        }
        {
          props.loaded &&
            <div>
              <span
                className='fa fa-refresh'
                data-for={`reload-${props.id}`}
                onClick={props.onReload}
                data-tip
              />
              <ReactTooltip
                id={`reload-${props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                  {'Reload item ...'}
                </div>
              </ReactTooltip>
            </div>
        }
        {
          props.hubType === 'hubs:autodesk.bim360:Account' &&
          props.versions &&
            <div>
              <span
                className='fa fa-times'
                data-for={`delete-${props.id}`}
                onClick={() => props.onDeleteItem(props)}
                data-tip
              />
              <ReactTooltip
                id={`delete-${props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                  {'Delete item ...'}
                </div>
              </ReactTooltip>
            </div>
        }
        {
          props.control &&
            <div>
              <span
                className={props.control.className}
                data-for={`control-${props.id}`}
                onClick={props.control.onClick}
                data-tip
              />
              <ReactTooltip
                id={`control-${props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                  {props.control.tooltip}
                </div>
              </ReactTooltip>
            </div>
        }
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderVersionsControl (props) {
    const activeVersionId = props.activeVersion.id

    const versions = props.versions.map(
      (version, idx) => {
        const isActive = (version.id === activeVersionId)

        const verNum = props.versions.length - idx

        const name = version.attributes.name

        return (
          <div
            className={`version ${isActive ? 'active' : ''}`}
            onClick={() => props.onVersionSelected(version, props)}
            key={version.id}
          >
            {
              isActive &&
                <span className='fa fa-check' />
            }
            <label>
              {`v${verNum} - ${name}`}
            </label>
          </div>
        )
      })

    return (
      <Popover
        className='data-management'
        title='Versions Control'
        id='versions-ctrl'
      >

        <label>
          Select active version:
        </label>

        <div className='versions'>
          {versions}
        </div>

      </Popover>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render (props) {
    return this.renderers[this.props.type](Object.assign(props || {}, this.props))
  }
}
