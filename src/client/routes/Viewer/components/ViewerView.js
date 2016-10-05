import ServiceManager from 'SvcManager'
import GridLayout from './GridLayout'
import './ViewerView.scss'
import React from 'react'


class ViewerView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  state = {
    selectedDbItem: null,
    updatedDbItem: null,
    filteredDbItems:[]
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentDidMount () {

    try {

      this.materialSvc = ServiceManager.getService(
        'MaterialSvc')

      const materials = await this.materialSvc.getMaterials(
        'forge-rcdb')

      this.props.loadDbItems(materials)

      this.socketSvc = ServiceManager.getService(
        'SocketSvc')

      this.eventSvc = ServiceManager.getService(
        'EventSvc')

    } catch(ex) {

     console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUpdateDbItem (updatedDbItem) {

    this.materialSvc.postMaterial(
      'forge-rcdb',
      updatedDbItem)

    this.eventSvc.emit(
      'updateDbItem',
      updatedDbItem)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectDbItem (selectedDbItem) {

    this.eventSvc.emit(
      'selectDbItem',
      selectedDbItem)

    this.setState(Object.assign({}, this.state, {
      selectedDbItem
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onFilterDbItems (filteredDbItems) {

    this.setState(Object.assign({}, this.state, {
      filteredDbItems
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className="viewer-view">
        <GridLayout
          onFilterDbItems={(dbItems) => this.onFilterDbItems(dbItems)}
          onUpdateDbItem={(dbItem) => this.onUpdateDbItem(dbItem)}
          onSelectDbItem={(dbItem) => this.onSelectDbItem(dbItem)}
          filteredDbItems={this.state.filteredDbItems}
          selectedDbItem={this.state.selectedDbItem}
          query={this.props.location.query}
          dbItems={this.props.dbItems}
        />
      </div>
    )
  }
}

export default ViewerView
