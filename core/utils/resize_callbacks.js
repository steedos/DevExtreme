/**
 * DevExtreme (core/utils/resize_callbacks.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var windowUtils = require("./window"),
    domAdapter = require("../dom_adapter"),
    Callbacks = require("./callbacks"),
    readyCallbacks = require("./ready_callbacks"),
    callOnce = require("./call_once");
var resizeCallbacks = function() {
    var prevSize, callbacks = Callbacks(),
        originalCallbacksAdd = callbacks.add,
        originalCallbacksRemove = callbacks.remove;
    if (!windowUtils.hasWindow()) {
        return callbacks
    }
    var formatSize = function() {
        var documentElement = domAdapter.getDocumentElement();
        return {
            width: documentElement.clientWidth,
            height: documentElement.clientHeight
        }
    };
    var handleResize = function() {
        var now = formatSize();
        if (now.width === prevSize.width && now.height === prevSize.height) {
            return
        }
        var changedDimension;
        if (now.width === prevSize.width) {
            changedDimension = "height"
        }
        if (now.height === prevSize.height) {
            changedDimension = "width"
        }
        prevSize = now;
        callbacks.fire(changedDimension)
    };
    var setPrevSize = callOnce(function() {
        prevSize = formatSize()
    });
    var removeListener;
    callbacks.add = function() {
        var result = originalCallbacksAdd.apply(callbacks, arguments);
        setPrevSize();
        readyCallbacks.add(function() {
            if (!removeListener && callbacks.has()) {
                removeListener = domAdapter.listen(windowUtils.getWindow(), "resize", handleResize)
            }
        });
        return result
    };
    callbacks.remove = function() {
        var result = originalCallbacksRemove.apply(callbacks, arguments);
        if (!callbacks.has() && removeListener) {
            removeListener();
            removeListener = void 0
        }
        return result
    };
    return callbacks
}();
module.exports = resizeCallbacks;
