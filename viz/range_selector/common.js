/**
 * DevExtreme (viz/range_selector/common.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _format = require("../axes/smart_formatter").smartFormatter,
    isFunction = require("../../core/utils/type").isFunction,
    HEIGHT_COMPACT_MODE = 24,
    POINTER_SIZE = 4,
    EMPTY_SLIDER_MARKER_TEXT = ". . .";
var utils = {
    trackerSettings: {
        fill: "grey",
        stroke: "grey",
        opacity: 1e-4
    },
    animationSettings: {
        duration: 250
    }
};
var consts = {
    emptySliderMarkerText: EMPTY_SLIDER_MARKER_TEXT,
    pointerSize: POINTER_SIZE
};
var formatValue = function(value, formatOptions, tickIntervalsInfo, valueType, type, logarithmBase) {
    var formatObject = {
        value: value,
        valueText: _format(value, {
            labelOptions: formatOptions,
            ticks: tickIntervalsInfo ? tickIntervalsInfo.ticks : [],
            tickInterval: tickIntervalsInfo ? tickIntervalsInfo.tickInterval : void 0,
            dataType: valueType,
            type: type,
            logarithmBase: logarithmBase
        })
    };
    return String(isFunction(formatOptions.customizeText) ? formatOptions.customizeText.call(formatObject, formatObject) : formatObject.valueText)
};
exports.utils = utils;
exports.consts = consts;
exports.formatValue = formatValue;
exports.HEIGHT_COMPACT_MODE = HEIGHT_COMPACT_MODE;
