///////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
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

export default class CustomPropertyPanel extends
  Autodesk.Viewing.Extensions.ViewerPropertyPanel {

  constructor (viewer) {

    super(viewer)
  }

  refresh () {

    this.setVisible(false, true)
    this.setVisible(true, true)
  }
}

function old(viewer, options) {

    var _self = this;

    var _priceId = null;
    var _supplierId = null;
    var _currencyId = null;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.CustomPropertyPanelExtension loaded');

        var panel = new Autodesk.ADN.Viewing.Extension.CustomPropertyPanel(viewer);

        viewer.setPropertyPanel(panel);

        viewer.refreshPropertyPanel = function () {

            panel.setVisible(false, true);
            panel.setVisible(true, true);
        }

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // CustomPropertyPanel
    //
    ///////////////////////////////////////////////////////////////////////////
    Autodesk.ADN.Viewing.Extension.CustomPropertyPanel = function (viewer) {

        Autodesk.Viewing.Extensions.ViewerPropertyPanel.call(
          this, viewer);

        var _panel = this;

        /////////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////////
        _panel.setNodeProperties = function(nodeId) {

            Autodesk.Viewing.Extensions.ViewerPropertyPanel.
              prototype.setNodeProperties.call(
              _panel,
              nodeId);

            _panel.nodeId = nodeId;
        };

        /////////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////////
        _panel.addCustomProperty = function (customProperty, options) {

            var element = this.tree.getElementForNode({
                name: customProperty.name,
                value: customProperty.value,
                category: customProperty.category
            });

            if (element) {
                return false;
            }

            var parent = null;

            if (customProperty.category) {

                parent = this.tree.getElementForNode({
                    name: customProperty.category
                });

                if (!parent) {
                    parent = this.tree.createElement_(
                      {
                          name: customProperty.category,
                          type: 'category'
                      },
                      this.tree.myRootContainer,
                      options && options.localizeCategory ? {localize: true} : null);
                }

            } else {

                parent = this.tree.myRootContainer;
            }

            var element = this.tree.createElement_(
              customProperty,
              parent,
              options && options.localizeProperty ? {localize: true} : null);

            return element;
        };

        /////////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////////
        _panel.setProperties = function (properties) {

            properties = _.filter(properties, function(prop){

                return prop.displayName !== 'Material';
            });

            Autodesk.Viewing.Extensions.ViewerPropertyPanel.
              prototype.setProperties.call(
              _panel,
              properties);

            getCustomProperties(_panel.nodeId,

              function(customProperties) {

                //suppress "no properties" in panel
                if(customProperties.length) {

                    $('div.noProperties').remove();
                }

                customProperties.forEach(function(customProperty) {

                    _panel.addCustomProperty(customProperty);
                });

                _panel.resizeToContent();
            });
        };

        /////////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////////
        _panel.displayProperty = function (property, parent, displayOptions) {

            var name = document.createElement('div');

            var text = property.name;

            if (displayOptions && displayOptions.localize) {
                name.setAttribute('data-i18n', text);
                text = Autodesk.Viewing.i18n.translate(text);
            }

            name.textContent = text;
            name.title = text;
            name.className = 'propertyName';

            var separator = document.createElement('div');
            separator.className = 'separator';

            parent.appendChild(name);
            parent.appendChild(separator);

            var value = null;

            switch (property.dataType) {

                case 'text':
                    value = createTextProperty(property, parent);
                    break;

                case 'select':
                    value = createSelectProperty(property, parent);
                    break;

                default:

                    //native property
                    value = createTextProperty(property, parent);

                    return [name, value];
            }

            // Make the property name and value highlightable.
            return [name, value];
        }

        /////////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////////
        function createTextProperty(property, parent) {

            var value = document.createElement('div');
            value.textContent = property.value;
            value.title = property.value;
            value.className = 'propertyValue';

            parent.appendChild(value);

            value.id = property.elementId;

            return value;
        }

        /////////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////////
        function createSelectProperty(property, parent) {

            var labelId = guid();

            var menuId = guid();

            var listId = guid();

            var btnId = guid();

            var html = [
                '<div class="propertyValue">',
                '<div id ="' + menuId + '" class="dropdown chart-dropdown" style="top:29px;">',
                '<button id ="' + btnId + '" class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" style="padding: 2.5px 10px;">',
                '<label id="' + labelId +'" class="material-select" style="font: normal 14px Times New Roman"></label>',
                '<span class="caret"></span>',
                '</button>',
                '<ul id="' + listId + '"class="dropdown-menu scrollable-menu customprop-dropdown" >',
                '</ul>',
                '</div>',
                '</div>'
            ].join('\n');

            $(parent).append(html);


            $('#' + btnId).click(function(){

                $('.customprop-dropdown').dropdown('toggle');

                $('.treeview').css({
                    'overflow':'visible'
                })
            });

            $('#' + labelId).text(property.value);

            options.menuItems.forEach(function(menuItem){

                var itemId = guid();

                var itemHtml = '<li id="' + itemId + '"><a href="">' + menuItem.label + '</a></li>';

                $('#' + listId).append(itemHtml);

                $('#' + itemId).click(function(event) {

                    event.preventDefault();

                    //returns (dbId, oldMaterial, newMaterial)
                    menuItem.handler(
                      _panel.nodeId,
                      $('#' + labelId).text(),
                      menuItem.label);

                    $('#' + labelId).text(menuItem.label);

                    $.get(options.apiUrl +
                      '/materials/byName/' + menuItem.label,
                      function (material) {

                          $('#' + _priceId).text(material.price);
                          $('#' + _supplierId).text(material.supplier);
                          $('#' + _currencyId).text(material.currency);
                      });
                });
            });

            return menuId;
        }


        /////////////////////////////////////////////////////////////////
        //
        //
        /////////////////////////////////////////////////////////////////
        function getCustomProperties(dbId, callback) {

            var properties = [];

            viewer.getComponentMaterial(dbId,

              function(materialName) {

                  $.get(options.apiUrl +
                    '/materials/byName/' + materialName ,
                    function(material) {

                        properties.push({
                            name: 'Material',
                            value: material.name,
                            dataType: 'select',
                            category: 'Database'
                        });

                        _supplierId = guid();

                        properties.push({
                            name: 'Supplier',
                            value: material.supplier,
                            dataType: 'text',
                            category: 'Database',
                            elementId: _supplierId
                        });

                        _priceId = guid();

                        properties.push({
                            name: 'Price',
                            value: material.price,
                            dataType: 'text',
                            category: 'Database',
                            elementId: _priceId
                        });

                        _currencyId = guid();

                        properties.push({
                            name: 'Currency',
                            value: material.currency,
                            dataType: 'text',
                            category: 'Database',
                            elementId: _currencyId
                        });

                        callback(properties);
                    });
              });
        }
    };

};
