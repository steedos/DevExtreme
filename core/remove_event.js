/**
 * DevExtreme (core/remove_event.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("./renderer");
var beforeCleanData = require("./element_data").beforeCleanData;
var eventsEngine = require("../events/core/events_engine");
var registerEvent = require("../events/core/event_registrator");
var eventName = "dxremove";
var eventPropName = "dxRemoveEvent";
beforeCleanData(function(elements) {
    elements = [].slice.call(elements);
    for (var i = 0; i < elements.length; i++) {
        var $element = $(elements[i]);
        if ($element.prop(eventPropName)) {
            $element[0][eventPropName] = null;
            eventsEngine.triggerHandler($element, eventName)
        }
    }
});
registerEvent(eventName, {
    noBubble: true,
    setup: function(element) {
        $(element).prop(eventPropName, true)
    }
});
module.exports = eventName;
