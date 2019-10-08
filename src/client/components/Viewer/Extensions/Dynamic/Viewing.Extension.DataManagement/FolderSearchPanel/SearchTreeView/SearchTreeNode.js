import { OverlayTrigger, Popover } from 'react-bootstrap'
import EventsEmitter from 'EventsEmitter'
import ReactTooltip from 'react-tooltip'
import flatten from 'lodash/flatten'
import sortBy from 'lodash/sortBy'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Label from 'Label'
import React from 'react'

export default class SearchTreeNode extends EventsEmitter {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super()

    this.onVersionSelected = this.onVersionSelected.bind(this)
    this.onLoadViewable = this.onLoadViewable.bind(this)

    this.delegate = props.delegate
    this.level = props.level
    this.group = props.group
    this.dmAPI = props.dmAPI
    this.name = props.name
    this.type = props.type
    this.id = props.id

    this.renderProps = {}

    this.children = []

    this.props = props
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
  /// /////////////////////////////////////////////////////
  addChildNode (node) {
    this.children.push(node)

    this.addChild(node)
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
  onLoadViewable () {
    this.delegate.emit('load.viewable', this)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onVersionSelected (version) {
    this.setActiveVersion(version)
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
      versions: this.renderVersionNode.bind(this),
      folders: this.renderFolderNode.bind(this),
      items: this.renderItemNode.bind(this),
      node: this.renderNode.bind(this)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderNode () {
    return (
      <div className='treenode click-trigger'>
        <Label
          className='name'
          text={this.props.name}
        />
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderFolderNode () {
    return (
      <div className='treenode click-trigger'>
        <Label
          className='name'
          text={this.props.name}
        />
        {
          this.props.showLoader &&
            <div className='node-loader'>
              <span />
            </div>
        }
        <div>
          <span
            className='fa fa-cloud-upload'
            data-for={`upload-${this.props.id}`}
            onClick={this.props.onUpload}
            data-tip
          />
          <ReactTooltip
            id={`upload-${this.props.id}`}
            className='tooltip-text'
            effect='solid'
          >
            <div>
              {'Upload file to that folder ...'}
            </div>
          </ReactTooltip>
        </div>
        {
          this.props.loaded &&
            <div>
              <span
                className='fa fa-refresh'
                data-for={`reload-${this.props.id}`}
                onClick={this.props.onReload}
                data-tip
              />
              <ReactTooltip
                id={`reload-${this.props.id}`}
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
            className='fa fa fa-search'
            data-for={`search-${this.props.id}`}
            onClick={this.props.onFolderSearch}
            data-tip
          />
          <ReactTooltip
            id={`search-${this.props.id}`}
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
  renderVersionsControl () {
    const activeVersionId = this.props.activeVersion.id

    const versions = this.props.versions.map(
      (version, idx) => {
        const isActive = (version.id === activeVersionId)

        const verNum = this.props.versions.length - idx

        const name = version.attributes.name

        return (
          <div
            className={`version ${isActive ? 'active' : ''}`}
            onClick={() => this.props.onVersionSelected(version)}
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
  renderItemNode () {
    return (
      <div className='treenode click-trigger'>
        <Label
          className='name'
          text={this.props.name}
        />
        {
          this.props.showLoader &&
            <div className='node-loader'>
              <span />
            </div>
        }
        {
          this.props.viewerUrn &&
            <div>
              <span
                className='fa fa-eye'
                data-for={`load-${this.props.id}`}
                onClick={this.props.onLoadViewable}
                data-tip
              />
              <ReactTooltip
                id={`load-${this.props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                  {`Load ${this.props.name} in viewer ...`}
                </div>
              </ReactTooltip>
            </div>
        }
        {
          this.props.versions &&
            <div>
              <OverlayTrigger
                trigger='click'
                overlay={this.renderVersionsControl()}
                placement='right'
                rootClose
              >
                <span
                  className='fa fa-clock-o'
                  data-for={`versions-${this.props.id}`}
                  data-tip
                />
              </OverlayTrigger>
              <ReactTooltip
                id={`versions-${this.props.id}`}
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
          this.props.thumbnail &&
            <div>
              <span
                className='fa fa-file-image-o'
                data-for={`thumbnail-${this.props.id}`}
                data-tip
              />
              <ReactTooltip
                id={`thumbnail-${this.props.id}`}
                className='tooltip-thumbnail'
                effect='solid'
              >
                <div>
                  <img
                    src={this.props.thumbnail}
                    height='120'
                  />
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
  renderVersionNode () {
    return (
      <div className='treenode click-trigger'>
        <Label
          className='name'
          text={this.props.name}
        />
        {
          this.props.showLoader &&
            <div className='node-loader'>
              <span />
            </div>
        }
        {
          this.props.viewerUrn &&
            <div>
              <span
                className='fa fa-eye'
                data-for={`load-${this.props.id}`}
                onClick={this.props.onLoadViewable}
                data-tip
              />
              <ReactTooltip
                id={`load-${this.props.id}`}
                className='tooltip-text'
                effect='solid'
              >
                <div>
                  {`Load ${this.props.name} in viewer ...`}
                </div>
              </ReactTooltip>
            </div>
        }
        {
          this.props.thumbnail &&
            <div>
              <span
                className='fa fa-file-image-o'
                data-for={`thumbnail-${this.props.id}`}
                data-tip
              />
              <ReactTooltip
                id={`thumbnail-${this.props.id}`}
                className='tooltip-thumbnail'
                effect='solid'
              >
                <div>
                  <img
                    src={this.props.thumbnail}
                    height='120'
                  />
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
  render () {
    return this.renderers[this.props.type]()
  }
}
