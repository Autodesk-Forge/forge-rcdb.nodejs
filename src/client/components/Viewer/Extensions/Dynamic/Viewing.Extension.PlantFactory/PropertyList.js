import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import Toolkit from 'Viewer.Toolkit'
import React from 'react'

class PropertyList extends React.Component {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor () {
    super()

    this.percentFormatter = (cell, row) => {
      return (
        `${cell.toFixed(2)} %      `
      )
    }

    this.onRowClick = this.onRowClick.bind(this)

    this.lastClickedIndex = -1
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onRowClick (row, viewer) {
    if (this.lastClickedIndex !== row.index) {
      const dbIds = row.dbIds

      Toolkit.isolateFull(viewer, dbIds)

      viewer.fitToView()
    } else {
      Toolkit.isolateFull(viewer)

      viewer.fitToView()
    }

    this.lastClickedIndex = row.index
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const { title, data, viewer, style } = this.props

    return (
      <div className='property-list' style={style}>
        <div className='title controls'>
          <label>
            {title}
          </label>
        </div>

        <div className='property-list-table'>
          <BootstrapTable
            data={data} striped hover
            options={{
              onRowClick: (row) => this.onRowClick(row, viewer)
            }}
          >
            <TableHeaderColumn
              headerAlign='left'
              dataAlign='left'
              dataField='shortLabel'
              isKey
              dataAlign='center'
              dataSort
            >
              Value
            </TableHeaderColumn>
            <TableHeaderColumn
              width='120'
              headerAlign='left'
              dataAlign='left'
              dataField='percent'
              dataFormat={this.percentFormatter}
            >
              % Components
            </TableHeaderColumn>
          </BootstrapTable>
        </div>
      </div>
    )
  }
}

export default PropertyList
