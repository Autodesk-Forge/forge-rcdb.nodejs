import ContentEditable from 'react-contenteditable'
import 'react-select/dist/react-select.css'
import React, { PropTypes } from 'react'
import Select from 'react-select'
import './DBDropdown.scss'

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
  state = {
    dirty: false,
    editedFieldName: '',
    editedFieldValue:''
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

    // Strip all non-number characters from the input
    //return inputValue.replace(/[^0-9]/g, "");

    const enterPressed = (e.target.value.indexOf('<br>') > -1)

    console.log(e.target.value)
    console.log(enterPressed)

    let fieldValue = e.target.value.replace('<br>', '')

    switch(fieldName){

      case 'price':
        fieldValue = parseFloat(fieldValue)
        break;
    }

    this.setState(Object.assign({}, this.state, {
      dirty: true,
      editedFieldName: fieldName,
      editedFieldValue:fieldValue
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onBlurField (e, field) {

    if (this.state.dirty) {

      this.props.selectedDbItem[
        this.state.editedFieldName] =
          this.state.editedFieldValue

      this.props.onUpdateDbItem(
        this.props.selectedDbItem)

      this.state.dirty = false
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    const {selectedDbItem} = this.props

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
            onChange={(item)=>this.onSelectDbItem(item)}
          />
          <div className="field-container">
            <div className="field-name"><b>Supplier:</b></div>
            <ContentEditable
              onBlur={(e)=>this.onBlurField(e, 'supplier')}
              className="field-value"
              html={selectedDbItem ? selectedDbItem.supplier : ''}
              disabled={false}
              onChange={(e)=>this.onChangeField(e, 'supplier')}
            />
          </div>
          <br/>
          <div className="field-container">
            <div className="field-name"><b>Currency:</b></div>
            <ContentEditable
              onBlur={(e)=>this.onBlurField(e, 'currency')}
              className="field-value"
              html={selectedDbItem ? selectedDbItem.currency : ''}
              disabled={false}
              onChange={(e)=>this.onChangeField(e, 'currency')}
            />
          </div>
          <br/>
          <div className="field-container">
            <div className="field-name"><b>Price:</b></div>
            <ContentEditable
              onBlur={(e)=>this.onBlurField(e, 'price')}
              className="field-value"
              html={selectedDbItem ? selectedDbItem.price : ''}
              disabled={false}
              onChange={(e)=>this.onChangeField(e, 'price')}
            />
          </div>
        </div>
    )
  }
}

export default DBDropdown
