import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import ContentEditable from 'react-contenteditable'
import WidgetContainer from 'WidgetContainer'
import BaseComponent from 'BaseComponent'
import flatten from 'lodash/flatten'
import Toolkit from 'Viewer.Toolkit'
import React from 'react'

export default class Search extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onInputChanged = this.onInputChanged.bind(this)
    this.onRowClicked = this.onRowClicked.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSearch = this.onSearch.bind(this)

    this.state = {
      search: '',
      rows: []
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInputChanged (e) {

    this.assignState({
      search: e.target.value
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()

      this.onSearch()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getModelProperties (text, attributeNames) {

    return new Promise((resolve, reject) => {

      this.props.model.search(text, (result) => {

        resolve(result)

      }, (error) => {

        reject(error)

      }, attributeNames)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getBulkProperties (dbIds) {

    return new Promise((resolve, reject) => {

      this.props.model.getBulkProperties(
        dbIds, null, (result) => {

        resolve(result)

      }, (error) => {

        reject(error)

      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async searchModel (text, attributeNames) {

    try {

      const dbIds = await this.getModelProperties(
        `"${text}"`, attributeNames)

      const results = await this.getBulkProperties(dbIds)

      const rows = []

      results.forEach((result) => {

          result.properties.forEach((prop) => {

            const value = prop.displayValue.toString()

            if (value.indexOf(text) > -1 && !!result.name) {

              rows.push({
                displayCategory: prop.displayCategory,
                displayValue: prop.displayValue,
                displayName: prop.displayName,
                component: result.name,
                dbId: result.dbId
              })
            }
          })
      })

      return rows

    } catch (ex) {

      return ex
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async searchDatabase (text) {

    try {

      const metaProperties =
        await this.props.api.search(text)

      return metaProperties

    } catch (ex) {

      return ex
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onSearch () {

    const {search} = this.state

    if (!!search) {

      const results = await Promise.all([
        this.searchModel(search),
        this.searchDatabase(search)
      ])

      const rows = flatten(results)

      this.assignState({
        rows
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Meta Search
        </label>
        <div className="meta-search-controls">
          <ContentEditable
            data-placeholder="Search Meta Properties"
            onChange={this.onInputChanged}
            onKeyDown={this.onKeyDown}
            html={this.state.search}
            className="input-search"
          />
          <button onClick={this.onSearch}
            title="Search ...">
            <span className="fa fa-search"/>
          </button>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onRowClicked (row) {

    const {model, viewer} = this.props

    const dbId = parseInt(row.dbId)

    Toolkit.isolateFull(
      viewer, dbId, model)

    viewer.fitToView(dbId)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    const width = this.props.dimensions.width

    const columnWidth = !isNaN(width)
      ? (width * 0.25).toString()
      : '20'

    const options = {
      onRowClick: this.onRowClicked
    }

    return (
      <BootstrapTable
        data={this.state.rows}
        options={options}
        striped={true}
        hover={true}>
        <TableHeaderColumn
          dataField="component"
          width={columnWidth}
          headerAlign='left'
          dataAlign='left'>
          Component
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="displayName"
          width={columnWidth}
          headerAlign='left'
          dataAlign='left'
          isKey={true}>
          Property
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="displayCategory"
          width={columnWidth}
          headerAlign='left'
          dataAlign='left'>
          Category
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="displayValue"
          headerAlign='left'
          dataAlign='left'>
          Value
        </TableHeaderColumn>
      </BootstrapTable>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle()}
        className="meta-search"
        showTitle={true}>
        { this.renderContent () }
      </WidgetContainer>
    )
  }
}


