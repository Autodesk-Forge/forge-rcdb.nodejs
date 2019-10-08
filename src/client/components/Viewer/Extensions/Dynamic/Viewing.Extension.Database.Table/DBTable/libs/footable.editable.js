/*!
 * FooTable Editable Plugin - Awesome Responsive FooTables That Are Editable
 * Version : 0.1
 * Author: Jake Drew - http://www.jakemdrew.com
 *
 * Requires jQuery - http://jquery.com/
 * Requires FooTable http://themergency.com/footable
 *
 * FooTable Editable Copyright 2013 Jake Drew
 *
 * Released under the MIT license
 * You are free to use FooTable Editable in commercial projects as long as this copyright header is left intact.
 *
 * Date: 2 Jul 2013
 */

(function ($, w, undefined) {
  if (w.footable == undefined || w.footable == null) { throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.') }

  var defaults = {
    serverTableName: undefined,
    dataHandlerURL: 'demo',
    autoLoad: false,
    createDetail:
      function (element, data) {
        var groups = { _none: { name: null, data: [] } }
        for (var i = 0; i < data.length; i++) {
          var groupid = data[i].group
          if (groupid != null) {
            if (!(groupid in groups)) { groups[groupid] = { name: data[i].groupName, data: [] } }

            groups[groupid].data.push(data[i])
          } else {
            groups._none.data.push(data[i])
          }
        }

        var table = $(element).closest('table')

        for (var group in groups) {
          if (groups[group].data.length == 0) continue
          if (group != '_none') element.append('<h4>' + groups[group].name + '</h4>')

          for (var j = 0; j < groups[group].data.length; j++) {
            var separator = (groups[group].data[j].name) ? ':' : ''

            // check for html input tags or img tags
            var tagTest = '<td>' + groups[group].data[j].display + '</td>'

            const style = 'style="float:left;"'

            if ($(tagTest).children().length > 0) {
              element.append(
                `<div class="row-detail"><strong ${style} class="">` +
                  groups[group].data[j].name + separator +
                '</strong> ' +
                groups[group].data[j].display + '</div>')
            } else {
              if ($.data(w.footable, $(table).attr('id') + '_fooEditableCols').indexOf(groups[group].data[j].name) >= 0) {
                element.append(
                  `<div><strong ${style}>` +
                  groups[group].data[j].name +
                  '</strong>' + separator +
                  ' <input type="text" value="' +
                  groups[group].data[j].display + '"/></div>')
              } else {
                element.append(
                  `<div><strong ${style}>` +
                  groups[group].data[j].name +
                  '</strong>' + separator +
                  ' <input type="text" readonly value="' +
                  groups[group].data[j].display + '"/></div>')
              }
            }
          }
        }

        if ($(element).text() == '') {
          $(element).closest('tr').prev().removeClass('footable-detail-show')
          $(element).closest('tr').remove()
        }
      },

    parsers: {
      numeric: function (cell) {
        var val = $(cell).data('value') || $(cell).text().replace(/[^0-9.-]/g, '')
        val = parseFloat(val)
        if (isNaN(val)) val = 0
        return val
      },
      JSONDate: function (cell) {
        if (String(cell).substring(0, 6) == '/Date(') {
          dt = new Date(parseInt(String(cell).substring(6)))
          d = dt.getDate(); m = dt.getMonth() + 1; yy = dt.getFullYear()
          cell = m + '/' + d + '/' + yy
        }
        return cell
      },
      prettyDate: function (cell) {
        var dt = Date.parse(cell)
        if (isNaN(dt) == false) {
          dt = new Date(dt)
          d = dt.getDate(); m = dt.getMonth(); yy = dt.getFullYear()
          cell = m + '/' + d + '/' + yy
        }
        return cell
      }
    }
  }

  function makeColsFooEditable (table) {
    $(table).find('th').each(function (index) {
      if ($(this).hasClass('fooEditable')) {
        index += 1
        $('td:nth-child(' + index + ')').attr('contentEditable', true)
      }
    })
  }

  function getButtonIndexes (table) {
    // finds all fields defined data-ft-buttons= Add or Delete or both
    // only creates the collection one time.
    var buttonIndexes = $.data(w.footable, $(table).attr('id') + '_buttonIndexes')

    if (buttonIndexes === undefined) {
      buttonIndexes = {}
      buttonIndexes.addCols = new Array()
      buttonIndexes.deleteCols = new Array()
      buttonIndexes.buttonCols = new Array()
      buttonIndexes.buttonColCt = 0

      $(table).find('th').each(function (index) {
        var buttons = $(this).attr('data-ft-buttons')
        if (buttons != undefined) {
          buttonIndexes.buttonCols.push(index)
          if (buttons.indexOf('Add') >= 0) {
            buttonIndexes.addCols.push(index)
          }
          if (buttons.indexOf('Delete') >= 0) {
            buttonIndexes.deleteCols.push(index)
          }
          buttonIndexes.buttonColCt++
        }
      })

      $.data(w.footable, $(table).attr('id') + '_buttonIndexes', buttonIndexes)
    }
    return buttonIndexes
  }

  var onUpdateHandler = null

  function setUpdateHandler (handler) {
    onUpdateHandler = handler
  }

  function processCommand (target, command) {
    var tId = $(target).closest('table').attr('id')

    var curRow = getCurrentRow(target)

    // Do not process update transactions on a new record
    if ($(curRow).hasClass('fooNewRecord') && $(target).attr('type') != 'button') return

    var updateRecord = {}
    updateRecord.command = command
    updateRecord.table = $.data(w.footable, tId + '_serverTableName')

    if (command == 'Load') {
      // send the updateRecord to the server via AJAX
      transportData(target, updateRecord)
      return
    }

    /* All fields are sent for command=add, only id fields for command=delete. */
    $(curRow).find('td').each(function () {
      var fieldName = $.data(w.footable, tId + '_colNames')[$(this).index()]
      var fieldIsVisible = $(this).is(':visible')
      var fieldIsControl = $.data(w.footable, tId + '_colControlType')[$(this).index()]
      var fieldIsIdCol = $.data(w.footable, tId + '_idColIndexes').indexOf($(this).index()) >= 0

      if (command == 'Add' || fieldIsIdCol) {
        // input vals are always populated in corresponding td.
        if (fieldIsControl === undefined) updateRecord[fieldName] = $(this).text().trim()
        else {
          var ctlVal = $(this).find('input').val().trim()
          if (ctlVal != 'true') ctlVal = 'false'
          updateRecord[fieldName] = ctlVal
        }
      }
    })

    if (command == 'Update') {
      var updatedFieldName = $.data(w.footable, tId + '_colNames')[$(target).index()]
      var updatedFieldValue
      var updatedFieldOldValue = $.data(target, 'oldValue')

      if ($(target).is("input[type='text']")) {
        updatedFieldName = $(target).closest('div').text().trim().slice(0, -1)
        updatedFieldValue = $(target).val()
      } else if ($.data(w.footable, tId + '_colControlType')[$(target).index()] !== undefined) {
        var ctl = $(target).find('input')
        var ctlVal = ctl.val()
        if (ctlVal != 'true') ctlVal = 'false'
        updatedFieldValue = ctlVal
        updatedFieldOldValue = !ctlVal
      } else {
        updatedFieldValue = $(target).text()
      }

      updateRecord.fieldName = updatedFieldName.split(' ')[0].toLowerCase()
      updateRecord.fieldOldValue = updatedFieldOldValue
      updateRecord.fieldValue = updatedFieldValue
      updateRecord.id = $(target).parent()[0].id
    }

    if (onUpdateHandler) {
      onUpdateHandler(updateRecord)
    }
  }

  function transportData (target, updateRecord) {
    var tId = $(target).closest('table').attr('id')
    var dataHandlerURL = $.data(w.footable, tId + '_dataHandlerURL')

    // Do nothing mode...
    if (dataHandlerURL == '') return

    // Do not make ajax call for demo mode...
    if (dataHandlerURL == 'demo' || updateRecord === undefined) {
      alert('Demo Mode:\r\nThe following JSON data would be sent to the server: \r\n' + JSON.stringify(updateRecord))
      // mimic server response
      var response = {}
      response.response = 'Success'
      response.message = 'Your message here'
      response.data = undefined
      alert('Demo Mode:\r\nThe server responded: \r\n' + JSON.stringify(response))
      processServerResponse(target, JSON.stringify(response), updateRecord)
      return
    }

    // Send the updateRecord to the server via AJAX for valid command.
    $.ajax({
      type: 'POST',
      url: $.data(w.footable, tId + '_dataHandlerURL'),
      contentType: 'application/json; charset=uft-8',
      data: JSON.stringify(updateRecord)
    })
      .done(function (data) { processServerResponse(target, data, updateRecord) })
      .fail(function (msg) { alert('error: ' + JSON.stringify(msg.responseText)) })
    // .always(function (msg) { alert("complete" + JSON.stringify(msg)); });
  }

  function tryJSONParse (data) {
    try {
      p = JSON.parse(data)
      data = p
    } catch (e) {
      // data was not valid json
    } finally {
      return data
    }
  }

  // function processServerResponse(target, data, updateRecord) {
  //  //the data response variable can be json or a valid javascript object...
  //  data = tryJSONParse(data);
  //  data.responseData = tryJSONParse(data.responseData);
  //
  //  var table = $(target).closest('table');
  //  var curRow = getCurrentRow(target);
  //  var nextRow = $(curRow).next();
  //
  //  //handle processing for fooButtons
  //  if ($(target).hasClass('footableButton') && data.response != "Error") {
  //    if (updateRecord.command == "Add") {
  //      //convert new record to normal record.
  //      $(curRow).removeClass('fooNewRecord');
  //      $(curRow).find('input[type="button"][value="Add"].footableButton').remove();
  //
  //      addButtonsToRow(curRow, getButtonIndexes(table));
  //
  //      if ($(nextRow).hasClass('footable-row-detail')) addButtonsToDetailRow(nextRow, getButtonIndexes(this));
  //
  //      //Hide the curRow detail row, if showing
  //      if ($(curRow).hasClass('footable-detail-show')) {
  //        $(curRow).removeClass('footable-detail-show');
  //        $(nextRow).hide();
  //      }
  //
  //    }
  //    if (updateRecord.command == "Delete" && data.response == "Success") {
  //      deleteRow(curRow);
  //    }
  //  }
  //
  //  //Handle processing AJAX server responses.
  //  if (data.response == "Success") {
  //    //Do nothing!
  //  }
  //  else if (data.response == "Load") {
  //    deleteAllRows(table);
  //    addRows(table, data.responseData);
  //  }
  //  else if (data.response == "Append") {
  //    addRows(table, data.responseData);
  //  }
  //  else if (data.response == "Update") {
  //    updateRow(curRow, data.responseData);
  //  }
  //  else if (data.response == "Delete") {
  //    deleteRow(curRow);
  //  }
  //  else if (data.response == "DeleteAll") {
  //    deleteAllRows(table);
  //  }
  //  else if (data.response == "Error") {
  //    alert("The update was not successful\r\n" + data.message);
  //
  //    if (updateRecord.command == 'Update') {
  //      //if a cell update fails, revert back to the previous value.
  //      var updateIndex = $.data(
  //        w.footable,
  //        $(ft.table).attr('id') + '_colNames').indexOf(
  //        updateRecord.updatedFieldName);
  //
  //      $(target).closest('tr').find('td').eq(updateIndex)
  //        .text(updateRecord.updatedFieldOldValue);
  //    }
  //  }
  //  else {
  //    alert('Invalid server response! Response recieved: ' + data.response);
  //  }
  //
  //  checkNewEmptyRecord(table);
  // }

  function getCurrentRow (target) {
    var curRow = $(target).closest('tr')
    if ($(curRow).hasClass('footable-row-detail')) curRow = $(curRow).prev()
    return curRow
  }

  function updateRow (row, rowData) {
    var table = $(row).closest('table')
    var rowTd = $(row).find('td')
    $.each(rowData, function (name, value) {
      var colIndex = $.data(w.footable, $(table).attr('id') + '_colNames').indexOf(name)
      if (colIndex != -1) $(rowTd).eq(colIndex).text(value)
    })
  }

  function deleteRow (row) {
    if ($(row).next().hasClass('footable-row-detail')) {
      $(row).next().remove()
    }
    if ($(row).prev().hasClass('footable-detail-show')) {
      $(row).prev().remove()
    }
    $(row).remove()
  }

  function deleteAllRows (table) {
    $(table).find('tbody > tr').not('.fooNewRecord').remove()
  }

  function checkNewEmptyRecord (table) {
    // Don't add multiple empty records to a table.
    if ($(table).find('.fooNewRecord').length > 0) return
    if ($.data(w.footable, $(table).attr('id') + '_fooNewRecord').length <= 0) return
    // make a copy of the default new record and hide fields that should be hidden.
    var newRec = $.data(w.footable, $(table).attr('id') + '_fooNewRecord').clone(true, true)
    var headRowTd = $(table).find('th')
    $(newRec).find('td').each(function (index) {
      if (!$(headRowTd[index]).is(':visible')) {
        $(this).hide()
      }
    })
    $(table).find('tbody').append(newRec)
  }

  function addRows (table, tableRows, options) {
    // exit if there are no rows to process.
    if (tableRows === undefined) { return }

    // Assume tableRows is a JSON string and try to parse, if it is not already and object

    var tableTh = $(table).find('th')
    var rows = ''
    var fooButtonIndexes = getButtonIndexes(table)

    var ft = $(table).data('ft')

    $(tableRows).each(function () {
      var tr = `<tr id="${this.id}">`
      var i = 0

      // Build valid tr's for row in tableRows
      $.each(this, function (name, value) {
        if (name === 'id') { return }

        // use any custom return parsers to parse the value for each new row's cell
        var retParser = tableTh.eq(i).attr('data-return-type')

        if (retParser != undefined) {
          var parser = ft.options.parsers[retParser]
          value = parser(value)
        }

        var fieldIsControl = $.data(
          w.footable,
          $(table).attr('id') + '_colControlType')[i]

        if (fieldIsControl != undefined) {
          switch (fieldIsControl) {
            case 'checkbox':

              if (value == 'true' || value == true) { value = '<input type="checkbox" checked="checked" />' } else value = '<input type="checkbox" />'

              break

            case 'select':

              const selectOpts = options.select[name].map((item) => {
                const isSelected = (value === item.value ? 'selected' : '')
                return `
                  <option value="${item.value}" ${isSelected}>
                    ${item.label}
                  </option>
                  `
              })

              value = `
                <div class="select-container">
                  <select>
                    ${selectOpts.join('')}
                  </select>
                </div>
                `
              break
          }
        } else {
          // wraps in label for styling
          value = `<label>${value}</label>`
        }

        // capture and add fooTable data-class values.
        var classes = ''
        var dataClass = $(tableTh).eq(i).attr('data-class')
        if (dataClass !== undefined) classes = ' class="' + dataClass + '" '
        // handle hidden fields
        var style = ''
        if (!$(tableTh).eq(i).is(':visible')) style = ' style="display:none;" '

        tr += '<td' + classes + style + '>' + value + '</td>'
        i++
      })

      // add 1 empty td for each button column
      $(fooButtonIndexes.buttonColCt).each(function () {
        tr += '<td></td>'
      })
      tr += '</tr>'
      rows += tr
    })

    $(table).find('tbody').prepend(rows)

    // addFooRowButtons(table);
    makeColsFooEditable(table)

    var ft = $(table).data('ft')

    if (ft) {
      ft.bindToggleSelectors()
      $(table).data('ft').resize() // makes new rows display correct when fields are hidden.
    }
  }

  $.fn.ftEditable = function (target) {
    return {
      // processServerResponse: processServerResponse,
      // transportData: transportData,
      // processCommand: processCommand,

      checkNewEmptyRecord: checkNewEmptyRecord,
      setUpdateHandler: setUpdateHandler,
      deleteAllRows: deleteAllRows,
      updateRow: updateRow,
      deleteRow: deleteRow,
      addRows: addRows
    }
  }

  function Editable () {
    // Expose plugin features to w.footable

    var p = this
    p.name = 'Footable Editable'
    p.init = function (ft) {
      // save a reference to ft.
      $(ft.table).data('ft', ft)

      // capture any default over-rides by user
      var tId = $(ft.table).attr('id')

      $.data(w.footable, tId + '_dataHandlerURL', ft.options.dataHandlerURL)
      $.data(w.footable, tId + '_serverTableName', ft.options.serverTableName)
      $.data(w.footable, tId + '_autoLoad', ft.options.autoLoad)

      $(ft.table).bind({
        footable_initialized: function (e) {
          // Get array of all the column names, indexes with class='id' and footableButtons
          var idColIndexes = new Array()
          var colNames = new Array()
          var fooEditableCols = new Array()
          // var expandCols = new Array;
          var colControlType = new Array()

          $(ft.table).find('th').each(function (index) {
            var fieldName = $(this).text().trim()
            colNames.push(fieldName)

            if ($(this).hasClass('fooEditable')) {
              fooEditableCols.push(fieldName)
            }

            if ($(this).hasClass('fooId')) {
              idColIndexes.push(index)
            }

            colControlType.push($(this).attr('data-ft-control'))
          })
          // set global table specific variables
          $.data(w.footable, tId + '_colNames', colNames)
          $.data(w.footable, tId + '_idColIndexes', idColIndexes)
          $.data(w.footable, tId + '_fooEditableCols', fooEditableCols)
          $.data(w.footable, tId + '_fooNewRecord', $(ft.table).find('.fooNewRecord').clone(true, true))
          $.data(w.footable, tId + '_colControlType', colControlType)

          // Populate the value property of checkboxes in the footable to true or false
          $(ft.table).on('change', 'input[type="checkbox"]', function (e) {
            var val = $(this).is(':checked')
            $(this).val(val)
            if (val) this.setAttribute('checked', 'checked')
            else this.removeAttribute('checked')
            $(this).parent().trigger('td-cell-changed')
          })

          // track each footable cell's old value to determine when a cell value changes.
          $(ft.table).on('focus', 'td', function () {
            $.data(this, 'oldValue', $(this).text())
          })

          // fire custom event each time a footable cell value changes
          $(ft.table).on('blur', 'td', function (e) {
            if ($(this).text() != $.data(this, 'oldValue')) {
              $(this).trigger('td-cell-changed')
            }
          })

          // if a footable cell value changes, create an update object to send to the server.
          $(ft.table).bind('td-cell-changed', function (e) {
            var buttons = getButtonIndexes(this)
            // Do not process update on data-ft-buttons columns
            if (buttons.buttonCols.indexOf($(e.target).index()) < 0) {
              processCommand(e.target, 'Update')
            }
          })

          // must use on() function since input tags are dynamically created.
          $(ft.table).on('focus', 'input', function (e) {
            $.data(this, 'oldValue', $(this).val())
          })

          // must use on() function since input tags are dynamically created.
          $(ft.table).on('change', 'input', function (e) {
            if ($(e.target).closest('tr').hasClass('footable-row-detail')) {
              // Always pass changes made to an input detail textbox to it's corr parent td
              var FieldName = $(e.target).closest('div').text().trim().slice(0, -1)
              var tdFieldIndex = $.data(w.footable, $(ft.table).attr('id') + '_colNames').indexOf(FieldName)

              $(e.target).closest('tr').prev().find('td').eq(tdFieldIndex)
                .text($.data(e.target, 'oldValue'))
                .text($(e.target).val())

              processCommand(e.target, 'Update')
            }
          })

          // $(ft.table).on('click', 'input[type="button"][value="Add"].footableButton', function (e) {
          //  processCommand(e.target, 'Add');
          // });
          //
          // $(ft.table).on('click', 'input[type="button"][value="Delete"].footableButton', function (e) {
          //  processCommand(e.target, 'Delete');
          // });
        } // footable_initialized
      }) // ft.table bind

      makeColsFooEditable(ft.table)
      // addFooRowButtons(ft.table);

      // AutoLoad sends a load command each time a Footable is created.
      if ($.data(w.footable, $(ft.table).attr('id') + '_autoLoad')) {
        processCommand(ft.table, 'Load')
      }

      // Create event that fires after footable-row-detail-inner div has been populated.
      $(ft.table).on('click', 'tr', function (e) {
        if (!$(this).hasClass('footable-row-detail')) {
          $(this).trigger('fooDetail-Populated')
        }
      })

      // Add any footableButton's to a row's footable-row-detail-inner div
      // $(ft.table).bind('fooDetail-Populated', function (e) {
      //  addButtonsToDetailRow($(e.target).next(), getButtonIndexes(this));
      // });
    } // p.init
  } // Editable()

  w.footable.plugins.register(new Editable(), defaults)
})(jQuery, window)
