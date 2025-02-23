/**
 * DevExtreme (ui/date_box/ui.date_box.base.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    windowUtils = require("../../core/utils/window"),
    window = windowUtils.getWindow(),
    registerComponent = require("../../core/component_registrator"),
    typeUtils = require("../../core/utils/type"),
    each = require("../../core/utils/iterator").each,
    compareVersions = require("../../core/utils/version").compare,
    extend = require("../../core/utils/extend").extend,
    support = require("../../core/utils/support"),
    devices = require("../../core/devices"),
    config = require("../../core/config"),
    dateUtils = require("../../core/utils/date"),
    uiDateUtils = require("./ui.date_utils"),
    dateSerialization = require("../../core/utils/date_serialization"),
    DropDownEditor = require("../drop_down_editor/ui.drop_down_editor"),
    dateLocalization = require("../../localization/date"),
    messageLocalization = require("../../localization/message"),
    DATEBOX_CLASS = "dx-datebox",
    DX_AUTO_WIDTH_CLASS = "dx-auto-width",
    DATEBOX_WRAPPER_CLASS = "dx-datebox-wrapper";
var PICKER_TYPE = {
    calendar: "calendar",
    rollers: "rollers",
    list: "list",
    "native": "native"
};
var TYPE = {
    date: "date",
    datetime: "datetime",
    time: "time"
};
var STRATEGY_NAME = {
    calendar: "Calendar",
    dateView: "DateView",
    "native": "Native",
    calendarWithTime: "CalendarWithTime",
    list: "List"
};
var STRATEGY_CLASSES = {
    Calendar: require("./ui.date_box.strategy.calendar"),
    DateView: require("./ui.date_box.strategy.date_view"),
    Native: require("./ui.date_box.strategy.native"),
    CalendarWithTime: require("./ui.date_box.strategy.calendar_with_time"),
    List: require("./ui.date_box.strategy.list")
};
var isRealWidthSet = function($element) {
    var explicitWidth = $element[0].style.width;
    if (explicitWidth && "auto" !== explicitWidth && "inherit" !== explicitWidth) {
        return true
    }
    return false
};
var calculateWidth = function(value, $input, $element) {
    var IE_ROUNDING_ERROR = 10;
    var NATIVE_BUTTONS_WIDTH = 48;
    var $longestValueElement = $("<div>").text(value).css({
        fontStyle: $input.css("fontStyle"),
        fontVariant: $input.css("fontVariant"),
        fontWeight: $input.css("fontWeight"),
        fontSize: $input.css("fontSize"),
        fontFamily: $input.css("fontFamily"),
        letterSpacing: $input.css("letterSpacing"),
        border: $input.css("border"),
        visibility: "hidden",
        whiteSpace: "nowrap",
        position: "absolute",
        "float": "left"
    });
    $longestValueElement.appendTo($element);
    var elementWidth = parseFloat(window.getComputedStyle($longestValueElement.get(0)).width),
        rightPadding = parseFloat(window.getComputedStyle($input.get(0)).paddingRight),
        leftPadding = parseFloat(window.getComputedStyle($input.get(0)).paddingLeft);
    var width = elementWidth + rightPadding + leftPadding + IE_ROUNDING_ERROR + ("text" !== $input.prop("type") ? NATIVE_BUTTONS_WIDTH : 0);
    $longestValueElement.remove();
    return width
};
var DateBox = DropDownEditor.inherit({
    _supportedKeys: function() {
        return extend(this.callBase(), this._strategy.supportedKeys())
    },
    _setDeprecatedOptions: function() {
        this.callBase();
        extend(this._deprecatedOptions, {
            maxZoomLevel: {
                since: "18.1",
                alias: "calendarOptions.maxZoomLevel"
            },
            minZoomLevel: {
                since: "18.1",
                alias: "calendarOptions.minZoomLevel"
            }
        })
    },
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            type: "date",
            showAnalogClock: true,
            value: null,
            dateSerializationFormat: void 0,
            min: void 0,
            max: void 0,
            displayFormat: null,
            interval: 30,
            disabledDates: null,
            maxZoomLevel: "month",
            minZoomLevel: "century",
            pickerType: PICKER_TYPE.calendar,
            invalidDateMessage: messageLocalization.format("dxDateBox-validation-datetime"),
            dateOutOfRangeMessage: messageLocalization.format("validation-range"),
            applyButtonText: messageLocalization.format("Done"),
            adaptivityEnabled: false,
            calendarOptions: {}
        })
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: {
                platform: "ios"
            },
            options: {
                showPopupTitle: true
            }
        }, {
            device: {
                platform: "android"
            },
            options: {
                buttonsLocation: "bottom after"
            }
        }, {
            device: function() {
                var realDevice = devices.real(),
                    platform = realDevice.platform;
                return "ios" === platform || "android" === platform
            },
            options: {
                pickerType: PICKER_TYPE.native
            }
        }, {
            device: function(_device) {
                return "win" === _device.platform && _device.version && 8 === _device.version[0]
            },
            options: {
                buttonsLocation: "bottom after"
            }
        }, {
            device: function(_device2) {
                return "win" === _device2.platform && _device2.version && 10 === _device2.version[0]
            },
            options: {
                buttonsLocation: "bottom center"
            }
        }, {
            device: function(currentDevice) {
                var realDevice = devices.real(),
                    platform = realDevice.platform,
                    version = realDevice.version,
                    isPhone = realDevice.phone;
                return "generic" === platform && "desktop" !== currentDevice.deviceType || "win" === platform && isPhone || "android" === platform && compareVersions(version, [4, 4]) < 0
            },
            options: {
                pickerType: PICKER_TYPE.rollers
            }
        }, {
            device: {
                platform: "generic",
                deviceType: "desktop"
            },
            options: {
                buttonsLocation: "bottom after"
            }
        }])
    },
    _initOptions: function(options) {
        this._userOptions = extend({}, options);
        this.callBase(options);
        this._updatePickerOptions()
    },
    _updatePickerOptions: function() {
        var pickerType = this.option("pickerType");
        var type = this.option("type");
        if (pickerType === PICKER_TYPE.list && (type === TYPE.datetime || type === TYPE.date)) {
            pickerType = PICKER_TYPE.calendar
        }
        if (type === TYPE.time && pickerType === PICKER_TYPE.calendar) {
            pickerType = PICKER_TYPE.list
        }
        this.option("showDropDownButton", "generic" !== devices.real().platform || pickerType !== PICKER_TYPE.native);
        this._pickerType = pickerType
    },
    _init: function() {
        this._initStrategy();
        this.option(extend({}, this._strategy.getDefaultOptions(), this._userOptions));
        delete this._userOptions;
        this.callBase()
    },
    _toLowerCaseFirstLetter: function(string) {
        return string.charAt(0).toLowerCase() + string.substr(1)
    },
    _initStrategy: function() {
        var strategyName = this._getStrategyName(this._getFormatType()),
            strategy = STRATEGY_CLASSES[strategyName];
        if (!(this._strategy && this._strategy.NAME === strategyName)) {
            this._strategy = new strategy(this)
        }
    },
    _getFormatType: function() {
        var currentType = this.option("type");
        var isTime = /h|m|s/g.test(currentType),
            isDate = /d|M|Y/g.test(currentType);
        var type = "";
        if (isDate) {
            type += TYPE.date
        }
        if (isTime) {
            type += TYPE.time
        }
        return type
    },
    _getStrategyName: function(type) {
        var pickerType = this._pickerType;
        if (pickerType === PICKER_TYPE.rollers) {
            return STRATEGY_NAME.dateView
        } else {
            if (pickerType === PICKER_TYPE.native) {
                return STRATEGY_NAME.native
            }
        }
        if (type === TYPE.date) {
            return STRATEGY_NAME.calendar
        }
        if (type === TYPE.datetime) {
            return STRATEGY_NAME.calendarWithTime
        }
        return STRATEGY_NAME.list
    },
    _initMarkup: function() {
        this.$element().addClass(DATEBOX_CLASS);
        this._renderSubmitElement();
        this.callBase();
        this._refreshFormatClass();
        this._refreshPickerTypeClass();
        this._strategy.renderInputMinMax(this._input())
    },
    _render: function() {
        this.callBase();
        this._updateSize()
    },
    _renderDimensions: function() {
        this.callBase();
        this.$element().toggleClass(DX_AUTO_WIDTH_CLASS, !this.option("width"))
    },
    _refreshFormatClass: function() {
        var $element = this.$element();
        each(TYPE, function(_, item) {
            $element.removeClass(DATEBOX_CLASS + "-" + item)
        });
        $element.addClass(DATEBOX_CLASS + "-" + this.option("type"))
    },
    _refreshPickerTypeClass: function() {
        var $element = this.$element();
        each(PICKER_TYPE, function(_, item) {
            $element.removeClass(DATEBOX_CLASS + "-" + item)
        });
        $element.addClass(DATEBOX_CLASS + "-" + this._pickerType)
    },
    _renderSubmitElement: function() {
        this._$submitElement = $("<input>").attr("type", "hidden").appendTo(this.$element())
    },
    _getSubmitElement: function() {
        return this._$submitElement
    },
    _updateSize: function() {
        var $element = this.$element(),
            widthOption = this.option("width"),
            isWidthSet = typeUtils.isDefined(widthOption) || isRealWidthSet($element) && !this._isSizeUpdatable,
            pickerType = this._pickerType,
            shouldCalculateWidth = pickerType !== PICKER_TYPE.rollers && "generic" === devices.current().platform;
        if (!windowUtils.hasWindow() || isWidthSet || !(shouldCalculateWidth && $element.is(":visible"))) {
            return
        }
        var $input = this._input(),
            format = this._strategy.getDisplayFormat(this.option("displayFormat")),
            longestValue = dateLocalization.format(uiDateUtils.getLongestDate(format, dateLocalization.getMonthNames(), dateLocalization.getDayNames()), format);
        $element.width(calculateWidth(longestValue, $input, this.$element()));
        this._isSizeUpdatable = true
    },
    _attachChildKeyboardEvents: function() {
        this._strategy.attachKeyboardEvents(this._keyboardProcessor)
    },
    _renderPopup: function() {
        this.callBase();
        this._popup._wrapper().addClass(DATEBOX_WRAPPER_CLASS);
        this._renderPopupWrapper()
    },
    _popupConfig: function() {
        var popupConfig = this.callBase();
        return extend(this._strategy.popupConfig(popupConfig), {
            title: this._getPopupTitle(),
            dragEnabled: false
        })
    },
    _renderPopupWrapper: function() {
        if (!this._popup) {
            return
        }
        var $element = this.$element();
        var classPostfixes = extend({}, TYPE, PICKER_TYPE);
        each(classPostfixes, function(_, item) {
            $element.removeClass(DATEBOX_WRAPPER_CLASS + "-" + item)
        }.bind(this));
        this._popup._wrapper().addClass(DATEBOX_WRAPPER_CLASS + "-" + this.option("type")).addClass(DATEBOX_WRAPPER_CLASS + "-" + this._pickerType)
    },
    _renderPopupContent: function() {
        this.callBase();
        this._strategy.renderPopupContent()
    },
    _getFirstPopupElement: function() {
        return this._strategy.getFirstPopupElement() || this.callBase()
    },
    _getLastPopupElement: function() {
        return this._strategy.getLastPopupElement() || this.callBase()
    },
    _popupShowingHandler: function() {
        this.callBase();
        this._strategy.popupShowingHandler()
    },
    _popupHiddenHandler: function() {
        this.callBase();
        this._strategy.popupHiddenHandler()
    },
    _visibilityChanged: function(visible) {
        if (visible) {
            this._updateSize()
        }
    },
    _clearValueHandler: function(e) {
        this.option("text", "");
        this.callBase(e)
    },
    _readOnlyPropValue: function() {
        return this.callBase() && !this._isNativeType() || this._pickerType === PICKER_TYPE.rollers
    },
    _clearButtonVisibility: function() {
        return this.callBase() && !this._isNativeType()
    },
    _renderValue: function() {
        var value = this.dateOption("value"),
            dateSerializationFormat = this.option("dateSerializationFormat");
        this.option("text", this._getDisplayedText(value));
        var submitFormat = uiDateUtils.SUBMIT_FORMATS_MAP[this.option("type")];
        var submitValue = dateSerializationFormat ? dateSerialization.serializeDate(value, dateSerializationFormat) : uiDateUtils.toStandardDateFormat(value, submitFormat);
        this._$submitElement.val(submitValue);
        this._strategy.renderValue();
        this.callBase()
    },
    _getDisplayedText: function(value) {
        var displayedText, mode = this.option("mode");
        if ("text" === mode) {
            var displayFormat = this._strategy.getDisplayFormat(this.option("displayFormat"));
            displayedText = dateLocalization.format(value, displayFormat)
        } else {
            var format = this._getFormatByMode(mode);
            if (format) {
                displayedText = dateLocalization.format(value, format)
            } else {
                displayedText = uiDateUtils.toStandardDateFormat(value, mode)
            }
        }
        return displayedText
    },
    _getFormatByMode: function(mode) {
        return support.inputType(mode) ? null : uiDateUtils.FORMATS_MAP[mode]
    },
    _valueChangeEventHandler: function(e) {
        var text = this.option("text"),
            currentValue = this.dateOption("value");
        if (text === this._getDisplayedText(currentValue)) {
            this._validateValue(currentValue);
            return
        }
        var parsedDate = this._getParsedDate(text),
            value = currentValue || this._getDateByDefault(),
            type = this.option("type"),
            newValue = uiDateUtils.mergeDates(value, parsedDate, type),
            date = parsedDate && "time" === type ? newValue : parsedDate;
        if (this._applyInternalValidation(date)) {
            var displayedText = this._getDisplayedText(newValue);
            if (value && newValue && value.getTime() === newValue.getTime() && displayedText !== text) {
                this._renderValue()
            } else {
                this.dateValue(newValue, e)
            }
        }
        this._applyCustomValidation(newValue)
    },
    _getDateByDefault: function() {
        return this._strategy.useCurrentDateByDefault() && new Date
    },
    _getParsedDate: function(text) {
        var displayFormat = this._strategy.getDisplayFormat(this.option("displayFormat"));
        var parsedText = this._strategy.getParsedText(text, displayFormat);
        return typeUtils.isDefined(parsedText) ? parsedText : void 0
    },
    _validateValue: function(value) {
        return this._applyInternalValidation(value) && this._applyCustomValidation(value)
    },
    _applyInternalValidation: function(value) {
        var text = this.option("text"),
            hasText = !!text && null !== value,
            isDate = !!value && typeUtils.isDate(value) && !isNaN(value.getTime()),
            isDateInRange = isDate && dateUtils.dateInRange(value, this.dateOption("min"), this.dateOption("max"), this.option("type")),
            isValid = !hasText && !value || isDateInRange,
            validationMessage = "";
        if (!isDate) {
            validationMessage = this.option("invalidDateMessage")
        } else {
            if (!isDateInRange) {
                validationMessage = this.option("dateOutOfRangeMessage")
            }
        }
        this.option({
            isValid: isValid,
            validationError: isValid ? null : {
                editorSpecific: true,
                message: validationMessage
            }
        });
        return isValid
    },
    _applyCustomValidation: function(value) {
        this.validationRequest.fire({
            editor: this,
            value: value
        });
        return this.option("isValid")
    },
    _isValueChanged: function(newValue) {
        var oldValue = this.dateOption("value"),
            oldTime = oldValue && oldValue.getTime(),
            newTime = newValue && newValue.getTime();
        return oldTime !== newTime
    },
    _isTextChanged: function(newValue) {
        var oldText = this.option("text"),
            newText = newValue && this._getDisplayedText(newValue) || "";
        return oldText !== newText
    },
    _renderProps: function() {
        this.callBase();
        this._input().attr("autocomplete", "off")
    },
    _renderOpenedState: function() {
        if (!this._isNativeType()) {
            this.callBase()
        }
        if (this._strategy.isAdaptivityChanged()) {
            this._refreshStrategy()
        }
        this._strategy.renderOpenedState()
    },
    _getPopupTitle: function() {
        var placeholder = this.option("placeholder");
        if (placeholder) {
            return placeholder
        }
        var type = this.option("type");
        if (type === TYPE.time) {
            return messageLocalization.format("dxDateBox-simulatedDataPickerTitleTime")
        }
        if (type === TYPE.date || type === TYPE.datetime) {
            return messageLocalization.format("dxDateBox-simulatedDataPickerTitleDate")
        }
        return ""
    },
    _renderPlaceholder: function() {
        this._popup && this._popup.option("title", this._getPopupTitle());
        this.callBase()
    },
    _refreshStrategy: function() {
        this._strategy.dispose();
        this._initStrategy();
        this.option(this._strategy.getDefaultOptions());
        this._refresh()
    },
    _applyButtonHandler: function(e) {
        var value = this._strategy.getValue();
        if (this._validateValue(value)) {
            this.dateValue(value, e.event)
        }
        this.callBase()
    },
    _dispose: function() {
        this._strategy && this._strategy.dispose();
        this.callBase()
    },
    _isNativeType: function() {
        return this._pickerType === PICKER_TYPE.native
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "showClearButton":
                this.callBase.apply(this, arguments);
                this._updateSize();
                break;
            case "pickerType":
                this._updatePickerOptions({
                    pickerType: args.value
                });
                this._refreshStrategy();
                this._refreshPickerTypeClass();
                this._invalidate();
                break;
            case "type":
                this._updatePickerOptions({
                    format: args.value
                });
                this._refreshStrategy();
                this._refreshFormatClass();
                this._renderPopupWrapper();
                this._updateSize();
                break;
            case "placeholder":
                this._renderPlaceholder();
                break;
            case "min":
            case "max":
                this._applyInternalValidation(this.dateOption("value"));
                this._invalidate();
                break;
            case "dateSerializationFormat":
            case "interval":
            case "disabledDates":
            case "calendarOptions":
            case "minZoomLevel":
            case "maxZoomLevel":
                this._invalidate();
                break;
            case "displayFormat":
                this.option("text", this._getDisplayedText(this.dateOption("value")));
                this._renderInputValue();
                break;
            case "formatWidthCalculator":
                break;
            case "closeOnValueChange":
                var applyValueMode = args.value ? "instantly" : "useButtons";
                this.option("applyValueMode", applyValueMode);
                break;
            case "applyValueMode":
                this._suppressDeprecatedWarnings();
                this.option("closeOnValueChange", "instantly" === args.value);
                this._resumeDeprecatedWarnings();
                this.callBase.apply(this, arguments);
                break;
            case "text":
                this._strategy.textChangedHandler(args.value);
                this.callBase.apply(this, arguments);
                break;
            case "isValid":
                this.callBase.apply(this, arguments);
                this._updateSize();
                break;
            case "showDropDownButton":
            case "invalidDateMessage":
            case "dateOutOfRangeMessage":
            case "adaptivityEnabled":
            case "showAnalogClock":
                break;
            default:
                this.callBase.apply(this, arguments)
        }
    },
    _getSerializationFormat: function() {
        var value = this.option("value");
        if (this.option("dateSerializationFormat") && config().forceIsoDateParsing) {
            return this.option("dateSerializationFormat")
        }
        if (typeUtils.isNumeric(value)) {
            return "number"
        }
        if (!typeUtils.isString(value)) {
            return
        }
        return dateSerialization.getDateSerializationFormat(value)
    },
    _updateValue: function(value) {
        this.callBase();
        this._validateValue(value || this.dateOption("value"))
    },
    dateValue: function(value, dxEvent) {
        var isValueChanged = this._isValueChanged(value);
        if (isValueChanged && dxEvent) {
            this._saveValueChangeEvent(dxEvent)
        }
        if (!isValueChanged && this._isTextChanged(value)) {
            this._updateValue(value)
        }
        return this.dateOption("value", value)
    },
    dateOption: function(optionName, value) {
        if (1 === arguments.length) {
            return dateSerialization.deserializeDate(this.option(optionName))
        }
        var serializationFormat = this._getSerializationFormat();
        this.option(optionName, dateSerialization.serializeDate(value, serializationFormat))
    },
    reset: function() {
        this.callBase();
        this._updateValue(this.dateOption("value"))
    }
});
registerComponent("dxDateBox", DateBox);
module.exports = DateBox;
