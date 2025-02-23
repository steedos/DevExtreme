/**
 * DevExtreme (data/odata/mixins.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var stringUtils = require("../../core/utils/string"),
    iteratorUtils = require("../../core/utils/iterator"),
    odataUtils = require("./utils");
require("./query_adapter");
var DEFAULT_PROTOCOL_VERSION = 2;
var formatFunctionInvocationUrl = function(baseUrl, args) {
    return stringUtils.format("{0}({1})", baseUrl, iteratorUtils.map(args || {}, function(value, key) {
        return stringUtils.format("{0}={1}", key, value)
    }).join(","))
};
var escapeServiceOperationParams = function(params, version) {
    if (!params) {
        return params
    }
    var result = {};
    iteratorUtils.each(params, function(k, v) {
        result[k] = odataUtils.serializeValue(v, version)
    });
    return result
};
var SharedMethods = {
    _extractServiceOptions: function(options) {
        options = options || {};
        this._url = String(options.url).replace(/\/+$/, "");
        this._beforeSend = options.beforeSend;
        this._jsonp = options.jsonp;
        this._version = options.version || DEFAULT_PROTOCOL_VERSION;
        this._withCredentials = options.withCredentials;
        this._deserializeDates = options.deserializeDates;
        this._filterToLower = options.filterToLower
    },
    _sendRequest: function(url, method, params, payload) {
        return odataUtils.sendRequest(this.version(), {
            url: url,
            method: method,
            params: params || {},
            payload: payload
        }, {
            beforeSend: this._beforeSend,
            jsonp: this._jsonp,
            withCredentials: this._withCredentials,
            deserializeDates: this._deserializeDates
        })
    },
    version: function() {
        return this._version
    }
};
exports.SharedMethods = SharedMethods;
exports.escapeServiceOperationParams = escapeServiceOperationParams;
exports.formatFunctionInvocationUrl = formatFunctionInvocationUrl;
