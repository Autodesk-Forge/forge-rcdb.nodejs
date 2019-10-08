import Toolkit from 'Viewer.Toolkit'
import PieChart from 'PieChart'
import React from 'react'

class PropertyPieChart extends React.Component {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor () {
    super()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const { guid, title, data, viewer, style } = this.props

    return (
      <div className='property-pie-chart' style={style}>
        <div className='title controls'>
          <label>
            {title}
          </label>
        </div>

        <PieChart
          onSegmentClicked={(data, expanded) => {
            const dbIds = expanded ? [] : data.dbIds

            Toolkit.isolateFull(
              viewer,
              dbIds)

            viewer.fitToView()
          }}
          dataGuid={guid}
          data={data}
        />

      </div>
    )
  }
}

export default PropertyPieChart
