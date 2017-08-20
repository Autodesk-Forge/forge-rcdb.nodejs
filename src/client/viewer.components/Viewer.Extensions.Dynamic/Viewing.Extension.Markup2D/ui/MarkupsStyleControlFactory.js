(function(){

    var namespace = AutodeskNamespace('Autodesk.Markups.Ui');

    var ColorPicker = namespace.ColorPicker,
        DropDown    = namespace.DropDown,
        ToggleButton = namespace.ToggleButton;

    namespace.StyleControlFactory = {
        create: function(element){
            var style = element.getAttribute('data-markup-style');
            var styleControl;
            //NOTE: this check will have to get more 
            //      specific if more custom style inputs are needed
            if (element instanceof HTMLDivElement) {
                styleControl = new ColorPicker(element);
            } else if (element instanceof HTMLSelectElement) {
                styleControl = new DropDown(element);
            } else if (element instanceof HTMLButtonElement) {
                styleControl = new ToggleButton(element);
            }
            return styleControl;
        }
    };
})();
