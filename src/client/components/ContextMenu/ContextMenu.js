/////////////////////////////////////////////////////////////
// ContextMenu
//
/////////////////////////////////////////////////////////////
import './ContextMenu.scss'

export default class ContextMenu
  extends Autodesk.Viewing.Private.ContextMenu {

  constructor (opts) {

    super (opts)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  showMenu (menu, x, y) {

    var container = document.createElement('div'),
      menuItem,
      submenus = [];

    container.className = 'menu';
    this.viewer.container.appendChild(container);
    this.menus.push(container);

    for (var i = 0; i < menu.length; ++i) {

      var defn = menu[i], target = defn.target;

      menuItem = this.createMenuItem(container, defn);

      if (typeof target === 'function') {
        this.addCallbackToMenuItem(menuItem, target);

      } else if (Array.isArray(target)) {
        submenus.push({menuItem: menuItem, target: target});

      } else {
        console.warn("Invalid context menu option:", title, target);
      }
    }

    var rect = container.getBoundingClientRect(),
      containerWidth = rect.width,
      containerHeight = rect.height,
      viewerRect = this.viewer.container.getBoundingClientRect(),
      viewerWidth = viewerRect.width,
      viewerHeight = viewerRect.height,
      shiftLeft = isTouchDevice() && !this.viewer.navigation.getUseLeftHandedInput();

    if (shiftLeft) {
      x -= containerWidth;
    }

    if (x < 0) {
      x = 0;
    }
    if (viewerWidth < x + containerWidth) {
      x = viewerWidth - containerWidth;
      if (x < 0) {
        x = 0;
      }
    }

    if (y < 0) {
      y = 0;
    }
    if (viewerHeight < y + containerHeight) {
      y = viewerHeight - containerHeight;
      if (y < 0) {
        y = 0;
      }
    }

    container.style.top = Math.round(y) + "px";
    container.style.left = Math.round(x) + "px";

    for (i = 0; i < submenus.length; ++i) {
      var submenu = submenus[i];

      menuItem = submenu.menuItem;
      rect = menuItem.getBoundingClientRect();
      x = Math.round((shiftLeft ? rect.left : rect.right) - viewerRect.left);
      y = Math.round(rect.top - viewerRect.top);

      this.addSubmenuCallbackToMenuItem(menuItem, submenu.target, x, y);
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createMenuItem (parentItem, menuItemDef) {

    const menuItemId = this.guid()

    const text = menuItemDef.title

    $(parentItem).append(`
      <div id="${menuItemId}" class="menuItem" data-i18n=${text}>
        <span class="${menuItemDef.className || ''}">
        </span>
        ${Autodesk.Viewing.i18n.translate(text)}
      </div>
    `)

    return document.getElementById (menuItemId)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  guid(format='xxxxxxxx') {

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