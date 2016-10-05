/////////////////////////////////////////////////////////////////
// StateManager Extension
// By Philippe Leefsma, April 2016
/////////////////////////////////////////////////////////////////
import StateManagerPanel from './Viewing.Extension.StateManager.Panel'
import StatesAPI from './Viewing.Extension.StateManager.API'
import ExtensionBase from 'Viewer.ExtensionBase'
import ViewerToolkit from 'Viewer.Toolkit'

class StateManagerExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);

    if(this._options.apiUrl) {

      this._api = new StatesAPI(
        options.apiUrl);
    }
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.StateManager';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this._control = ViewerToolkit.createButton(
      'state-manager-control',
      'glyphicon glyphicon-retweet',
      'Manage States', ()=>{

        this._panel.toggleVisibility();
      });

    this.onAddStateHandler =
      (e) => this.onAddState(e);

    this.onRestoreStateHandler =
      (e) => this.onRestoreState(e);

    this.onRemoveStateHandler =
      (e) => this.onRemoveState(e);

    this.onSaveSequenceHandler =
      (e) => this.onSaveSequence(e);

    this._panel = new StateManagerPanel(
      this._options.container || this._viewer.container,
      this._control.container);

    this._panel.on('open', () => {

      if(this._api) {

        this._api.getSequence(this._options.model._id).then(
          async(sequence) => {

          var states = await this._api.getStates(
            this._options.model._id);

          sequence.forEach((stateId) => {

            states.forEach((state) => {

              if(state.guid == this._options.stateId){

                this._viewer.restoreState(state, false);
              }

              if (state.guid == stateId) {

                this._panel.addItem(state);
              }
            })
          })
        })
      }
    })

    this._panel.on('close', (state) => {

      this._panel.clearItems()
    })

    this._panel.on('state.add', (state) => {

      return this.onAddStateHandler(state);
    })

    this._panel.on('state.restore', (state)=>{

      return this.onRestoreStateHandler(state);
    });

    this._panel.on('state.remove', (state)=>{

      return this.onRemoveStateHandler(state);
    });

    this._panel.on('sequence.update', (sequence)=>{

      return this.onSaveSequenceHandler(sequence);
    });

    this.parentControl = this._options.parentControl;

    if(!this.parentControl){

      var viewerToolbar = this._viewer.getToolbar(true);

      this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
        'state-manager');

      viewerToolbar.addControl(this.parentControl);
    }

    this.parentControl.addControl(
      this._control);

    if(this._options.homeState) {

      var state = this._viewer.getState()

      state.name = "Home"
      state.readonly = true

      this._panel.addItem(state)
    }

    this._panel.setVisible(
      this._options.showPanel);

    console.log('Viewing.Extension.StateManager loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this.parentControl.removeControl(
      this._control);

    this._panel.setVisible(false);

    console.log('Viewing.Extension.StateManager unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onAddState (data) {

    var state = this._viewer.getState();

    state.guid = ExtensionBase.guid()

    state.name = (data.name.length ?
      data.name : new Date().toString('d/M/yyyy H:mm:ss'));

    if(this._api) {

      this._api.addState(
        this._options.model._id,
        state);
    }

    return state;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onRestoreState (state) {

    this._viewer.restoreState(state, null, false);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onRemoveState (state) {

    if(this._api) {

      this._api.removeState(
        this._options.model._id,
        state.guid);
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  ////////////////////////////////////////////////////////////////
  onSaveSequence (sequence) {

    if(this._api) {

      this._api.saveSequence(
        this._options.model._id,
        sequence);
    }
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  StateManagerExtension.ExtensionId,
  StateManagerExtension);
