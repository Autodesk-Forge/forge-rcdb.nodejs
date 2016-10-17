import {LayoutSplitter, Layout} from 'react-flex-layout'
import DBResponsiveView from '../DBResponsiveView'
import WidgetContainer from 'WidgetContainer'
import DBChart from 'DBChart'
import Viewer from 'Viewer'
import './FlexLayout.scss'
import React from 'react'


class FlexLayout extends React.Component {
  
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

          </div>
        )
    }
  }
}

module.exports = FlexLayout
