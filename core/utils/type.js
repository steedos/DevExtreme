/**
 * DevExtreme (core/utils/type.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
    return typeof obj
} : function(obj) {
    return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
};
var types = {
    "[object Array]": "array",
    "[object Date]": "date",
    "[object Object]": "object",
    "[object String]": "string",
    "[object Null]": "null"
};
var type = function(object) {
    var typeOfObject = Object.prototype.toString.call(object);
    return "object" === ("undefined" === typeof object ? "undefined" : _typeof(object)) ? types[typeOfObject] || "object" : "undefined" === typeof object ? "undefined" : _typeof(object)
};
var isBoolean = function(object) {
    return "boolean" === typeof object
};
var isExponential = function(value) {
    return isNumeric(value) && value.toString().indexOf("e") !== -1
};
var isDate = function(object) {
    return "date" === type(object)
};
var isDefined = function(object) {
    return null !== object && void 0 !== object
};
var isFunction = function(object) {
    return "function" === typeof object
};
var isString = function(object) {
    return "string" === typeof object
};
var isNumeric = function(object) {
    return "number" === typeof object && isFinite(object) || !isNaN(object - parseFloat(object))
};
var isObject = function(object) {
    return "object" === type(object)
};
var isEmptyObject = function(object) {
    var property;
    for (property in object) {
        return false
    }
    return true
};
var isPlainObject = function(object) {
    if (!object || "[object Object]" !== Object.prototype.toString.call(object)) {
        return false
    }
    var proto = Object.getPrototypeOf(object),
        ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return "function" === typeof ctor && Object.toString.call(ctor) === Object.toString.call(Object)
};
var isPrimitive = function(value) {
    return ["object", "array", "function"].indexOf(type(value)) === -1
};
var isWindow = function(object) {
    return null != object && object === object.window
};
var isRenderer = function(object) {
    return !!(object.jquery || object.dxRenderer)
};
var isPromise = function(object) {
    return object && isFunction(object.then)
};
var isDeferred = function(object) {
    return object && isFunction(object.done) && isFunction(object.fail)
};
exports.isBoolean = isBoolean;
exports.isExponential = isExponential;
exports.isDate = isDate;
exports.isDefined = isDefined;
exports.isFunction = isFunction;
exports.isString = isString;
exports.isNumeric = isNumeric;
exports.isObject = isObject;
exports.isEmptyObject = isEmptyObject;
exports.isPlainObject = isPlainObject;
exports.isPrimitive = isPrimitive;
exports.isWindow = isWindow;
exports.isRenderer = isRenderer;
exports.isPromise = isPromise;
exports.isDeferred = isDeferred;
exports.type = type;
