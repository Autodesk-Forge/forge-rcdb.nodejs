import ContentEditable from 'react-contenteditable'
import 'react-select/dist/react-select.css'
import PropTypes from 'prop-types'
import Select from 'react-select'
import './DBDropdown.scss'
import React from 'react'

class DBDropdown extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    dbItems: PropTypes.arrayOf(PropTypes.object)
  }

  static defaultProps = {
    dbItems: []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()

    this.state = {
      editedFieldName: '',
      editedFieldValue:'',
      dirty: false
    }

    this.currencies = [
      {value:'ARS', label:'ARS'},
      {value:'BRL', label:'BRL'},
      {value:'CAD', label:'CAD'},
      {value:'CHF', label:'CHF'},
      {value:'CNY', label:'CNY'},
      {value:'DKK', label:'DKK'},
      {value:'EUR', label:'EUR'},
      {value:'GBP', label:'CAD'},
      {value:'INR', label:'INR'},
      {value:'JPY', label:'JPY'},
      {value:'MXN', label:'MXN'},
      {value:'PLN', label:'PLN'},
      {value:'RUB', label:'RUB'},
      {value:'USD', label:'USD'},
      {value:'ZAR', label:'ZAR'}
    ]
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelectDbItem (selectedDbItem) {

    if (selectedDbItem) {

      this.props.onSelectDbItem(
        selectedDbItem)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onChangeField (e, fieldName) {

    let fieldValue = e.target.value

    switch (fieldName) {

      case 'price':
        fieldValue = parseFloat(fieldValue)
        break;
    }

    this.setState(Object.assign({}, this.state, {
      editedFieldValue:fieldValue,
      editedFieldName: fieldName,
      dirty: true
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onBlurField (e, field) {

    if (this.state.dirty && this.props.selectedDbItem) {

      this.props.selectedDbItem[
        this.state.editedFieldName] =
          this.state.editedFieldValue

      this.setState(Object.assign({}, this.state, {
        dirty: false
      }), () => {
        this.props.onUpdateDbItem(
          this.props.selectedDbItem)
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    // ENTER
    if (e.keyCode === 13 || !this.props.selectedDbItem) {

      if (this.state.dirty && this.props.selectedDbItem) {

        this.props.selectedDbItem[
          this.state.editedFieldName] =
          this.state.editedFieldValue

        this.setState(Object.assign({}, this.state, {
          dirty: false
        }), () => {
          this.props.onUpdateDbItem(
            this.props.selectedDbItem)
        })
      }

      e.stopPropagation()
      e.preventDefault()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDownNumeric (e) {

    //backspace, ENTER, ->, <-, delete, '.', ',',
    const allowed = [8, 13, 37, 39, 46, 188, 190]

    if (allowed.indexOf(e.keyCode) > -1 ||
      (e.keyCode > 47 && e.keyCode < 58)) {

      return this.onKeyDown(e)
    }

    e.stopPropagation()
    e.preventDefault()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onCurrencyChanged (currency) {

    this.props.selectedDbItem.currency =
      currency.value

    this.props.onUpdateDbItem(
      this.props.selectedDbItem)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const { selectedDbItem } = this.props

    return (
        <div className="db-dropdown">
          <Select
            name="form-field-name"
            labelKey="name"
            valueKey="_id"
            value={selectedDbItem ? selectedDbItem._id : null}
            options={this.props.dbItems}
            clearable={false}
            placeholder={'Select material ...'}
            noResultsText={'No material match ...'}
            onChange={(item) => this.onSelectDbItem(item)}
          />
          <div className="field-container">
            <div className="field-name">
              <b>Supplier:</b>
            </div>
            <ContentEditable
              onBlur={(e)=>this.onBlurField(e, 'supplier')}
              className="field-value"
              html={selectedDbItem ? selectedDbItem.supplier : ''}
              disabled={false}
              onChange={(e)=>this.onChangeField(e, 'supplier')}
              onKeyDown={(e) => this.onKeyDown(e)}
            />
          </div>
          <br/>
          <div className="field-container">
            <div className="field-name">
              <b>Currency:</b>
            </div>
            <div className="currency-select">
              <Select
                name="form-field-name"
                labelKey="label"
                valueKey="value"
                value={selectedDbItem ? selectedDbItem.currency : null}
                options={selectedDbItem ? this.currencies : null}
                clearable={false}
                placeholder={'...'}
                noResultsText={'None ...'}
                onChange={(currency) => this.onCurrencyChanged(currency)}
              />
            </div>
          </div>
          <br/>
          <div className="field-container">
            <div className="field-name">
              <b>Price:</b>
            </div>
            <ContentEditable
              onBlur={(e)=>this.onBlurField(e, 'price')}
              className="field-value"
              html={selectedDbItem ? selectedDbItem.price : ''}
              disabled={false}
              onChange={(e)=>this.onChangeField(e, 'price')}
              onKeyDown={(e) => this.onKeyDownNumeric(e)}
            />
          </div>
        </div>
    )
  }
}

export default DBDropdown
