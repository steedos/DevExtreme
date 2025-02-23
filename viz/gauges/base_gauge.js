/**
 * DevExtreme (viz/gauges/base_gauge.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _Number = Number,
    _getAppropriateFormat = require("../core/utils").getAppropriateFormat,
    extend = require("../../core/utils/extend").extend,
    translator1DModule = require("../translators/translator1d"),
    _extend = extend,
    BaseWidget = require("../core/base_widget"),
    Tracker = require("./tracker");
var dxBaseGauge = BaseWidget.inherit({
    _rootClassPrefix: "dxg",
    _createThemeManager: function() {
        return new this._factory.ThemeManager
    },
    _initCore: function() {
        var that = this,
            root = that._renderer.root;
        that._valueChangingLocker = 0;
        that._translator = that._factory.createTranslator();
        that._tracker = that._factory.createTracker({
            renderer: that._renderer,
            container: root
        });
        that._setTrackerCallbacks()
    },
    _beginValueChanging: function() {
        this._resetIsReady();
        ++this._valueChangingLocker
    },
    _endValueChanging: function() {
        if (0 === --this._valueChangingLocker) {
            this._drawn()
        }
    },
    _setTrackerCallbacks: function() {
        var that = this,
            renderer = that._renderer,
            tooltip = that._tooltip;
        that._tracker.setCallbacks({
            "tooltip-show": function(target, info) {
                var tooltipParameters = target.getTooltipParameters(),
                    offset = renderer.getRootOffset(),
                    formatObject = _extend({
                        value: tooltipParameters.value,
                        valueText: tooltip.formatValue(tooltipParameters.value),
                        color: tooltipParameters.color
                    }, info);
                return tooltip.show(formatObject, {
                    x: tooltipParameters.x + offset.left,
                    y: tooltipParameters.y + offset.top,
                    offset: tooltipParameters.offset
                }, {
                    target: info
                })
            },
            "tooltip-hide": function() {
                return tooltip.hide()
            }
        })
    },
    _dispose: function() {
        this._cleanCore();
        this.callBase.apply(this, arguments)
    },
    _disposeCore: function() {
        var that = this;
        that._themeManager.dispose();
        that._tracker.dispose();
        that._translator = that._tracker = null
    },
    _cleanCore: function() {
        var that = this;
        that._tracker.deactivate();
        that._cleanContent()
    },
    _renderCore: function() {
        var that = this;
        if (!that._isValidDomain) {
            return
        }
        that._renderContent();
        that._tracker.setTooltipState(that._tooltip.isEnabled());
        that._tracker.activate();
        that._noAnimation = false
    },
    _applyChanges: function() {
        this.callBase.apply(this, arguments);
        this._resizing = this._noAnimation = false
    },
    _setContentSize: function() {
        var that = this;
        that._resizing = that._noAnimation = 2 === that._changes.count();
        that.callBase.apply(that, arguments)
    },
    _applySize: function(rect) {
        var that = this;
        that._innerRect = {
            left: rect[0],
            top: rect[1],
            right: rect[2],
            bottom: rect[3]
        };
        var layoutCache = that._layout._cache;
        that._cleanCore();
        that._renderCore();
        that._layout._cache = that._layout._cache || layoutCache;
        return [rect[0], that._innerRect.top, rect[2], that._innerRect.bottom]
    },
    _initialChanges: ["DOMAIN"],
    _themeDependentChanges: ["DOMAIN"],
    _optionChangesMap: {
        subtitle: "MOSTLY_TOTAL",
        indicator: "MOSTLY_TOTAL",
        geometry: "MOSTLY_TOTAL",
        animation: "MOSTLY_TOTAL",
        startValue: "DOMAIN",
        endValue: "DOMAIN"
    },
    _optionChangesOrder: ["DOMAIN", "MOSTLY_TOTAL"],
    _change_DOMAIN: function() {
        this._setupDomain()
    },
    _change_MOSTLY_TOTAL: function() {
        this._applyMostlyTotalChange()
    },
    _setupDomain: function() {
        var that = this;
        that._setupDomainCore();
        that._isValidDomain = isFinite(1 / (that._translator.getDomain()[1] - that._translator.getDomain()[0]));
        if (!that._isValidDomain) {
            that._incidentOccurred("W2301")
        }
        that._change(["MOSTLY_TOTAL"])
    },
    _applyMostlyTotalChange: function() {
        var that = this;
        that._setupCodomain();
        that._setupAnimationSettings();
        that._setupDefaultFormat();
        that._change(["LAYOUT"])
    },
    _setupAnimationSettings: function() {
        var that = this,
            option = that.option("animation");
        that._animationSettings = null;
        if (void 0 === option || option) {
            option = _extend({
                enabled: true,
                duration: 1e3,
                easing: "easeOutCubic"
            }, option);
            if (option.enabled && option.duration > 0) {
                that._animationSettings = {
                    duration: _Number(option.duration),
                    easing: option.easing
                }
            }
        }
        that._containerBackgroundColor = that.option("containerBackgroundColor") || that._themeManager.theme().containerBackgroundColor
    },
    _setupDefaultFormat: function() {
        var domain = this._translator.getDomain();
        this._defaultFormatOptions = _getAppropriateFormat(domain[0], domain[1], this._getApproximateScreenRange())
    },
    _setupDomainCore: null,
    _calculateSize: null,
    _cleanContent: null,
    _renderContent: null,
    _setupCodomain: null,
    _getApproximateScreenRange: null,
    _factory: {
        createTranslator: function() {
            return new translator1DModule.Translator1D
        },
        createTracker: function(parameters) {
            return new Tracker(parameters)
        }
    }
});
exports.dxBaseGauge = dxBaseGauge;
var _format = require("../../format_helper").format;
var formatValue = function(value, options, extra) {
    options = options || {};
    var formatObject, text = _format(value, options.format);
    if ("function" === typeof options.customizeText) {
        formatObject = _extend({
            value: value,
            valueText: text
        }, extra);
        return String(options.customizeText.call(formatObject, formatObject))
    }
    return text
};
var getSampleText = function(translator, options) {
    var text1 = formatValue(translator.getDomainStart(), options),
        text2 = formatValue(translator.getDomainEnd(), options);
    return text1.length >= text2.length ? text1 : text2
};
exports.formatValue = formatValue;
exports.getSampleText = getSampleText;
exports.compareArrays = function(array1, array2) {
    return array1 && array2 && array1.length === array2.length && compareArraysElements(array1, array2)
};

function compareArraysElements(array1, array2) {
    var i, array1ValueIsNaN, array2ValueIsNaN, ii = array1.length;
    for (i = 0; i < ii; ++i) {
        array1ValueIsNaN = array1[i] !== array1[i];
        array2ValueIsNaN = array2[i] !== array2[i];
        if (array1ValueIsNaN && array2ValueIsNaN) {
            continue
        }
        if (array1[i] !== array2[i]) {
            return false
        }
    }
    return true
}
dxBaseGauge.addPlugin(require("../core/export").plugin);
dxBaseGauge.addPlugin(require("../core/title").plugin);
dxBaseGauge.addPlugin(require("../core/tooltip").plugin);
dxBaseGauge.addPlugin(require("../core/loading_indicator").plugin);
var _setTooltipOptions = dxBaseGauge.prototype._setTooltipOptions;
dxBaseGauge.prototype._setTooltipOptions = function() {
    _setTooltipOptions.apply(this, arguments);
    this._tracker && this._tracker.setTooltipState(this._tooltip.isEnabled())
};
