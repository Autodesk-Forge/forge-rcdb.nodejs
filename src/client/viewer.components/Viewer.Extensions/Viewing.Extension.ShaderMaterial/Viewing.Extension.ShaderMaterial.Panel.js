/////////////////////////////////////////////////////////////////////
// Viewing.Extension.ShaderMaterial.Panel
// by Philippe Leefsma, Feb 2017
//
/////////////////////////////////////////////////////////////////////
import ToolPanelBase from 'ToolPanelBase'

export default class ShaderMaterialPanel extends ToolPanelBase {

  constructor(container, btnElement) {

    super(container, 'Shader Material', {
      buttonElement: btnElement,
      movable: true,
      shadow: true
    })

    $(this.container).addClass('shader-material')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent (id) {

    return `

      <div class="container">

      </div>`
  }
}
