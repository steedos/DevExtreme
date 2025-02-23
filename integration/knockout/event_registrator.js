/**
 * DevExtreme (integration/knockout/event_registrator.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    eventsEngine = require("../../events/core/events_engine"),
    ko = require("knockout"),
    isPlainObject = require("../../core/utils/type").isPlainObject,
    eventRegistratorCallbacks = require("../../events/core/event_registrator_callbacks"),
    eventUtils = require("../../events/utils");
eventRegistratorCallbacks.add(function(name) {
    var koBindingEventName = eventUtils.addNamespace(name, name + "Binding");
    ko.bindingHandlers[name] = {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var $element = $(element),
                unwrappedValue = ko.utils.unwrapObservable(valueAccessor()),
                eventSource = unwrappedValue.execute ? unwrappedValue.execute : unwrappedValue;
            eventsEngine.off($element, koBindingEventName);
            eventsEngine.on($element, koBindingEventName, isPlainObject(unwrappedValue) ? unwrappedValue : {}, function(e) {
                eventSource.call(viewModel, viewModel, e)
            })
        }
    }
});
