/**
 * DevExtreme (ui/html_editor/modules/popup.js)
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
var _quill_importer = require("../quill_importer");
var _renderer = require("../../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _extend = require("../../../core/utils/extend");
var _popup = require("../../popup");
var _popup2 = _interopRequireDefault(_popup);
var _list = require("../../list");
var _list2 = _interopRequireDefault(_list);

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
var SUGGESTION_LIST_CLASS = "dx-suggestion-list";
var BaseModule = (0, _quill_importer.getQuill)().import("core/module");
var ListPopupModule = function(_BaseModule) {
    _inherits(ListPopupModule, _BaseModule);
    _createClass(ListPopupModule, [{
        key: "_getDefaultOptions",
        value: function() {
            return {
                dataSource: null
            }
        }
    }]);

    function ListPopupModule(quill, options) {
        _classCallCheck(this, ListPopupModule);
        var _this = _possibleConstructorReturn(this, (ListPopupModule.__proto__ || Object.getPrototypeOf(ListPopupModule)).call(this, quill, options));
        _this.options = (0, _extend.extend)({}, _this._getDefaultOptions(), options);
        _this._popup = _this.renderPopup();
        return _this
    }
    _createClass(ListPopupModule, [{
        key: "renderList",
        value: function($container, options) {
            $container.addClass(SUGGESTION_LIST_CLASS);
            this._list = this.options.editorInstance._createComponent($container, _list2.default, options)
        }
    }, {
        key: "renderPopup",
        value: function() {
            var editorInstance = this.options.editorInstance,
                $container = (0, _renderer2.default)("<div>").appendTo(editorInstance.$element()),
                popupConfig = this._getPopupConfig();
            return editorInstance._createComponent($container, _popup2.default, popupConfig)
        }
    }, {
        key: "_getPopupConfig",
        value: function() {
            var _this2 = this;
            return {
                contentTemplate: function(contentElem) {
                    var listConfig = _this2._getListConfig(_this2.options);
                    _this2.renderList((0, _renderer2.default)(contentElem), listConfig)
                },
                deferRendering: false,
                onShown: function() {
                    _this2._list.focus()
                },
                onHidden: function() {
                    _this2._list.unselectAll();
                    _this2._list.option("focusedElement", null)
                },
                showTitle: false,
                width: "auto",
                height: "auto",
                shading: false,
                closeOnTargetScroll: true,
                closeOnOutsideClick: true,
                animation: {
                    show: {
                        type: "fade",
                        duration: 0,
                        from: 0,
                        to: 1
                    },
                    hide: {
                        type: "fade",
                        duration: 400,
                        from: 1,
                        to: 0
                    }
                },
                fullScreen: false
            }
        }
    }, {
        key: "_getListConfig",
        value: function(options) {
            return {
                dataSource: options.dataSource,
                onSelectionChanged: this.selectionChangedHandler.bind(this),
                selectionMode: "single"
            }
        }
    }, {
        key: "selectionChangedHandler",
        value: function(e) {
            if (this._popup.option("visible")) {
                this._popup.hide();
                this.insertEmbedContent(e)
            }
        }
    }, {
        key: "insertEmbedContent",
        value: function(selectionChangedEvent) {}
    }, {
        key: "showPopup",
        value: function() {
            this._popup && this._popup.show()
        }
    }, {
        key: "savePosition",
        value: function(position) {
            this.caretPosition = position
        }
    }, {
        key: "getPosition",
        value: function() {
            return this.caretPosition
        }
    }]);
    return ListPopupModule
}(BaseModule);
exports.default = ListPopupModule;
