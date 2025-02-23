/**
 * DevExtreme (ui/drawer/ui.drawer.rendering.strategy.js)
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
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _fx = require("../../animation/fx");
var _fx2 = _interopRequireDefault(_fx);
var _deferred = require("../../core/utils/deferred");
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
var animation = {
    moveTo: function(config) {
        var $element = config.$element,
            position = config.position,
            direction = config.direction || "left",
            toConfig = {},
            animationType = void 0;
        if ("right" === direction) {
            toConfig.transform = "translate(" + position + "px, 0px)";
            animationType = "custom"
        }
        if ("left" === direction) {
            toConfig.left = position;
            animationType = "slide"
        }
        if ("top" === direction || "bottom" === direction) {
            toConfig.top = position;
            animationType = "slide"
        }
        _fx2.default.animate($element, {
            type: animationType,
            to: toConfig,
            duration: config.duration,
            complete: config.complete
        })
    },
    margin: function margin(config) {
        var $element = config.$element,
            margin = config.margin,
            direction = config.direction || "left",
            toConfig = {};
        toConfig["margin" + (0, _inflector.camelize)(direction, true)] = margin;
        _fx2.default.animate($element, {
            to: toConfig,
            duration: config.duration,
            complete: config.complete
        })
    },
    fade: function($element, config, duration, completeAction) {
        _fx2.default.animate($element, {
            type: "fade",
            to: config.to,
            from: config.from,
            duration: duration,
            complete: completeAction
        })
    },
    size: function size(config) {
        var $element = config.$element,
            size = config.size,
            direction = config.direction || "left",
            marginTop = config.marginTop || 0,
            duration = config.duration,
            toConfig = {};
        if ("right" === direction || "left" === direction) {
            toConfig.width = size
        } else {
            toConfig.height = size
        }
        if ("bottom" === direction) {
            toConfig.marginTop = marginTop
        }
        _fx2.default.animate($element, {
            to: toConfig,
            duration: duration,
            complete: config.complete
        })
    },
    complete: function($element) {
        _fx2.default.stop($element, true)
    }
};
var DrawerStrategy = function() {
    function DrawerStrategy(drawer) {
        _classCallCheck(this, DrawerStrategy);
        this._drawer = drawer
    }
    _createClass(DrawerStrategy, [{
        key: "getDrawerInstance",
        value: function() {
            return this._drawer
        }
    }, {
        key: "renderPanel",
        value: function(template, whenPanelRendered) {
            template && template.render({
                container: this.getDrawerInstance().content(),
                onRendered: function() {
                    whenPanelRendered.resolve()
                }
            })
        }
    }, {
        key: "renderPosition",
        value: function(offset, animate) {
            var drawer = this.getDrawerInstance();
            var revealMode = drawer.option("revealMode");
            this.prepareAnimationDeferreds(animate);
            var config = this.getPositionRenderingConfig(offset);
            if (this.useDefaultAnimation()) {
                this.defaultPositionRendering(config, offset, animate)
            } else {
                if ("slide" === revealMode) {
                    this.slidePositionRendering(config, offset, animate)
                }
                if ("expand" === revealMode) {
                    this.expandPositionRendering(config, offset, animate)
                }
            }
        }
    }, {
        key: "prepareAnimationDeferreds",
        value: function(animate) {
            var drawer = this.getDrawerInstance();
            this._contentAnimation = new _deferred.Deferred;
            this._panelAnimation = new _deferred.Deferred;
            this._shaderAnimation = new _deferred.Deferred;
            drawer._animations.push(this._contentAnimation, this._panelAnimation, this._shaderAnimation);
            if (animate) {
                _deferred.when.apply(_renderer2.default, drawer._animations).done(function() {
                    drawer._animationCompleteHandler()
                })
            } else {
                drawer.resizeContent()
            }
        }
    }, {
        key: "getPositionRenderingConfig",
        value: function(offset) {
            var drawer = this.getDrawerInstance();
            return {
                direction: drawer.getDrawerPosition(),
                $panel: (0, _renderer2.default)(drawer.content()),
                $content: (0, _renderer2.default)(drawer.viewContent()),
                defaultAnimationConfig: this._defaultAnimationConfig(),
                size: this._getPanelSize(offset)
            }
        }
    }, {
        key: "useDefaultAnimation",
        value: function() {
            return false
        }
    }, {
        key: "_elementsAnimationCompleteHandler",
        value: function() {
            this._contentAnimation.resolve();
            this._panelAnimation.resolve()
        }
    }, {
        key: "_defaultAnimationConfig",
        value: function() {
            var _this = this;
            return {
                complete: function() {
                    _this._elementsAnimationCompleteHandler()
                }
            }
        }
    }, {
        key: "_getPanelOffset",
        value: function(offset) {
            var drawer = this.getDrawerInstance();
            var size = drawer.isHorizontalDirection() ? drawer.getRealPanelWidth() : drawer.getRealPanelHeight();
            if (offset) {
                return -(size - drawer.getMaxSize())
            } else {
                return -(size - drawer.getMinSize())
            }
        }
    }, {
        key: "_getPanelSize",
        value: function(offset) {
            return offset ? this.getDrawerInstance().getMaxSize() : this.getDrawerInstance().getMinSize()
        }
    }, {
        key: "renderShaderVisibility",
        value: function(offset, animate, duration) {
            var _this2 = this;
            var fadeConfig = this._getFadeConfig(offset);
            var drawer = this.getDrawerInstance();
            if (animate) {
                animation.fade((0, _renderer2.default)(drawer._$shader), fadeConfig, duration, function() {
                    _this2._drawer._toggleShaderVisibility(offset);
                    _this2._shaderAnimation.resolve()
                })
            } else {
                drawer._toggleShaderVisibility(offset);
                drawer._$shader.css("opacity", fadeConfig.to)
            }
        }
    }, {
        key: "_getFadeConfig",
        value: function(offset) {
            if (offset) {
                return {
                    to: 1,
                    from: 0
                }
            } else {
                return {
                    to: 0,
                    from: 1
                }
            }
        }
    }, {
        key: "getPanelContent",
        value: function() {
            return (0, _renderer2.default)(this.getDrawerInstance().content())
        }
    }, {
        key: "getWidth",
        value: function() {
            return this.getDrawerInstance().$element().get(0).getBoundingClientRect().width
        }
    }, {
        key: "setPanelSize",
        value: function(keepMaxSize) {
            var drawer = this.getDrawerInstance();
            var panelSize = this._getPanelSize(drawer.option("opened"));
            if (drawer.isHorizontalDirection()) {
                (0, _renderer2.default)(drawer.content()).width(keepMaxSize ? drawer.getRealPanelWidth() : panelSize)
            } else {
                (0, _renderer2.default)(drawer.content()).height(keepMaxSize ? drawer.getRealPanelHeight() : panelSize)
            }
        }
    }, {
        key: "needOrderContent",
        value: function() {
            return false
        }
    }]);
    return DrawerStrategy
}();
module.exports = DrawerStrategy;
module.exports.animation = animation;
