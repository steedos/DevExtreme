/**
 * DevExtreme (core/utils/selection_filter.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var getKeyHash = require("./common").getKeyHash,
    equalByValue = require("./common").equalByValue,
    typeUtils = require("./type");
var SelectionFilterCreator = function(selectedItemKeys, isSelectAll) {
    this.getLocalFilter = function(keyGetter, equalKeys, equalByReference, keyExpr) {
        equalKeys = void 0 === equalKeys ? equalByValue : equalKeys;
        return functionFilter.bind(this, equalKeys, keyGetter, equalByReference, keyExpr)
    };
    this.getExpr = function(keyExpr) {
        if (!keyExpr) {
            return
        }
        var filterExpr;
        selectedItemKeys.forEach(function(key, index) {
            filterExpr = filterExpr || [];
            var filterExprPart;
            if (index > 0) {
                filterExpr.push(isSelectAll ? "and" : "or")
            }
            if (typeUtils.isString(keyExpr)) {
                filterExprPart = getFilterForPlainKey(keyExpr, key)
            } else {
                filterExprPart = getFilterForCompositeKey(keyExpr, key)
            }
            filterExpr.push(filterExprPart)
        });
        if (filterExpr && 1 === filterExpr.length) {
            filterExpr = filterExpr[0]
        }
        return filterExpr
    };
    this.getCombinedFilter = function(keyExpr, dataSourceFilter) {
        var filterExpr = this.getExpr(keyExpr),
            combinedFilter = filterExpr;
        if (isSelectAll && dataSourceFilter) {
            if (filterExpr) {
                combinedFilter = [];
                combinedFilter.push(filterExpr);
                combinedFilter.push(dataSourceFilter)
            } else {
                combinedFilter = dataSourceFilter
            }
        }
        return combinedFilter
    };
    var selectedItemKeyHashesMap;
    var getSelectedItemKeyHashesMap = function(selectedItemKeys) {
        if (!selectedItemKeyHashesMap) {
            selectedItemKeyHashesMap = {};
            for (var i = 0; i < selectedItemKeys.length; i++) {
                selectedItemKeyHashesMap[getKeyHash(selectedItemKeys[i])] = true
            }
        }
        return selectedItemKeyHashesMap
    };
    var normalizeKeys = function(keys, keyOf, keyExpr) {
        return Array.isArray(keyExpr) ? keys.map(function(key) {
            return keyOf(key)
        }) : keys
    };
    var functionFilter = function(equalKeys, keyOf, equalByReference, keyExpr, item) {
        var keyHash, i, key = keyOf(item);
        if (!equalByReference) {
            keyHash = getKeyHash(key);
            if (!typeUtils.isObject(keyHash)) {
                var selectedKeyHashesMap = getSelectedItemKeyHashesMap(normalizeKeys(selectedItemKeys, keyOf, keyExpr));
                if (selectedKeyHashesMap[keyHash]) {
                    return !isSelectAll
                }
                return !!isSelectAll
            }
        }
        for (i = 0; i < selectedItemKeys.length; i++) {
            if (equalKeys(selectedItemKeys[i], key)) {
                return !isSelectAll
            }
        }
        return !!isSelectAll
    };
    var getFilterForPlainKey = function(keyExpr, keyValue) {
        if (void 0 === keyValue) {
            return
        }
        return [keyExpr, isSelectAll ? "<>" : "=", keyValue]
    };
    var getFilterForCompositeKey = function(keyExpr, itemKeyValue) {
        var filterExpr = [];
        for (var i = 0, length = keyExpr.length; i < length; i++) {
            var currentKeyExpr = keyExpr[i],
                currentKeyValue = itemKeyValue && itemKeyValue[currentKeyExpr],
                filterExprPart = getFilterForPlainKey(currentKeyExpr, currentKeyValue);
            if (!filterExprPart) {
                break
            }
            if (i > 0) {
                filterExpr.push(isSelectAll ? "or" : "and")
            }
            filterExpr.push(filterExprPart)
        }
        return filterExpr
    }
};
exports.SelectionFilterCreator = SelectionFilterCreator;
