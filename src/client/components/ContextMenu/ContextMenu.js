/////////////////////////////////////////////////////////////
// ContextMenu
//
/////////////////////////////////////////////////////////////

export default class ContextMenu
  extends Autodesk.Viewing.Private.ContextMenu {

  constructor (opts) {

    super (opts)
  }

  setMenuItemIcon (menuItem, iconClasses) {

    var menuItemIcon = document.createElement("div")
    menuItemIcon.classList.add("menuItemIcon")

    if (iconClasses) {

      const classes = iconClasses.split(' ')

      classes.forEach((cls) => {

        menuItemIcon.classList.add(cls)
      })
    }

    menuItem.appendChild(menuItemIcon)
  }
}
