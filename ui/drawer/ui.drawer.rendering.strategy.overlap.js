/**
 * DevExtreme (ui/drawer/ui.drawer.rendering.strategy.overlap.js)
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
var _overlay = require("../overlay");
var _overlay2 = _interopRequireDefault(_overlay);
var _type = require("../../core/utils/type");
var _type2 = _interopRequireDefault(_type);
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
var OverlapStrategy = function(_DrawerStrategy) {
    _inherits(OverlapStrategy, _DrawerStrategy);

    function OverlapStrategy() {
        _classCallCheck(this, OverlapStrategy);
        return _possibleConstructorReturn(this, (OverlapStrategy.__proto__ || Object.getPrototypeOf(OverlapStrategy)).apply(this, arguments))
    }
    _createClass(OverlapStrategy, [{
        key: "renderPanel",
        value: function(template, whenPanelRendered) {
            var _this2 = this;
            delete this._initialPosition;
            var position = this.getOverlayPosition();
            var drawer = this.getDrawerInstance();
            drawer._overlay = drawer._createComponent(drawer.content(), _overlay2.default, {
                shading: false,
                container: drawer.getOverlayTarget(),
                position: position,
                width: "auto",
                height: "100%",
                templatesRenderAsynchronously: drawer.option("templatesRenderAsynchronously"),
                animation: {
                    show: {
                        duration: 0
                    }
                },
                onPositioned: function(e) {
                    this._fixOverlayPosition(e.component.$content())
                }.bind(this),
                contentTemplate: drawer.option("template"),
                onContentReady: function(args) {
                    whenPanelRendered.resolve();
                    _this2._processOverlayZIndex(args.component.content())
                },
                visible: true,
                propagateOutsideClick: true
            })
        }
    }, {
        key: "_fixOverlayPosition",
        value: function($overlayContent) {
            var drawer = this.getDrawerInstance();
            if (_type2.default.isDefined(this._initialPosition)) {
                _translator2.default.move($overlayContent, {
                    left: this._initialPosition.left,
                    top: this._initialPosition.top
                })
            }
            if ("right" === drawer.getDrawerPosition()) {
                $overlayContent.css("left", "auto");
                if (drawer.option("rtlEnabled")) {
                    _translator2.default.move($overlayContent, {
                        left: 0
                    })
                }
            }
        }
    }, {
        key: "getOverlayPosition",
        value: function() {
            var drawer = this.getDrawerInstance();
            var panelPosition = drawer.getDrawerPosition();
            var result = {};
            if ("left" === panelPosition) {
                result = {
                    my: "top left",
                    at: "top left"
                }
            }
            if ("right" === panelPosition) {
                var my = drawer.option("rtlEnabled") ? "top left" : "top right";
                result = {
                    my: my,
                    at: "top right"
                }
            }
            if ("top" === panelPosition || "bottom" === panelPosition) {
                result = {
                    my: panelPosition,
                    at: panelPosition
                }
            }
            result.of = drawer.getOverlayTarget();
            return result
        }
    }, {
        key: "setPanelSize",
        value: function(keepMaxSize) {
            var drawer = this.getDrawerInstance();
            var overlay = drawer.getOverlay();
            if (drawer.isHorizontalDirection()) {
                overlay.option("height", "100%");
                overlay.option("width", keepMaxSize ? drawer.getRealPanelWidth() : this._getPanelSize(drawer.option("opened")))
            } else {
                overlay.option("width", overlay.option("container").width());
                overlay.option("height", keepMaxSize ? drawer.getRealPanelHeight() : this._getPanelSize(drawer.option("opened")))
            }
        }
    }, {
        key: "setupContent",
        value: function($content, position) {
            var drawer = this.getDrawerInstance();
            $content.css("padding" + (0, _inflector.camelize)(position, true), drawer.option("minSize"));
            $content.css("transform", "inherit")
        }
    }, {
        key: "slidePositionRendering",
        value: function(config, offset, animate) {
            var drawer = this.getDrawerInstance();
            this._initialPosition = drawer.getOverlay().$content().position();
            var position = drawer.getDrawerPosition();
            this.setupContent(config.$content, position, config.drawer);
            if (animate) {
                var animationConfig = (0, _extend.extend)(config.defaultAnimationConfig, {
                    $element: config.$panel,
                    position: config.panelOffset,
                    duration: drawer.option("animationDuration"),
                    direction: position
                });
                _uiDrawerRendering.animation.moveTo(animationConfig)
            } else {
                if (drawer.isHorizontalDirection()) {
                    _translator2.default.move(config.$panel, {
                        left: config.panelOffset
                    })
                } else {
                    _translator2.default.move(config.$panel, {
                        top: config.panelOffset
                    })
                }
            }
        }
    }, {
        key: "expandPositionRendering",
        value: function(config, offset, animate) {
            var drawer = this.getDrawerInstance();
            this._initialPosition = drawer.getOverlay().$content().position();
            var position = drawer.getDrawerPosition();
            this.setupContent(config.$content, position);
            _translator2.default.move(config.$panelOverlayContent, {
                left: 0
            });
            var animationConfig = (0, _extend.extend)(config.defaultAnimationConfig, {
                $element: config.$panelOverlayContent,
                size: config.size,
                duration: drawer.option("animationDuration"),
                direction: position,
                marginTop: config.marginTop
            });
            if (animate) {
                _uiDrawerRendering.animation.size(animationConfig)
            } else {
                if (drawer.isHorizontalDirection()) {
                    (0, _renderer2.default)(config.$panelOverlayContent).css("width", config.size)
                } else {
                    (0, _renderer2.default)(config.$panelOverlayContent).css("height", config.size);
                    if ("bottom" === position) {
                        (0, _renderer2.default)(config.$panelOverlayContent).css("marginTop", config.marginTop)
                    }
                }
            }
        }
    }, {
        key: "getPositionRenderingConfig",
        value: function(offset) {
            var drawer = this.getDrawerInstance();
            var config = _get(OverlapStrategy.prototype.__proto__ || Object.getPrototypeOf(OverlapStrategy.prototype), "getPositionRenderingConfig", this).call(this, offset);
            return (0, _extend.extend)(config, {
                panelOffset: this._getPanelOffset(offset) * this.getDrawerInstance()._getPositionCorrection(),
                $panelOverlayContent: drawer.getOverlay().$content(),
                marginTop: drawer.getRealPanelHeight() - config.size
            })
        }
    }, {
        key: "getPanelContent",
        value: function() {
            return (0, _renderer2.default)(this.getDrawerInstance().getOverlay().content())
        }
    }, {
        key: "_processOverlayZIndex",
        value: function($element) {
            var styles = (0, _renderer2.default)($element).get(0).style;
            var zIndex = styles.zIndex || 1;
            this.getDrawerInstance().setZIndex(zIndex)
        }
    }, {
        key: "needOrderContent",
        value: function(position) {
            return "right" === position || "bottom" === position
        }
    }]);
    return OverlapStrategy
}(_uiDrawerRendering2.default);
module.exports = OverlapStrategy;
