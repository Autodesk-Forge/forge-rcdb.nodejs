import ContentEditable from 'react-contenteditable'
import { browserHistory } from 'react-router'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import Item from './ConfiguratorItem'
import './ConfiguratorHomeView.scss'
import { Link } from 'react-router'
import React from 'react'
import Label from 'Label'

class ConfiguratorHomeView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super ()

    this.storageSvc = ServiceManager.getService(
      'StorageSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.state = {
      search: '',
      items: []
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentWillMount () {

    const items = this.storageSvc.load(
      'configurator.models', [])

    this.assignState({
      items
    })
    
    this.modelSvc.getModels('configurator').then(
      (dbItems) => {

        const dbItemsStr = JSON.stringify(dbItems)
        const itemsStr = JSON.stringify(items)

        if (dbItemsStr !== itemsStr) {

          this.storageSvc.save(
            'configurator.models', 
            dbItems)

          this.assignState({
            items: dbItems
          })
        }
      })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  gotToLink (e, href) {

    e.preventDefault()

    browserHistory.push(href)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSearchChanged (e) {

    this.assignState({
      search: e.target.value.toLowerCase()
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderItems () {

    const {search, items} = this.state

    const filteredItems = items.filter((model) => {
      return search.length
        ? model.name.toLowerCase().indexOf(search) > -1
        : true
    })

    return filteredItems.map((item) => {

      return <Item key={item._id} item={item}/>
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className="home">
        <ContentEditable
          onChange={(e) => this.onSearchChanged(e)}
          onKeyDown={(e) => this.onKeyDown(e)}
          data-placeholder="Search ..."
          html={this.state.search}
          className="search"
        />
        <div className="container">
          <div className="primary">
            <div className="items">
              {this.renderItems()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ConfiguratorHomeView























































