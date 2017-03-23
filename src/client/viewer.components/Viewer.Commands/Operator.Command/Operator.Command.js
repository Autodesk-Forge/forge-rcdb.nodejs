import ViewerCommand from 'Viewer.Command'
import Toolkit from 'Viewer.Toolkit'

export default class OperatorCommand extends ViewerCommand {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, {
      commandId: 'Operator'
    })

    this.control = this.createButtonControl({
      parentControl: options.parentControl,
      caption: 'Operator view',
      icon: 'toolbar-operator',
      id: 'toolbar-operator',
      handler: () => {

        this.commandTool.active
          ? this.commandTool.deactivate()
          : this.commandTool.activate()
      }
    })

    this.commandTool.on('activate', () => {

      this.control.container.classList.add('active')

      this.viewer.toolController.activateTool('firstperson')

      this.previousState = this.viewer.getState({
        viewport: true
      })

      const operatorViewState = {
        "viewport": {
          "worldUpVector": [0, 0, 1],
          "pivotPoint": [-1914.7964636108886, 283.9822561018569, -923.9953304938531],
          "target": [819.0347474225482, 12.490785687483424, -1692.8075533370086],
          "eye": [-1698.9852947768727, -15.72146842137574, -549.1872365619897],
          "up": [0.4134754873354844, 0.004632638073167974, 0.9105034651428664],
          "distanceToOrbit": -38.443589932905894,
          "fieldOfView": 45.00000010722521,
          "aspectRatio": 5.088339222614841,
          "projection": "perspective",
          "isOrthographic": false
        }
      }

      this.viewer.restoreState(operatorViewState)

      $('.tool-selector').css({
        'background-color': 'rgba(255, 255, 255, .95)'
      })
    })

    this.commandTool.on('deactivate', () => {

      this.control.container.classList.remove('active')

      this.viewer.toolController.deactivateTool('firstperson')

      this.viewer.restoreState(this.previousState)

      $('.tool-selector').css({
        'background-color': 'rgba(22, 22, 22, .1)'
      })
    })
  }
}


