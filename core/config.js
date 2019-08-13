/**
 * DevExtreme (core/config.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _extend = require("./utils/extend");
var _extend2 = _interopRequireDefault(_extend);
var _errors = require("./errors");
var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var config = {
    rtlEnabled: false,
    defaultCurrency: "USD",
    oDataFilterToLower: true,
    designMode: false,
    serverDecimalSeparator: ".",
    decimalSeparator: ".",
    thousandsSeparator: ",",
    forceIsoDateParsing: true,
    wrapActionsBeforeExecute: true,
    useLegacyStoreResult: false,
    useJQuery: void 0,
    editorStylingMode: void 0,
    useLegacyVisibleIndex: false,
    optionsParser: function(optionsString) {
        if ("{" !== optionsString.trim().charAt(0)) {
            optionsString = "{" + optionsString + "}"
        }
        try {
            return new Function("return " + optionsString)()
        } catch (ex) {
            throw _errors2.default.Error("E3018", ex, optionsString)
        }
    }
};
var configMethod = function() {
    if (!arguments.length) {
        return config
    }
    _extend2.default.extend(config, arguments.length <= 0 ? void 0 : arguments[0])
};
if ("undefined" !== typeof DevExpress && DevExpress.config) {
    configMethod(DevExpress.config)
}
module.exports = configMethod;
module.exports.default = module.exports;
