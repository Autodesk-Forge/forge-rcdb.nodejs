
import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import WidgetContainer from 'WidgetContainer'
import ResponsiveView from 'ResponsiveView'
import { ReactLoader } from 'Loader'
import DBDropdown from 'DBDropdown'
import DBTable from 'DBTable'
import DBChart from 'DBChart'
import Viewer from 'Viewer'
import React from 'react'

class FlexLayout extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const showLoader = !this.props.filteredDbItems.length

    switch (this.props.layoutType) {

      case 'flexLayoutLeft':

        return (
          <ReflexContainer key="flexLayoutLeft" orientation='vertical'>
            <ReflexElement flex={0.4}>
              <ReflexContainer orientation='horizontal'>
                <ReflexElement minSize={210} propagateDimensions={true}>
                  <WidgetContainer title="Database">
                    <ReactLoader show={showLoader}/>
                    <ResponsiveView breakPoint={185}
                      onSelectDbItem={this.props.onSelectDbItem}
                      onUpdateDbItem={this.props.onUpdateDbItem}
                      selectedDbItem={this.props.selectedDbItem}
                      dbItems={this.props.filteredDbItems}>
                      <DBDropdown/>
                      <DBTable/>
                    </ResponsiveView>
                  </WidgetContainer>
                </ReflexElement>
                <ReflexSplitter onStopResize={() => this.forceUpdate()}/>
                <ReflexElement>
                  <WidgetContainer title="Cost Breakdown">
                    <ReactLoader show={showLoader}/>
                    <DBChart
                      onClick={this.props.onChartClicked}
                      legendData={this.props.legendData}
                      pieData={this.props.pieData}
                    />
                  </WidgetContainer>
                </ReflexElement>
              </ReflexContainer>
            </ReflexElement>
            <ReflexSplitter onStopResize={() => this.forceUpdate()}/>
            <ReflexElement propagateDimensions={true}>
              <Viewer onViewerCreated={this.props.onViewerCreated}/>
            </ReflexElement>
          </ReflexContainer>
        )

      case 'flexLayoutRight':
      default:

        return (

          <ReflexContainer key="flexLayoutRight" orientation='vertical'>
            <ReflexElement flex={0.6} propagateDimensions={true}>
              <Viewer onViewerCreated={this.props.onViewerCreated}/>
            </ReflexElement>
            <ReflexSplitter onStopResize={() => this.forceUpdate()}/>
            <ReflexElement>
              <ReflexContainer orientation='horizontal'>
                <ReflexElement minSize={210} propagateDimensions={true}>
                  <WidgetContainer title="Database">
                    <ReactLoader show={showLoader}/>
                    <ResponsiveView breakPoint={185}
                      onSelectDbItem={this.props.onSelectDbItem}
                      onUpdateDbItem={this.props.onUpdateDbItem}
                      selectedDbItem={this.props.selectedDbItem}
                      dbItems={this.props.filteredDbItems}>
                      <DBDropdown/>
                      <DBTable/>
                    </ResponsiveView>
                  </WidgetContainer>
                </ReflexElement>
                <ReflexSplitter onStopResize={() => this.forceUpdate()}/>
                <ReflexElement>
                  <WidgetContainer title="Cost Breakdown">
                    <ReactLoader show={showLoader}/>
                    <DBChart
                      onClick={this.props.onSelectDbItem}
                      legendData={this.props.legendData}
                      pieData={this.props.pieData}
                    />
                  </WidgetContainer>
                </ReflexElement>
              </ReflexContainer>
            </ReflexElement>
          </ReflexContainer>
        )
    }
  }
}

module.exports = FlexLayout
