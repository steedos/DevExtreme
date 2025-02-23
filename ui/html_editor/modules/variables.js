/**
 * DevExtreme (ui/html_editor/modules/variables.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) {
                descriptor.writable = true
            }
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) {
            defineProperties(Constructor.prototype, protoProps)
        }
        if (staticProps) {
            defineProperties(Constructor, staticProps)
        }
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (null === object) {
        object = Function.prototype
    }
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (void 0 === desc) {
        var parent = Object.getPrototypeOf(object);
        if (null === parent) {
            return
        } else {
            return get(parent, property, receiver)
        }
    } else {
        if ("value" in desc) {
            return desc.value
        } else {
            var getter = desc.get;
            if (void 0 === getter) {
                return
            }
            return getter.call(receiver)
        }
    }
};
var _quill_importer = require("../quill_importer");
var _renderer = require("../../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _popup = require("./popup");
var _popup2 = _interopRequireDefault(_popup);
var _variable = require("../formats/variable");
var _variable2 = _interopRequireDefault(_variable);
var _extend = require("../../../core/utils/extend");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && ("object" === typeof call || "function" === typeof call) ? call : self
}

function _inherits(subClass, superClass) {
    if ("function" !== typeof superClass && null !== superClass) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) {
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
    }
}
var VARIABLE_FORMAT_CLASS = "dx-variable-format";
var ACTIVE_FORMAT_CLASS = "dx-format-active";
(0, _quill_importer.getQuill)().register({
    "formats/variable": _variable2.default
}, true);
var VariableModule = function(_PopupModule) {
    _inherits(VariableModule, _PopupModule);
    _createClass(VariableModule, [{
        key: "_getDefaultOptions",
        value: function() {
            var baseConfig = _get(VariableModule.prototype.__proto__ || Object.getPrototypeOf(VariableModule.prototype), "_getDefaultOptions", this).call(this);
            return (0, _extend.extend)(baseConfig, {
                escapeChar: ""
            })
        }
    }]);

    function VariableModule(quill, options) {
        _classCallCheck(this, VariableModule);
        var _this = _possibleConstructorReturn(this, (VariableModule.__proto__ || Object.getPrototypeOf(VariableModule)).call(this, quill, options));
        var toolbar = quill.getModule("toolbar");
        if (toolbar) {
            toolbar.addClickHandler("variable", _this.showPopup.bind(_this))
        }
        quill.keyboard.addBinding({
            key: "P",
            altKey: true
        }, _this.showPopup.bind(_this));
        _this._popup.on("shown", function(e) {
            var $ofElement = (0, _renderer2.default)(e.component.option("position").of);
            if ($ofElement.hasClass(VARIABLE_FORMAT_CLASS)) {
                $ofElement.addClass(ACTIVE_FORMAT_CLASS)
            }
        });
        return _this
    }
    _createClass(VariableModule, [{
        key: "showPopup",
        value: function(event) {
            var selection = this.quill.getSelection();
            var position = selection ? selection.index : this.quill.getLength();
            this.savePosition(position);
            this._resetPopupPosition(event, position);
            _get(VariableModule.prototype.__proto__ || Object.getPrototypeOf(VariableModule.prototype), "showPopup", this).call(this)
        }
    }, {
        key: "_resetPopupPosition",
        value: function(event, position) {
            if (event && event.element) {
                this._popup.option("position", {
                    of: event.element,
                    offset: {
                        h: 0,
                        v: 0
                    },
                    my: "top center",
                    at: "bottom center",
                    collision: "fit"
                })
            } else {
                var mentionBounds = this.quill.getBounds(position);
                var rootRect = this.quill.root.getBoundingClientRect();
                this._popup.option("position", {
                    of: this.quill.root,
                    offset: {
                        h: mentionBounds.left,
                        v: mentionBounds.bottom - rootRect.height
                    },
                    my: "top center",
                    at: "bottom left",
                    collision: "fit flip"
                })
            }
        }
    }, {
        key: "insertEmbedContent",
        value: function(selectionChangedEvent) {
            var caretPosition = this.getPosition();
            var selectedItem = selectionChangedEvent.component.option("selectedItem");
            var variableData = (0, _extend.extend)({}, {
                value: selectedItem,
                escapeChar: this.options.escapeChar
            });
            setTimeout(function() {
                this.quill.insertEmbed(caretPosition, "variable", variableData);
                this.quill.setSelection(caretPosition + 1)
            }.bind(this))
        }
    }]);
    return VariableModule
}(_popup2.default);
exports.default = VariableModule;
