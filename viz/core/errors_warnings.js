/**
 * DevExtreme (viz/core/errors_warnings.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var errorUtils = require("../../core/utils/error"),
    errors = require("../../core/errors");
module.exports = errorUtils(errors.ERROR_MESSAGES, {
    E2001: "Invalid data source",
    E2002: "Axis type and data type are incompatible",
    E2003: 'The "{0}" data source field contains data of unsupported type',
    E2004: 'The "{0}" data source field is inconsistent',
    E2005: 'The value field "{0}" is absent in the data source or all its values are negative',
    E2006: "A cycle is detected in provided data",
    E2007: 'The value field "{0}" is absent in the data source',
    E2008: 'The value field "{0}" must be a string',
    E2009: 'The value field "{0}" must be a positive numeric value',
    E2101: "Unknown series type: {0}",
    E2102: "Ambiguity occurred between two value axes with the same name",
    E2103: 'The "{0}" option is given an invalid value. Assign a function instead',
    E2104: "Invalid logarithm base",
    E2105: 'Invalid value of a "{0}"',
    E2106: "Invalid visible range",
    E2202: "Invalid {0} scale value",
    E2203: "The range you are trying to set is invalid",
    W2002: "The {0} series cannot be drawn because the {1} data field is missing",
    W2003: "Tick interval is too small",
    W2101: 'The "{0}" pane does not exist; the last pane is used by default',
    W2102: 'A value axis with the "{0}" name was created automatically',
    W2103: "The chart title was hidden due to the container size",
    W2104: "The legend was hidden due to the container size",
    W2105: 'The title of the "{0}" axis was hidden due to the container size',
    W2106: 'The labels of the "{0}" axis were hidden due to the container size',
    W2107: "The export menu was hidden due to the container size",
    W2108: "The browser does not support exporting images to {0} format.",
    W2301: "Invalid value range"
});
