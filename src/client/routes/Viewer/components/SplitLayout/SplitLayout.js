import DBResponsiveView from '../DBResponsiveView'
import WidgetContainer from 'WidgetContainer'
import SplitPane from 'react-split-pane'
import ServiceManager from 'SvcManager'
import DBChart from 'DBChart'
import Viewer from 'Viewer'
import './SplitLayout.scss'
import React from 'react'

class SplitLayout extends React.Component {

  constructor () {

    super ()

    this.eventSvc = ServiceManager.getService(
      'EventSvc')
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  state = {
    splitHeight: 0,
    splitWidth: 0
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount() {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    switch(this.props.layoutType) {

      case 'splitLayoutRight':

        return (
          <div>
            <SplitPane className="primary"
              split="vertical"
              minSize={50} defaultSize="60%"
              onChange={ (size) => {
                if(this.eventTimeout) {
                  clearTimeout(this.eventTimeout)
                }
                this.eventTimeout = setTimeout(() => {
                  this.setState(Object.assign({}, this.state, {
                    splitWidth: size
                  }))
                }, 100)
              }}>

              <Viewer
                onViewerCreated={this.props.onViewerCreated}
                onFilterDbItems={this.props.onFilterDbItems}
                updatedDbItem={this.props.updatedDbItem}
                onModelLoaded={this.props.onModelLoaded}
                dbItems={this.props.dbItems}
                width={this.state.splitWidth}/>

              <SplitPane split="horizontal"
                minSize={230} defaultSize={300}
                onChange={ (size) => {
                  if(this.eventTimeout) {
                    clearTimeout(this.eventTimeout)
                  }
                  this.eventTimeout = setTimeout(() => {
                    $('.Pane.horizontal.Pane2').css({
                      height: `calc(100% - ${size}px)`
                    })
                    this.setState(Object.assign({}, this.state, {
                      splitHeight: size
                    }))
                  }, 100)
                }}>
                <WidgetContainer title="Database">
                  <DBResponsiveView
                    onSelectDbItem={this.props.onSelectDbItem}
                    onUpdateDbItem={this.props.onUpdateDbItem}
                    selectedDbItem={this.props.selectedDbItem}
                    dbItems={this.props.filteredDbItems}
                    height={this.state.splitHeight}
                  />
                </WidgetContainer>
                <WidgetContainer title="Cost Breakdown">
                  <DBChart
                    onClick={this.props.onChartClicked}
                    height={this.state.splitHeight}
                    width={this.state.splitWidth}
                    data={this.props.chartData}
                  />
                </WidgetContainer>
              </SplitPane>
            </SplitPane>
          </div>
        )

      case 'splitLayoutLeft':
      default:

        return (
          <div>
            <SplitPane className="primary"
              split="vertical"
              minSize={50} defaultSize="40%"
              onChange={ (size) => {
                if(this.eventTimeout) {
                  clearTimeout(this.eventTimeout)
                }
                this.eventTimeout = setTimeout(() => {
                  this.setState(Object.assign({}, this.state, {
                    splitWidth: size
                  }))
                }, 100)
              }}>
              <SplitPane split="horizontal"
                minSize={230} defaultSize={300}
                onChange={ (size) => {
                  if(this.eventTimeout) {
                    clearTimeout(this.eventTimeout)
                  }
                  this.eventTimeout = setTimeout(() => {
                    $('.Pane.horizontal.Pane2').css({
                      height: `calc(100% - ${size}px)`
                    })
                    this.setState(Object.assign({}, this.state, {
                      splitHeight: size
                    }))
                  }, 100)
                }}>
                <WidgetContainer title="Database">
                  <DBResponsiveView
                    onSelectDbItem={this.props.onSelectDbItem}
                    onUpdateDbItem={this.props.onUpdateDbItem}
                    selectedDbItem={this.props.selectedDbItem}
                    dbItems={this.props.filteredDbItems}
                    height={this.state.splitHeight}
                  />
                </WidgetContainer>
                <WidgetContainer title="Cost Breakdown">
                  <DBChart
                    onClick={this.props.onChartClicked}
                    height={this.state.splitHeight}
                    width={this.state.splitWidth}
                    data={this.props.chartData}
                  />
                </WidgetContainer>
              </SplitPane>
              <Viewer
                onViewerCreated={this.props.onViewerCreated}
                onFilterDbItems={this.props.onFilterDbItems}
                updatedDbItem={this.props.updatedDbItem}
                onModelLoaded={this.props.onModelLoaded}
                dbItems={this.props.dbItems}
                width={this.state.splitWidth}/>
            </SplitPane>
          </div>
        )
    }
  }
}

module.exports = SplitLayout
