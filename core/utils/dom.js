/**
 * DevExtreme (core/utils/dom.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    config = require("../../core/config"),
    domAdapter = require("../../core/dom_adapter"),
    windowUtils = require("./window"),
    window = windowUtils.getWindow(),
    eventsEngine = require("../../events/core/events_engine"),
    inArray = require("./array").inArray,
    typeUtils = require("./type"),
    isDefined = typeUtils.isDefined,
    isRenderer = typeUtils.isRenderer,
    htmlParser = require("../../core/utils/html_parser"),
    elementStrategy;
var resetActiveElement = function() {
    var activeElement = domAdapter.getActiveElement();
    if (activeElement && activeElement !== domAdapter.getBody() && activeElement.blur) {
        activeElement.blur()
    }
};
var clearSelection = function() {
    var selection = window.getSelection();
    if (!selection) {
        return
    }
    if ("Caret" === selection.type) {
        return
    }
    if (selection.empty) {
        selection.empty()
    } else {
        if (selection.removeAllRanges) {
            try {
                selection.removeAllRanges()
            } catch (e) {}
        }
    }
};
var closestCommonParent = function(startTarget, endTarget) {
    var $startTarget = $(startTarget),
        $endTarget = $(endTarget);
    if ($startTarget[0] === $endTarget[0]) {
        return $startTarget[0]
    }
    var $startParents = $startTarget.parents(),
        $endParents = $endTarget.parents(),
        startingParent = Math.min($startParents.length, $endParents.length);
    for (var i = -startingParent; i < 0; i++) {
        if ($startParents.get(i) === $endParents.get(i)) {
            return $startParents.get(i)
        }
    }
};
var triggerVisibilityChangeEvent = function(eventName) {
    var VISIBILITY_CHANGE_SELECTOR = ".dx-visibility-change-handler";
    return function(element) {
        var $element = $(element || "body");
        var changeHandlers = $element.filter(VISIBILITY_CHANGE_SELECTOR).add($element.find(VISIBILITY_CHANGE_SELECTOR));
        for (var i = 0; i < changeHandlers.length; i++) {
            eventsEngine.triggerHandler(changeHandlers[i], eventName)
        }
    }
};
var uniqueId = function() {
    var counter = 0;
    return function(prefix) {
        return (prefix || "") + counter++
    }
}();
var dataOptionsAttributeName = "data-options";
var getElementOptions = function(element) {
    var optionsString = $(element).attr(dataOptionsAttributeName) || "";
    return config().optionsParser(optionsString)
};
var createComponents = function(elements, componentTypes) {
    var result = [],
        selector = "[" + dataOptionsAttributeName + "]";
    var $items = elements.find(selector).add(elements.filter(selector));
    $items.each(function(index, element) {
        var $element = $(element),
            options = getElementOptions(element);
        for (var componentName in options) {
            if (!componentTypes || inArray(componentName, componentTypes) > -1) {
                if ($element[componentName]) {
                    $element[componentName](options[componentName]);
                    result.push($element[componentName]("instance"))
                }
            }
        }
    });
    return result
};
var createMarkupFromString = function(str) {
    if (!window.WinJS) {
        return $(htmlParser.parseHTML(str))
    }
    var tempElement = $("<div>");
    window.WinJS.Utilities.setInnerHTMLUnsafe(tempElement.get(0), str);
    return tempElement.contents()
};
var extractTemplateMarkup = function(element) {
    element = $(element);
    var templateTag = element.length && element.filter(function() {
        var $node = $(this);
        return $node.is("script[type]") && $node.attr("type").indexOf("script") < 0
    });
    if (templateTag.length) {
        return templateTag.eq(0).html()
    } else {
        element = $("<div>").append(element);
        return element.html()
    }
};
var normalizeTemplateElement = function normalizeTemplateElement(element) {
    var $element = isDefined(element) && (element.nodeType || isRenderer(element)) ? $(element) : $("<div>").html(element).contents();
    if (1 === $element.length) {
        if ($element.is("script")) {
            $element = normalizeTemplateElement($element.html().trim())
        } else {
            if ($element.is("table")) {
                $element = $element.children("tbody").contents()
            }
        }
    }
    return $element
};
var toggleAttr = function($target, attr, value) {
    value ? $target.attr(attr, value) : $target.removeAttr(attr)
};
var clipboardText = function(event, text) {
    var clipboard = event.originalEvent && event.originalEvent.clipboardData || window.clipboardData;
    if (1 === arguments.length) {
        return clipboard && clipboard.getData("Text")
    }
    clipboard && clipboard.setData("Text", text)
};
var contains = function(container, element) {
    if (!element) {
        return false
    }
    element = domAdapter.isTextNode(element) ? element.parentNode : element;
    return domAdapter.isDocument(container) ? container.documentElement.contains(element) : container.contains(element)
};
var getPublicElement = function($element) {
    return elementStrategy($element)
};
var setPublicElementWrapper = function(value) {
    elementStrategy = value
};
setPublicElementWrapper(function(element) {
    return element && element.get(0)
});
exports.setPublicElementWrapper = setPublicElementWrapper;
exports.resetActiveElement = resetActiveElement;
exports.createMarkupFromString = createMarkupFromString;
exports.triggerShownEvent = triggerVisibilityChangeEvent("dxshown");
exports.triggerHidingEvent = triggerVisibilityChangeEvent("dxhiding");
exports.triggerResizeEvent = triggerVisibilityChangeEvent("dxresize");
exports.getElementOptions = getElementOptions;
exports.createComponents = createComponents;
exports.extractTemplateMarkup = extractTemplateMarkup;
exports.normalizeTemplateElement = normalizeTemplateElement;
exports.clearSelection = clearSelection;
exports.uniqueId = uniqueId;
exports.closestCommonParent = closestCommonParent;
exports.clipboardText = clipboardText;
exports.toggleAttr = toggleAttr;
exports.contains = contains;
exports.getPublicElement = getPublicElement;
