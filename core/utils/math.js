/**
 * DevExtreme (core/utils/math.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var isExponential = require("./type").isExponential;
var sign = function(value) {
    if (0 === value) {
        return 0
    }
    return value / Math.abs(value)
};
var fitIntoRange = function(value, minValue, maxValue) {
    var isMinValueUndefined = !minValue && 0 !== minValue,
        isMaxValueUndefined = !maxValue && 0 !== maxValue;
    isMinValueUndefined && (minValue = !isMaxValueUndefined ? Math.min(value, maxValue) : value);
    isMaxValueUndefined && (maxValue = !isMinValueUndefined ? Math.max(value, minValue) : value);
    return Math.min(Math.max(value, minValue), maxValue)
};
var inRange = function(value, minValue, maxValue) {
    return value >= minValue && value <= maxValue
};

function getExponent(value) {
    return Math.abs(parseInt(value.toExponential().split("e")[1]))
}

function _isEdgeBug() {
    var value = 3e-4,
        correctValue = "0.000300",
        precisionValue = 3;
    return correctValue !== value.toPrecision(precisionValue)
}

function adjust(value, interval) {
    var separatedAdjustedValue, precision = getPrecision(interval || 0) + 2,
        separatedValue = value.toString().split("."),
        sourceValue = value,
        absValue = Math.abs(value),
        isExponentValue = isExponential(value),
        integerPart = absValue > 1 ? 10 : 0;
    if (1 === separatedValue.length) {
        return value
    }
    if (!isExponentValue) {
        if (isExponential(interval)) {
            precision = separatedValue[0].length + getExponent(interval)
        }
        value = absValue;
        value = value - Math.floor(value) + integerPart
    }
    precision = _isEdgeBug() && getExponent(value) > 6 || precision > 7 ? 15 : 7;
    if (!isExponentValue) {
        separatedAdjustedValue = parseFloat(value.toPrecision(precision)).toString().split(".");
        if (separatedAdjustedValue[0] === integerPart.toString()) {
            return parseFloat(separatedValue[0] + "." + separatedAdjustedValue[1])
        }
    }
    return parseFloat(sourceValue.toPrecision(precision))
}

function getPrecision(value) {
    var mantissa, positionOfDelimiter, str = value.toString();
    if (str.indexOf(".") < 0) {
        return 0
    }
    mantissa = str.split(".");
    positionOfDelimiter = mantissa[1].indexOf("e");
    return positionOfDelimiter >= 0 ? positionOfDelimiter : mantissa[1].length
}
exports.sign = sign;
exports.fitIntoRange = fitIntoRange;
exports.inRange = inRange;
exports.adjust = adjust;
exports.getPrecision = getPrecision;
exports.getExponent = getExponent;
