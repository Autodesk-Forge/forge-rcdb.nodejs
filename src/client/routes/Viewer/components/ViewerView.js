import ServiceManager from 'SvcManager'
import GridLayout from './GridLayout'
import './ViewerView.scss'
import React from 'react'


class ViewerView extends React.Component {

  async componentDidMount () {

    try {

      const materialSvc = ServiceManager.getService(
        'MaterialSvc')

      const materials = await materialSvc.getMaterials()

      this.props.loadDbItems(materials)

    } catch(ex) {

     console.log(ex)
    }
  }

  render() {

    const { viewerState } = this.props

    return (
      <div className="viewer-view">
        <GridLayout
          onDbItemSelected={this.props.onDbItemSelected}
          dbItems={viewerState.dbItems}
        />
      </div>
    )
  }
}

export default ViewerView
