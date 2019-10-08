(function () {
  var namespace = AutodeskNamespace('Autodesk.Markups.Ui')

  function ToggleButton (element) {
    this.root = element
    Object.defineProperty(this, 'value', {
      get: function () {
        return this.root.value
      },
      set: function (val) {
        this.root.value = val
      }
    })
  }

  var proto = ToggleButton.prototype

  proto.setOptions = function (options) {
    // nothing to do
    // it's either true or false, on or off
  }

  namespace.ToggleButton = ToggleButton
})()
