/**
 * DevExtreme (exporter/excel/excel.tag_helper.js)
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
var _type = require("../../core/utils/type");
var tagHelper = {
    toXml: function(tagName, attributes, content) {
        var result = ["<", tagName];
        for (var attributeName in attributes) {
            var attributeValue = attributes[attributeName];
            if ((0, _type.isDefined)(attributeValue)) {
                result.push(" ", attributeName, '="', attributeValue, '"')
            }
        }
        if ((0, _type.isDefined)(content) && "" !== content) {
            result.push(">", content, "</", tagName, ">")
        } else {
            result.push(" />")
        }
        return result.join("")
    }
};
exports.default = tagHelper;
