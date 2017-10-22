
import BaseComponent from 'BaseComponent'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import ReactDOM from 'react-dom'
import React from 'react'
import './PieLegend.scss'

export default class PieLegend extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onRowClicked = this.onRowClicked.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onRowClicked (row) {

    const arg = row.item.dbMaterial

    this.props.onItemSelected(arg)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const columns = [{
        accessor: 'color',
        maxWidth: 34,
        minWidth: 34,
        Header: '',
        Cell: row => (
        <div style={{
          background: row.value,
          borderRadius: '50%',
          padding: '3px',
          height: '100%',
          width: '100%'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '50%',
            height: '100%',
            width: '100%'
          }}>
            <div style={{
              background: row.value,
              borderRadius: '50%',
              opacity: '0.35',
              height: '100%',
              width: '100%'
            }}/>
          </div>
        </div>
        )
      }, {
        accessor: 'name',
        Header: 'Material'
      }, {
        accessor: 'percentTxt',
        Header: 'Percent Total'
      } , {
        accessor: 'cost',
        Header: 'Cost'
      }
    ]

    return (
      <div className="pie-legend">
        <ReactTable
          defaultPageSize={this.props.data.length}
          className="-striped -highlight"
          showPagination={false}
          data={this.props.data}
          columns={columns}

          getTdProps={(state, row, column, instance) => {
            return {
              onClick: (e, handleOriginal) => {
                if (this.props.onItemSelected) {
                  const item = row.original.item
                  this.props.onItemSelected (item)
                }
                if (handleOriginal) {
                  handleOriginal()
                }
              }
            }
          }}
        />
      </div>
    )
  }
}
