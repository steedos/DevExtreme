/**
 * DevExtreme (exporter/excel/excel.color_helper.js)
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
var _excel = require("./excel.tag_helper");
var _excel2 = _interopRequireDefault(_excel);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var colorHelper = {
    _tryConvertColor: function(source) {
        if ("string" !== typeof source) {
            return source
        }
        var result = void 0;
        if (source.length > 0 && "#" === source[0]) {
            var colorCode = source.substr(1, source.length);
            if (6 === colorCode.length) {
                result = "FF" + colorCode
            } else {
                if (8 === colorCode.length) {
                    result = colorCode[6] + colorCode[7] + colorCode.substr(0, 6)
                } else {
                    result = colorCode
                }
            }
        } else {
            result = source
        }
        return result
    },
    tryCreateTag: function(sourceObj) {
        var result = null;
        if ((0, _type.isDefined)(sourceObj)) {
            if ("string" === typeof sourceObj) {
                result = {
                    rgb: this._tryConvertColor(sourceObj)
                }
            } else {
                result = {
                    rgb: this._tryConvertColor(sourceObj.rgb),
                    theme: sourceObj.theme
                }
            }
            if (colorHelper.isEmpty(result)) {
                result = null
            }
        }
        return result
    },
    copy: function(source) {
        var result = null;
        if ((0, _type.isDefined)(source)) {
            if ("string" === typeof source) {
                result = source
            } else {
                result = {};
                if (void 0 !== source.rgb) {
                    result.rgb = source.rgb
                }
                if (void 0 !== source.theme) {
                    result.theme = source.theme
                }
            }
        }
        return result
    },
    isEmpty: function(tag) {
        return !(0, _type.isDefined)(tag) || !(0, _type.isDefined)(tag.rgb) && !(0, _type.isDefined)(tag.theme)
    },
    areEqual: function(leftTag, rightTag) {
        return colorHelper.isEmpty(leftTag) && colorHelper.isEmpty(rightTag) || (0, _type.isDefined)(leftTag) && (0, _type.isDefined)(rightTag) && leftTag.rgb === rightTag.rgb && leftTag.theme === rightTag.theme
    },
    toXml: function(tagName, tag) {
        return _excel2.default.toXml(tagName, {
            rgb: tag.rgb,
            theme: tag.theme
        })
    }
};
exports.default = colorHelper;
