/**
 * DevExtreme (animation/frame.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var windowUtils = require("../core/utils/window"),
    window = windowUtils.hasWindow() ? windowUtils.getWindow() : {},
    callOnce = require("../core/utils/call_once");
var FRAME_ANIMATION_STEP_TIME = 1e3 / 60,
    request = function(callback) {
        return setTimeout(callback, FRAME_ANIMATION_STEP_TIME)
    },
    cancel = function(requestID) {
        clearTimeout(requestID)
    };
var setAnimationFrameMethods = callOnce(function() {
    var nativeRequest = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
        nativeCancel = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame;
    if (nativeRequest && nativeCancel) {
        request = nativeRequest;
        cancel = nativeCancel
    }
    if (nativeRequest && !nativeCancel) {
        var canceledRequests = {};
        request = function(callback) {
            var requestId = nativeRequest.call(window, function() {
                try {
                    if (requestId in canceledRequests) {
                        return
                    }
                    callback.apply(this, arguments)
                } finally {
                    delete canceledRequests[requestId]
                }
            });
            return requestId
        };
        cancel = function(requestId) {
            canceledRequests[requestId] = true
        }
    }
});
exports.requestAnimationFrame = function() {
    setAnimationFrameMethods();
    return request.apply(window, arguments)
};
exports.cancelAnimationFrame = function() {
    setAnimationFrameMethods();
    cancel.apply(window, arguments)
};
