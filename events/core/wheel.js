/**
 * DevExtreme (events/core/wheel.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    eventsEngine = require("../../events/core/events_engine"),
    domAdapter = require("../../core/dom_adapter"),
    callOnce = require("../../core/utils/call_once"),
    registerEvent = require("./event_registrator"),
    eventUtils = require("../utils");
var EVENT_NAME = "dxmousewheel",
    EVENT_NAMESPACE = "dxWheel";
var getWheelEventName = callOnce(function() {
    return domAdapter.hasDocumentProperty("onwheel") ? "wheel" : "mousewheel"
});
var wheel = {
    setup: function(element) {
        var $element = $(element);
        eventsEngine.on($element, eventUtils.addNamespace(getWheelEventName(), EVENT_NAMESPACE), wheel._wheelHandler.bind(wheel))
    },
    teardown: function(element) {
        eventsEngine.off(element, "." + EVENT_NAMESPACE)
    },
    _wheelHandler: function(e) {
        var delta = this._getWheelDelta(e.originalEvent);
        eventUtils.fireEvent({
            type: EVENT_NAME,
            originalEvent: e,
            delta: delta,
            pointerType: "mouse"
        });
        e.stopPropagation()
    },
    _getWheelDelta: function(event) {
        return event.wheelDelta ? event.wheelDelta : 30 * -event.deltaY
    }
};
registerEvent(EVENT_NAME, wheel);
exports.name = EVENT_NAME;
