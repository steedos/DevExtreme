/**
 * DevExtreme (ui/html_editor/converterController.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) {
                descriptor.writable = true
            }
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) {
            defineProperties(Constructor.prototype, protoProps)
        }
        if (staticProps) {
            defineProperties(Constructor, staticProps)
        }
        return Constructor
    }
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
var ConverterController = function() {
    function ConverterController() {
        _classCallCheck(this, ConverterController);
        this._converters = {}
    }
    _createClass(ConverterController, [{
        key: "addConverter",
        value: function(name, converter) {
            this._converters[name] = converter
        }
    }, {
        key: "getConverter",
        value: function(name) {
            return this._converters[name]
        }
    }]);
    return ConverterController
}();
var controller = new ConverterController;
exports.default = controller;
