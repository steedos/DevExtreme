/**
 * DevExtreme (ui/drop_down_box.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _ui = require("./drop_down_editor/ui.drop_down_editor");
var _ui2 = _interopRequireDefault(_ui);
var _ui3 = require("./editor/ui.data_expression");
var _ui4 = _interopRequireDefault(_ui3);
var _common = require("../core/utils/common");
var _common2 = _interopRequireDefault(_common);
var _iterator = require("../core/utils/iterator");
var _selectors = require("./widget/selectors");
var _selectors2 = _interopRequireDefault(_selectors);
var _ui5 = require("./widget/ui.keyboard_processor");
var _ui6 = _interopRequireDefault(_ui5);
var _deferred = require("../core/utils/deferred");
var _renderer = require("../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _extend = require("../core/utils/extend");
var _utils = require("../ui/overlay/utils");
var _component_registrator = require("../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _utils2 = require("../events/utils");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var DROP_DOWN_BOX_CLASS = "dx-dropdownbox",
    ANONYMOUS_TEMPLATE_NAME = "content";
var DropDownBox = _ui2.default.inherit({
    _supportedKeys: function() {
        return (0, _extend.extend)({}, this.callBase(), {
            tab: function(e) {
                if (!this.option("opened")) {
                    return
                }
                var $tabbableElements = this._getTabbableElements(),
                    $focusableElement = e.shiftKey ? $tabbableElements.last() : $tabbableElements.first();
                $focusableElement && _events_engine2.default.trigger($focusableElement, "focus");
                e.preventDefault()
            }
        })
    },
    _getTabbableElements: function() {
        return this._getElements().filter(_selectors2.default.tabbable)
    },
    _getElements: function() {
        return (0, _renderer2.default)(this.content()).find("*")
    },
    _getAnonymousTemplateName: function() {
        return ANONYMOUS_TEMPLATE_NAME
    },
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            acceptCustomValue: false,
            contentTemplate: null,
            openOnFieldClick: true,
            valueFormat: function(value) {
                return Array.isArray(value) ? value.join(", ") : value
            }
        })
    },
    _initMarkup: function() {
        this._initDataExpressions();
        this._renderSubmitElement();
        this.$element().addClass(DROP_DOWN_BOX_CLASS);
        this.callBase()
    },
    _renderSubmitElement: function() {
        this._$submitElement = (0, _renderer2.default)("<input>").attr("type", "hidden").appendTo(this.$element())
    },
    _renderValue: function() {
        this._setSubmitValue();
        this.callBase()
    },
    _setSubmitValue: function() {
        var value = this.option("value"),
            submitValue = "this" === this.option("valueExpr") ? this._displayGetter(value) : value;
        this._$submitElement.val(submitValue)
    },
    _getSubmitElement: function() {
        return this._$submitElement
    },
    _renderInputValue: function() {
        var callBase = this.callBase.bind(this),
            values = [];
        if (!this._dataSource) {
            callBase(values);
            return (new _deferred.Deferred).resolve()
        }
        var currentValue = this._getCurrentValue(),
            keys = _common2.default.ensureDefined(currentValue, []);
        keys = Array.isArray(keys) ? keys : [keys];
        var itemLoadDeferreds = (0, _iterator.map)(keys, function(key) {
            return this._loadItem(key).always(function(item) {
                var displayValue = this._displayGetter(item);
                values.push(_common2.default.ensureDefined(displayValue, key))
            }.bind(this))
        }.bind(this));
        return _deferred.when.apply(this, itemLoadDeferreds).always(function() {
            this.option("displayValue", values);
            callBase(values.length && values)
        }.bind(this)).fail(callBase)
    },
    _loadItem: function(value) {
        var deferred = new _deferred.Deferred,
            that = this;
        var selectedItem = (0, _common.grep)(this.option("items") || [], function(item) {
            return this._isValueEquals(this._valueGetter(item), value)
        }.bind(this))[0];
        if (void 0 !== selectedItem) {
            deferred.resolve(selectedItem)
        } else {
            this._loadValue(value).done(function(item) {
                deferred.resolve(item)
            }).fail(function(args) {
                if (that.option("acceptCustomValue")) {
                    deferred.resolve(value)
                } else {
                    deferred.reject()
                }
            })
        }
        return deferred.promise()
    },
    _updatePopupWidth: function() {
        this._setPopupOption("width", this.$element().outerWidth())
    },
    _popupElementTabHandler: function(e) {
        if ("tab" !== (0, _utils2.normalizeKeyName)(e)) {
            return
        }
        var $firstTabbable = this._getTabbableElements().first().get(0),
            $lastTabbable = this._getTabbableElements().last().get(0),
            $target = e.originalEvent.target,
            moveBackward = !!($target === $firstTabbable && e.shift),
            moveForward = !!($target === $lastTabbable && !e.shift);
        if (moveBackward || moveForward) {
            this.close();
            _events_engine2.default.trigger(this._input(), "focus");
            if (moveBackward) {
                e.originalEvent.preventDefault()
            }
        }
    },
    _renderPopup: function(e) {
        this.callBase();
        if (this.option("focusStateEnabled")) {
            this._popup._keyboardProcessor.push(new _ui6.default({
                element: this.content(),
                handler: this._popupElementTabHandler,
                context: this
            }))
        }
    },
    _popupConfig: function() {
        return (0, _extend.extend)(this.callBase(), {
            width: function() {
                return this.$element().outerWidth()
            }.bind(this),
            height: "auto",
            tabIndex: -1,
            dragEnabled: false,
            focusStateEnabled: this.option("focusStateEnabled"),
            maxHeight: function() {
                return (0, _utils.getElementMaxHeightByWindow)(this.$element())
            }.bind(this)
        })
    },
    _popupShownHandler: function() {
        this.callBase();
        var $firstElement = this._getTabbableElements().first();
        _events_engine2.default.trigger($firstElement, "focus")
    },
    _setCollectionWidgetOption: _common2.default.noop,
    _optionChanged: function(args) {
        this._dataExpressionOptionChanged(args);
        switch (args.name) {
            case "width":
                this.callBase(args);
                this._updatePopupWidth();
                break;
            case "dataSource":
                this._renderInputValue();
                break;
            case "displayValue":
                this.option("text", args.value);
                break;
            case "displayExpr":
                this._renderValue();
                break;
            default:
                this.callBase(args)
        }
    }
}).include(_ui4.default);
(0, _component_registrator2.default)("dxDropDownBox", DropDownBox);
module.exports = DropDownBox;
module.exports.default = module.exports;
