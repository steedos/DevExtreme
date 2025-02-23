/**
 * DevExtreme (localization/utils.js)
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
exports.toFixed = void 0;
var _math = require("../core/utils/math");
var DECIMAL_BASE = 10;

function roundByAbs(value) {
    var valueSign = (0, _math.sign)(value);
    return valueSign * Math.round(Math.abs(value))
}

function adjustValue(value, precision) {
    var precisionMultiplier = Math.pow(DECIMAL_BASE, precision);
    var roundMultiplier = precisionMultiplier * DECIMAL_BASE;
    var intermediateValue = roundByAbs(value * roundMultiplier) / DECIMAL_BASE;
    return roundByAbs(intermediateValue) / precisionMultiplier
}

function toFixed(value, precision) {
    var valuePrecision = precision || 0;
    var adjustedValue = valuePrecision > 0 ? adjustValue.apply(void 0, arguments) : value;
    return adjustedValue.toFixed(valuePrecision)
}
exports.toFixed = toFixed;
