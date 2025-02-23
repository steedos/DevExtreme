/**
 * DevExtreme (ui/text_box/utils.caret.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    isDefined = require("../../core/utils/type").isDefined,
    browser = require("../../core/utils/browser"),
    domAdapter = require("../../core/dom_adapter");
var isFocusingOnCaretChange = browser.msie || browser.safari;
var getCaret = function(input) {
    if (isObsoleteBrowser(input)) {
        return getCaretForObsoleteBrowser(input)
    }
    return {
        start: input.selectionStart,
        end: input.selectionEnd
    }
};
var setCaret = function(input, position) {
    if (isObsoleteBrowser(input)) {
        setCaretForObsoleteBrowser(input, position);
        return
    }
    if (!domAdapter.getBody().contains(input)) {
        return
    }
    input.selectionStart = position.start;
    input.selectionEnd = position.end
};
var isObsoleteBrowser = function(input) {
    return !input.setSelectionRange
};
var getCaretForObsoleteBrowser = function(input) {
    var range = domAdapter.getSelection().createRange();
    var rangeCopy = range.duplicate();
    range.move("character", -input.value.length);
    range.setEndPoint("EndToStart", rangeCopy);
    return {
        start: range.text.length,
        end: range.text.length + rangeCopy.text.length
    }
};
var setCaretForObsoleteBrowser = function(input, position) {
    if (!domAdapter.getBody().contains(input)) {
        return
    }
    var range = input.createTextRange();
    range.collapse(true);
    range.moveStart("character", position.start);
    range.moveEnd("character", position.end - position.start);
    range.select()
};
var caret = function(input, position) {
    input = $(input).get(0);
    if (!isDefined(position)) {
        return getCaret(input)
    }
    if (isFocusingOnCaretChange && domAdapter.getActiveElement() !== input) {
        return
    }
    setCaret(input, position)
};
module.exports = caret;
