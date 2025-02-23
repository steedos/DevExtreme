/**
 * DevExtreme (ui/grid_core/ui.grid_core.editor_factory.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _dom_adapter = require("../../core/dom_adapter");
var _dom_adapter2 = _interopRequireDefault(_dom_adapter);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _click = require("../../events/click");
var _click2 = _interopRequireDefault(_click);
var _pointer = require("../../events/pointer");
var _pointer2 = _interopRequireDefault(_pointer);
var _position = require("../../animation/position");
var _position2 = _interopRequireDefault(_position);
var _utils = require("../../events/utils");
var _browser = require("../../core/utils/browser");
var _browser2 = _interopRequireDefault(_browser);
var _extend = require("../../core/utils/extend");
var _ui = require("../shared/ui.editor_factory_mixin");
var _ui2 = _interopRequireDefault(_ui);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var EDITOR_INLINE_BLOCK = "dx-editor-inline-block",
    CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled",
    FOCUS_OVERLAY_CLASS = "focus-overlay",
    CONTENT_CLASS = "content",
    FOCUSED_ELEMENT_CLASS = "dx-focused",
    ROW_CLASS = "dx-row",
    MODULE_NAMESPACE = "dxDataGridEditorFactory",
    UPDATE_FOCUS_EVENTS = (0, _utils.addNamespace)([_pointer2.default.down, "focusin", _click2.default.name].join(" "), MODULE_NAMESPACE),
    POINTER_EVENTS_TARGET_CLASS = "dx-pointer-events-target",
    POINTER_EVENTS_NONE_CLASS = "dx-pointer-events-none",
    FOCUSED_ELEMENT_SELECTOR = "td[tabindex]:focus, tr[tabindex]:focus, input:focus, textarea:focus, .dx-lookup-field:focus, .dx-checkbox:focus",
    DX_HIDDEN = "dx-hidden";
var EditorFactory = _uiGrid_core2.default.ViewController.inherit({
    _getFocusedElement: function($dataGridElement) {
        return $dataGridElement.find(FOCUSED_ELEMENT_SELECTOR)
    },
    _getFocusCellSelector: function() {
        return ".dx-row > td"
    },
    _updateFocusCore: function() {
        var $focusCell, hideBorders, $focus = this._$focusedElement,
            $dataGridElement = this.component && this.component.$element();
        if ($dataGridElement) {
            $focus = this._getFocusedElement($dataGridElement);
            if ($focus.length) {
                if (!$focus.hasClass(CELL_FOCUS_DISABLED_CLASS) && !$focus.hasClass(ROW_CLASS)) {
                    $focusCell = $focus.closest(this._getFocusCellSelector() + ", ." + CELL_FOCUS_DISABLED_CLASS);
                    hideBorders = $focusCell.get(0) !== $focus.get(0) && $focusCell.hasClass(EDITOR_INLINE_BLOCK);
                    $focus = $focusCell
                }
                if ($focus.length && !$focus.hasClass(CELL_FOCUS_DISABLED_CLASS)) {
                    this.focus($focus, hideBorders);
                    return
                }
            }
        }
        this.loseFocus()
    },
    _updateFocus: function(e) {
        var that = this,
            isFocusOverlay = e && e.event && (0, _renderer2.default)(e.event.target).hasClass(that.addWidgetPrefix(FOCUS_OVERLAY_CLASS));
        that._isFocusOverlay = that._isFocusOverlay || isFocusOverlay;
        clearTimeout(that._updateFocusTimeoutID);
        that._updateFocusTimeoutID = setTimeout(function() {
            delete that._updateFocusTimeoutID;
            if (!that._isFocusOverlay) {
                that._updateFocusCore()
            }
            that._isFocusOverlay = false
        })
    },
    _updateFocusOverlaySize: function($element, position) {
        var location = _position2.default.calculate($element, (0, _extend.extend)({
            collision: "fit"
        }, position));
        if (location.h.oversize > 0) {
            $element.outerWidth($element.outerWidth() - location.h.oversize)
        }
        if (location.v.oversize > 0) {
            $element.outerHeight($element.outerHeight() - location.v.oversize)
        }
    },
    callbackNames: function() {
        return ["focused"]
    },
    focus: function($element, hideBorder) {
        var that = this;
        if (void 0 === $element) {
            return that._$focusedElement
        } else {
            if ($element) {
                if (!$element.is(that._$focusedElement)) {
                    that._$focusedElement && that._$focusedElement.removeClass(FOCUSED_ELEMENT_CLASS)
                }
                that._$focusedElement = $element;
                clearTimeout(that._focusTimeoutID);
                that._focusTimeoutID = setTimeout(function() {
                    delete that._focusTimeoutID;
                    that.renderFocusOverlay($element, hideBorder);
                    $element.addClass(FOCUSED_ELEMENT_CLASS);
                    that.focused.fire($element)
                })
            }
        }
    },
    renderFocusOverlay: function($element, hideBorder) {
        var focusOverlayPosition, that = this;
        if (!that._$focusOverlay) {
            that._$focusOverlay = (0, _renderer2.default)("<div>").addClass(that.addWidgetPrefix(FOCUS_OVERLAY_CLASS) + " " + POINTER_EVENTS_TARGET_CLASS)
        }
        if (hideBorder) {
            that._$focusOverlay.addClass(DX_HIDDEN)
        } else {
            if ($element.length) {
                var align = _browser2.default.msie ? "left bottom" : _browser2.default.mozilla ? "right bottom" : "left top",
                    $content = $element.closest("." + that.addWidgetPrefix(CONTENT_CLASS)),
                    elemCoord = $element[0].getBoundingClientRect();
                that._$focusOverlay.removeClass(DX_HIDDEN).appendTo($content).outerWidth(elemCoord.right - elemCoord.left + 1).outerHeight(elemCoord.bottom - elemCoord.top + 1);
                focusOverlayPosition = {
                    precise: true,
                    my: align,
                    at: align,
                    of: $element,
                    boundary: $content.length && $content
                };
                that._updateFocusOverlaySize(that._$focusOverlay, focusOverlayPosition);
                _position2.default.setup(that._$focusOverlay, focusOverlayPosition);
                that._$focusOverlay.css("visibility", "visible")
            }
        }
    },
    resize: function() {
        var $focusedElement = this._$focusedElement;
        if ($focusedElement) {
            this.focus($focusedElement)
        }
    },
    loseFocus: function() {
        this._$focusedElement && this._$focusedElement.removeClass(FOCUSED_ELEMENT_CLASS);
        this._$focusedElement = null;
        this._$focusOverlay && this._$focusOverlay.addClass(DX_HIDDEN)
    },
    init: function() {
        this.createAction("onEditorPreparing", {
            excludeValidators: ["designMode", "disabled", "readOnly"],
            category: "rendering"
        });
        this.createAction("onEditorPrepared", {
            excludeValidators: ["designMode", "disabled", "readOnly"],
            category: "rendering"
        });
        this._updateFocusHandler = this._updateFocusHandler || this.createAction(this._updateFocus.bind(this));
        _events_engine2.default.on(_dom_adapter2.default.getDocument(), UPDATE_FOCUS_EVENTS, this._updateFocusHandler);
        this._attachContainerEventHandlers()
    },
    _attachContainerEventHandlers: function() {
        var that = this,
            $container = that.component && that.component.$element();
        if ($container) {
            _events_engine2.default.on($container, (0, _utils.addNamespace)("keydown", MODULE_NAMESPACE), function(e) {
                if ("tab" === (0, _utils.normalizeKeyName)(e)) {
                    that._updateFocusHandler(e)
                }
            })
        }
    },
    _focusOverlayEventProxy: function(e) {
        var element, $target = (0, _renderer2.default)(e.target),
            $currentTarget = (0, _renderer2.default)(e.currentTarget),
            needProxy = $target.hasClass(POINTER_EVENTS_TARGET_CLASS) || $target.hasClass(POINTER_EVENTS_NONE_CLASS);
        if (!needProxy || $currentTarget.hasClass(DX_HIDDEN)) {
            return
        }
        $currentTarget.addClass(DX_HIDDEN);
        element = $target.get(0).ownerDocument.elementFromPoint(e.clientX, e.clientY);
        (0, _utils.fireEvent)({
            originalEvent: e,
            target: element
        });
        e.stopPropagation();
        $currentTarget.removeClass(DX_HIDDEN);
        if (e.type === _click2.default.name && "INPUT" === element.tagName) {
            _events_engine2.default.trigger((0, _renderer2.default)(element), "focus")
        }
    },
    dispose: function() {
        clearTimeout(this._focusTimeoutID);
        clearTimeout(this._updateFocusTimeoutID);
        _events_engine2.default.off(_dom_adapter2.default.getDocument(), UPDATE_FOCUS_EVENTS, this._updateFocusHandler)
    }
}).include(_ui2.default);
module.exports = {
    defaultOptions: function() {
        return {}
    },
    controllers: {
        editorFactory: EditorFactory
    },
    extenders: {
        controllers: {
            columnsResizer: {
                _startResizing: function(args) {
                    this.callBase(args);
                    if (this.isResizing()) {
                        this.getController("editorFactory").loseFocus()
                    }
                }
            }
        }
    }
};
