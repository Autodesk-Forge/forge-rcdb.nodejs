import ContentEditable from 'react-contenteditable'
import { history as browserHistory } from 'BrowserContext'
import BaseComponent from 'BaseComponent'
import { ServiceContext } from 'ServiceContext'
import Item from './ConfiguratorItem'
import './ConfiguratorHomeView.scss'
import React from 'react'
import Label from 'Label'

class ConfiguratorHomeView extends BaseComponent {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor () {
    super()

    this.state = {
      search: '',
      items: []
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  async componentWillMount () {
    const items = await this.context.storageSvc.load(
      'configurator.models', [])

    this.assignState({
      items
    })

    this.context.modelSvc.getModels('configurator').then(
      (dbItems) => {
        const dbItemsStr = JSON.stringify(dbItems)
        const itemsStr = JSON.stringify(items)

        if (dbItemsStr !== itemsStr) {
          this.context.storageSvc.save(
            'configurator.models',
            dbItems)

          this.assignState({
            items: dbItems
          })
        }
      })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  gotToLink (e, href) {
    e.preventDefault()

    browserHistory.push(href)
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onKeyDown (e) {
    if (e.keyCode === 13) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onSearchChanged (e) {
    this.assignState({
      search: e.target.value.toLowerCase()
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  renderItems () {
    const { search, items } = this.state

    const filteredItems = items.filter((model) => {
      return search.length
        ? model.name.toLowerCase().indexOf(search) > -1
        : true
    })

    return filteredItems.map((item) => {
      return <Item key={item._id} item={item} />
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    return (
      <div className='home'>
        <ContentEditable
          onChange={(e) => this.onSearchChanged(e)}
          onKeyDown={(e) => this.onKeyDown(e)}
          data-placeholder='Search ...'
          html={this.state.search}
          className='search'
        />
        <div className='container'>
          <div className='primary'>
            <div className='items'>
              {this.renderItems()}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default ConfiguratorHomeView
