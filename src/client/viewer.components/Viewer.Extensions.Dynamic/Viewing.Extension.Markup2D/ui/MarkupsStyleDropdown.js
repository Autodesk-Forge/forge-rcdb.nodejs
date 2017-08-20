(function(){

    var namespace = AutodeskNamespace('Autodesk.Markups.Ui');
    var coreNamespace = AutodeskNamespace('Autodesk.Markups.Core');
    var utilsNamespace = AutodeskNamespace('Autodesk.Markups.Core.Utils');

    var Utils = namespace.Utils,
        toList = Utils.toList,
        toTitleCase = Utils.toTitleCase,
        updateDropDownOptions = Utils.updateDropDownOptions;

    function DropDown(element) {
        this.root = element;
        Object.defineProperty(this, 'value', {
            get : function() {
                return this.root.value;
            },
            set : function(val){
                this.root.value = val;
            }
        });
    }

    var proto = DropDown.prototype;

    proto.setOptions = function (options) {
        updateDropDownOptions(this.root, options);
    };

    namespace.DropDown = DropDown;
})();
