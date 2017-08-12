
import SelectionWindowTool from './Viewing.Extension.SelectionWindow.Tool'

function ZoomWindow(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
  this.createUIBound = function() {
    viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.createUIBound);
    this.createUI(this.viewer.getToolbar(false));
  }.bind(this);
}

ZoomWindow.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ZoomWindow.prototype.constructor = ZoomWindow;

var proto = ZoomWindow.prototype;

proto.load = function() {
  var viewer = this.viewer;

  // Init & Register tool
  this.tool = new SelectionWindowTool(viewer)

  viewer.toolController.registerTool(this.tool);

  // Add the ui to the viewer.
  this.createUI(viewer.getToolbar(false));
  return true;
};

proto.createUI = function(toolbar) {
  var navTools;
  if (!toolbar || !(navTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID)) || !navTools.dollybutton) {
    // tool bars aren't built yet, wait until they are
    this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.createUIBound);
    return;
  }

  var self = this;
  // remove default zoom tool
  navTools.removeControl(navTools.dollybutton.getId());
  this.defaultDollyButton = navTools.dollybutton;

  // add combo button for zoom tool
  this.zoomWindowToolButton = new Autodesk.Viewing.UI.ComboButton('toolbar-zoomTools');
  this.zoomWindowToolButton.setIcon('zoomwindowtoolicon-zoom-window');
  this.createZoomSubmenu(this.zoomWindowToolButton);
  navTools.addControl(this.zoomWindowToolButton);

  // Escape hotkey to exit tool.
  //
  var hotkeys = [{
    keycodes: [
      Autodesk.Viewing.theHotkeyManager.KEYCODES.ESCAPE
    ],
    onRelease: function () {
      if (self.zoomWindowToolButton.getState() === Autodesk.Viewing.UI.Button.State.ACTIVE) {
        self.viewer.setActiveNavigationTool();
        self.zoomWindowToolButton.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
      }
    }
  }];
  Autodesk.Viewing.theHotkeyManager.pushHotkeys(this.escapeHotkeyId, hotkeys);
};

proto.destroyUI = function() {
  var viewer = this.viewer;
  var toolbar = viewer.getToolbar(false);
  if (toolbar) {
    var navTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID);
    if (navTools) {
      if (this.zoomWindowToolButton) {
        this.zoomWindowToolButton.subMenu.removeEventListener(
          Autodesk.Viewing.UI.RadioButtonGroup.Event.ACTIVE_BUTTON_CHANGED,
          this.zoomWindowToolButton.subMenuActiveButtonChangedHandler(navTools));
        navTools.removeControl(this.zoomWindowToolButton.getId());
      }
      this.zoomWindowToolButton = null;
      // set back dolly button
      if (navTools.panbutton && this.defaultDollyButton) {
        navTools.addControl(this.defaultDollyButton);
      }
      else {
        this.defaultDollyButton = null;
      }
    }
  }
  Autodesk.Viewing.theHotkeyManager.popHotkeys(this.escapeHotkeyId);
};

proto.createNavToggler = function(viewer, button, name) {
  return function() {
    var state = button.getState();
    if (state === Autodesk.Viewing.UI.Button.State.INACTIVE) {
      viewer.setActiveNavigationTool(name);
      button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
    } else if (state === Autodesk.Viewing.UI.Button.State.ACTIVE) {
      viewer.setActiveNavigationTool();
      button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
    }
  };
};

proto.createZoomSubmenu = function(parentButton){

  var viewer = this.viewer;
  var toolbar = viewer.getToolbar(true);
  var navTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID);

  // zoom window
  var zoomWindowToolBut = new Autodesk.Viewing.UI.Button('toolbar-zoomWindowTool');
  zoomWindowToolBut.setToolTip(Autodesk.Viewing.i18n.translate("Zoom window"));
  zoomWindowToolBut.setIcon('zoomwindowtoolicon-zoom-window');
  zoomWindowToolBut.onClick = this.createNavToggler(viewer, zoomWindowToolBut, 'selectionWindowTool');
  parentButton.addControl(zoomWindowToolBut);
  // zoom
  var dollyBut = new Autodesk.Viewing.UI.Button('toolbar-zoomTool');
  dollyBut.setToolTip('Zoom');
  dollyBut.setIcon('adsk-icon-zoom');
  dollyBut.onClick = this.createNavToggler(viewer, dollyBut, 'dolly');
  parentButton.addControl(dollyBut);
  // Set the default click action
  parentButton.onClick = zoomWindowToolBut.onClick; // default
};

proto.unload = function() {
  var viewer = this.viewer;
  if (viewer.getActiveNavigationTool() === "dolly" ||
    viewer.getActiveNavigationTool() === "selectionWindowTool") {
    viewer.setActiveNavigationTool();
  }
  // Remove the UI
  this.destroyUI();
  // Deregister tool
  viewer.toolController.deregisterTool(this.tool);
  this.tool = null;

  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Viewing.Extension.SelectionWindow',
  ZoomWindow)
