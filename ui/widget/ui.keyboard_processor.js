/**
 * DevExtreme (ui/widget/ui.keyboard_processor.js)
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
var _class = require("../../core/class");
var _class2 = _interopRequireDefault(_class);
var _array = require("../../core/utils/array");
var _iterator = require("../../core/utils/iterator");
var _utils = require("../../events/utils");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var COMPOSITION_START_EVENT = "compositionstart";
var COMPOSITION_END_EVENT = "compositionend";
var KEYDOWN_EVENT = "keydown";
var NAMESPACE = "KeyboardProcessor";
var KeyboardProcessor = _class2.default.inherit({
    _keydown: (0, _utils.addNamespace)(KEYDOWN_EVENT, NAMESPACE),
    _compositionStart: (0, _utils.addNamespace)(COMPOSITION_START_EVENT, NAMESPACE),
    _compositionEnd: (0, _utils.addNamespace)(COMPOSITION_END_EVENT, NAMESPACE),
    ctor: function(options) {
        var _this = this;
        options = options || {};
        if (options.element) {
            this._element = (0, _renderer2.default)(options.element)
        }
        if (options.focusTarget) {
            this._focusTarget = options.focusTarget
        }
        this._handler = options.handler;
        this._context = options.context;
        this._childProcessors = [];
        if (this._element) {
            this._processFunction = function(e) {
                _this.process(e)
            };
            this._toggleProcessingWithContext = this.toggleProcessing.bind(this);
            _events_engine2.default.on(this._element, this._keydown, this._processFunction);
            _events_engine2.default.on(this._element, this._compositionStart, this._toggleProcessingWithContext);
            _events_engine2.default.on(this._element, this._compositionEnd, this._toggleProcessingWithContext)
        }
    },
    dispose: function() {
        if (this._element) {
            _events_engine2.default.off(this._element, this._keydown, this._processFunction);
            _events_engine2.default.off(this._element, this._compositionStart, this._toggleProcessingWithContext);
            _events_engine2.default.off(this._element, this._compositionEnd, this._toggleProcessingWithContext)
        }
        this._element = void 0;
        this._handler = void 0;
        this._context = void 0;
        this._childProcessors = void 0
    },
    clearChildren: function() {
        this._childProcessors = []
    },
    push: function(child) {
        if (!this._childProcessors) {
            this.clearChildren()
        }
        this._childProcessors.push(child);
        return child
    },
    attachChildProcessor: function() {
        var childProcessor = new KeyboardProcessor;
        this._childProcessors.push(childProcessor);
        return childProcessor
    },
    reinitialize: function(childHandler, childContext) {
        this._context = childContext;
        this._handler = childHandler;
        return this
    },
    process: function(e) {
        var isNotFocusTarget = this._focusTarget && this._focusTarget !== e.target && (0, _array.inArray)(e.target, this._focusTarget) < 0;
        var shouldSkipProcessing = this._isComposingJustFinished && 229 === e.which || this._isComposing || isNotFocusTarget;
        this._isComposingJustFinished = false;
        if (shouldSkipProcessing) {
            return false
        }
        var args = {
            keyName: (0, _utils.normalizeKeyName)(e),
            key: e.key,
            code: e.code,
            ctrl: e.ctrlKey,
            location: e.location,
            metaKey: e.metaKey,
            shift: e.shiftKey,
            alt: e.altKey,
            which: e.which,
            originalEvent: e
        };
        var handlerResult = this._handler && this._handler.call(this._context, args);
        if (handlerResult && this._childProcessors) {
            (0, _iterator.each)(this._childProcessors, function(index, childProcessor) {
                childProcessor.process(e)
            })
        }
    },
    toggleProcessing: function(_ref) {
        var type = _ref.type;
        this._isComposing = type === COMPOSITION_START_EVENT;
        this._isComposingJustFinished = !this._isComposing
    }
});
module.exports = KeyboardProcessor;
