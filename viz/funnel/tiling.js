/**
 * DevExtreme (viz/funnel/tiling.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _normalizeEnum = require("../core/utils").normalizeEnum,
    algorithms = {},
    defaultAlgorithm;
exports.getAlgorithm = function(name) {
    return algorithms[_normalizeEnum(name)] || defaultAlgorithm
};
exports.addAlgorithm = function(name, callback, setDefault) {
    algorithms[name] = callback;
    if (setDefault) {
        defaultAlgorithm = algorithms[name]
    }
};
