import { DropdownButton, MenuItem } from 'react-bootstrap'
import { Tabs, Tab } from 'react-bootstrap'
import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import Measure from 'react-measure'
import React from 'react'

export default class ScenesView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onTabSelected = this.onTabSelected.bind(this)

    this.state = {
      activeTabKey: 'scene-info',
      tabsWidth: 0,
      scene: null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onTabSelected (tabKey) {

    this.assignState({
      activeTabKey: tabKey
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTabs () {

    const {activeTabKey, tabsWidth} = this.state

    const nbTabs = 3

    const style = {
      width:
        `${Math.floor((tabsWidth-8)/nbTabs-15)}px`
    }

    const tabTitle = (title) => {
      return (
        <label style={style}>
          {title}
        </label>
      )
    }

    return (
      <div className="scene-tabs">
        <Measure bounds onResize={(rect) => {
          this.assignState({
            tabsWidth: rect.bounds.width
          })
        }}>
        {
          ({ measureRef }) =>
            <div ref={measureRef} className="tabs-container">
              <Tabs activeKey={activeTabKey}
                onSelect={this.onTabSelected}
                id="scene-tabs"
                className="tabs">
                <Tab className="tab-container"
                  title={tabTitle('Scene Info')}
                  eventKey="scene-info"
                  key="scene-info">

                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('Instance Tree')}
                  eventKey="instanceTree"
                  key="instanceTree">

                </Tab>
                <Tab className="tab-container"
                  title={tabTitle('Resources')}
                  eventKey="resources"
                  key="resources">

                </Tab>
              </Tabs>
            </div>
          }
        </Measure>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const {scenes} = this.props
    const {scene} = this.state

    const menuItems = scenes.map((sc, idx) => {
      return (
        <MenuItem eventKey={idx} key={idx}
          onClick={() => {
            this.assignState({
              scene: sc
            })
          }}>
          { sc.name }
        </MenuItem>
      )
    })

    return(
      <div className="scenes">
        <ReactLoader show={!scenes.length}/>
        <DropdownButton
          title={`Select scene: ${scene ? scene.name : ''}`}
          key={'dropdown-scenes'}
          id={'dropdown-scenes'}>
            { menuItems }
        </DropdownButton>
        { this.renderTabs() }
      </div>
    )
  }
}
