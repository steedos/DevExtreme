/**
 * DevExtreme (ui/tab_panel/item.js)
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
var _get = function get(object, property, receiver) {
    if (null === object) {
        object = Function.prototype
    }
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (void 0 === desc) {
        var parent = Object.getPrototypeOf(object);
        if (null === parent) {
            return
        } else {
            return get(parent, property, receiver)
        }
    } else {
        if ("value" in desc) {
            return desc.value
        } else {
            var getter = desc.get;
            if (void 0 === getter) {
                return
            }
            return getter.call(receiver)
        }
    }
};
var _item = require("../collection/item");
var _item2 = _interopRequireDefault(_item);
var _common = require("../../core/utils/common");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && ("object" === typeof call || "function" === typeof call) ? call : self
}

function _inherits(subClass, superClass) {
    if ("function" !== typeof superClass && null !== superClass) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) {
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
    }
}
var TabPanelItem = function(_CollectionWidgetItem) {
    _inherits(TabPanelItem, _CollectionWidgetItem);

    function TabPanelItem() {
        _classCallCheck(this, TabPanelItem);
        return _possibleConstructorReturn(this, (TabPanelItem.__proto__ || Object.getPrototypeOf(TabPanelItem)).apply(this, arguments))
    }
    _createClass(TabPanelItem, [{
        key: "_renderWatchers",
        value: function() {
            this._startWatcher("badge", _common.noop);
            return _get(TabPanelItem.prototype.__proto__ || Object.getPrototypeOf(TabPanelItem.prototype), "_renderWatchers", this).call(this)
        }
    }]);
    return TabPanelItem
}(_item2.default);
exports.default = TabPanelItem;
