/**
 * DevExtreme (ui/drawer/ui.drawer.rendering.strategy.push.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
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
var _uiDrawerRendering = require("./ui.drawer.rendering.strategy");
var _uiDrawerRendering2 = _interopRequireDefault(_uiDrawerRendering);
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _translator = require("../../animation/translator");
var _translator2 = _interopRequireDefault(_translator);
var _extend = require("../../core/utils/extend");

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
var PushStrategy = function(_DrawerStrategy) {
    _inherits(PushStrategy, _DrawerStrategy);

    function PushStrategy() {
        _classCallCheck(this, PushStrategy);
        return _possibleConstructorReturn(this, (PushStrategy.__proto__ || Object.getPrototypeOf(PushStrategy)).apply(this, arguments))
    }
    _createClass(PushStrategy, [{
        key: "useDefaultAnimation",
        value: function() {
            return true
        }
    }, {
        key: "defaultPositionRendering",
        value: function(config, offset, animate) {
            var _this2 = this;
            var drawer = this.getDrawerInstance();
            (0, _renderer2.default)(drawer.content()).css(drawer.isHorizontalDirection() ? "width" : "height", config.maxSize);
            if (animate) {
                var animationConfig = {
                    $element: config.$content,
                    position: config.contentPosition,
                    direction: drawer.getDrawerPosition(),
                    duration: drawer.option("animationDuration"),
                    complete: function() {
                        _this2._elementsAnimationCompleteHandler()
                    }
                };
                _uiDrawerRendering.animation.moveTo(animationConfig)
            } else {
                if (drawer.isHorizontalDirection()) {
                    _translator2.default.move(config.$content, {
                        left: config.contentPosition
                    })
                } else {
                    _translator2.default.move(config.$content, {
                        top: config.contentPosition
                    })
                }
            }
        }
    }, {
        key: "getPositionRenderingConfig",
        value: function(offset) {
            return (0, _extend.extend)(_get(PushStrategy.prototype.__proto__ || Object.getPrototypeOf(PushStrategy.prototype), "getPositionRenderingConfig", this).call(this, offset), {
                contentPosition: this._getPanelSize(offset) * this.getDrawerInstance()._getPositionCorrection(),
                maxSize: this._getPanelSize(true)
            })
        }
    }]);
    return PushStrategy
}(_uiDrawerRendering2.default);
module.exports = PushStrategy;
