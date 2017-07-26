import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import ContentEditable from 'react-contenteditable'
import WidgetContainer from 'WidgetContainer'
import React from 'react'

export default class Search extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onInputChanged = this.onInputChanged.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSearch = this.onSearch.bind(this)

    this.state = {
      search: ''
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInputChanged (e) {

    this.setState({
      search: e.target.value
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    //backspace, ENTER, ->, <-, delete, '.', '-', ',',
    //const allowed = [8, 13, 37, 39, 46, 188, 189, 190]
    //
    //if (allowed.indexOf(e.keyCode) > -1 ||
    //  (e.keyCode > 47 && e.keyCode < 58)) {
    //
    //  return
    //}
    //
    //e.stopPropagation()
    //e.preventDefault()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSearch () {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    return (
      <div className="title">
        <label>
          Meta Search
        </label>
        <div className="meta-search-controls">
          <ContentEditable
            data-placeholder="Search Meta Properties"
            onChange={this.onInputChanged}
            onKeyDown={this.onKeyDown}
            html={this.state.search}
            className="input-search"
          />
          <button onClick={this.onSearch}
            title="Search ...">
            <span className="fa fa-search"/>
          </button>
        </div>
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {

    return (
      <div>
       Search
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <WidgetContainer
        renderTitle={() => this.renderTitle()}
        className="meta-search"
        showTitle={true}>
        { this.renderContent () }
      </WidgetContainer>
    )
  }
}


