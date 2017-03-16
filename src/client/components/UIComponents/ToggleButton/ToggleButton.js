/////////////////////////////////////////////////////////////
// Toggle Button
//
/////////////////////////////////////////////////////////////
import UIComponent from 'UIComponent'

export default class ToggleButton extends UIComponent {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (container, opts) {

    super()

    this.states = opts.states

    this.btnId = this.guid()

    this.stateIdx = 0

    var html = `
      <button id="${this.btnId}" class="btn toggle-btn">
          <span class="${this.states[this.stateIdx].className}">
          </span>
          <label>
            ${this.states[this.stateIdx].name}
          </label>
      </button>
    `

    $(container).append(html);

    $('#' + this.btnId).click((e)=>{

      $('#' + this.btnId + ' span').removeClass(
        this.states[this.stateIdx].className
      );

      this.emit('btn.toggled', {
        state: this.states[this.stateIdx]
      });

      ++this.stateIdx;

      this.stateIdx %= this.states.length;

      $('#' + this.btnId + ' span').addClass(
        this.states[this.stateIdx].className
      );

      $('#' + this.btnId + ' label').text(
        this.states[this.stateIdx].name);
    });
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  setState(stateIdx){

    $('#' + this.btnId + ' span').removeClass(
      this.states[this.stateIdx].className
    )

    this.stateIdx = stateIdx;

    $('#' + this.btnId + ' span').addClass(
      this.states[this.stateIdx].className
    )

    $('#' + this.btnId + ' label').text(
      this.states[this.stateIdx].name)
  }
}
