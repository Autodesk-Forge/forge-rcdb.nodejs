import DBDropdown from 'DBDropdown'
import './DBResponsiveView.scss'
import DBTable from 'DBTable'
import DBChart from 'DBChart'
import Viewer from 'Viewer'
import React from 'react'

class DBResponsiveView extends React.Component {

  render() {

    const height = $('.db-responsive-view').height()

    if(height && height < 185) {

      return (
        <div className="db-responsive-view">
          <DBDropdown {...this.props}/>
        </div>
      )

    } else {

      return (
        <div className="db-responsive-view">
          <DBTable {...this.props}/>
        </div>
      )
    }
  }
}

module.exports = DBResponsiveView
