/**
 * DevExtreme (core/utils/icon.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer");
var getImageSourceType = function(source) {
    if (!source || "string" !== typeof source) {
        return false
    }
    if (/data:.*base64|\.|\//.test(source)) {
        return "image"
    }
    if (/^[\w-_]+$/.test(source)) {
        return "dxIcon"
    }
    return "fontIcon"
};
var getImageContainer = function(source) {
    var imageType = getImageSourceType(source),
        ICON_CLASS = "dx-icon";
    switch (imageType) {
        case "image":
            return $("<img>").attr("src", source).addClass(ICON_CLASS);
        case "fontIcon":
            return $("<i>").addClass(ICON_CLASS + " " + source);
        case "dxIcon":
            return $("<i>").addClass(ICON_CLASS + " " + ICON_CLASS + "-" + source);
        default:
            return null
    }
};
exports.getImageSourceType = getImageSourceType;
exports.getImageContainer = getImageContainer;
