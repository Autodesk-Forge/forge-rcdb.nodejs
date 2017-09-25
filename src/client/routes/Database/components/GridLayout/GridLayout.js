
import {Responsive, WidthProvider} from 'react-grid-layout'
const ResponsiveReactGridLayout = WidthProvider(Responsive)
import WidgetContainer from 'WidgetContainer'
import ResponsiveView from 'ResponsiveView'
import throttle from 'lodash/throttle'
import DBDropdown from 'DBDropdown'
import DBTable from 'DBTable'
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
      { i: 'grid',   h: 42, w: 16, x: 0, y: 0 },
      { i: 'chart',  h: h - 40, w: 16, x: 0, y: 0 },
      { i: 'viewer', h: h+2, w: 32, x: 16, y: 0 }
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

    this.throttledUpdate = throttle(() => {
      this.forceUpdate()
    }, 150)

    window.addEventListener(
      'resize', this.throttledUpdate)

    this.setState({
      mounted: true
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  componentWillUnmount () {

    window.removeEventListener(
      'resize', this.throttledUpdate)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  generateDOM() {

    return this.state.layouts.lg.map((layout) => {

      switch(layout.i) {

        case 'grid':
          return (
            <div key={layout.i}>
              <GridLayoutMovableLock>
                <WidgetContainer title="Database">
                  <ResponsiveView breakPoint={185}
                    onSelectDbItem={this.props.onSelectDbItem}
                    onUpdateDbItem={this.props.onUpdateDbItem}
                    selectedDbItem={this.props.selectedDbItem}
                    dbItems={this.props.filteredDbItems}>
                    <DBDropdown/>
                    <DBTable/>
                  </ResponsiveView>
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
                    legendData={this.props.legendData}
                    pieData={this.props.pieData}
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
                  dbItems={this.props.dbItems}
                  style={{height:"100%"}}/>
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
