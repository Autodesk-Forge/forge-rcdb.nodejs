/////////////////////////////////////////////////////////////////////
// IoTPropertyPanel
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////

export default class PropertyPanel extends
  Autodesk.Viewing.UI.PropertyPanel {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (container, id, title) {

    super (container, id, title)

    $(this.container).addClass('toolPanelBase')
    $(this.container).addClass('IoT')

    this.container.dockRight = false

    this.properties = []
  }

  /////////////////////////////////////////////////////////////
  // createTitleBar override
  //
  /////////////////////////////////////////////////////////////
  createTitleBar (title) {

    var titleBar = document.createElement("div")

    titleBar.className = "dockingPanelTitle"

    this.titleTextId = guid()

    this.titleImgId = guid()

    var html = `
      <span id="${this.titleImgId}"></span>
      <div id="${this.titleTextId}" class="dockingPanelTitleText">
        ${title}
      </div>
    `

    $(titleBar).append(html)

    this.addEventListener(titleBar, 'click', (event)=> {

      if (!this.movedSinceLastClick) {

        this.onTitleClick(event)
      }

      this.movedSinceLastClick = false
    })

    this.addEventListener(titleBar, 'dblclick', (event) => {

      this.onTitleDoubleClick(event)
    })

    return titleBar
  }

  /////////////////////////////////////////////////////////////
  // setTitle override
  //
  /////////////////////////////////////////////////////////////
  setTitle (text, options) {

    if (options && options.localizeTitle) {

      $(`#${this.titleTextId}`).attr('data-i18n', text)

      text = Autodesk.Viewing.i18n.translate(text)

    } else {

      $(`#${this.titleTextId}`).removeAttr('data-i18n')
    }

    $(`#${this.titleTextId}`).text(text)
  }

  /////////////////////////////////////////////////////////////////
  // setNodeProperties override
  //
  /////////////////////////////////////////////////////////////////
  setNodeProperties (nodeId) {

    super.setNodeProperties(nodeId)

    this.nodeId = nodeId
  }

  /////////////////////////////////////////////////////////////////
  // Adds new meta property to panel
  //
  /////////////////////////////////////////////////////////////////
  addMetaProperty (metaProperty, options) {

    var element = this.tree.getElementForNode({
      name: metaProperty.name,
      value: metaProperty.value,
      category: metaProperty.category
    })

    if (element) {

      return false
    }

    var parent = null

    if (metaProperty.category) {

      parent = this.tree.getElementForNode({
        name: metaProperty.category
      })

      if (!parent) {
        parent = this.tree.createElement_({
            name: metaProperty.category,
            type: 'category'
          },
          this.tree.myRootContainer,
          options && options.localizeCategory ? {localize: true} : null)
      }
    }
    else {

      parent = this.tree.myRootContainer
    }

    this.tree.createElement_(
      metaProperty,
      parent,
      options && options.localizeProperty ? {localize: true} : null)

    return true
  }

  /////////////////////////////////////////////////////////////////
  // setProperties override
  //
  /////////////////////////////////////////////////////////////////
  setProperties (properties) {

    //super.setProperties(properties)

    this.removeAllProperties()

    properties.forEach((prop) => {

      this.addMetaProperty(prop)
    })

    this.properties = properties
  }

  /////////////////////////////////////////////////////////////////
  // setVisible override
  //
  /////////////////////////////////////////////////////////////////
  setVisible (show) {

    if (!this.properties || !this.properties.length) {

      return super.setVisible (false)
    }

    super.setVisible (show)
  }

  /////////////////////////////////////////////////////////////////
  // displayProperty override
  //
  /////////////////////////////////////////////////////////////////
  displayProperty (property, parent, options) {

    var name = document.createElement('div')

    if(property.nameId) {

      name.id = property.nameId
    }

    var text = property.name

    if (options && options.localize) {
      name.setAttribute('data-i18n', text)
      text = Autodesk.Viewing.i18n.translate(text)
    }

    name.textContent = text
    name.title = text
    name.className = 'propertyName'

    var separator = document.createElement('div')
    separator.className = 'separator'

    parent.appendChild(name)
    parent.appendChild(separator)

    var value = null

    //native properties dont have a dataType
    //display them just as text
    if(!property.dataType) {
      value = createTextProperty(property, parent)
      return [name, value]
    }

    switch (property.dataType) {

      case 'text':
        value = createTextProperty(property, parent)
        break

      case 'link':
        value = createLinkProperty(property, parent)
        break

      case 'img':
        value = createImageProperty(property, parent)
        break

      case 'file':
        value = createFileProperty(property, parent)
        break

      default :
        break
    }

    // Make the property highlightable
    return [name, value]
  }

  /////////////////////////////////////////////////////////////////
  // onPropertyClick handle
  //
  /////////////////////////////////////////////////////////////////
  async onPropertyClick (property, event) {

    if(!property.dataType)
      return

    switch(property.dataType){

      case 'text':
        //nothing to do for text
        break

      // opens link in new tab
      case 'link':
        window.open(property.href, '_blank')
        break

      // download image or file
      case 'img':
      case 'file':
        downloadURI(property.href, property.filename)
        break

      default :
        break
    }
  }
}

/////////////////////////////////////////////////////////////////
// Creates a text property
//
/////////////////////////////////////////////////////////////////
function createTextProperty(property, parent){

  var value = document.createElement('div')
  value.textContent = property.value
  value.title = property.value
  value.className = 'propertyValue'

  parent.appendChild(value)

  return value
}

/////////////////////////////////////////////////////////////////
// Creates a link property
//
/////////////////////////////////////////////////////////////////
function createLinkProperty(property, parent){

  var id = guid()

  var html = `
    <div id="${id}" class="propertyValue derivative">
      <a  href="${property.href}" target="_blank">
        ${property.value}
      </a>
    </div>
    `

  $(parent).append(html)

  return $('#' + id)[0]
}

/////////////////////////////////////////////////////////////////
// Creates an image property
//
/////////////////////////////////////////////////////////////////
function createImageProperty(property, parent){

  var id = guid()

  var html = [

    '<div id="' + id + '" class="propertyValue derivative">' +
    '<a href="' + property.href +'">',
    '<img src="' + property.href +'" width="128" height="128"> </img>' +
    '</a>',
    '</div>'

  ].join('\n')

  $(parent).append(html)

  return $('#' + id)[0]
}

/////////////////////////////////////////////////////////////////
// Creates a file property
//
/////////////////////////////////////////////////////////////////
function createFileProperty(property, parent){

  var id = guid()

  var html = [

    '<div id="' + id + '" class="propertyValue derivative">' +
    '<a href="' + property.href +'">',
    property.value,
    '</a>',
    '</div>'

  ].join('\n')

  $(parent).append(html)

  return $('#' + id)[0]
}

/////////////////////////////////////////////////////////////////
// guid util
//
/////////////////////////////////////////////////////////////////
function guid(format = 'xxxxxxxxxx') {

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

/////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////
function downloadURI (uri, name) {

  var link = document.createElement("a")
  link.download = name
  link.href = uri
  link.click()
}
