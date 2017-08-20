(function(){

    var namespace = AutodeskNamespace('Autodesk.Markups.Ui');

    var Utils = namespace.Utils,
        toList = Utils.toList;

    var clearButtonGroup = function (groupingElement) {
        var buttons = groupingElement.querySelectorAll('.active');
        toList(buttons).map(function(btn){
            btn.classList.remove('active');
        });
    };

    function ColorPicker(element) {
        this.root = element;

        this.render();
        this.handleUIEvents();
        this.selectedColor = null;

        Object.defineProperty(this, 'value', {
            get : function() {
                return this.selectedColor;
            },
            set : function(val){
                if (this.selectedColor === val) return;

                this.selectedColor = val;

                clearButtonGroup(this.root);
                //set the active class on the element of the color selected
                var element = this.root.querySelector('[data-value="' + val + '"]');
                element.classList.add('active');
            }
        });

        window.colorPicker = this;
    }

    var proto = ColorPicker.prototype;

    proto.render = function () {
        var componentHTML = '' +
            '<ul class="color-picker-pallete">' +
            '</ul>';
        this.root.innerHTML = componentHTML;
    };

    proto.on = function (eventName, selector, callback) {
        this.root.addEventListener(eventName, function(event){
            var target = event.target;
            if (Utils.matchesSelector(target, selector)) callback(event);
        });
    };

    proto.handleUIEvents = function () {
        this.on('click', '.color-picker-item', function(event){
            var target = event.target;
            this.value = target.getAttribute('data-value');

            this.root.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                detail: {
                    source: this
                }
            }));
        }.bind(this));
    };

    proto.setOptions = function (colorsList) {
        var colors = colorsList;
        var items = colors.map(function(color){
            var selected = color.value === this.selectedColor;
            var markup = '' +
                '<li>' +
                    '<div ' +
                        'class="color-picker-item ' + (selected ? 'active' : '') + '" ' +
                        'style="background-color: ' + color.value + '" ' +
                        'data-value="' + color.value + '"></div>' +
                '</li>';
            return markup;
        }.bind(this));

        var ul = this.root.querySelector('ul');
        ul.innerHTML = items.join('');
    };

    namespace.ColorPicker = ColorPicker;
})();
