
import {Responsive, WidthProvider} from 'react-grid-layout'
const ResponsiveReactGridLayout = WidthProvider(Responsive)
import DBDropdown from 'DBDropdown'
import Viewer from './Viewer'
import DBGrid from './DBGrid'
import './GridLayout.scss'
import React from 'react'
import _ from 'lodash'

const computeDefaultLayout = () => {

  var h = (screen.availHeight - 140)

  h = h/8 - ((h/8)%4)

  return [
      { i: 'db-grid', h: h - 30, w: 4, x: 0, y: 0 },
      { i: 'db-drop', h: 30, w: 4, x: 0, y: 0 },
      { i: 'viewer',  h: h, w: 8, x: 4, y: 0 }
    ]
}

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

class GridLayout extends React.Component {

  static propTypes = {

  }

  static defaultProps = {
    className: "layout",
    rowHeight: 4,
    margin: [4, 4],
    cols: {
      lg: 12, md: 10, sm: 6, xs: 4, xxs: 2
    },
    selectedDbItem: {
      label: ''
    }
  }

  state = {
    mounted: false,
    currentBreakpoint: 'lg',
    layouts: {
      lg: computeDefaultLayout()
    },
    selectedDbItem:{
      label:'',
      value: null
    }
  }

  componentDidMount() {
    this.setState({
      mounted: true
    })
  }

  generateDOM() {

    return _.map(this.state.layouts.lg, (layout) => {

      switch(layout.i) {

        case 'db-grid':
          return (
            <div key={layout.i}>
              <DBGrid/>
            </div>)
          break

        case 'db-drop':
          return (
            <div key={layout.i}>
            <GridLayoutMovableLock>
              <DBDropdown
                onDbItemSelected={this.props.onDbItemSelected}
                dbItems={this.props.dbItems}
              />
            </GridLayoutMovableLock>
            </div>)
          break

        case 'viewer':
          return (
            <div key={layout.i}>
              <GridLayoutMovableLock>
                <Viewer/>
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

  onBreakpointChange = (breakpoint) => {
    this.setState({
      currentBreakpoint: breakpoint
    })
  }

  onLayoutChange = (layout, layouts) => {
    this.setState({
      layout: layout
    })
  }

  render() {

    return (
      <div>
        <ResponsiveReactGridLayout
          {...this.props}
          layouts={this.state.layouts}
          onBreakpointChange={this.onBreakpointChange}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={false}
          useCSSTransforms={this.state.mounted}>
          {this.generateDOM()}
        </ResponsiveReactGridLayout>
      </div>
    )
  }
}

module.exports = GridLayout
