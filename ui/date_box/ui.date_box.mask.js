/**
 * DevExtreme (ui/date_box/ui.date_box.mask.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _utils = require("../../events/utils");
var _type = require("../../core/utils/type");
var _dom = require("../../core/utils/dom");
var _extend = require("../../core/utils/extend");
var _math = require("../../core/utils/math");
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _uiDate_boxMask = require("./ui.date_box.mask.parts");
var _date = require("../../localization/date");
var _date2 = _interopRequireDefault(_date);
var _date3 = require("../../localization/ldml/date.parser");
var _date4 = require("../../localization/ldml/date.format");
var _uiDate_box = require("./ui.date_box.base");
var _uiDate_box2 = _interopRequireDefault(_uiDate_box);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var MASK_EVENT_NAMESPACE = "dateBoxMask";
var FORWARD = 1;
var BACKWARD = -1;
var DateBoxMask = _uiDate_box2.default.inherit({
    _supportedKeys: function(e) {
        var _this = this;
        var originalHandlers = this.callBase(e);
        var callOriginalHandler = function(e) {
            return originalHandlers[(0, _utils.normalizeKeyName)(e)].apply(_this, [e])
        };
        var applyHandler = function(e, maskHandler) {
            if (_this._shouldUseOriginalHandler(e)) {
                return callOriginalHandler.apply(_this, [e])
            } else {
                return maskHandler.apply(_this, [e])
            }
        };
        return (0, _extend.extend)({}, originalHandlers, {
            del: function(e) {
                return applyHandler(e, function(event) {
                    _this._revertPart(FORWARD);
                    _this._isAllSelected() || event.preventDefault()
                })
            },
            backspace: function(e) {
                return applyHandler(e, function(event) {
                    _this._revertPart(BACKWARD);
                    _this._isAllSelected() || event.preventDefault()
                })
            },
            home: function(e) {
                return applyHandler(e, function(event) {
                    _this._selectFirstPart();
                    event.preventDefault()
                })
            },
            end: function(e) {
                return applyHandler(e, function(event) {
                    _this._selectLastPart();
                    event.preventDefault()
                })
            },
            escape: function(e) {
                return applyHandler(e, function(event) {
                    _this._revertChanges(event)
                })
            },
            enter: function(e) {
                return applyHandler(e, function(event) {
                    _this._enterHandler(event)
                })
            },
            leftArrow: function(e) {
                return applyHandler(e, function(event) {
                    _this._selectNextPart(BACKWARD);
                    event.preventDefault()
                })
            },
            rightArrow: function(e) {
                return applyHandler(e, function(event) {
                    _this._selectNextPart(FORWARD);
                    event.preventDefault()
                })
            },
            upArrow: function(e) {
                return applyHandler(e, function(event) {
                    _this._upDownArrowHandler(FORWARD);
                    event.preventDefault()
                })
            },
            downArrow: function(e) {
                return applyHandler(e, function(event) {
                    _this._upDownArrowHandler(BACKWARD);
                    event.preventDefault()
                })
            }
        })
    },
    _shouldUseOriginalHandler: function(e) {
        return !this._useMaskBehavior() || this.option("opened") || e && e.altKey
    },
    _upDownArrowHandler: function(step) {
        this._setNewDateIfEmpty();
        var originalValue = this._getActivePartValue(this._initialMaskValue);
        var currentValue = this._getActivePartValue();
        var delta = currentValue - originalValue;
        this._loadMaskValue(this._initialMaskValue);
        this._partIncrease(delta + step)
    },
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            useMaskBehavior: false,
            emptyDateValue: new Date(2e3, 0, 1, 0, 0, 0),
            advanceCaret: true
        })
    },
    _isSingleCharKey: function(e) {
        var key = e.originalEvent.key;
        return "string" === typeof key && 1 === key.length && !e.ctrl && !e.alt
    },
    _keyboardHandler: function(e) {
        var key = e.originalEvent.key;
        var result = this.callBase(e);
        if (!this._useMaskBehavior() || !this._isSingleCharKey(e)) {
            return result
        }
        if (this._isAllSelected()) {
            this._activePartIndex = 0
        }
        this._setNewDateIfEmpty();
        isNaN(parseInt(key)) ? this._searchString(key) : this._searchNumber(key);
        e.originalEvent.preventDefault();
        return result
    },
    _isAllSelected: function() {
        var caret = this._caret();
        return caret.end - caret.start === this.option("text").length
    },
    _getFormatPattern: function() {
        if (this._formatPattern) {
            return this._formatPattern
        }
        var format = this._strategy.getDisplayFormat(this.option("displayFormat"));
        var isLDMLPattern = (0, _type.isString)(format) && !_date2.default._getPatternByFormat(format);
        if (isLDMLPattern) {
            this._formatPattern = format
        } else {
            this._formatPattern = (0, _date4.getFormat)(function(value) {
                return _date2.default.format(value, format)
            })
        }
        return this._formatPattern
    },
    _setNewDateIfEmpty: function() {
        if (!this._maskValue) {
            this._maskValue = new Date;
            this._initialMaskValue = new Date;
            this._renderDateParts()
        }
    },
    _searchNumber: function(char) {
        var _getActivePartLimits = this._getActivePartLimits(),
            max = _getActivePartLimits.max;
        var maxLimitLength = String(max).length;
        var formatLength = this._getActivePartProp("pattern").length;
        this._searchValue = (this._searchValue + char).substr(-maxLimitLength);
        if (isNaN(this._searchValue)) {
            this._searchValue = char
        }
        this._setActivePartValue(this._searchValue);
        if (this.option("advanceCaret")) {
            var isShortFormat = 1 === formatLength;
            var maxSearchLength = isShortFormat ? maxLimitLength : Math.min(formatLength, maxLimitLength);
            var isLengthExceeded = this._searchValue.length === maxSearchLength;
            var isValueOverflowed = parseInt(this._searchValue + "0") > max;
            if (isLengthExceeded || isValueOverflowed) {
                this._selectNextPart(FORWARD)
            }
        }
    },
    _searchString: function(char) {
        if (!isNaN(parseInt(this._getActivePartProp("text")))) {
            return
        }
        var limits = this._getActivePartProp("limits")(this._maskValue),
            startString = this._searchValue + char.toLowerCase(),
            endLimit = limits.max - limits.min;
        for (var i = 0; i <= endLimit; i++) {
            this._loadMaskValue(this._initialMaskValue);
            this._partIncrease(i + 1);
            if (0 === this._getActivePartProp("text").toLowerCase().indexOf(startString)) {
                this._searchValue = startString;
                return
            }
        }
        this._setNewDateIfEmpty();
        if (this._searchValue) {
            this._clearSearchValue();
            this._searchString(char)
        }
    },
    _clearSearchValue: function() {
        this._searchValue = ""
    },
    _revertPart: function(direction) {
        if (!this._isAllSelected()) {
            var actual = this._getActivePartValue(this.option("emptyDateValue"));
            this._setActivePartValue(actual);
            this._selectNextPart(direction)
        }
        this._clearSearchValue()
    },
    _useMaskBehavior: function() {
        return this.option("useMaskBehavior") && "text" === this.option("mode")
    },
    _initMaskState: function() {
        this._activePartIndex = 0;
        this._formatPattern = null;
        this._regExpInfo = (0, _date3.getRegExpInfo)(this._getFormatPattern(), _date2.default);
        this._loadMaskValue()
    },
    _renderMask: function() {
        this.callBase();
        this._detachMaskEvents();
        this._clearMaskState();
        if (this._useMaskBehavior()) {
            this._attachMaskEvents();
            this._initMaskState();
            this._renderDateParts()
        }
    },
    _renderDateParts: function() {
        if (!this._useMaskBehavior()) {
            return
        }
        var text = this.option("text") || this._getDisplayedText(this._maskValue);
        if (text) {
            this._dateParts = (0, _uiDate_boxMask.renderDateParts)(text, this._regExpInfo);
            this._selectNextPart()
        }
    },
    _detachMaskEvents: function() {
        _events_engine2.default.off(this._input(), "." + MASK_EVENT_NAMESPACE)
    },
    _attachMaskEvents: function() {
        var _this2 = this;
        _events_engine2.default.on(this._input(), (0, _utils.addNamespace)("dxclick", MASK_EVENT_NAMESPACE), this._maskClickHandler.bind(this));
        _events_engine2.default.on(this._input(), (0, _utils.addNamespace)("paste", MASK_EVENT_NAMESPACE), this._maskPasteHandler.bind(this));
        _events_engine2.default.on(this._input(), (0, _utils.addNamespace)("drop", MASK_EVENT_NAMESPACE), function() {
            _this2._renderDisplayText(_this2._getDisplayedText(_this2._maskValue));
            _this2._selectNextPart()
        })
    },
    _selectLastPart: function() {
        if (this.option("text")) {
            this._activePartIndex = this._dateParts.length;
            this._selectNextPart(BACKWARD)
        }
    },
    _selectFirstPart: function() {
        if (this.option("text")) {
            this._activePartIndex = -1;
            this._selectNextPart(FORWARD)
        }
    },
    _onMouseWheel: function(e) {
        if (this._useMaskBehavior()) {
            this._partIncrease(e.delta > 0 ? FORWARD : BACKWARD, e)
        }
    },
    _selectNextPart: function() {
        var step = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
        if (!this.option("text")) {
            return
        }
        if (step) {
            this._initialMaskValue = new Date(this._maskValue)
        }
        var index = (0, _math.fitIntoRange)(this._activePartIndex + step, 0, this._dateParts.length - 1);
        if (this._dateParts[index].isStub) {
            var isBoundaryIndex = 0 === index && step < 0 || index === this._dateParts.length - 1 && step > 0;
            if (!isBoundaryIndex) {
                this._selectNextPart(step >= 0 ? step + 1 : step - 1);
                return
            } else {
                index = this._activePartIndex
            }
        }
        if (this._activePartIndex !== index) {
            this._clearSearchValue()
        }
        this._activePartIndex = index;
        this._caret(this._getActivePartProp("caret"))
    },
    _getActivePartLimits: function() {
        var limitFunction = this._getActivePartProp("limits");
        return limitFunction(this._maskValue)
    },
    _getActivePartValue: function(dateValue) {
        dateValue = dateValue || this._maskValue;
        var getter = this._getActivePartProp("getter");
        return (0, _type.isFunction)(getter) ? getter(dateValue) : dateValue[getter]()
    },
    _addLeadingZeroes: function(value) {
        var zeroes = this._searchValue.match(/^0+/),
            limits = this._getActivePartLimits(),
            maxLimitLength = String(limits.max).length;
        return ((zeroes && zeroes[0] || "") + String(value)).substr(-maxLimitLength)
    },
    _setActivePartValue: function(value, dateValue) {
        dateValue = dateValue || this._maskValue;
        var setter = this._getActivePartProp("setter"),
            limits = this._getActivePartLimits();
        value = (0, _math.inRange)(value, limits.min, limits.max) ? value : value % 10;
        value = this._addLeadingZeroes((0, _math.fitIntoRange)(value, limits.min, limits.max));
        (0, _type.isFunction)(setter) ? setter(dateValue, value): dateValue[setter](value);
        this._renderDisplayText(this._getDisplayedText(dateValue));
        this._renderDateParts()
    },
    _getActivePartProp: function(property) {
        if (!this._dateParts || !this._dateParts[this._activePartIndex]) {
            return
        }
        return this._dateParts[this._activePartIndex][property]
    },
    _loadMaskValue: function() {
        var value = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.dateOption("value");
        this._maskValue = value && new Date(value);
        this._initialMaskValue = value && new Date(value)
    },
    _saveMaskValue: function() {
        var value = this._maskValue && new Date(this._maskValue);
        this._initialMaskValue = new Date(value);
        this.dateOption("value", value)
    },
    _revertChanges: function() {
        this._loadMaskValue();
        this._renderDisplayText(this._getDisplayedText(this._maskValue));
        this._renderDateParts()
    },
    _renderDisplayText: function(text) {
        this.callBase(text);
        if (this._useMaskBehavior()) {
            this.option("text", text)
        }
    },
    _partIncrease: function(step) {
        this._setNewDateIfEmpty();
        var _getActivePartLimits2 = this._getActivePartLimits(),
            max = _getActivePartLimits2.max,
            min = _getActivePartLimits2.min;
        var limitDelta = max - min;
        if (1 === limitDelta) {
            limitDelta++
        }
        var newValue = step + this._getActivePartValue();
        if (newValue > max) {
            newValue = this._applyLimits(newValue, {
                limitBase: min,
                limitClosest: max,
                limitDelta: limitDelta
            })
        } else {
            if (newValue < min) {
                newValue = this._applyLimits(newValue, {
                    limitBase: max,
                    limitClosest: min,
                    limitDelta: limitDelta
                })
            }
        }
        this._setActivePartValue(newValue)
    },
    _applyLimits: function(newValue, _ref) {
        var limitBase = _ref.limitBase,
            limitClosest = _ref.limitClosest,
            limitDelta = _ref.limitDelta;
        var delta = (newValue - limitClosest) % limitDelta;
        return delta ? limitBase + delta - 1 * (0, _math.sign)(delta) : limitClosest
    },
    _maskClickHandler: function() {
        if (this.option("text")) {
            this._activePartIndex = (0, _uiDate_boxMask.getDatePartIndexByPosition)(this._dateParts, this._caret().start);
            this._caret(this._getActivePartProp("caret"))
        }
    },
    _maskPasteHandler: function(e) {
        var newText = this._replaceSelectedText(this.option("text"), this._caret(), (0, _dom.clipboardText)(e));
        var date = _date2.default.parse(newText, this._getFormatPattern());
        if (date) {
            this._maskValue = date;
            this._renderDisplayText(this._getDisplayedText(this._maskValue));
            this._renderDateParts();
            this._selectNextPart()
        }
        e.preventDefault()
    },
    _isValueDirty: function() {
        var value = this.dateOption("value");
        return (this._maskValue && this._maskValue.getTime()) !== (value && value.getTime())
    },
    _fireChangeEvent: function() {
        this._clearSearchValue();
        if (this._isValueDirty()) {
            _events_engine2.default.trigger(this._input(), "change")
        }
    },
    _enterHandler: function(e) {
        this._fireChangeEvent();
        this._selectNextPart(FORWARD);
        e.preventDefault()
    },
    _focusOutHandler: function(e) {
        this.callBase(e);
        if (this._useMaskBehavior()) {
            this._fireChangeEvent();
            this._selectFirstPart(e)
        }
    },
    _valueChangeEventHandler: function(e) {
        if (this._useMaskBehavior()) {
            this._saveValueChangeEvent(e);
            if (!this.option("text")) {
                this._maskValue = null
            }
            this._saveMaskValue()
        } else {
            this.callBase(e)
        }
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "useMaskBehavior":
                this._renderMask();
                break;
            case "displayFormat":
            case "mode":
                this.callBase(args);
                this._renderMask();
                break;
            case "value":
                this._loadMaskValue();
                this.callBase(args);
                this._renderDateParts();
                break;
            case "advanceCaret":
            case "emptyDateValue":
                break;
            default:
                this.callBase(args)
        }
    },
    _clearMaskState: function() {
        this._clearSearchValue();
        delete this._dateParts;
        delete this._activePartIndex;
        delete this._maskValue
    },
    reset: function() {
        this.callBase();
        this._clearMaskState();
        this._activePartIndex = 0
    },
    _clean: function() {
        this.callBase();
        this._detachMaskEvents();
        this._clearMaskState()
    }
});
module.exports = DateBoxMask;
