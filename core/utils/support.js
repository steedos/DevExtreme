/**
 * DevExtreme (core/utils/support.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _array = require("./array");
var _dom_adapter = require("../dom_adapter");
var _common = require("./common");
var _call_once = require("./call_once");
var _call_once2 = _interopRequireDefault(_call_once);
var _window = require("./window");
var _window2 = _interopRequireDefault(_window);
var _devices = require("../devices");
var _devices2 = _interopRequireDefault(_devices);
var _style = require("./style");
var _style2 = _interopRequireDefault(_style);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var _windowUtils$getNavig = _window2.default.getNavigator(),
    maxTouchPoints = _windowUtils$getNavig.maxTouchPoints,
    msMaxTouchPoints = _windowUtils$getNavig.msMaxTouchPoints,
    pointerEnabled = _windowUtils$getNavig.pointerEnabled;
var hasProperty = _window2.default.hasProperty.bind(_window2.default);
var transitionEndEventNames = {
    webkitTransition: "webkitTransitionEnd",
    MozTransition: "transitionend",
    OTransition: "oTransitionEnd",
    msTransition: "MsTransitionEnd",
    transition: "transitionend"
};
var supportProp = function(prop) {
    return !!_style2.default.styleProp(prop)
};
var isNativeScrollingSupported = function() {
    var _devices$real = _devices2.default.real(),
        platform = _devices$real.platform,
        version = _devices$real.version,
        isMac = _devices$real.mac;
    var isObsoleteAndroid = version && version[0] < 4 && "android" === platform;
    var isNativeScrollDevice = !isObsoleteAndroid && (0, _array.inArray)(platform, ["ios", "android", "win"]) > -1 || isMac;
    return isNativeScrollDevice
};
var inputType = function(type) {
    if ("text" === type) {
        return true
    }
    var input = (0, _dom_adapter.createElement)("input");
    try {
        input.setAttribute("type", type);
        input.value = "wrongValue";
        return !input.value
    } catch (e) {
        return false
    }
};
var detectTouchEvents = function(hasWindowProperty, maxTouchPoints) {
    return (hasWindowProperty("ontouchstart") || !!maxTouchPoints) && !hasWindowProperty("callPhantom")
};
var detectPointerEvent = function(hasWindowProperty, pointerEnabled) {
    var isPointerEnabled = (0, _common.ensureDefined)(pointerEnabled, true);
    var canUsePointerEvent = (0, _common.ensureDefined)(pointerEnabled, false);
    return hasWindowProperty("PointerEvent") && isPointerEnabled || canUsePointerEvent
};
var touchEvents = detectTouchEvents(hasProperty, maxTouchPoints);
var pointerEvents = detectPointerEvent(hasProperty, pointerEnabled);
var touchPointersPresent = !!maxTouchPoints || !!msMaxTouchPoints;
exports.touchEvents = touchEvents;
exports.pointerEvents = pointerEvents;
exports.touch = touchEvents || pointerEvents && touchPointersPresent;
exports.transition = (0, _call_once2.default)(function() {
    return supportProp("transition")
});
exports.transitionEndEventName = (0, _call_once2.default)(function() {
    return transitionEndEventNames[_style2.default.styleProp("transition")]
});
exports.animation = (0, _call_once2.default)(function() {
    return supportProp("animation")
});
exports.nativeScrolling = isNativeScrollingSupported();
exports.styleProp = _style2.default.styleProp;
exports.stylePropPrefix = _style2.default.stylePropPrefix;
exports.supportProp = supportProp;
exports.inputType = inputType;
