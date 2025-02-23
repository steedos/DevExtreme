/**
 * DevExtreme (ui/scroll_view/ui.scrollable.native.js)
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
var _utils = require("../../events/utils");
var _utils2 = _interopRequireDefault(_utils);
var _common = require("../../core/utils/common");
var _iterator = require("../../core/utils/iterator");
var _devices = require("../../core/devices");
var _devices2 = _interopRequireDefault(_devices);
var _class = require("../../core/class");
var _class2 = _interopRequireDefault(_class);
var _ui = require("./ui.scrollbar");
var _ui2 = _interopRequireDefault(_ui);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var SCROLLABLE_NATIVE = "dxNativeScrollable";
var SCROLLABLE_NATIVE_CLASS = "dx-scrollable-native";
var SCROLLABLE_SCROLLBAR_SIMULATED = "dx-scrollable-scrollbar-simulated";
var SCROLLABLE_SCROLLBARS_HIDDEN = "dx-scrollable-scrollbars-hidden";
var VERTICAL = "vertical";
var HORIZONTAL = "horizontal";
var HIDE_SCROLLBAR_TIMEOUT = 500;
var NativeStrategy = _class2.default.inherit({
    ctor: function(scrollable) {
        this._init(scrollable)
    },
    _init: function(scrollable) {
        this._component = scrollable;
        this._$element = scrollable.$element();
        this._$container = scrollable._$container;
        this._$content = scrollable._$content;
        this._direction = scrollable.option("direction");
        this._useSimulatedScrollbar = scrollable.option("useSimulatedScrollbar");
        this._showScrollbar = scrollable.option("showScrollbar");
        this.option = scrollable.option.bind(scrollable);
        this._createActionByOption = scrollable._createActionByOption.bind(scrollable);
        this._isLocked = scrollable._isLocked.bind(scrollable);
        this._isDirection = scrollable._isDirection.bind(scrollable);
        this._allowedDirection = scrollable._allowedDirection.bind(scrollable)
    },
    render: function() {
        this._renderPushBackOffset();
        var device = _devices2.default.real(),
            deviceType = device.platform;
        this._$element.addClass(SCROLLABLE_NATIVE_CLASS).addClass(SCROLLABLE_NATIVE_CLASS + "-" + deviceType).toggleClass(SCROLLABLE_SCROLLBARS_HIDDEN, !this._showScrollbar);
        if (this._showScrollbar && this._useSimulatedScrollbar) {
            this._renderScrollbars()
        }
    },
    updateBounds: _common.noop,
    _renderPushBackOffset: function() {
        var pushBackValue = this.option("pushBackValue");
        if (!pushBackValue && !this._component._lastPushBackValue) {
            return
        }
        this._$content.css({
            paddingTop: pushBackValue,
            paddingBottom: pushBackValue
        });
        this._component._lastPushBackValue = pushBackValue
    },
    _renderScrollbars: function() {
        this._scrollbars = {};
        this._hideScrollbarTimeout = 0;
        this._$element.addClass(SCROLLABLE_SCROLLBAR_SIMULATED);
        this._renderScrollbar(VERTICAL);
        this._renderScrollbar(HORIZONTAL)
    },
    _renderScrollbar: function(direction) {
        if (!this._isDirection(direction)) {
            return
        }
        this._scrollbars[direction] = new _ui2.default((0, _renderer2.default)("<div>").appendTo(this._$element), {
            direction: direction,
            expandable: this._component.option("scrollByThumb")
        })
    },
    handleInit: _common.noop,
    handleStart: function() {
        this._disablePushBack = true
    },
    handleMove: function(e) {
        if (this._isLocked()) {
            e.cancel = true;
            return
        }
        if (this._allowedDirection()) {
            e.originalEvent.isScrollingEvent = true
        }
    },
    handleEnd: function() {
        this._disablePushBack = false
    },
    handleCancel: _common.noop,
    handleStop: _common.noop,
    _eachScrollbar: function(callback) {
        callback = callback.bind(this);
        (0, _iterator.each)(this._scrollbars || {}, function(direction, scrollbar) {
            callback(scrollbar, direction)
        })
    },
    createActions: function() {
        this._scrollAction = this._createActionByOption("onScroll");
        this._updateAction = this._createActionByOption("onUpdated")
    },
    _createActionArgs: function() {
        var location = this.location();
        return {
            event: this._eventForUserAction,
            scrollOffset: {
                top: -location.top,
                left: -location.left
            },
            reachedLeft: this._isDirection(HORIZONTAL) ? location.left >= 0 : void 0,
            reachedRight: this._isDirection(HORIZONTAL) ? location.left <= this._containerSize.width - this._componentContentSize.width : void 0,
            reachedTop: this._isDirection(VERTICAL) ? location.top >= 0 : void 0,
            reachedBottom: this._isDirection(VERTICAL) ? location.top <= this._containerSize.height - this._componentContentSize.height : void 0
        }
    },
    handleScroll: function(e) {
        if (!this._isScrollLocationChanged()) {
            e.stopImmediatePropagation();
            return
        }
        this._eventForUserAction = e;
        this._moveScrollbars();
        this._scrollAction(this._createActionArgs());
        this._lastLocation = this.location();
        this._pushBackFromBoundary()
    },
    _pushBackFromBoundary: function() {
        var pushBackValue = this.option("pushBackValue");
        if (!pushBackValue || this._disablePushBack) {
            return
        }
        var scrollOffset = this._containerSize.height - this._contentSize.height,
            scrollTopPos = this._$container.scrollTop(),
            scrollBottomPos = scrollOffset + scrollTopPos - 2 * pushBackValue;
        if (!scrollTopPos) {
            this._$container.scrollTop(pushBackValue)
        } else {
            if (!scrollBottomPos) {
                this._$container.scrollTop(pushBackValue - scrollOffset)
            }
        }
    },
    _isScrollLocationChanged: function() {
        var currentLocation = this.location(),
            lastLocation = this._lastLocation || {},
            isTopChanged = lastLocation.top !== currentLocation.top,
            isLeftChanged = lastLocation.left !== currentLocation.left;
        return isTopChanged || isLeftChanged
    },
    _moveScrollbars: function() {
        this._eachScrollbar(function(scrollbar) {
            scrollbar.moveTo(this.location());
            scrollbar.option("visible", true)
        });
        this._hideScrollbars()
    },
    _hideScrollbars: function() {
        clearTimeout(this._hideScrollbarTimeout);
        this._hideScrollbarTimeout = setTimeout(function() {
            this._eachScrollbar(function(scrollbar) {
                scrollbar.option("visible", false)
            })
        }.bind(this), HIDE_SCROLLBAR_TIMEOUT)
    },
    location: function() {
        return {
            left: -this._$container.scrollLeft(),
            top: this.option("pushBackValue") - this._$container.scrollTop()
        }
    },
    disabledChanged: _common.noop,
    update: function() {
        this._update();
        this._updateAction(this._createActionArgs())
    },
    _update: function() {
        this._updateDimensions();
        this._updateScrollbars()
    },
    _updateDimensions: function() {
        this._containerSize = {
            height: this._$container.height(),
            width: this._$container.width()
        };
        this._componentContentSize = {
            height: this._component.$content().height(),
            width: this._component.$content().width()
        };
        this._contentSize = {
            height: this._$content.height(),
            width: this._$content.width()
        };
        this._pushBackFromBoundary()
    },
    _updateScrollbars: function() {
        this._eachScrollbar(function(scrollbar, direction) {
            var dimension = direction === VERTICAL ? "height" : "width";
            scrollbar.option({
                containerSize: this._containerSize[dimension],
                contentSize: this._componentContentSize[dimension]
            });
            scrollbar.update()
        })
    },
    _allowedDirections: function() {
        return {
            vertical: this._isDirection(VERTICAL) && this._contentSize.height > this._containerSize.height,
            horizontal: this._isDirection(HORIZONTAL) && this._contentSize.width > this._containerSize.width
        }
    },
    dispose: function() {
        var className = this._$element.get(0).className;
        var scrollableNativeRegexp = new RegExp(SCROLLABLE_NATIVE_CLASS + "\\S*", "g");
        if (scrollableNativeRegexp.test(className)) {
            this._$element.removeClass(className.match(scrollableNativeRegexp).join(" "))
        }
        _events_engine2.default.off(this._$element, "." + SCROLLABLE_NATIVE);
        _events_engine2.default.off(this._$container, "." + SCROLLABLE_NATIVE);
        this._removeScrollbars();
        clearTimeout(this._hideScrollbarTimeout)
    },
    _removeScrollbars: function() {
        this._eachScrollbar(function(scrollbar) {
            scrollbar.$element().remove()
        })
    },
    scrollBy: function(distance) {
        var location = this.location();
        this._$container.scrollTop(-location.top - distance.top + this.option("pushBackValue"));
        this._$container.scrollLeft(-location.left - distance.left)
    },
    validate: function(e) {
        if (this.option("disabled")) {
            return false
        }
        if (_utils2.default.isDxMouseWheelEvent(e) && this._isScrolledInMaxDirection(e)) {
            return false
        }
        return !!this._allowedDirection()
    },
    _isScrolledInMaxDirection: function(e) {
        var container = this._$container.get(0);
        var result = void 0;
        if (e.delta > 0) {
            result = e.shiftKey ? !container.scrollLeft : !container.scrollTop
        } else {
            if (e.shiftKey) {
                result = container.clientWidth + container.scrollLeft >= container.scrollWidth
            } else {
                result = container.clientHeight + container.scrollTop >= container.scrollHeight
            }
        }
        return result
    },
    getDirection: function() {
        return this._allowedDirection()
    },
    verticalOffset: function() {
        return this.option("pushBackValue")
    }
});
module.exports = NativeStrategy;
