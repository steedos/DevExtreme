/**
 * DevExtreme (ui/drawer/ui.drawer.rendering.strategy.shrink.js)
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
var _extend = require("../../core/utils/extend");
var _inflector = require("../../core/utils/inflector");

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
var ShrinkStrategy = function(_DrawerStrategy) {
    _inherits(ShrinkStrategy, _DrawerStrategy);

    function ShrinkStrategy() {
        _classCallCheck(this, ShrinkStrategy);
        return _possibleConstructorReturn(this, (ShrinkStrategy.__proto__ || Object.getPrototypeOf(ShrinkStrategy)).apply(this, arguments))
    }
    _createClass(ShrinkStrategy, [{
        key: "slidePositionRendering",
        value: function(config, offset, animate) {
            if (animate) {
                var animationConfig = (0, _extend.extend)(config.defaultAnimationConfig, {
                    $element: config.$panel,
                    margin: config.panelOffset,
                    duration: this.getDrawerInstance().option("animationDuration"),
                    direction: config.direction
                });
                _uiDrawerRendering.animation.margin(animationConfig)
            } else {
                config.$panel.css("margin" + (0, _inflector.camelize)(config.direction, true), config.panelOffset)
            }
        }
    }, {
        key: "expandPositionRendering",
        value: function(config, offset, animate) {
            var drawer = this.getDrawerInstance();
            if (animate) {
                var animationConfig = (0, _extend.extend)(config.defaultAnimationConfig, {
                    $element: config.$panel,
                    size: config.size,
                    duration: drawer.option("animationDuration"),
                    direction: config.direction
                });
                _uiDrawerRendering.animation.size(animationConfig)
            } else {
                if (drawer.isHorizontalDirection()) {
                    (0, _renderer2.default)(config.$panel).css("width", config.size)
                } else {
                    (0, _renderer2.default)(config.$panel).css("height", config.size)
                }
            }
        }
    }, {
        key: "getPositionRenderingConfig",
        value: function(offset) {
            return (0, _extend.extend)(_get(ShrinkStrategy.prototype.__proto__ || Object.getPrototypeOf(ShrinkStrategy.prototype), "getPositionRenderingConfig", this).call(this, offset), {
                panelOffset: this._getPanelOffset(offset)
            })
        }
    }, {
        key: "needOrderContent",
        value: function(position, isRtl) {
            return (isRtl ? "left" === position : "right" === position) || "bottom" === position
        }
    }]);
    return ShrinkStrategy
}(_uiDrawerRendering2.default);
module.exports = ShrinkStrategy;
