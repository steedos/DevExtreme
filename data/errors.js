/**
 * DevExtreme (data/errors.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var errorUtils = require("../core/utils/error"),
    coreErrors = require("../core/errors"),
    handlers = {};
var errors = errorUtils(coreErrors.ERROR_MESSAGES, {
    E4000: "[DevExpress.data]: {0}",
    E4001: "Unknown aggregating function is detected: '{0}'",
    E4002: "Unsupported OData protocol version is used",
    E4003: "Unknown filter operation is used: {0}",
    E4004: "The thenby() method is called before the sortby() method",
    E4005: "Store requires a key expression for this operation",
    E4006: "ArrayStore 'data' option must be an array",
    E4007: "Compound keys cannot be auto-generated",
    E4008: "Attempt to insert an item with the a duplicated key",
    E4009: "Data item cannot be found",
    E4010: "CustomStore does not support creating queries",
    E4011: "Custom Store method is not implemented or is not a function: {0}",
    E4012: "Custom Store method returns an invalid value: {0}",
    E4013: "Local Store requires the 'name' configuration option is specified",
    E4014: "Unknown data type is specified for ODataStore: {0}",
    E4015: "Unknown entity name or alias is used: {0}",
    E4016: "The compileSetter(expr) method is called with 'self' passed as a parameter",
    E4017: "Keys cannot be modified",
    E4018: "The server has returned a non-numeric value in a response to an item count request",
    E4019: "Mixing of group operators inside a single group of filter expression is not allowed",
    E4020: "Unknown store type is detected: {0}",
    E4021: "The server response does not provide the totalCount value",
    E4022: "The server response does not provide the groupCount value",
    E4023: "Could not parse the following XML: {0}",
    W4000: "Data returned from the server has an incorrect structure",
    W4001: 'The {0} field is listed in both "keyType" and "fieldTypes". The value of "fieldTypes" is used.',
    W4002: "Data loading has failed for some cells due to the following error: {0}"
});

function handleError(error) {
    var id = "E4000";
    if (error && "__id" in error) {
        id = error.__id
    }
    errors.log(id, error)
}
var errorHandler = null;
var _errorHandler = function(error) {
    if (handlers.errorHandler) {
        handlers.errorHandler(error)
    }
};
handlers = {
    errors: errors,
    errorHandler: errorHandler,
    _errorHandler: _errorHandler
};
module.exports = handlers;
