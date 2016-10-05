import ViewerToolkit from 'ViewerToolkit'

class ViewerCombo {

  constructor (options = {}) {

    this._controls = options.controls.map((control) => {


    })
  }

  this._txControl = ViewerToolkit.createButton(
    'toolbar-translate',
    'fa fa-arrows-alt',
    'Translate Tool', () => {

      var txTool = this.translateTool.getName()
      var rxTool = this.rotateTool.getName()

      if (this.translateTool.active) {

        this._viewer.toolController.deactivateTool(txTool)
        this._txControl.container.classList.remove('active')
        this._comboCtrl.container.classList.remove('active')

      } else {

        this._viewer.toolController.activateTool(txTool)
        this._txControl.container.classList.add('active')

        this._viewer.toolController.deactivateTool(rxTool)
        this._rxControl.container.classList.remove('active')

        this._comboCtrl.container.classList.add('active')
      }
    })

  this._rxControl = ViewerToolkit.createButton(
    'toolbar-rotate',
    'fa fa-refresh',
    'Rotate Tool', () => {

      var txTool = this.translateTool.getName()
      var rxTool = this.rotateTool.getName()

      if (this.rotateTool.active) {

        this._viewer.toolController.deactivateTool(rxTool)
        this._rxControl.container.classList.remove('active')
        this._comboCtrl.container.classList.remove('active')

      } else {

        this._viewer.toolController.activateTool(rxTool)
        this._rxControl.container.classList.add('active')

        this._viewer.toolController.deactivateTool(txTool)
        this._txControl.container.classList.remove('active')

        this._comboCtrl.container.classList.add('active')
      }
    })

  this.parentControl = this._options.parentControl

  if (!this.parentControl) {

    var viewerToolbar = this._viewer.getToolbar(true)

    this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
      'transform')

    viewerToolbar.addControl(this.parentControl)
  }

  this._comboCtrl = new Autodesk.Viewing.UI.ComboButton(
    'transform-combo')

  this._comboCtrl.setToolTip('Transform Tools')

  this._comboCtrl.icon.style.fontSize = '24px'
  this._comboCtrl.icon.style.transform = 'rotateY(180Deg)'

  this._comboCtrl.icon.className =
    'glyphicon glyphicon-wrench'

  this._comboCtrl.addControl(this._txControl)
  this._comboCtrl.addControl(this._rxControl)

  var openCombo = this._comboCtrl.onClick

  this._comboCtrl.onClick = (e) => {

    if(this._comboCtrl.container.classList.contains('active')) {

      this._txControl.container.classList.remove('active')
      this._rxControl.container.classList.remove('active')

      this._comboCtrl.container.classList.remove('active')

      var txTool = this.translateTool.getName()
      var rxTool = this.rotateTool.getName()

      this._viewer.toolController.deactivateTool(txTool)
      this._viewer.toolController.deactivateTool(rxTool)

    } else {

      openCombo()
    }
  }

  this.parentControl.addControl(this._comboCtrl)

  console.log('Viewing.Extension.Transform loaded')

  return true
}

export default ViewerCombo
