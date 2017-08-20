(function(){

  var namespace = AutodeskNamespace('Autodesk.Markups.Ui');
  var coreNamespace = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core');
  var utilsNamespace = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core.Utils');

  var Utils = namespace.Utils,
    toList = Utils.toList,
    toTitleCase = Utils.toTitleCase,
    getMarkupType = Utils.getMarkupType;

  var StyleControlFactory = namespace.StyleControlFactory;

  var convertToStyleValue = function (value) {
    var output = value;
    //only strings need conversion
    if (typeof value === 'string') {
      var potentialNumber = new Number(value);
      var isNumber = !isNaN(potentialNumber);
      if (isNumber) {
        //its a number, return the primitive value
        //not the object wrapper
        output = potentialNumber.valueOf();
      } else {
        //not a number, could it be a boolean?
        if (value === 'true' || value === 'false') {
          output = (value === 'true');
        }
      }
    }
    return output;
  };

  function MarkupsPanel(viewer, markupsCore) {

    this.viewer = viewer;
    this.markupsCore = markupsCore;
    Autodesk.Viewing.UI.DockingPanel.call(this, viewer.container, 'markup-panel', 'Markup Editor', null);

    //these styles are overriden by the dockRight option but
    //they are required so the panel displays correctly
    this.container.style.top = '10px';
    this.container.style.left = '10px';
    this.container.style.width = '275px';
    this.container.style.height = '400px';
    //this.container.dockRight = true;

    this.render();
    this.handlePanelEvents();
    this.handleUIEvents();
    this.handleCoreEvents();
  }

  MarkupsPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
  Autodesk.Viewing.Extensions.ViewerPanelMixin.call(MarkupsPanel.prototype);

  var proto = MarkupsPanel.prototype;

  proto.getNames = function () {
    return ['markups-panel'];
  };

  proto.getName = function () {
    return this.getNames()[0];
  };

  proto.render = function () {
    var componentHTML = '' +
      '<div class="markups-panel-content">' +
      '<div class="edit-tools">' +
      '<div class="markup-tools" data-button-group>' +
      '<div class="viewer-actions">' +
      '<button data-viewer-tool="dolly" class="adsk-button-icon adsk-icon-zoom"></button>' +
      '<button data-viewer-tool="pan" class="adsk-button-icon adsk-icon-pan"></button>' +
      '</div>' +
      '<div class="vertical-seperator">&nbsp;</div>' +
      '<div class="markup-actions">' +
      '<button data-annotation-action="undo">Undo</button>' +
      '<button data-annotation-action="redo">Redo</button>' +
      '<button data-annotation-action="delete">Delete</button>' +
      '</div>' +
      `<div class="markup-buttons">
      <button id="markup-arrow-button" data-annotation-type="arrow">
        <div id="markup-arrow"/>
      </button>
      <button id="markup-label-button" data-annotation-type="text">
        <div id="markup-label"/>
      </button>
      <button id="markup-rectangle-button" data-annotation-type="rectangle">
        <div id="markup-rectangle"/>
      </button>
      <button id="markup-circle-button" data-annotation-type="circle">
        <div id="markup-circle"/>
      </button>
      <button id="markup-cloud-button" data-annotation-type="cloud">
        <div id="markup-cloud"/>
      </button>
      <button id="markup-freehand-button" data-annotation-type="freehand">
        <div id="markup-freehand"/>
      </button>
      ` +
      '</div>' +
      '</div>' +
      '</div>' +
      '<hr />' +
      '<div class="markup-properties">' +
      '<div>' +
      '<strong>Stroke</strong>' +
      '<label><select data-markup-style="stroke-width"></select></label>' +
      '<br />' +
      '<label><div data-markup-style="stroke-color"></div></label>' +
      '<label><select data-markup-style="stroke-opacity"></select></label>' +
      '<hr />' +
      '</div>' +
      '<div>' +
      '<strong>Fill</strong>' +
      '<br />' +
      '<label><div data-markup-style="fill-color"></div></label>' +
      '<label><select data-markup-style="fill-opacity"></select></label>' +
      '<hr />' +
      '</div>' +
      '<div>' +
      '<strong>Font</strong>' +
      '<label><select data-markup-style="font-size"></select></label>' +
      '<button data-font="bold" data-markup-style="font-weight">B</button>' +
      '<button data-font="italic" data-markup-style="font-style">I</button>' +
      '<label>Background Color: <select data-markup-style="background-color"></select></label>' +
      '<br />' +
      '<label><select data-markup-style="font-family"></select></label>' +
      '</div>' +
      '</div>' +
      '<div class="panel-actions">' +
      '<button data-panel-action="clear">Clear</button>' +
      '<button data-panel-action="finish">Close</button>' +
      '</div>' +
      '</div>';
    this.createScrollContainer({});
    this.scrollContainer.innerHTML = componentHTML;
    this.btnUndo = this.scrollContainer.querySelector('[data-annotation-action="undo"]');
    this.btnRedo = this.scrollContainer.querySelector('[data-annotation-action="redo"]');
    this.ddAnnotationFont = this.scrollContainer.querySelector('[data-markup-style="font-family"]');

    //get all the style inputs and create a style controller for each one
    this.styleControls = {};
    var styleElements = this.scrollContainer.querySelectorAll('[data-markup-style]');
    toList(styleElements).map(function(element){
      var style = element.getAttribute('data-markup-style');
      this.styleControls[style] = StyleControlFactory.create(element);
    }.bind(this));
  };

  var clearButtonGroup = function (groupingElements) {
    var containers = [];
    if (groupingElements instanceof HTMLElement)
      containers = [groupingElements]
    else
      containers = toList(groupingElements);

    containers.map(function(c){
      var buttons = c.querySelectorAll('button.active');
      toList(buttons).map(function(btn){
        btn.classList.remove('active');
      });
    });
  };

  proto.getAnnotationButton = function (type) {
    var selector = '[data-annotation-type="' + type + '"]';
    return this.container.querySelector(selector);
  };

  proto.selectDefaultAnnotation = function () {
    var def = this.getAnnotationButton('arrow');
    this.switchEditMode('arrow');
    this.selectAnnotationButton(def);
  };

  proto.engageEditMode = function(enabled) {
    var markupsCore = this.markupsCore;
    if (enabled) {
      markupsCore.enterEditMode();
      this.selectDefaultAnnotation();
    } else {
      markupsCore.leaveEditMode();
    }
  };

  proto.handlePanelEvents = function () {
    this.addVisibilityListener(this.engageEditMode.bind(this));
  };

  proto.selectAnnotationButton = function (element, options) {
    var annotationType = element.getAttribute('data-annotation-type');
    //clear the button group this button belongs to
    clearButtonGroup(this.container.querySelectorAll('.viewer-actions, .markup-buttons'));
    element.classList.add('active');

    activateApplicableControls.bind(this)(options);
    this.resizeToContent();
  };

  var displayStyleInput = function (element) {
    if (Utils.matchesSelector(element.parentElement, 'label')) {
      element.parentElement.style.display = 'inline-block';
    } else {
      element.style.display = 'inline-block';
    }
  };

  var hideStyleInput = function (element) {
    if (Utils.matchesSelector(element.parentElement, 'label')) {
      //when the control is inside a label, hide
      //the label instead
      element.parentElement.style.display = 'none';
    } else {
      element.style.display = 'none';
    }
  };

  proto.getStyleInputs = function () {
    //get all the style controls
    var controls = this.container.querySelectorAll('[data-markup-style]');
    return toList(controls);
  };

  proto.hideStyleInputs = function () {
    this.getStyleInputs().map(hideStyleInput);
  };


  var activateApplicableControls = function () {

    var markupsCore = this.viewer.getExtension('Autodesk.Viewing.MarkupsCore')

    var currentStyles = this.markupsCore.getStyle();
    var defaultValues = utilsNamespace.getStyleDefaultValues(currentStyles, markupsCore);
    this.hideStyleInputs();

    //display only the controls that apply to this given edit mode
    for(var activeStyle in defaultValues){
      var styleSettings = defaultValues[activeStyle];
      var styleElement = this.container.querySelector('[data-markup-style="' + activeStyle + '"]');
      var styleControl;

      //when a style control for the given style isn't found
      //ignore it and just move on
      if (!styleElement) {
        continue;
      }

      //get the style control associated with this style
      //and update its option
      styleControl = this.styleControls[activeStyle];


      styleSettings.values = styleSettings.values.map(function(v){
        return {
          title: v.name,
          value: v.value,
          //the drop down list needs to these additional attributes
          attrs: {
            value: v.value,
            style: 'font-family: "' + v.value + '"'
          }
        };
      });

      styleControl.setOptions(styleSettings.values);
      displayStyleInput(styleElement);

      styleControl.value = currentStyles[activeStyle] || styleSettings.values[styleSettings['default']].value;
    }

    //the markup styles are grouped together by the style which they modify(fill, stroke, font)
    //iterate through each group
    toList(this.container.querySelectorAll('.markup-properties > div')).map(function(div){
      //hide the section container
      div.style.display = 'none';
      //iterate through all immediate button and labels, which either
      //are the control are contain the contro
      toList(div.querySelectorAll('label, button')).map(function(control){
        //if any control is visible
        if (control.style.display !== 'none') {
          //display the section
          div.style.display = 'block';
        }
      });
    });
  };

  proto.setViewerTool = function(toolName){
    this.viewer.setActiveNavigationTool(toolName);
    this.markupsCore.allowNavigation(!!toolName);
  };

  proto.switchEditMode = function (type) {
    var className = 'EditMode' + toTitleCase(type);
    var editMode = new Autodesk.Viewing.Extensions.Markups.Core[className](this.markupsCore);
    this.markupsCore.changeEditMode(editMode);
  };

  proto.handleUIEvents = function () {
    var self = this;

    var selectAnnotation = function (event) {
      //figure out what annotation type was selected
      var target = event.target;
      var annotationType = target.getAttribute('data-annotation-type');

      //disable any tool that may be selected
      self.setViewerTool(null);
      //switch to the new mode
      self.switchEditMode(annotationType);
      //reflect the change in edit mode on the panel
      self.selectAnnotationButton(target);
    };

    var selectFontStyle = function (event) {
      var target = event.target;
      var parent = target.parentElement;

      target.classList.toggle('active');
      target.value = target.classList.contains('active');
      //trigger a change event
      target.dispatchEvent(new Event('change', { bubbles: true }));
    };

    //helper function to facilate the use of event delegation
    var on = function (eventName, selector, callback) {
      self.container.addEventListener(eventName, function(event){
        var target = event.target;
        if (Utils.matchesSelector(target, selector)) callback(event);
      });
    };

    on('click', '[data-annotation-type]', selectAnnotation);
    on('click', 'button[data-markup-style]', selectFontStyle);
    on('click', '[data-panel-action="finish"]', function(){
      //hide the panel
      self.setVisible(false);
    });

    on('click', '[data-viewer-tool]', function(event){
      var target = event.target;
      //clear the button group this button belongs to
      clearButtonGroup(self.container.querySelectorAll('.viewer-actions, .markup-buttons'));

      //toggle the active state of the toolButton clicked
      target.classList.toggle('active');

      //figure out what tool was clicked
      var actionType = target.getAttribute('data-viewer-tool');
      self.setViewerTool(actionType);
    });

    on('click', '[data-annotation-action="delete"]', function(event){
      var selectedAnnotation = self.markupsCore.getSelection();
      if (selectedAnnotation)
        self.markupsCore.deleteMarkup(selectedAnnotation);
    });

    on('click', '[data-panel-action="clear"]', function(event){
      self.markupsCore.clear();
    });

    this.btnUndo.addEventListener('click', function(event){
      if (this.markupsCore.isUndoStackEmpty()) return;
      this.markupsCore.undo();
    }.bind(this));

    this.btnRedo.addEventListener('click', function(event){
      if (this.markupsCore.isRedoStackEmpty()) return;
      this.markupsCore.redo();
    }.bind(this));

    var applySelectedFontFamily = function(event){
      var target = event.target;
      var selection = target.options[target.selectedIndex].value;
      target.style.fontFamily = selection;
    };
    this.ddAnnotationFont.addEventListener('change', applySelectedFontFamily);

    var applyStyleChangeToMarkup = function(event){

      var target = event.target;
      var style = target.getAttribute('data-markup-style');
      var value = (event.detail && event.detail.source.value) || target.value;
      var updatedStyle = {};
      updatedStyle[style] = convertToStyleValue(value);
      this.markupsCore.setStyle(updatedStyle);
    }.bind(this);

    //listen for change events on the elements/controls
    //that control the markup style
    on('change', '[data-markup-style]', applyStyleChangeToMarkup);

  };

  proto.getContentSize = function getContentSize() {
    return {
      height: this.container.querySelector('.markups-panel-content').offsetHeight + 55,
      width: this.container.querySelector('.markups-panel-content').offsetWidth
    };
  };

  proto.handleCoreEvents = function () {
    this.markupsCore.addEventListener(coreNamespace.EVENT_HISTORY_CHANGED, function(){
      var emptyUndo = this.markupsCore.isUndoStackEmpty();
      var emptyRedo = this.markupsCore.isRedoStackEmpty();
      this.btnUndo.classList[emptyUndo ? 'remove' : 'add']('active');
      this.btnRedo.classList[emptyRedo ? 'remove' : 'add']('active');
    }.bind(this));


    this.markupsCore.addEventListener(coreNamespace.EVENT_MARKUP_SELECTED, function(event){
      var target = event.target;
      var markupType = getMarkupType(target);
      var markupButton = this.getAnnotationButton(markupType);
      this.selectAnnotationButton(markupButton);
      this.container.querySelector('[data-annotation-action="delete"]').classList.add('active');
    }.bind(this));

    this.markupsCore.addEventListener(coreNamespace.EVENT_MARKUP_DESELECT, function(event){
      this.container.querySelector('[data-annotation-action="delete"]').classList.remove('active');
    }.bind(this));
  };

  namespace.MarkupsPanel = MarkupsPanel;
})();


