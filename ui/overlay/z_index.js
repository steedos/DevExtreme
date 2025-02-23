/**
 * DevExtreme (ui/overlay/z_index.js)
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
exports.clearStack = exports.remove = exports.create = exports.base = void 0;
var _common = require("../../core/utils/common");
var baseZIndex = 1500;
var zIndexStack = [];
var base = exports.base = function(ZIndex) {
    baseZIndex = (0, _common.ensureDefined)(ZIndex, baseZIndex);
    return baseZIndex
};
var create = exports.create = function() {
    var baseIndex = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : baseZIndex;
    var length = zIndexStack.length;
    var index = (length ? zIndexStack[length - 1] : baseIndex) + 1;
    zIndexStack.push(index);
    return index
};
var remove = exports.remove = function(zIndex) {
    var position = zIndexStack.indexOf(zIndex);
    if (position >= 0) {
        zIndexStack.splice(position, 1)
    }
};
var clearStack = exports.clearStack = function() {
    zIndexStack = []
};
