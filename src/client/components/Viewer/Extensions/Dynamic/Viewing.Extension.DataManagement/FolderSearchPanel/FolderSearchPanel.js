import { DropdownButton, MenuItem } from 'react-bootstrap'
import SearchTreeView from './SearchTreeView'
import EventsEmitter from 'EventsEmitter'
import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import ReactDOM from 'react-dom'
import React from 'react'

class PanelContent extends BaseComponent {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super(props)

    this.search = this.search.bind(this)

    this.projectId = props.data.projectId

    this.folderId = props.data.folderId

    const operator = {
      label: 'equal to',
      expr: '-eq='
    }

    this.state = {
      searchResults: [],
      showLoader: false,
      searchGuid: null,
      filters: {
        displayName: {
          label: 'Display Name:',
          operator,
          value: ''
        },
        createTime: {
          label: 'Create Time:',
          isQuantity: true,
          operator,
          value: ''
        },
        createUserName: {
          label: 'Create Username:',
          operator,
          value: ''
        },
        lastModifiedTime: {
          label: 'Last Modified Time:',
          isQuantity: true,
          operator,
          value: ''
        },
        lastModifiedUserName: {
          label: 'Last Modified Username:',
          operator,
          value: ''
        },
        fileType: {
          label: 'File Type:',
          operator,
          value: ''
        }
      }
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onInputChanged (e, name) {
    const filter = this.state.filters[name]

    this.assignState({
      filters: Object.assign({},
        this.state.filters, {
          [name]: Object.assign({}, filter, {
            value: e.target.value
          })
        })
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  search () {
    const { filters } = this.state

    this.assignState({
      showLoader: true
    })

    const keys = Object.keys(filters).filter((key) => {
      return (filters[key].value.length > 0)
    })

    const filtersExprs = keys.map((key) => {
      const { operator, value } = filters[key]

      return `filter[${key}]${operator.expr}${value}`
    })

    const filter = filtersExprs.join('&')

    this.props.dmAPI.searchFolder(
      this.projectId,
      this.folderId,
      filter).then((res) => {
      const searchResults = [
        ...(res.included || []),
        ...(res.data || [])
      ]

      this.assignState({
        searchGuid: this.props.guid(),
        showLoader: false,
        searchResults
      })
    }, () => {
      this.assignState({
        searchGuid: this.props.guid(),
        showLoader: false,
        searchResults: []
      })
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getDropdownItems (filterKey, filter) {
    const menuItemsQuantity = [{
      label: 'less than',
      expr: '-lt='
    }, {
      label: 'less or equal',
      expr: '-le='
    }, {
      label: 'equal to',
      expr: '-eq='
    }, {
      label: 'greater or equal',
      expr: '-ge='
    }, {
      label: 'greater than',
      expr: '-gt='
    }]

    const menuItemsString = [{
      label: 'equal to',
      expr: '-eq='
    }, {
      label: 'starts with',
      expr: '-starts='
    }, {
      label: 'ends with',
      expr: '-ends='
    }, {
      label: 'contains',
      expr: '-contains='
    }]

    const menuItems = filter.isQuantity
      ? menuItemsQuantity
      : menuItemsString

    return menuItems.map((operator, idx) => {
      return (
        <MenuItem
          eventKey={idx} key={idx}
          onClick={() => {
            this.assignState({
              filters: Object.assign({},
                this.state.filters, {
                  [filterKey]: Object.assign({}, filter, {
                    operator
                  })
                })
            })
          }}
        >
          {operator.label}
        </MenuItem>
      )
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const filterKeys = Object.keys(this.state.filters)

    const filterItems = filterKeys.map((filterKey) => {
      const filter = this.state.filters[filterKey]

      return (
        <div className='filter' key={filterKey}>
          <label>
            {filter.label}
          </label>
          <DropdownButton
            title={filter.operator.label}
            key={`dropdown-${filterKey}`}
            id={`dropdown-${filterKey}`}
          >
            {this.getDropdownItems(filterKey, filter)}
          </DropdownButton>
          <input
            onChange={(e) => this.onInputChanged(e, filterKey)}
            className='input-filter'
          />
        </div>
      )
    })

    const {
      searchResults,
      searchGuid,
      showLoader
    } = this.state

    return (
      <div className='panel-content'>
        {filterItems}
        <button
          className='search-btn'
          onClick={this.search}
        >
          <span className='fa fa-search' />
          Search ...
        </button>
        <div className='results'>
          <ReactLoader show={showLoader} />
          <SearchTreeView
            onVersionNodeCreated={this.props.onVersionNodeCreated}
            onItemNodeCreated={this.props.onItemNodeCreated}
            onLoadViewable={this.props.onLoadViewable}
            derivativesAPI={this.props.derivativesAPI}
            menuContainer={this.props.menuContainer}
            searchResults={searchResults}
            projectId={this.projectId}
            folderId={this.folderId}
            dmAPI={this.props.dmAPI}
            guid={searchGuid}
          />
        </div>
      </div>
    )
  }
}

export default class FolderSearchPanel extends EventsEmitter {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (data, options) {
    super()

    this.onVersionNodeCreated = this.onVersionNodeCreated.bind(this)
    this.onItemNodeCreated = this.onItemNodeCreated.bind(this)
    this.onLoadViewable = this.onLoadViewable.bind(this)
    this.onClose = this.onClose.bind(this)

    this.derivativesAPI = options.derivativesAPI

    this.menuContainer = options.menuContainer

    this.className = 'folder-search'

    this.projectId = data.projectId

    this.folderId = data.folderId

    this.dmAPI = options.dmAPI

    this.id = this.guid()

    this.data = data
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onClose () {
    this.emit('panel.close', this.id)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onVersionNodeCreated (node) {
    this.emit('version.created', node)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onItemNodeCreated (node) {
    this.emit('item.created', node)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onLoadViewable (node) {
    this.emit('load.viewable', node)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderTitle () {
    return (
      <div className='title'>
        <span className='fa fa-search' />
        <label>
          {`Search Folder: ${this.data.name}`}
        </label>
        <div className='controls'>
          <button onClick={this.onClose}>
            <span className='fa fa-times' />
          </button>
        </div>
      </div>
    )
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    return (
      <PanelContent
        onVersionNodeCreated={this.onVersionNodeCreated}
        onItemNodeCreated={this.onItemNodeCreated}
        onLoadViewable={this.onLoadViewable}
        derivativesAPI={this.derivativesAPI}
        menuContainer={this.menuContainer}
        dmAPI={this.dmAPI}
        data={this.data}
        guid={this.guid}
      />
    )
  }
}
