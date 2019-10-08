(function () {
  var coreNamespace = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core')
  var namespace = AutodeskNamespace('Autodesk.Markups.Ui')

  var Utils = {
    updateDropDownOptions: function (element, items) {
      if (!(element instanceof HTMLSelectElement)) return

      // clear out the previous options
      element.innerHTML = ''

      var docFrag = document.createDocumentFragment()
      items.map(function (item) {
        var option = document.createElement('option')
        option.textContent = item.title
        for (var attr in item.attrs) {
          var value = item.attrs[attr]
          option.setAttribute(attr, value)
        }
        docFrag.appendChild(option)
      })
      element.appendChild(docFrag)
    },
    toList: function (listLikeStructure) {
      return [].slice.apply(listLikeStructure)
    },
    toTitleCase: function (str) {
      return str.charAt(0).toUpperCase() + str.substring(1)
    },
    getMarkupType: function (annotation) {
      switch (annotation.type) {
        case coreNamespace.MARKUP_TYPE_ARROW:
          return 'arrow'
        case coreNamespace.MARKUP_TYPE_TEXT:
          return 'text'
        case coreNamespace.MARKUP_TYPE_RECTANGLE:
          return 'rectangle'
        case coreNamespace.MARKUP_TYPE_CIRCLE:
          return 'circle'
        case coreNamespace.MARKUP_TYPE_CLOUD:
          return 'cloud'
        case coreNamespace.MARKUP_TYPE_FREEHAND:
          return 'freehand'
      }
    },
    matchesSelector: function (domElem, selector) {
      if (domElem.matches) return domElem.matches(selector) // Un-prefixed
      if (domElem.msMatchesSelector) return domElem.msMatchesSelector(selector) // IE
      if (domElem.mozMatchesSelector) return domElem.mozMatchesSelector(selector) // Firefox (Gecko)
      if (domElem.webkitMatchesSelector) return domElem.webkitMatchesSelector(selector) // Opera, Safari, Chrome
      return false
    }
  }

  namespace.Utils = Utils
})()
