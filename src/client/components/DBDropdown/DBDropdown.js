import ContentEditable from 'react-contenteditable'
import 'react-select/dist/react-select.css'
import React, { PropTypes } from 'react'
import Select from 'react-select'
import './DBDropdown.scss'

class DBDropdown extends React.Component {

  static propTypes = {

    dbItems: PropTypes.arrayOf(PropTypes.object)
  }

  static defaultProps = {
    dbItems: []
  }

  constructor(props) {

    super(props)

    this.state = {
     selectedDbItem: {
       value:0
     },
     html: {
       supplier:' ',
       currency:' ',
       price:' '
     }
    }
  }

  componentDidMount () {

  }

  onDbItemSelected (item) {

    this.props.onDbItemSelected(item)

    this.setState({
      selectedDbItem: item || {value:0}
    });
  }

  onFieldChanged (e, field) {

    const html = e.target.value.replace('<br>', '')

    let state = this.state

    state.html[field] = html

    this.setState(state);
  }

  onFieldBlured (e, field) {

    console.log(e)
  }

  render() {

    const dbItems = this.props.dbItems.map((item)=> {
      return {
        label: item.name,
        value: item._id
      }
    })

    return (
        <div className="db-dropdown">
          <Select
            name="form-field-name"
            value={this.state.selectedDbItem.value}
            options={dbItems}
            onChange={(item)=>this.onDbItemSelected(item)}
          />
          <div className="field-container">
            <div className="field-name">Supplier:</div>
            <ContentEditable
              onBlur={(e)=>this.onFieldBlured(e, 'supplier')}
              className="field-value"
              html={this.state.html.supplier}
              disabled={false}
              onChange={(e)=>this.onFieldChanged(e, 'supplier')}
            />
          </div>
          <br/>
          <div className="field-container">
            <div className="field-name">Currency:</div>
            <ContentEditable
              className="field-value"
              html={this.state.html.currency}
              disabled={false}
              onChange={(e)=>this.onFieldChanged(e, 'currency')}
            />
          </div>
          <br/>
          <div className="field-container">
            <div className="field-name">Price:</div>
            <ContentEditable
              className="field-value"
              html={this.state.html.price}
              disabled={false}
              onChange={(e)=>this.onFieldChanged(e, 'price')}
            />
          </div>
        </div>
    )
  }
}

export default DBDropdown
