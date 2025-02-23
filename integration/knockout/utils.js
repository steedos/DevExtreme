/**
 * DevExtreme (integration/knockout/utils.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var ko = require("knockout");
var getClosestNodeWithContext = function getClosestNodeWithContext(node) {
    var context = ko.contextFor(node);
    if (!context && node.parentNode) {
        return getClosestNodeWithContext(node.parentNode)
    }
    return node
};
module.exports.getClosestNodeWithContext = getClosestNodeWithContext;
