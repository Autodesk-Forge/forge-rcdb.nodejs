import IoTGraph from './IoT.Graph'
import React from 'react'

export default class IoTGraphContainer extends React.Component {

  render () {

    const { graphData, id, name} = this.props.item

    const graphs = graphData.map((data, idx) => {

      const graphName = `${name} - ${data.name}`

      return (
        <IoTGraph
          dimensions={this.props.dimensions}
          rows={graphData.length}
          key={id + idx}
          guid={id}
          {...data}
          name={graphName}
        />
      )
    })

    return (
      <div className="graph-container">
        {graphs}
      </div>
    )
  }
}