import Griddle from 'griddle-react'
import PropTypes from 'prop-types'
import React from 'react'
import './DBGrid.scss'

var fakeData = [

  { id: 1, title: 'iPad Air', price: 100.99 },
  { id: 2, title: 'iPad Air 2', price: 200.99 },
  { id: 3, title: 'iPad Air 3', price: 200.99 }

]

class DBGrid extends React.Component {
  render () {
    const { items } = this.props

    return (
      <div className='gallery'>
        <Griddle
          results={fakeData}
          tableClassName='table'
          showFilter
          showSettings={false}
          showFooter={false}
          resultsPerPage={fakeData.length}
          columns={['title', 'price']}
        />
      </div>
    )
  }
}

DBGrid.defaultProps = {
  items: []
}

DBGrid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object)
}

export default DBGrid

// import React from 'react';
// import ReactDOM from 'react-dom';
// import {Table, Column, Cell} from 'fixed-data-table';
//
/// / Table data as a list of array.
// const rows = [
//  ['a1', 'b1', 'c1'],
//  ['a2', 'b2', 'c2'],
//  ['a3', 'b3', 'c3'],
//  // .... and more
// ];
//
// class DBGrid extends React.Component {
//
//  render() {
//
//    return (
//      <Table
//        rowHeight={50}
//        rowsCount={rows.length}
//        headerHeight={50}>
//        <Column
//          header={<Cell>Col 1</Cell>}
//          cell={<Cell>Column 1 static content</Cell>}
//          width={2000}
//        />
//      </Table>
//    );
//  }
// }
//
// export default DBGrid;
