import Toolkit from 'Viewer.Toolkit'
import BarChart from 'BarChart'
import React from 'react'

class PropertyBarChart extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const { guid, title, data, viewer } = this.props

    return (
      <div className="property-bar-chart">
        <div className="title controls">
          <label>
            { title }
          </label>
        </div>

        <BarChart onGroupClicked={(e) => {

            const dbIds = e.dbIds

            Toolkit.isolateFull(
              viewer, dbIds)

            viewer.fitToView()
          }}
          guid={guid}
          data={data}
        />

      </div>
    )
  }
}

export default PropertyBarChart
