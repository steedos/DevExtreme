/**
 * DevExtreme (events/core/hook_touch_props.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var touchPropsToHook = ["pageX", "pageY", "screenX", "screenY", "clientX", "clientY"];
var touchPropHook = function(name, event) {
    if (event[name] && !event.touches || !event.touches) {
        return event[name]
    }
    var touches = event.touches.length ? event.touches : event.changedTouches;
    if (!touches.length) {
        return
    }
    return touches[0][name]
};
module.exports = function(callback) {
    touchPropsToHook.forEach(function(name) {
        callback(name, function(event) {
            return touchPropHook(name, event)
        })
    }, this)
};
