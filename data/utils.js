/**
 * DevExtreme (data/utils.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _type = require("../core/utils/type");
var _type2 = _interopRequireDefault(_type);
var _dom_adapter = require("../core/dom_adapter");
var _dom_adapter2 = _interopRequireDefault(_dom_adapter);
var _ready_callbacks = require("../core/utils/ready_callbacks");
var _window = require("../core/utils/window");
var _iterator = require("../core/utils/iterator");
var _data = require("../core/utils/data");
var _deferred = require("../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i]
        }
        return arr2
    } else {
        return Array.from(arr)
    }
}
var XHR_ERROR_UNLOAD = "DEVEXTREME_XHR_ERROR_UNLOAD";
var normalizeBinaryCriterion = function(crit) {
    return [crit[0], crit.length < 3 ? "=" : String(crit[1]).toLowerCase(), crit.length < 2 ? true : crit[crit.length - 1]]
};
var normalizeSortingInfo = function(info) {
    if (!Array.isArray(info)) {
        info = [info]
    }
    return (0, _iterator.map)(info, function(i) {
        var result = {
            selector: (0, _type.isFunction)(i) || "string" === typeof i ? i : i.getter || i.field || i.selector,
            desc: !!(i.desc || "d" === String(i.dir).charAt(0).toLowerCase())
        };
        if (i.compare) {
            result.compare = i.compare
        }
        return result
    })
};
var errorMessageFromXhr = function() {
    var textStatusMessages = {
        timeout: "Network connection timeout",
        error: "Unspecified network error",
        parsererror: "Unexpected server response"
    };
    var explainTextStatus = function(textStatus) {
        var result = textStatusMessages[textStatus];
        if (!result) {
            return textStatus
        }
        return result
    };
    var unloading;
    (0, _ready_callbacks.add)(function() {
        var window = (0, _window.getWindow)();
        _dom_adapter2.default.listen(window, "beforeunload", function() {
            unloading = true
        })
    });
    return function(xhr, textStatus) {
        if (unloading) {
            return XHR_ERROR_UNLOAD
        }
        if (xhr.status < 400) {
            return explainTextStatus(textStatus)
        }
        return xhr.statusText
    }
}();
var aggregators = {
    count: {
        seed: 0,
        step: function(count) {
            return 1 + count
        }
    },
    sum: {
        seed: 0,
        step: function(sum, item) {
            return sum + item
        }
    },
    min: {
        step: function(min, item) {
            return item < min ? item : min
        }
    },
    max: {
        step: function(max, item) {
            return item > max ? item : max
        }
    },
    avg: {
        seed: [0, 0],
        step: function(pair, value) {
            return [pair[0] + value, pair[1] + 1]
        },
        finalize: function(pair) {
            return pair[1] ? pair[0] / pair[1] : NaN
        }
    }
};
var processRequestResultLock = function() {
    var lockDeferred, lockCount = 0;
    var obtain = function() {
        if (0 === lockCount) {
            lockDeferred = new _deferred.Deferred
        }
        lockCount++
    };
    var release = function() {
        lockCount--;
        if (lockCount < 1) {
            lockDeferred.resolve()
        }
    };
    var promise = function() {
        var deferred = 0 === lockCount ? (new _deferred.Deferred).resolve() : lockDeferred;
        return deferred.promise()
    };
    var reset = function() {
        lockCount = 0;
        if (lockDeferred) {
            lockDeferred.resolve()
        }
    };
    return {
        obtain: obtain,
        release: release,
        promise: promise,
        reset: reset
    }
}();

function isDisjunctiveOperator(condition) {
    return /^(or|\|\||\|)$/i.test(condition)
}

function isConjunctiveOperator(condition) {
    return /^(and|&&|&)$/i.test(condition)
}
var keysEqual = function(keyExpr, key1, key2) {
    if (Array.isArray(keyExpr)) {
        var name, names = (0, _iterator.map)(key1, function(v, k) {
            return k
        });
        for (var i = 0; i < names.length; i++) {
            name = names[i];
            if ((0, _data.toComparable)(key1[name], true) != (0, _data.toComparable)(key2[name], true)) {
                return false
            }
        }
        return true
    }
    return (0, _data.toComparable)(key1, true) == (0, _data.toComparable)(key2, true)
};
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var base64_encode = function(input) {
    if (!Array.isArray(input)) {
        input = stringToByteArray(String(input))
    }
    var result = "";

    function getBase64Char(index) {
        return BASE64_CHARS.charAt(index)
    }
    for (var i = 0; i < input.length; i += 3) {
        var octet1 = input[i],
            octet2 = input[i + 1],
            octet3 = input[i + 2];
        result += (0, _iterator.map)([octet1 >> 2, (3 & octet1) << 4 | octet2 >> 4, isNaN(octet2) ? 64 : (15 & octet2) << 2 | octet3 >> 6, isNaN(octet3) ? 64 : 63 & octet3], getBase64Char).join("")
    }
    return result
};
var stringToByteArray = function(str) {
    var code, i, bytes = [];
    for (i = 0; i < str.length; i++) {
        code = str.charCodeAt(i);
        if (code < 128) {
            bytes.push(code)
        } else {
            if (code < 2048) {
                bytes.push(192 + (code >> 6), 128 + (63 & code))
            } else {
                if (code < 65536) {
                    bytes.push(224 + (code >> 12), 128 + (code >> 6 & 63), 128 + (63 & code))
                } else {
                    if (code < 2097152) {
                        bytes.push(240 + (code >> 18), 128 + (code >> 12 & 63), 128 + (code >> 6 & 63), 128 + (63 & code))
                    }
                }
            }
        }
    }
    return bytes
};
var isUnaryOperation = function(crit) {
    return "!" === crit[0] && Array.isArray(crit[1])
};
var isGroupOperator = function(value) {
    return "and" === value || "or" === value
};
var isGroupCriterion = function(crit) {
    var first = crit[0],
        second = crit[1];
    if (Array.isArray(first)) {
        return true
    }
    if (_type2.default.isFunction(first)) {
        if (Array.isArray(second) || _type2.default.isFunction(second) || isGroupOperator(second)) {
            return true
        }
    }
    return false
};
var trivialPromise = function() {
    var d = new _deferred.Deferred;
    return d.resolve.apply(d, arguments).promise()
};
var rejectedPromise = function() {
    var d = new _deferred.Deferred;
    return d.reject.apply(d, arguments).promise()
};

function throttle(func, timeout) {
    var timeoutId, lastArgs;
    return function() {
        var _this = this;
        lastArgs = arguments;
        if (!timeoutId) {
            timeoutId = setTimeout(function() {
                timeoutId = void 0;
                if (lastArgs) {
                    func.call(_this, lastArgs)
                }
            }, (0, _type.isFunction)(timeout) ? timeout() : timeout)
        }
        return timeoutId
    }
}

function throttleChanges(func, timeout) {
    var cache = [],
        throttled = throttle(function() {
            func.call(this, cache);
            cache = []
        }, timeout);
    return function(changes) {
        if (Array.isArray(changes)) {
            var _cache;
            (_cache = cache).push.apply(_cache, _toConsumableArray(changes))
        }
        return throttled.call(this, cache)
    }
}
var utils = {
    XHR_ERROR_UNLOAD: XHR_ERROR_UNLOAD,
    normalizeBinaryCriterion: normalizeBinaryCriterion,
    normalizeSortingInfo: normalizeSortingInfo,
    errorMessageFromXhr: errorMessageFromXhr,
    aggregators: aggregators,
    keysEqual: keysEqual,
    throttleChanges: throttleChanges,
    trivialPromise: trivialPromise,
    rejectedPromise: rejectedPromise,
    isDisjunctiveOperator: isDisjunctiveOperator,
    isConjunctiveOperator: isConjunctiveOperator,
    processRequestResultLock: processRequestResultLock,
    isUnaryOperation: isUnaryOperation,
    isGroupCriterion: isGroupCriterion,
    base64_encode: base64_encode
};
module.exports = utils;
