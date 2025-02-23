/**
 * DevExtreme (ui/html_editor/modules/widget_collector.js)
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
var WidgetCollector = function() {
    function WidgetCollector() {
        _classCallCheck(this, WidgetCollector);
        this._collection = []
    }
    _createClass(WidgetCollector, [{
        key: "clear",
        value: function() {
            this._collection = []
        }
    }, {
        key: "add",
        value: function(name, instance) {
            this._collection.push({
                name: name,
                instance: instance
            })
        }
    }, {
        key: "getByName",
        value: function(widgetName) {
            var _ref = this._collection.find(function(_ref2) {
                    var name = _ref2.name;
                    return widgetName === name
                }) || {},
                instance = _ref.instance;
            return instance
        }
    }, {
        key: "each",
        value: function(handler) {
            this._collection.forEach(function(_ref3) {
                var name = _ref3.name,
                    instance = _ref3.instance;
                return instance && handler(name, instance)
            })
        }
    }]);
    return WidgetCollector
}();
exports.default = WidgetCollector;
