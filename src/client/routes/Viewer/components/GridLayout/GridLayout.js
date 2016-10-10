
import {Responsive, WidthProvider} from 'react-grid-layout'
const ResponsiveReactGridLayout = WidthProvider(Responsive)
import DBResponsiveView from '../DBResponsiveView'
import WidgetContainer from 'WidgetContainer'
import DBChart from 'DBChart'
import Viewer from 'Viewer'
import './GridLayout.scss'
import React from 'react'
import _ from 'lodash'

class GridLayoutMovableLock extends React.Component {

  onPointerDown (e) {

    if(e.target &&
      e.target.className &&
      e.target.className.toLowerCase &&
      e.target.className.toLowerCase () === 'handle') {

      return

    } else {

      e.stopPropagation()
    }
  }

  render() {

    return (
      <div className="grid-layout-movableLock"
        onTouchStart={this.onPointerDown}
        onMouseDown={this.onPointerDown}>
        <div className="handle"></div>
          {this.props.children}
      </div>
    )
  }
}

class GridLayout extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {

  }

  static defaultProps = {
    className: "layout",
    rowHeight: 4,
    margin: [4, 4],
    cols: {
      lg: 48, md: 40, sm: 24, xs: 8, xxs: 8
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  computeDefaultLayout = () => {

    var h = (screen.availHeight - 140)

    h = h/8 - ((h/8)%4)

    return [
      { i: 'grid',   h: 35, w: 16, x: 0, y: 0 },
      { i: 'chart',  h: h - 35, w: 16, x: 0, y: 0 },
      { i: 'viewer', h: h, w: 32, x: 16, y: 0 }
    ]
  }

  state = {
    mounted: false,
    currentBreakpoint: 'lg',
    layouts: {
      lg: this.computeDefaultLayout()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount() {

    this.setState({
      mounted: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  generateDOM() {

    return _.map(this.state.layouts.lg, (layout) => {

      switch(layout.i) {

        case 'grid':
          return (
            <div key={layout.i}>
              <GridLayoutMovableLock>
                <WidgetContainer title="Database">
                  <DBResponsiveView
                    onSelectDbItem={this.props.onSelectDbItem}
                    onUpdateDbItem={this.props.onUpdateDbItem}
                    selectedDbItem={this.props.selectedDbItem}
                    dbItems={this.props.filteredDbItems}
                  />
                </WidgetContainer>
              </GridLayoutMovableLock>
            </div>)
          break

        case 'chart':
          return (
            <div key={layout.i}>
              <GridLayoutMovableLock>
                <WidgetContainer title="Cost Breakdown">
                  <DBChart
                    onSelectDbItem={this.props.onSelectDbItem}
                    onUpdateDbItem={this.props.onUpdateDbItem}
                    selectedDbItem={this.props.selectedDbItem}
                    onClick={this.props.onChartClicked}
                    data={this.props.chartData}
                  />
                </WidgetContainer>
              </GridLayoutMovableLock>
            </div>)
          break

        case 'viewer':
          return (
            <div key={layout.i}>
              <GridLayoutMovableLock>
                <Viewer
                  onViewerCreated={this.props.onViewerCreated}
                  onFilterDbItems={this.props.onFilterDbItems}
                  updatedDbItem={this.props.updatedDbItem}
                  onModelLoaded={this.props.onModelLoaded}
                  dbItems={this.props.dbItems}/>
              </GridLayoutMovableLock>
            </div>)
          break

        default:
          return (
            <div key={layout.i}>
              Layout
            </div>
          )
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onBreakpointChange = (breakpoint) => {
    this.setState({
      currentBreakpoint: breakpoint
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onLayoutChange = (layout, layouts) => {
    this.setState({
      layout: layout
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div>
        <ResponsiveReactGridLayout
          onBreakpointChange={this.onBreakpointChange}
          useCSSTransforms={this.state.mounted}
          onLayoutChange={this.onLayoutChange}
          layouts={this.state.layouts}
          measureBeforeMount={false}
          {...this.props}>
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    )
  }
}

module.exports = GridLayout
