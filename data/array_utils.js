/**
 * DevExtreme (data/array_utils.js)
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
var _type = require("../core/utils/type");
var _config = require("../core/config");
var _config2 = _interopRequireDefault(_config);
var _guid = require("../core/guid");
var _guid2 = _interopRequireDefault(_guid);
var _extend = require("../core/utils/extend");
var _errors = require("./errors");
var _object = require("../core/utils/object");
var _object2 = _interopRequireDefault(_object);
var _utils = require("./utils");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function hasKey(target, keyOrKeys) {
    var key, keys = "string" === typeof keyOrKeys ? keyOrKeys.split() : keyOrKeys.slice();
    while (keys.length) {
        key = keys.shift();
        if (key in target) {
            return true
        }
    }
    return false
}

function findItems(keyInfo, items, key, groupCount) {
    var childItems, result;
    if (groupCount) {
        for (var i = 0; i < items.length; i++) {
            childItems = items[i].items || items[i].collapsedItems || [];
            result = findItems(keyInfo, childItems || [], key, groupCount - 1);
            if (result) {
                return result
            }
        }
    } else {
        if (indexByKey(keyInfo, items, key) >= 0) {
            return items
        }
    }
}

function getItems(keyInfo, items, key, groupCount) {
    if (groupCount) {
        return findItems(keyInfo, items, key, groupCount) || []
    }
    return items
}

function generateHasKeyCache(keyInfo, array) {
    if (keyInfo.key() && !array._hasKeyMap) {
        var hasKeyMap = {};
        for (var i = 0, arrayLength = array.length; i < arrayLength; i++) {
            hasKeyMap[JSON.stringify(keyInfo.keyOf(array[i]))] = true
        }
        array._hasKeyMap = hasKeyMap
    }
}

function getHasKeyCacheValue(array, key) {
    if (array._hasKeyMap) {
        return array._hasKeyMap[JSON.stringify(key)]
    }
    return true
}

function setHasKeyCacheValue(array, key) {
    if (array._hasKeyMap) {
        array._hasKeyMap[JSON.stringify(key)] = true
    }
}

function applyBatch(keyInfo, array, batchData, groupCount, useInsertIndex) {
    batchData.forEach(function(item) {
        var items = "insert" === item.type ? array : getItems(keyInfo, array, item.key, groupCount);
        generateHasKeyCache(keyInfo, items);
        switch (item.type) {
            case "update":
                update(keyInfo, items, item.key, item.data, true);
                break;
            case "insert":
                insert(keyInfo, items, item.data, useInsertIndex && (0, _type.isDefined)(item.index) ? item.index : -1, true);
                break;
            case "remove":
                remove(keyInfo, items, item.key, true)
        }
    })
}

function update(keyInfo, array, key, data, isBatch) {
    var target, extendComplexObject = true,
        keyExpr = keyInfo.key();
    if (keyExpr) {
        if (hasKey(data, keyExpr) && !(0, _utils.keysEqual)(keyExpr, key, keyInfo.keyOf(data))) {
            return !isBatch && (0, _utils.rejectedPromise)(_errors.errors.Error("E4017"))
        }
        var index = indexByKey(keyInfo, array, key);
        if (index < 0) {
            return !isBatch && (0, _utils.rejectedPromise)(_errors.errors.Error("E4009"))
        }
        target = array[index]
    } else {
        target = key
    }
    _object2.default.deepExtendArraySafe(target, data, extendComplexObject);
    if (!isBatch) {
        if ((0, _config2.default)().useLegacyStoreResult) {
            return (0, _utils.trivialPromise)(key, data)
        } else {
            return (0, _utils.trivialPromise)(target, key)
        }
    }
}

function insert(keyInfo, array, data, index, isBatch) {
    var keyValue, obj, keyExpr = keyInfo.key();
    obj = (0, _type.isPlainObject)(data) ? (0, _extend.extend)({}, data) : data;
    if (keyExpr) {
        keyValue = keyInfo.keyOf(obj);
        if (void 0 === keyValue || "object" === ("undefined" === typeof keyValue ? "undefined" : _typeof(keyValue)) && (0, _type.isEmptyObject)(keyValue)) {
            if (Array.isArray(keyExpr)) {
                throw _errors.errors.Error("E4007")
            }
            keyValue = obj[keyExpr] = String(new _guid2.default)
        } else {
            if (void 0 !== array[indexByKey(keyInfo, array, keyValue)]) {
                return !isBatch && (0, _utils.rejectedPromise)(_errors.errors.Error("E4008"))
            }
        }
    } else {
        keyValue = obj
    }
    if (index >= 0) {
        array.splice(index, 0, obj)
    } else {
        array.push(obj)
    }
    setHasKeyCacheValue(array, keyValue);
    if (!isBatch) {
        return (0, _utils.trivialPromise)((0, _config2.default)().useLegacyStoreResult ? data : obj, keyValue)
    }
}

function remove(keyInfo, array, key, isBatch) {
    var index = indexByKey(keyInfo, array, key);
    if (index > -1) {
        array.splice(index, 1)
    }
    if (!isBatch) {
        return (0, _utils.trivialPromise)(key)
    }
}

function indexByKey(keyInfo, array, key) {
    var keyExpr = keyInfo.key();
    if (!getHasKeyCacheValue(array, key)) {
        return -1
    }
    for (var i = 0, arrayLength = array.length; i < arrayLength; i++) {
        if ((0, _utils.keysEqual)(keyExpr, keyInfo.keyOf(array[i]), key)) {
            return i
        }
    }
    return -1
}
module.exports.applyBatch = applyBatch;
module.exports.update = update;
module.exports.insert = insert;
module.exports.remove = remove;
module.exports.indexByKey = indexByKey;
