
import BaseComponent from 'BaseComponent'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import ReactDOM from 'react-dom'
import React from 'react'
import './PieLegend.scss'

export default class PieLegend extends BaseComponent {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor (props) {
    super(props)
    this.state = { selected: null }
    this.onRowClicked = this.onRowClicked.bind(this)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onRowClicked (row) {
    const arg = row.item.dbMaterial

    this.props.onItemSelected(arg)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const columns = [{
      accessor: 'color',
      resizable: false,
      sortable: false,
      maxWidth: 28,
      minWidth: 28,
      Header: '',
      Cell: row => (
        <div style={{
          background: row.value,
          borderRadius: '50%',
          padding: '3px',
          height: '100%',
          width: '100%'
        }}
        >
          <div style={{
            background: 'white',
            borderRadius: '50%',
            height: '100%',
            width: '100%'
          }}
          >
            <div style={{
              background: row.value,
              borderRadius: '50%',
              opacity: '0.35',
              height: '100%',
              width: '100%'
            }}
            />
          </div>
        </div>
      )
    }, {
      accessor: 'name',
      Header: 'Material'
    }, {
      accessor: 'percentTxt',
      Header: 'Percent Total',
      sortMethod: (a, b) => {
        const fa = parseFloat(a.replace('%', ''))
        const fb = parseFloat(b.replace('%', ''))
        if (fa < fb) return -1
        if (fa > fb) return 1
        return 0
      }
    }, {
      accessor: 'cost',
      Header: 'Cost',
      sortMethod: (a, b) => {
        const fa = parseFloat(a.replace('$USD', ''))
        const fb = parseFloat(b.replace('$USD', ''))
        if (fa < fb) return -1
        if (fa > fb) return 1
        return 0
      }
    }
    ]

    return (
      <div className='pie-legend'>
        <ReactTable
          defaultPageSize={this.props.data.length}
          className='-highlight'
          showPagination={false}
          data={this.props.data}
          columns={columns}
          getTdProps={(state, row, column, instance) => {
            return {
              onClick: (e, handleOriginal) => {
                this.setState({
                  selected: this.state.selected == row.index ? null : row.index
                })
                if (this.props.onItemSelected) {
                  const item = row.original.item
                  this.props.onItemSelected(item)
                }
                if (handleOriginal) {
                  handleOriginal()
                }
              },
              style: {
                background: row.index === this.state.selected ? '#00afec' : ''

              }
            }
          }}
        />
      </div>
    )
  }
}
