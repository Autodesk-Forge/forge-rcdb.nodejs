///////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
///////////////////////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter'

///////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////
export default class ViewerPropertiesPanel extends
    EventsEmitter.Composer (Autodesk.Viewing.Extensions.ViewerPropertyPanel) {

  constructor (viewer, opts = {}) {

    super (viewer)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setNodeProperties (nodeId) {

    super.setNodeProperties(nodeId)

    this.nodeId = nodeId
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  refresh () {

    this.setVisible(false, true)
    this.setVisible(true, true)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  __setProperties (properties, options) {

    this.removeAllProperties()

    const withoutCategories = []
    const withCategories = []

    for (var i = 0; i < properties.length; i++) {
        var property = properties[i]
        if (!property.hidden) {
            var category = properties[i].displayCategory;
            if (category && typeof category === 'string' && category !== '') {
                withCategories.push(property)
            } else {
                withoutCategories.push(property)
            }
        }
    }

    if ((withCategories.length + withoutCategories.length) === 0) {
        this.showNoProperties()
        return
    }

    for (var i = 0; i < withCategories.length; i++) {

      const property = withCategories[i]
      
      const precision = property.precision || Autodesk.Viewing.Private.calculatePrecision(
          property.displayValue)
  
      const displayValue = Autodesk.Viewing.Private.formatValueWithUnits(
          property.displayValue, 
          property.units, 
          property.type, 
          precision)
  
      this.__addProperty(Object.assign({}, property, {
        displayValue
      }))
    }

    const hasCategories = (withCategories.length > 0);

    for (var i = 0; i < withoutCategories.length; i++) {

      const property = withoutCategories[i]

      const precision = property.precision || Autodesk.Viewing.Private.calculatePrecision(
        property.displayValue)
      
      const displayValue = Autodesk.Viewing.Private.formatValueWithUnits(
        property.displayValue,
        property.units,
        property.type,
        precision)

      const displayCategory = hasCategories 
        ? 'Other' 
        : ''

      const opts = hasCategories 
        ? {localizeCategory: true} 
        : {}  

      this.__addProperty(Object.assign({}, property, {
        displayCategory,
        displayValue
      }), opts)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setProperties (properties) {

    this.emit('setProperties', {
      nodeId: this.nodeId,
      properties

    }).then((properties) => {

      this.__setProperties (properties)

      this.resizeToContent()
    })
  }

  /////////////////////////////////////////////////////////
  // addProperty (name, value, category, options)
  //
  /////////////////////////////////////////////////////////
  __addProperty (metaProperty, options) {

    const element = this.tree.getElementForNode({
      category: metaProperty.displayCategory,
      value: metaProperty.displayValue,
      name: metaProperty.displayName
    })

    if (element) {
      return false
    }

    let parent = null

    if (metaProperty.displayCategory) {

        parent = this.tree.getElementForNode({
          name: metaProperty.displayCategory
        })

        if (!parent) {
            parent = this.tree.createElement_({
              name: metaProperty.displayCategory, 
              type: 'category'
            }, this.tree.myRootContainer, 
            options && options.localizeCategory 
              ? {localize: true} 
              : null)
        }

    } else {

        parent = this.tree.myRootContainer
    }

    this.tree.createElement_(
      metaProperty, 
      parent, 
      options && options.localizeProperty 
        ? {localize: true} 
        : null)

    return true
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  updateProperty (metaProperty) {

    switch (metaProperty.dataType) {

      case 'link':

        break

      case 'img':

        break

      case 'file':

        break

      case 'select':

        break

      case 'text':
      default:

        $('#' + metaProperty.id).text(
          metaProperty.displayValue)

        break
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createPropertyName (metaProperty, displayOptions) {

    const name = document.createElement('div')

    let text = metaProperty.displayName

    if (displayOptions && displayOptions.localize) {
      name.setAttribute('data-i18n', text)
      text = Autodesk.Viewing.i18n.translate(text)
    }

    name.className = 'property-name'
    name.textContent = text
    name.title = text

    return name
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createPropertySeparator () {

    const separator = document.createElement('div')
    separator.className = 'separator'

    return separator
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  displayProperty (metaProperty, parent, displayOptions) {

    const propertyName = this.createPropertyName(
      metaProperty, displayOptions)

    const separator = this.createPropertySeparator()

    var propertyValue = null

    switch (metaProperty.dataType) {

      case 'link':

        propertyValue = this.createLinkProperty(
          metaProperty,
          displayOptions)

        break

      case 'img':

        propertyValue = this.createImageProperty(
          metaProperty,
          displayOptions)

        break

      case 'file':

        propertyValue = createFileProperty(
          metaProperty,
          displayOptions)

        break

      case 'select':

        propertyValue = this.createSelectProperty(
          metaProperty,
          displayOptions)

        break

      case 'text':
      default:

        propertyValue = this.createTextProperty(
          metaProperty,
          displayOptions)

        break
    }

    parent.appendChild(propertyName)
    parent.appendChild(separator)
    parent.appendChild(propertyValue)

    // Make the property name and value highlightable
    return [propertyName, propertyValue]
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createTextProperty (metaProperty, displayOptions) {

    const value = document.createElement('div')

    value.textContent = metaProperty.displayValue
    value.id = metaProperty.id || this.guid()
    value.title = metaProperty.displayValue
    value.className = 'property-value'

    return value
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createLinkProperty (metaProperty, displayOptions) {

    const value = document.createElement('div')
    value.id = metaProperty.id || this.guid()
    value.title = metaProperty.displayValue
    value.className = 'property-value'

    $(value).append(`
      <a  href="${property.href}" target="_blank">
        ${metaProperty.displayValue}
      </a>
    `)

    return value
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createImageProperty (metaProperty, displayOptions) {

    const value = document.createElement('div')
    value.id = metaProperty.id || this.guid()
    value.title = metaProperty.displayValue
    value.className = 'property-value'

    const imgId = this.guid()

    $(value).append(`
      <a  href="${property.href}">
        <img id="${imgId}" src="${property.href}"
          height="${metaProperty.height}"
          width="${metaProperty.with}"/>
      </a>
    `)

    return value
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  createFileProperty (metaProperty, displayOptions) {

    const value = document.createElement('div')
    value.id = metaProperty.id || this.guid()
    value.title = metaProperty.displayValue
    value.className = 'property-value'

    const imgId = this.guid()

    $(value).append(`
      <a href="${property.href}">
        ${metaProperty.displayValue}
      </a>
    `)

    return value
  }

  /////////////////////////////////////////////////////////
  // onPropertyClick handle
  //
  /////////////////////////////////////////////////////////
  onPropertyClick (metaProperty, event) {

    switch (metaProperty.dataType) {

      // opens link in new tab
      case 'link':

        window.open(metaProperty.href, '_blank')

        break

      // download image or file
      case 'file':
      case 'img':

        this.downloadURI(
          metaProperty.href,
          metaProperty.filename)

        break

      case 'text':
      default :

        //nothing to do for text
        break
    }
  }

  /////////////////////////////////////////////////////////
  // Download util
  //
  /////////////////////////////////////////////////////////
  downloadURI (uri, name) {

    const link = document.createElement("a")

    link.download = name
    link.href = uri
    link.click()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  guid (format='xxxx-xxxx-xxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }
}