/**
 * DevExtreme (ui/validation/default_adapter.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var Callbacks = require("../../core/utils/callbacks"),
    Class = require("../../core/class");
var DefaultAdapter = Class.inherit({
    ctor: function(editor, validator) {
        var that = this;
        that.editor = editor;
        that.validator = validator;
        that.validationRequestsCallbacks = Callbacks();
        var handler = function(args) {
            that.validationRequestsCallbacks.fire(args)
        };
        editor.validationRequest.add(handler);
        editor.on("disposing", function() {
            editor.validationRequest.remove(handler)
        })
    },
    getValue: function() {
        return this.editor.option("value")
    },
    getCurrentValidationError: function() {
        return this.editor.option("validationError")
    },
    bypass: function() {
        return this.editor.option("disabled")
    },
    applyValidationResults: function(params) {
        this.editor.option({
            isValid: params.isValid,
            validationError: params.brokenRule
        })
    },
    reset: function() {
        this.editor.reset()
    },
    focus: function() {
        this.editor.focus()
    }
});
module.exports = DefaultAdapter;
