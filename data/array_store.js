/**
 * DevExtreme (data/array_store.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _utils = require("./utils");
var _query = require("./query");
var _query2 = _interopRequireDefault(_query);
var _errors = require("./errors");
var _abstract_store = require("./abstract_store");
var _abstract_store2 = _interopRequireDefault(_abstract_store);
var _array_utils = require("./array_utils");
var _array_utils2 = _interopRequireDefault(_array_utils);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var ArrayStore = _abstract_store2.default.inherit({
    ctor: function(options) {
        if (Array.isArray(options)) {
            options = {
                data: options
            }
        } else {
            options = options || {}
        }
        this.callBase(options);
        var initialArray = options.data;
        if (initialArray && !Array.isArray(initialArray)) {
            throw _errors.errors.Error("E4006")
        }
        this._array = initialArray || []
    },
    createQuery: function() {
        return (0, _query2.default)(this._array, {
            errorHandler: this._errorHandler
        })
    },
    _byKeyImpl: function(key) {
        var index = _array_utils2.default.indexByKey(this, this._array, key);
        if (index === -1) {
            return (0, _utils.rejectedPromise)(_errors.errors.Error("E4009"))
        }
        return (0, _utils.trivialPromise)(this._array[index])
    },
    _insertImpl: function(values) {
        return _array_utils2.default.insert(this, this._array, values)
    },
    _pushImpl: function(changes) {
        _array_utils2.default.applyBatch(this, this._array, changes)
    },
    _updateImpl: function(key, values) {
        return _array_utils2.default.update(this, this._array, key, values)
    },
    _removeImpl: function(key) {
        return _array_utils2.default.remove(this, this._array, key)
    },
    clear: function() {
        this.fireEvent("modifying");
        this._array = [];
        this.fireEvent("modified")
    }
}, "array");
module.exports = ArrayStore;
module.exports.default = module.exports;
