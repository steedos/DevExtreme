/**
 * DevExtreme (localization/globalize/currency.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
    return typeof obj
} : function(obj) {
    return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
};
require("./core");
require("./number");
require("../currency");
require("globalize/currency");
var enCurrencyUSD = {
    main: {
        en: {
            identity: {
                version: {
                    _cldrVersion: "28",
                    _number: "$Revision: 11972 $"
                },
                language: "en"
            },
            numbers: {
                currencies: {
                    USD: {
                        displayName: "US Dollar",
                        "displayName-count-one": "US dollar",
                        "displayName-count-other": "US dollars",
                        symbol: "$",
                        "symbol-alt-narrow": "$"
                    }
                }
            }
        }
    }
};
var currencyData = {
    supplemental: {
        version: {
            _cldrVersion: "28",
            _unicodeVersion: "8.0.0",
            _number: "$Revision: 11969 $"
        },
        currencyData: {
            fractions: {
                DEFAULT: {
                    _rounding: "0",
                    _digits: "2"
                }
            }
        }
    }
};
var Globalize = require("globalize"),
    config = require("../../core/config"),
    numberLocalization = require("../number");
if (Globalize && Globalize.formatCurrency) {
    if ("en" === Globalize.locale().locale) {
        Globalize.load(enCurrencyUSD, currencyData);
        Globalize.locale("en")
    }
    var formattersCache = {};
    var getFormatter = function(currency, format) {
        var formatter, formatCacheKey;
        if ("object" === ("undefined" === typeof format ? "undefined" : _typeof(format))) {
            formatCacheKey = Globalize.locale().locale + ":" + currency + ":" + JSON.stringify(format)
        } else {
            formatCacheKey = Globalize.locale().locale + ":" + currency + ":" + format
        }
        formatter = formattersCache[formatCacheKey];
        if (!formatter) {
            formatter = formattersCache[formatCacheKey] = Globalize.currencyFormatter(currency, format)
        }
        return formatter
    };
    var globalizeCurrencyLocalization = {
        _formatNumberCore: function(value, format, formatConfig) {
            if ("currency" === format) {
                var currency = formatConfig && formatConfig.currency || config().defaultCurrency;
                return getFormatter(currency, this._normalizeFormatConfig(format, formatConfig, value))(value)
            }
            return this.callBase.apply(this, arguments)
        },
        _normalizeFormatConfig: function(format, formatConfig, value) {
            var config = this.callBase(format, formatConfig, value);
            if ("currency" === format) {
                config.style = "accounting"
            }
            return config
        },
        format: function(value, _format) {
            if ("number" !== typeof value) {
                return value
            }
            _format = this._normalizeFormat(_format);
            if (_format) {
                if ("default" === _format.currency) {
                    _format.currency = config().defaultCurrency
                }
                if ("currency" === _format.type) {
                    return this._formatNumber(value, this._parseNumberFormatString("currency"), _format)
                } else {
                    if (!_format.type && _format.currency) {
                        return getFormatter(_format.currency, _format)(value)
                    }
                }
            }
            return this.callBase.apply(this, arguments)
        },
        getCurrencySymbol: function(currency) {
            if (!currency) {
                currency = config().defaultCurrency
            }
            return Globalize.cldr.main("numbers/currencies/" + currency)
        },
        getOpenXmlCurrencyFormat: function(currency) {
            var i, result, symbol, encodeSymbols, currencySymbol = this.getCurrencySymbol(currency).symbol,
                currencyFormat = Globalize.cldr.main("numbers/currencyFormats-numberSystem-latn");
            if (currencyFormat.accounting) {
                encodeSymbols = {
                    ".00": "{0}",
                    "'": "\\'",
                    "\\(": "\\(",
                    "\\)": "\\)",
                    " ": "\\ ",
                    '"': "&quot;",
                    "\\\xa4": currencySymbol
                };
                result = currencyFormat.accounting.split(";");
                for (i = 0; i < result.length; i++) {
                    for (symbol in encodeSymbols) {
                        if (encodeSymbols.hasOwnProperty(symbol)) {
                            result[i] = result[i].replace(new RegExp(symbol, "g"), encodeSymbols[symbol])
                        }
                    }
                }
                return 2 === result.length ? result[0] + "_);" + result[1] : result[0]
            }
        }
    };
    numberLocalization.inject(globalizeCurrencyLocalization)
}
