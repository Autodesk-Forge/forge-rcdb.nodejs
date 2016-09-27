/////////////////////////////////////////////////////////////
// switch button
//
/////////////////////////////////////////////////////////////
import EventsEmitter from 'EventsEmitter';

export default class SwitchButton extends EventsEmitter {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor(container, checked = true){

    super();

    var _this = this;

    var labelId = guid();

    this._inputId = guid();

    var html = `
        <p class="onoffswitch">
          <input id="${this._inputId}" type="checkbox" name="onoffswitch"
            class="onoffswitch-checkbox" ${checked?"checked":""}>
          <label id="${labelId}" class="onoffswitch-label">
            <span class="onoffswitch-inner"></span>
            <span class="onoffswitch-switch"></span>
          </label>
        </p>
      `;

    $(container).append(html);

    $('#' + labelId).click((e)=>{

      var $input = $('#' + this._inputId)[0];

      $input.checked = !$input.checked;

      _this.emit('checked', $input.checked);
    });
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  checked() {

    return  $('#' + this._inputId)[0].checked;
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  setChecked(checked) {

    $('#' + this._inputId).prop(
      'checked', checked);

    this.emit('checked', checked);
  }
}

function guid() {

  var d = new Date().getTime();

  var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

  return guid;
}

//https://proto.io/freebies/onoff/
var css = `

  .onoffswitch {
    position: relative; width: 50px;
    -webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;
  }
  .onoffswitch-checkbox {
    display: none;
  }
  .onoffswitch-label {
    display: block; overflow: hidden; cursor: pointer;
    border: 2px solid #999999; border-radius: 8px;
  }
  .onoffswitch-inner {
    display: block; width: 200%; margin-left: -100%;
    transition: margin 0.3s ease-in 0s;
  }
  .onoffswitch-inner:before, .onoffswitch-inner:after {
    display: block;
    float: left;
    width: 50%;
    height: 15px;
    padding: 0;
    line-height: 15px;
    font-size: 10px;
    color: white;
    font-family: Trebuchet, Arial, sans-serif;
    font-weight: bold;
    box-sizing: border-box;
  }
  .onoffswitch-inner:before {
    content: "ON";
    background-color: #0E8200;
    color: #FFFFFF;
  }
  .onoffswitch-inner:after {
    content: "OFF";
    padding-right: 10px;
    background-color: #d9534f;
    color: #FFFFFF;
    text-align: right;
  }
  .onoffswitch-switch {
    display: block;
    width: 12px;
    margin: 2px;
    background: #FFFFFF;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 31px;
    border: 2px solid #999999;
    border-radius: 8px;
    transition: all 0.3s ease-in 0s;
  }
  .onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
    margin-left: 0;
  }
  .onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
    right: -1px;
  }
`;

$('<style type="text/css">' + css + '</style>').appendTo('head');
