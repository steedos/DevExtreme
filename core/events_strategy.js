/**
 * DevExtreme (core/events_strategy.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var Callbacks = require("./utils/callbacks"),
    isFunction = require("./utils/type").isFunction,
    each = require("./utils/iterator").each,
    Class = require("./class");
module.exports = Class.inherit({
    ctor: function(owner) {
        this._events = {};
        this._owner = owner
    },
    hasEvent: function(eventName) {
        var callbacks = this._events[eventName];
        if (callbacks) {
            return callbacks.has()
        }
        return false
    },
    fireEvent: function(eventName, eventArgs) {
        var callbacks = this._events[eventName];
        if (callbacks) {
            callbacks.fireWith(this._owner, eventArgs)
        }
    },
    on: function(eventName, eventHandler) {
        var addFn, callbacks = this._events[eventName];
        if (!callbacks) {
            callbacks = Callbacks();
            this._events[eventName] = callbacks
        }
        addFn = callbacks.originalAdd || callbacks.add;
        addFn.call(callbacks, eventHandler)
    },
    off: function(eventName, eventHandler) {
        var callbacks = this._events[eventName];
        if (callbacks) {
            if (isFunction(eventHandler)) {
                callbacks.remove(eventHandler)
            } else {
                callbacks.empty()
            }
        }
    },
    dispose: function() {
        each(this._events, function() {
            this.empty()
        })
    }
});
