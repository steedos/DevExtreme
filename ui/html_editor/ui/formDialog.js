/**
 * DevExtreme (ui/html_editor/ui/formDialog.js)
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
var _renderer = require("../../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _extend = require("../../../core/utils/extend");
var _popup = require("../../popup");
var _popup2 = _interopRequireDefault(_popup);
var _form = require("../../form");
var _form2 = _interopRequireDefault(_form);
var _deferred = require("../../../core/utils/deferred");
var _message = require("../../../localization/message");

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
var DIALOG_CLASS = "dx-formdialog";
var FORM_CLASS = "dx-formdialog-form";
var FormDialog = function() {
    function FormDialog(editorInstance, popupConfig) {
        _classCallCheck(this, FormDialog);
        this._editorInstance = editorInstance;
        this._popupUserConfig = popupConfig;
        this._renderPopup()
    }
    _createClass(FormDialog, [{
        key: "_renderPopup",
        value: function() {
            var editorInstance = this._editorInstance;
            var $container = (0, _renderer2.default)("<div>").addClass(DIALOG_CLASS).appendTo(editorInstance.$element());
            var popupConfig = this._getPopupConfig();
            return editorInstance._createComponent($container, _popup2.default, popupConfig)
        }
    }, {
        key: "_escKeyHandler",
        value: function() {
            this._popup.hide()
        }
    }, {
        key: "_addEscapeHandler",
        value: function(e) {
            e.component.registerKeyHandler("escape", this._escKeyHandler.bind(this))
        }
    }, {
        key: "_getPopupConfig",
        value: function() {
            var _this = this;
            return (0, _extend.extend)({
                onInitialized: function(e) {
                    _this._popup = e.component;
                    _this._popup.on("hiding", function() {
                        _this.deferred.reject()
                    });
                    _this._popup.on("shown", function() {
                        _this._form.focus()
                    })
                },
                deferRendering: false,
                focusStateEnabled: false,
                showCloseButton: false,
                contentTemplate: function(contentElem) {
                    var $formContainer = (0, _renderer2.default)("<div>").appendTo(contentElem);
                    _this._renderForm($formContainer, {
                        onEditorEnterKey: function(e) {
                            _this.hide(e.component.option("formData"))
                        },
                        customizeItem: function(item) {
                            if ("simple" === item.itemType) {
                                item.editorOptions = (0, _extend.extend)(true, {}, item.editorOptions, {
                                    onInitialized: _this._addEscapeHandler.bind(_this)
                                })
                            }
                        }
                    })
                },
                toolbarItems: [{
                    toolbar: "bottom",
                    location: "after",
                    widget: "dxButton",
                    options: {
                        onInitialized: this._addEscapeHandler.bind(this),
                        text: (0, _message.format)("OK"),
                        onClick: function() {
                            _this.hide(_this._form.option("formData"))
                        }
                    }
                }, {
                    toolbar: "bottom",
                    location: "after",
                    widget: "dxButton",
                    options: {
                        onInitialized: this._addEscapeHandler.bind(this),
                        text: (0, _message.format)("Cancel"),
                        onClick: function() {
                            _this._popup.hide()
                        }
                    }
                }]
            }, this._popupUserConfig)
        }
    }, {
        key: "_renderForm",
        value: function($container, options) {
            $container.addClass(FORM_CLASS);
            this._form = this._editorInstance._createComponent($container, _form2.default, options)
        }
    }, {
        key: "show",
        value: function(formUserConfig) {
            if (this._popup.option("visible")) {
                return
            }
            this.deferred = new _deferred.Deferred;
            var formConfig = (0, _extend.extend)({}, formUserConfig);
            this._form.option(formConfig);
            this._popup.show();
            return this.deferred.promise()
        }
    }, {
        key: "hide",
        value: function(formData) {
            this.deferred.resolve(formData);
            this._popup.hide()
        }
    }, {
        key: "popupOption",
        value: function(optionName, optionValue) {
            return this._popup.option.apply(this._popup, arguments)
        }
    }]);
    return FormDialog
}();
exports.default = FormDialog;
