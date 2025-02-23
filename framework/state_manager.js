/**
 * DevExtreme (framework/state_manager.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var Class = require("../core/class"),
    inArray = require("../core/utils/array").inArray,
    each = require("../core/utils/iterator").each;
var MemoryKeyValueStorage = Class.inherit({
    ctor: function() {
        this.storage = {}
    },
    getItem: function(key) {
        return this.storage[key]
    },
    setItem: function(key, value) {
        this.storage[key] = value
    },
    removeItem: function(key) {
        delete this.storage[key]
    }
});
var StateManager = Class.inherit({
    ctor: function(options) {
        options = options || {};
        this.storage = options.storage || new MemoryKeyValueStorage;
        this.stateSources = options.stateSources || []
    },
    addStateSource: function(stateSource) {
        this.stateSources.push(stateSource)
    },
    removeStateSource: function(stateSource) {
        var index = inArray(stateSource, this.stateSources);
        if (index > -1) {
            this.stateSources.splice(index, 1);
            stateSource.removeState(this.storage)
        }
    },
    saveState: function() {
        var that = this;
        each(this.stateSources, function(index, stateSource) {
            stateSource.saveState(that.storage)
        })
    },
    restoreState: function() {
        var that = this;
        each(this.stateSources, function(index, stateSource) {
            stateSource.restoreState(that.storage)
        })
    },
    clearState: function() {
        var that = this;
        each(this.stateSources, function(index, stateSource) {
            stateSource.removeState(that.storage)
        })
    }
});
module.exports = StateManager;
module.exports.MemoryKeyValueStorage = MemoryKeyValueStorage;
module.exports.default = module.exports;
