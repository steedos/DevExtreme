/**
 * DevExtreme (ui/drawer/ui.drawer.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _type = require("../../core/utils/type");
var _type2 = _interopRequireDefault(_type);
var _dom = require("../../core/utils/dom");
var _component_registrator = require("../../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _extend = require("../../core/utils/extend");
var _ui = require("../widget/ui.widget");
var _ui2 = _interopRequireDefault(_ui);
var _empty_template = require("../widget/empty_template");
var _empty_template2 = _interopRequireDefault(_empty_template);
var _window = require("../../core/utils/window");
var _uiDrawerRenderingStrategy = require("./ui.drawer.rendering.strategy.push");
var _uiDrawerRenderingStrategy2 = _interopRequireDefault(_uiDrawerRenderingStrategy);
var _uiDrawerRenderingStrategy3 = require("./ui.drawer.rendering.strategy.shrink");
var _uiDrawerRenderingStrategy4 = _interopRequireDefault(_uiDrawerRenderingStrategy3);
var _uiDrawerRenderingStrategy5 = require("./ui.drawer.rendering.strategy.overlap");
var _uiDrawerRenderingStrategy6 = _interopRequireDefault(_uiDrawerRenderingStrategy5);
var _uiDrawerRendering = require("./ui.drawer.rendering.strategy");
var _click = require("../../events/click");
var _click2 = _interopRequireDefault(_click);
var _fx = require("../../animation/fx");
var _fx2 = _interopRequireDefault(_fx);
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var DRAWER_CLASS = "dx-drawer";
var DRAWER_WRAPPER_CLASS = "dx-drawer-wrapper";
var DRAWER_PANEL_CONTENT_CLASS = "dx-drawer-panel-content";
var DRAWER_CONTENT_CLASS = "dx-drawer-content";
var DRAWER_SHADER_CLASS = "dx-drawer-shader";
var INVISIBLE_STATE_CLASS = "dx-state-invisible";
var OPENED_STATE_CLASS = "dx-drawer-opened";
var ANONYMOUS_TEMPLATE_NAME = "content";
var Drawer = _ui2.default.inherit({
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            position: "left",
            opened: false,
            minSize: null,
            maxSize: null,
            shading: false,
            template: "panel",
            openedStateMode: "shrink",
            revealMode: "slide",
            animationEnabled: true,
            animationDuration: 400,
            closeOnOutsideClick: false,
            contentTemplate: "content",
            target: void 0
        })
    },
    _getAnonymousTemplateName: function() {
        return ANONYMOUS_TEMPLATE_NAME
    },
    _init: function() {
        this.callBase();
        this._initStrategy();
        this.$element().addClass(DRAWER_CLASS);
        this._animations = [];
        this._animationPromise = void 0;
        this._whenPanelRendered = void 0;
        this._whenPanelRefreshed = void 0;
        this._initHideTopOverlayHandler();
        this._initContentMarkup()
    },
    _initStrategy: function() {
        var mode = this.option("openedStateMode");
        var Strategy = this._getDefaultStrategy();
        if ("push" === mode) {
            Strategy = _uiDrawerRenderingStrategy2.default
        }
        if ("shrink" === mode) {
            Strategy = _uiDrawerRenderingStrategy4.default
        }
        if ("overlap" === mode) {
            Strategy = _uiDrawerRenderingStrategy6.default
        }
        this._strategy = new Strategy(this)
    },
    _initContentMarkup: function() {
        this._$wrapper = (0, _renderer2.default)("<div>").addClass(DRAWER_WRAPPER_CLASS);
        this._$contentWrapper = (0, _renderer2.default)("<div>").addClass(DRAWER_CONTENT_CLASS);
        this._$wrapper.append(this._$contentWrapper);
        this.$element().append(this._$wrapper)
    },
    _getDefaultStrategy: function() {
        return _uiDrawerRenderingStrategy2.default
    },
    _initHideTopOverlayHandler: function() {
        this._hideMenuHandler = this.hide.bind(this)
    },
    _initTemplates: function() {
        this.callBase();
        this._defaultTemplates.panel = new _empty_template2.default(this);
        this._defaultTemplates.content = new _empty_template2.default(this)
    },
    _initCloseOnOutsideClickHandler: function() {
        _events_engine2.default.off(this._$contentWrapper, _click2.default.name);
        _events_engine2.default.on(this._$contentWrapper, _click2.default.name, this._outsideClickHandler.bind(this))
    },
    _outsideClickHandler: function(e) {
        var closeOnOutsideClick = this.option("closeOnOutsideClick");
        if (_type2.default.isFunction(closeOnOutsideClick)) {
            closeOnOutsideClick = closeOnOutsideClick(e)
        }
        if (closeOnOutsideClick && this.option("opened")) {
            this.stopAnimations();
            if (this.option("shading")) {
                e.preventDefault()
            }
            this.hide();
            this._toggleShaderVisibility(false)
        }
    },
    _initMarkup: function() {
        this.callBase();
        this._toggleVisibleClass(this.option("opened"));
        this._renderPanelElement();
        this._refreshModeClass();
        this._refreshRevealModeClass();
        this._renderShader();
        this._whenPanelRendered = new _deferred.Deferred;
        this._strategy.renderPanel(this._getTemplate(this.option("template")), this._whenPanelRendered);
        var contentTemplateOption = this.option("contentTemplate"),
            contentTemplate = this._getTemplate(contentTemplateOption),
            transclude = this._getAnonymousTemplateName() === contentTemplateOption;
        contentTemplate && contentTemplate.render({
            container: this.viewContent(),
            noModel: true,
            transclude: transclude
        });
        this._initCloseOnOutsideClickHandler();
        this._refreshPositionClass()
    },
    _render: function() {
        var _this = this;
        this._initSize();
        this.callBase();
        this._whenPanelRendered.always(function() {
            _this._initSize();
            _this._strategy.setPanelSize("slide" === _this.option("revealMode") || !_this.isHorizontalDirection());
            _this._renderPosition(_this.option("opened"), false)
        })
    },
    _renderPanelElement: function() {
        this._$panel = (0, _renderer2.default)("<div>").addClass(DRAWER_PANEL_CONTENT_CLASS);
        this._$wrapper.append(this._$panel)
    },
    _refreshModeClass: function(prevClass) {
        prevClass && this.$element().removeClass(DRAWER_CLASS + "-" + prevClass);
        this.$element().addClass(DRAWER_CLASS + "-" + this.option("openedStateMode"))
    },
    _refreshPositionClass: function(prevClass) {
        prevClass && this.$element().removeClass(DRAWER_CLASS + "-" + prevClass);
        var position = this.getDrawerPosition();
        this.$element().addClass(DRAWER_CLASS + "-" + position);
        this._orderContent(position)
    },
    _orderContent: function(position) {
        if (this._strategy.needOrderContent(position, this.option("rtlEnabled"))) {
            this._$wrapper.prepend(this._$contentWrapper)
        } else {
            this._$wrapper.prepend(this._$panel)
        }
    },
    _refreshRevealModeClass: function(prevClass) {
        prevClass && this.$element().removeClass(DRAWER_CLASS + "-" + prevClass);
        this.$element().addClass(DRAWER_CLASS + "-" + this.option("revealMode"))
    },
    _renderShader: function() {
        this._$shader = this._$shader || (0, _renderer2.default)("<div>").addClass(DRAWER_SHADER_CLASS);
        this._$shader.appendTo(this.viewContent());
        this._toggleShaderVisibility(this.option("opened"))
    },
    _initSize: function() {
        var realPanelSize = this.isHorizontalDirection() ? this.getRealPanelWidth() : this.getRealPanelHeight();
        this._maxSize = this.option("maxSize") || realPanelSize;
        this._minSize = this.option("minSize") || 0
    },
    getDrawerPosition: function() {
        var position = this.option("position");
        var rtl = this.option("rtlEnabled");
        if ("before" === position) {
            return rtl ? "right" : "left"
        }
        if ("after" === position) {
            return rtl ? "left" : "right"
        }
        return position
    },
    getOverlayTarget: function() {
        return this.option("target") || this._$wrapper
    },
    getOverlay: function() {
        return this._overlay
    },
    getMaxSize: function() {
        return this._maxSize
    },
    getMinSize: function() {
        return this._minSize
    },
    getRealPanelWidth: function() {
        if ((0, _window.hasWindow)()) {
            return this.getElementWidth(this._strategy.getPanelContent())
        } else {
            return 0
        }
    },
    getElementWidth: function($element) {
        var $children = $element.children();
        return $children.length ? $children.eq(0).get(0).getBoundingClientRect().width : $element.get(0).getBoundingClientRect().width
    },
    getRealPanelHeight: function() {
        if ((0, _window.hasWindow)()) {
            return this.getElementHeight(this._strategy.getPanelContent())
        } else {
            return 0
        }
    },
    getElementHeight: function($element) {
        var $children = $element.children();
        return $children.length ? $children.eq(0).get(0).getBoundingClientRect().height : $element.get(0).getBoundingClientRect().height
    },
    isHorizontalDirection: function() {
        var position = this.getDrawerPosition();
        return "left" === position || "right" === position
    },
    stopAnimations: function(jumpToEnd) {
        _fx2.default.stop(this._$shader, jumpToEnd);
        _fx2.default.stop((0, _renderer2.default)(this.content()), jumpToEnd);
        _fx2.default.stop((0, _renderer2.default)(this.viewContent()), jumpToEnd);
        var overlay = this.getOverlay();
        overlay && _fx2.default.stop((0, _renderer2.default)(overlay.$content()), jumpToEnd)
    },
    setZIndex: function(zIndex) {
        this._$shader.css("zIndex", zIndex - 1);
        this._$panel.css("zIndex", zIndex)
    },
    resizeContent: function() {
        (0, _dom.triggerResizeEvent)(this.viewContent())
    },
    _isInvertedPosition: function() {
        var position = this.getDrawerPosition();
        return "right" === position || "bottom" === position
    },
    _renderPosition: function(offset, animate, jumpToEnd) {
        this.stopAnimations(jumpToEnd);
        this._animations = [];
        animate = _type2.default.isDefined(animate) ? animate && this.option("animationEnabled") : this.option("animationEnabled");
        if (!(0, _window.hasWindow)()) {
            return
        }
        var duration = this.option("animationDuration");
        offset && this._toggleShaderVisibility(offset);
        this._strategy.renderPosition(offset, animate);
        this._strategy.renderShaderVisibility(offset, animate, duration)
    },
    _animationCompleteHandler: function() {
        this.resizeContent();
        if (this._animationPromise) {
            this._animationPromise.resolve();
            this._animations = []
        }
    },
    _getPositionCorrection: function() {
        return this._isInvertedPosition() ? -1 : 1
    },
    _dispose: function() {
        _uiDrawerRendering.animation.complete((0, _renderer2.default)(this.viewContent()));
        this.callBase()
    },
    _visibilityChanged: function(visible) {
        if (visible) {
            this._dimensionChanged()
        }
    },
    _dimensionChanged: function() {
        this._initSize();
        this._strategy.setPanelSize("slide" === this.option("revealMode"))
    },
    _toggleShaderVisibility: function(visible) {
        if (this.option("shading")) {
            this._$shader.toggleClass(INVISIBLE_STATE_CLASS, !visible);
            this._$shader.css("visibility", visible ? "visible" : "hidden")
        } else {
            this._$shader.toggleClass(INVISIBLE_STATE_CLASS, true)
        }
    },
    _toggleVisibleClass: function(opened) {
        this.$element().toggleClass(OPENED_STATE_CLASS, opened)
    },
    _refreshPanel: function() {
        var _this2 = this;
        this._setInitialViewContentPosition();
        this._cleanPanel();
        this._renderPanelElement();
        this._orderContent(this.getDrawerPosition());
        this._whenPanelRefreshed = new _deferred.Deferred;
        this._strategy.renderPanel(this._getTemplate(this.option("template")), this._whenPanelRefreshed);
        (0, _window.hasWindow)() && this._whenPanelRefreshed.always(function() {
            _this2._strategy.setPanelSize("slide" === _this2.option("revealMode"));
            _this2._renderPosition(_this2.option("opened"), false, true)
        })
    },
    _setInitialViewContentPosition: function() {
        (0, _renderer2.default)(this.viewContent()).css("paddingLeft", 0);
        (0, _renderer2.default)(this.viewContent()).css("left", 0);
        (0, _renderer2.default)(this.viewContent()).css("transform", "translate(0px, 0px)")
    },
    _clean: function() {
        this._cleanFocusState();
        this._cleanPanel()
    },
    _cleanPanel: function() {
        this._$panel.remove();
        if (this._overlay) {
            this._overlay.dispose();
            delete this._overlay;
            delete this._$panel
        }
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "width":
                this.callBase(args);
                this._dimensionChanged();
                break;
            case "opened":
                this._renderPosition(args.value);
                this._toggleVisibleClass(args.value);
                break;
            case "position":
                this._refreshPositionClass(args.previousValue);
                this._invalidate();
                break;
            case "contentTemplate":
            case "template":
                this._invalidate();
                break;
            case "openedStateMode":
            case "target":
                this._initStrategy();
                this._refreshModeClass(args.previousValue);
                this._refreshPanel();
                break;
            case "minSize":
            case "maxSize":
                this._initSize();
                this._renderPosition(this.option("opened"), false);
                break;
            case "revealMode":
                this._refreshRevealModeClass(args.previousValue);
                this._refreshPanel();
                break;
            case "shading":
                this._toggleShaderVisibility(this.option("opened"));
                break;
            case "animationEnabled":
            case "animationDuration":
            case "closeOnOutsideClick":
                break;
            default:
                this.callBase(args)
        }
    },
    content: function() {
        return (0, _dom.getPublicElement)(this._$panel)
    },
    viewContent: function() {
        return (0, _dom.getPublicElement)(this._$contentWrapper)
    },
    show: function() {
        return this.toggle(true)
    },
    hide: function() {
        return this.toggle(false)
    },
    toggle: function(showing) {
        showing = void 0 === showing ? !this.option("opened") : showing;
        this._animationPromise = new _deferred.Deferred;
        this.option("opened", showing);
        return this._animationPromise.promise()
    }
});
(0, _component_registrator2.default)("dxDrawer", Drawer);
module.exports = Drawer;
