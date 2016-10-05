
import {Responsive, WidthProvider} from 'react-grid-layout'
const ResponsiveReactGridLayout = WidthProvider(Responsive)
import ServiceManager from 'SvcManager'
import DBDropdown from 'DBDropdown'
import DBTable from 'DBTable'
import Viewer from 'Viewer'
import './GridLayout.scss'
import React from 'react'
import _ from 'lodash'

class GridLayoutMovableLock extends React.Component {

  onMouseDown (e) {

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
        onMouseDown={this.onMouseDown}>
        <div className="handle"></div>
          {this.props.children}
      </div>
    )
  }
}

class DBResponsiveView extends React.Component {

  render() {

    const height = $('.db-responsive-view').height()

    if(height && height < 250) {

      return (
        <div className="db-responsive-view">
          <DBDropdown {...this.props}/>
        </div>
      )

    } else {

      return (
        <div className="db-responsive-view">
          <DBTable {...this.props}/>
        </div>
      )
    }
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
      lg: 24, md: 20, sm: 12, xs: 4, xxs: 4
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
      { i: 'db-responsive-view', h: h, w: 8, x: 0, y: 0 },
      { i: 'viewer',  h: h, w: 16, x: 8, y: 0 }
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

        case 'db-table':
          return (
            <div key={layout.i}>
              <GridLayoutMovableLock>
                <DBTable
                  onSelectDbItem={this.props.onSelectDbItem}
                  onUpdateDbItem={this.props.onUpdateDbItem}
                  selectedDbItem={this.props.selectedDbItem}
                  dbItems={this.props.filteredDbItems}
                />
              </GridLayoutMovableLock>
            </div>)
          break

        case 'db-drop':
          return (
            <div key={layout.i}>
            <GridLayoutMovableLock>
              <DBDropdown
                onSelectDbItem={this.props.onSelectDbItem}
                onUpdateDbItem={this.props.onUpdateDbItem}
                selectedDbItem={this.props.selectedDbItem}
                dbItems={this.props.filteredDbItems}
              />
            </GridLayoutMovableLock>
            </div>)
          break

        case 'db-responsive-view':
          return (
            <div key={layout.i}>
              <GridLayoutMovableLock>
                <DBResponsiveView
                  onSelectDbItem={this.props.onSelectDbItem}
                  onUpdateDbItem={this.props.onUpdateDbItem}
                  selectedDbItem={this.props.selectedDbItem}
                  dbItems={this.props.filteredDbItems}
                />
              </GridLayoutMovableLock>
            </div>)
          break

        case 'viewer':
          return (
            <div key={layout.i}>
              <GridLayoutMovableLock>
                <Viewer
                  onFilterDbItems={this.props.onFilterDbItems}
                  updatedDbItem={this.props.updatedDbItem}
                  modelId={this.props.query.id}
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
          onLayoutChange={this.onLayoutChange}
          useCSSTransforms={this.state.mounted}
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
