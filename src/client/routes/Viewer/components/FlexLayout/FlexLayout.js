import {LayoutSplitter, Layout} from 'react-flex-layout'
import DBResponsiveView from '../DBResponsiveView'
import WidgetContainer from 'WidgetContainer'
import DBChart from 'DBChart'
import Viewer from 'Viewer'
import './FlexLayout.scss'
import React from 'react'


class FlexLayout extends React.Component {

  constructor () {

    super ()

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  state = {

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

      case 'flexLayoutRight':

        return (
          <div>
            <Layout layoutWidth={500} layoutHeight={500}>
              <Layout layoutWidth={100}>
                Column1
              </Layout>
              <LayoutSplitter/>
              <Layout layoutWidth={100}>
                Column2
              </Layout>
            </Layout>
          </div>
        )

      case 'flexLayoutLeft':
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

module.exports = FlexLayout
