/**
 * DevExtreme (core/utils/object.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var typeUtils = require("./type"),
    variableWrapper = require("./variable_wrapper");
var clone = function() {
    function Clone() {}
    return function(obj) {
        Clone.prototype = obj;
        return new Clone
    }
}();
var orderEach = function(map, func) {
    var key, i, keys = [];
    for (key in map) {
        if (map.hasOwnProperty(key)) {
            keys.push(key)
        }
    }
    keys.sort(function(x, y) {
        var isNumberX = typeUtils.isNumeric(x),
            isNumberY = typeUtils.isNumeric(y);
        if (isNumberX && isNumberY) {
            return x - y
        }
        if (isNumberX && !isNumberY) {
            return -1
        }
        if (!isNumberX && isNumberY) {
            return 1
        }
        if (x < y) {
            return -1
        }
        if (x > y) {
            return 1
        }
        return 0
    });
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        func(key, map[key])
    }
};
var assignValueToProperty = function(target, property, value, assignByReference) {
    if (!assignByReference && variableWrapper.isWrapped(target[property])) {
        variableWrapper.assign(target[property], value)
    } else {
        target[property] = value
    }
};
var deepExtendArraySafe = function deepExtendArraySafe(target, changes, extendComplexObject, assignByReference) {
    var prevValue, newValue;
    for (var name in changes) {
        prevValue = target[name];
        newValue = changes[name];
        if ("__proto__" === name || target === newValue) {
            continue
        }
        if (typeUtils.isPlainObject(newValue)) {
            var goDeeper = extendComplexObject ? typeUtils.isObject(prevValue) : typeUtils.isPlainObject(prevValue);
            newValue = deepExtendArraySafe(goDeeper ? prevValue : {}, newValue, extendComplexObject, assignByReference)
        }
        if (void 0 !== newValue && prevValue !== newValue) {
            assignValueToProperty(target, name, newValue, assignByReference)
        }
    }
    return target
};
exports.clone = clone;
exports.orderEach = orderEach;
exports.deepExtendArraySafe = deepExtendArraySafe;
