/**
 * DevExtreme (ui/widget/selectors.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    domAdapter = require("../../core/dom_adapter");
var _focusable = function(element, tabIndex) {
    if (!visible(element)) {
        return false
    }
    var nodeName = element.nodeName.toLowerCase(),
        isTabIndexNotNaN = !isNaN(tabIndex),
        isDisabled = element.disabled,
        isDefaultFocus = /^(input|select|textarea|button|object|iframe)$/.test(nodeName),
        isHyperlink = "a" === nodeName,
        isFocusable = true,
        isContentEditable = element.isContentEditable;
    if (isDefaultFocus || isContentEditable) {
        isFocusable = !isDisabled
    } else {
        if (isHyperlink) {
            isFocusable = element.href || isTabIndexNotNaN
        } else {
            isFocusable = isTabIndexNotNaN
        }
    }
    return isFocusable
};
var visible = function(element) {
    var $element = $(element);
    return $element.is(":visible") && "hidden" !== $element.css("visibility") && "hidden" !== $element.parents().css("visibility")
};
module.exports = {
    focusable: function(index, element) {
        return _focusable(element, $(element).attr("tabIndex"))
    },
    tabbable: function(index, element) {
        var tabIndex = $(element).attr("tabIndex");
        return (isNaN(tabIndex) || tabIndex >= 0) && _focusable(element, tabIndex)
    },
    focused: function($element) {
        var element = $($element).get(0);
        return domAdapter.getActiveElement() === element
    }
};
