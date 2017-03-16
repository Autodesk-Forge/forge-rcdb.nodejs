/////////////////////////////////////////////////////////////////////
// Viewing.Extension.StateManager.Panel
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import ToolPanelBase from 'ToolPanelBase'
import SwitchButton from 'SwitchButton'
import ToggleButton from 'ToggleButton'
import 'dragula/dist/dragula.min.css'
import Dropdown from 'Dropdown'
import dragula from 'dragula'

export default class StateManagerPanel extends ToolPanelBase{

  constructor(container, btnElement) {

    super(container, 'States Manager', {
      buttonElement: btnElement,
      movable: true,
      shadow: false
    })

    $(this.container).removeClass('dockingPanel')
    $(this.container).addClass('state-manager')

    const sequences = []

    this.dropdown = new Dropdown({
      container: `#${this.container.id}-seq-dropdown`,
      title: 'Sequence',
      prompt: 'Sequence ...',
      pos: {
        top: 0, left: 0
      },
      menuItems: sequences
    })

    $(`#${this.container.id}-save-btn`).click((e)=>{

      var $name = $(`#${this.container.id}-name`)

      var state = this.emit('state.add', {
        name: $name.val()
      })

      this.addItem(state)

      $name.val('')
    })

    this.playToggleBtn = new ToggleButton(
      `#${this.container.id}-play-btn`, {
        states: [{
          name: 'Play',
          className: 'glyphicon glyphicon-play btn-play'
        }, {
          name: 'Pause',
          className: 'glyphicon glyphicon-pause btn-play'
        }]
      })

    this.playToggleBtn.on('btn.toggled', (event) => {

      switch (event.state.name) {

        case 'Play':
          this.playSequence(2000)
          break

        case 'Pause':
          clearTimeout(this.playSequenceId)
          break
      }
    })

    this.loopSwitch = new SwitchButton(
      `#${this.container.id}-switch-loop`)

    this.drake = dragula(
      [$(`#${this.container.id}-item-list`)[0]],
      {removeOnSpill: false});

    this.drake.on('drop', ()=> {

      var sequence = [];

      $(`#${this.container.id}-item-list > div`).each(
        (idx, child)=> {
          sequence.push(child.id);
        });

      this.emit('sequence.update', sequence);
    });

    this.drake.on('drag', (el)=> {

    });

    this.stateMap = {}
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent (id) {

    return `
      <div class="container">
        <div>
        <div id="${id}-sequence" class="sequence">
          <div id="${id}-seq-dropdown" class="seq-dropdown">
          </div>
          <button id="${id}-add-seq-btn" class="btn btn-info btn-add-seq">
            <span class="fa fa-plus btn-span-list">
            </span>
            New
          </button>
          <button id="${id}-del-seq-btn" class="btn btn-info btn-del-seq">
            <span class="fa fa-times btn-span-list">
            </span>
            <label>
            Delete
            </label>
          </button>
        </div>
        <input id="${id}-name"
            type="text"
            class="input-name"
            placeholder=" State name ...">
          <button id="${id}-save-btn" class="btn btn-info btn-save">
            <span class="fa fa-database btn-span-list">
            </span>
            Save
          </button>
          <div id="${id}-play-btn" class="btn-play-container">
          </div>
          <div id="${id}-switch-loop" class="switch-loop"></div>
        </div>
        <div class="item-list" id="${id}-item-list">
        </div>
      </div>`
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  addItem (item) {

    var itemHtml = `

        <div id="${item.guid}"
          class="state-list-group-item state-restore">
            <label class="state-restore">
              ${item.name}
            </label>
             <button id="${item.guid}-delete-btn"
                    class="btn btn-danger state-btn-list">
              <span class="glyphicon glyphicon-remove state-btn-span-list">
              </span>
            </button>
        </div>
      `;

    $(`#${this.container.id}-item-list`).append(itemHtml)

    if (item.readonly) {

      $(`#${item.guid}-delete-btn`).css({
        display:'none'
      })
    }

    var $item = $(`#${item.guid}`)

    $(`#${item.guid}-delete-btn`).click((e) => {

      this.emit('state.remove', item)

      delete this.stateMap[item.guid]

      $item.remove()
    })

    $item.click((e) => {

      e.preventDefault();

      var element = document.elementFromPoint(
        e.pageX, e.pageY)

      if (element.className.indexOf('state-restore') > -1) {

        this.emit('state.restore', item)
      }
    })

    this.stateMap[item.guid] = item
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  clearItems () {

    $(`#${this.container.id}-item-list`).empty()

    this.stateMap = {}
  }

  /////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////
  getSequence () {

    const $items = $(`#${this.container.id}-item-list > div`)

    return $items.toArray().map((item) => {

      return item.id
    })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  playSequence (period) {

    const sequence = this.getSequence()

    this.sequenceIdx = 0

    const step = (id) => {

      this.emit('state.restore', this.stateMap[id])

      $(`#${id}`).addClass('active')

      setTimeout(() => {
        $(`#${id}`).removeClass('active')
      }, period * 0.9)

      ++this.sequenceIdx

      if(this.sequenceIdx == sequence.length) {

        if (!this.loopSwitch.checked()) {

          this.playToggleBtn.setState(0)
          return
        }

        this.sequenceIdx = 0
      }

      this.playSequenceId = setTimeout(() => {

        step(sequence[this.sequenceIdx])

      }, period)
    }

    if(sequence.length > 0) {

      step(sequence[this.sequenceIdx])
    }
  }
}
