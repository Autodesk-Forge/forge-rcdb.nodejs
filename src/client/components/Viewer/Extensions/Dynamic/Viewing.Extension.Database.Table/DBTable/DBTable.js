
import PropTypes from 'prop-types'
import './libs/nice-select.css'
import find from 'lodash/find'
import './libs/nice-select'
import React from 'react'
import './libs/footable'
import './DBTable.scss'
import './libs/footable.editable'

class DBTable extends React.Component {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  constructor () {
    super()

    this.scroll = 0
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentDidMount () {
    $('.footable').footable({
      breakpoints: {
        phone: 400,
        tablet: 400
      }
    })

    this.ftEditable = $().ftEditable()

    this.ftEditable.setUpdateHandler((updateRecord) => {
      const dbItem = find(this.props.items, {
        _id: updateRecord.id
      })

      switch (updateRecord.fieldName) {
        case 'price':

          const price = parseFloat(updateRecord.fieldValue)

          if (!isNaN(price)) {
            dbItem[updateRecord.fieldName] = price
          }

          break

        case 'currency':
          return

        default:
          dbItem[updateRecord.fieldName] =
            updateRecord.fieldValue
          break
      }

      this.props.onUpdateItem(dbItem)
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  shouldComponentUpdate (nextProps) {
    if (nextProps.guid !== this.props.guid) {
      return true
    }

    return false
  }

  /// //////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////
  componentDidUpdate () {
    this.refresh()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  componentWillUnmount () {
    $('.footable').remove()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onRowClicked (id) {
    const selectedItem = find(
      this.props.items, {
        _id: id
      })

    if (selectedItem) {
      this.props.onSelectItem(
        selectedItem, true)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  onHeaderClicked (e) {

  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  refresh () {
    if (this.ftEditable) {
      this.ftEditable.deleteAllRows(
        '.footable')

      this.ftEditable.addRows(
        '.footable',
        this.props.items.map((dbItem) => {
          return {
            name: dbItem.name,
            supplier: dbItem.supplier,
            price: dbItem.price,
            currency: dbItem.currency,
            id: dbItem._id
          }
        }), {

          select: {
            currency: [
              { value: 'ARS', label: 'ARS' },
              { value: 'BRL', label: 'BRL' },
              { value: 'CAD', label: 'CAD' },
              { value: 'CHF', label: 'CHF' },
              { value: 'CNY', label: 'CNY' },
              { value: 'DKK', label: 'DKK' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'CAD' },
              { value: 'INR', label: 'INR' },
              { value: 'JPY', label: 'JPY' },
              { value: 'MXN', label: 'MXN' },
              { value: 'PLN', label: 'PLN' },
              { value: 'RUB', label: 'RUB' },
              { value: 'USD', label: 'USD' },
              { value: 'ZAR', label: 'ZAR' }
            ]
          }
        })

      this.select = $('select', '.db-table').niceSelect()

      this.select.on('change', (e, option) => {
        const id = $(option).parents('tr')[0].id

        const dbItem = find(this.props.items, {
          _id: id
        })

        dbItem.currency = $(option).attr('data-value')

        this.props.onUpdateItem(dbItem)
      })

      $('.footable > tbody > tr > td:first-child').off(
        'click')

      $('.footable > tbody > tr > td:first-child').on(
        'click', (e) => {
          const id = $(e.target).parent()[0].id
          this.onRowClicked(id)
        })

      $('.footable > tbody > tr > td:first-child label').on(
        'click', (e) => {
          const id = $(e.target).parent().parent()[0].id
          this.onRowClicked(id)
        })

      $('.footable > thead > tr > th').on(
        'click', (e) => this.onHeaderClicked(e))

      $("td[contenteditable='true']", '.footable').on(
        'keydown keypress', (e) => {
          // Allow only numeric for "Price"
          if ($(e.target).index() === 2) {
            // backspace,  ->, <-, delete, '.', ',',
            const allowed = [8, 37, 39, 46, 188, 190]

            if (allowed.indexOf(e.keyCode) > -1 ||
               (e.keyCode > 47 && e.keyCode < 58)) {

              // console.log('OK')

            // enter
            } else if (e.keyCode === 13) {
              const value = this.getValue(e.target)

              const price = parseFloat(value)

              if (!isNaN(price)) {
                const dbItem = this.getDbItem(e.target)

                dbItem.price = price

                this.props.onUpdateItem(dbItem)
              }

              e.preventDefault()
            } else {
              e.preventDefault()
            }
          } else {
            // prevents ENTER
            if (e.keyCode === 13) {
              const field = this.getField(e.target)

              const value = this.getValue(e.target)

              const dbItem = this.getDbItem(e.target)

              dbItem[field] = value

              this.props.onUpdateItem(dbItem)

              e.preventDefault()
            }
          }
        })

      $('.scroll tbody').scroll(() => {
        this.scroll = $('.scroll tbody').scrollTop()
      })

      $('.scroll tbody').scrollTop(this.scroll)
    }
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getDbItem (target) {
    const id = $(target).parent()[0].id

    return find(this.props.items, {
      _id: id
    })
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getValue (target) {
    const $label = $(target).find('label')

    if ($label.length) {
      return $label.text()
    }

    return $(target).text()
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  getField (target) {
    const idx = $(target).index()

    const header = $('.footable > thead > tr > th')[idx]

    const field = $(header).attr('data-field')

    return field
  }

  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    return (
      <div className='db-table'>
        <table className='footable scroll'>
          <thead>
            <tr>
              <th
                className='db-column fooId'
                data-field='material'
              >
                <label>Material</label>
              </th>
              <th
                className='db-column fooEditable'
                data-hide='phone,tablet'
                data-field='supplier'
              >
                Supplier
              </th>
              <th
                className='db-column fooEditable'
                data-field='price'
              >
                Price (/kg)
              </th>
              <th
                className='db-column'
                data-field='currency'
                data-hide='phone'
                data-ft-control='select'
              >
                Currency
              </th>
              <th className='db-column hidden'>
                _id
              </th>
            </tr>
          </thead>
          <tbody />
        </table>
      </div>
    )
  }
}

export default DBTable
