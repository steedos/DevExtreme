/**
 * DevExtreme (core/polyfills/promise.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var deferredUtils = require("../../core/utils/deferred"),
    windowUtils = require("../../core/utils/window"),
    Deferred = deferredUtils.Deferred,
    when = deferredUtils.when,
    promise = windowUtils.hasWindow() ? windowUtils.getWindow().Promise : Promise;
if (!promise) {
    promise = function(resolver) {
        var d = new Deferred;
        resolver(d.resolve.bind(this), d.reject.bind(this));
        return d.promise()
    };
    promise.resolve = function(val) {
        return (new Deferred).resolve(val).promise()
    };
    promise.reject = function(val) {
        return (new Deferred).reject(val).promise()
    };
    promise.all = function(promises) {
        return when.apply(this, promises).then(function() {
            return [].slice.call(arguments)
        })
    }
}
module.exports = promise;
