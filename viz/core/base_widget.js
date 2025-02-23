/**
 * DevExtreme (viz/core/base_widget.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var noop = require("../../core/utils/common").noop,
    windowUtils = require("../../core/utils/window"),
    domAdapter = require("../../core/dom_adapter"),
    typeUtils = require("../../core/utils/type"),
    each = require("../../core/utils/iterator").each,
    version = require("../../core/version"),
    _windowResizeCallbacks = require("../../core/utils/resize_callbacks"),
    _stringFormat = require("../../core/utils/string").format,
    _isObject = require("../../core/utils/type").isObject,
    extend = require("../../core/utils/extend").extend,
    _floor = Math.floor,
    DOMComponent = require("../../core/dom_component"),
    helpers = require("./helpers"),
    _parseScalar = require("./utils").parseScalar,
    errors = require("./errors_warnings"),
    _log = errors.log,
    rendererModule = require("./renderers/renderer"),
    _Layout = require("./layout"),
    OPTION_RTL_ENABLED = "rtlEnabled",
    SIZED_ELEMENT_CLASS = "dx-sized-element",
    _option = DOMComponent.prototype.option;

function getTrue() {
    return true
}

function getFalse() {
    return false
}

function areCanvasesDifferent(canvas1, canvas2) {
    return !(canvas1.width === canvas2.width && canvas1.height === canvas2.height && canvas1.left === canvas2.left && canvas1.top === canvas2.top && canvas1.right === canvas2.right && canvas1.bottom === canvas2.bottom)
}

function createResizeHandler(callback) {
    var timeout, handler = function() {
        clearTimeout(timeout);
        timeout = setTimeout(callback, 100)
    };
    handler.dispose = function() {
        clearTimeout(timeout);
        return this
    };
    return handler
}

function defaultOnIncidentOccurred(e) {
    if (!e.component.hasEvent("incidentOccurred")) {
        _log.apply(null, [e.target.id].concat(e.target.args || []))
    }
}
var createIncidentOccurred = function(widgetName, eventTrigger) {
    return function(id, args) {
        eventTrigger("incidentOccurred", {
            target: {
                id: id,
                type: "E" === id[0] ? "error" : "warning",
                args: args,
                text: _stringFormat.apply(null, [errors.ERROR_MESSAGES[id]].concat(args || [])),
                widget: widgetName,
                version: version
            }
        })
    }
};

function pickPositiveValue(values) {
    return values.reduce(function(result, value) {
        return value > 0 && !result ? value : result
    }, 0)
}
var getEmptyComponent = function() {
    var emptyComponentConfig = {};
    emptyComponentConfig.ctor = function(element, options) {
        this.callBase(element, options);
        var sizedElement = domAdapter.createElement("div");
        var width = options && typeUtils.isNumeric(options.width) ? options.width + "px" : "100%";
        var height = options && typeUtils.isNumeric(options.height) ? options.height + "px" : this._getDefaultSize().height + "px";
        domAdapter.setStyle(sizedElement, "width", width);
        domAdapter.setStyle(sizedElement, "height", height);
        domAdapter.setClass(sizedElement, SIZED_ELEMENT_CLASS);
        domAdapter.insertElement(element, sizedElement)
    };
    var EmptyComponent = DOMComponent.inherit(emptyComponentConfig);
    var originalInherit = EmptyComponent.inherit;
    EmptyComponent.inherit = function(config) {
        for (var field in config) {
            if (typeUtils.isFunction(config[field]) && "_" !== field.substr(0, 1) || "_dispose" === field || "_optionChanged" === field) {
                config[field] = noop
            }
        }
        return originalInherit.call(this, config)
    };
    return EmptyComponent
};
var isServerSide = !windowUtils.hasWindow();

function sizeIsValid(value) {
    return typeUtils.isDefined(value) && value > 0
}
module.exports = isServerSide ? getEmptyComponent() : DOMComponent.inherit({
    _eventsMap: {
        onIncidentOccurred: {
            name: "incidentOccurred"
        },
        onDrawn: {
            name: "drawn"
        }
    },
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            onIncidentOccurred: defaultOnIncidentOccurred
        })
    },
    _useLinks: true,
    _init: function() {
        var linkTarget, that = this;
        that._$element.children("." + SIZED_ELEMENT_CLASS).remove();
        that.callBase.apply(that, arguments);
        that._changesLocker = 0;
        that._optionChangedLocker = 0;
        that._changes = helpers.changes();
        that._suspendChanges();
        that._themeManager = that._createThemeManager();
        that._themeManager.setCallback(function() {
            that._requestChange(that._themeDependentChanges)
        });
        that._renderElementAttributes();
        that._initRenderer();
        linkTarget = that._useLinks && that._renderer.root;
        linkTarget && linkTarget.enableLinks().virtualLink("core").virtualLink("peripheral");
        that._renderVisibilityChange();
        that._attachVisibilityChangeHandlers();
        that._initEventTrigger();
        that._incidentOccurred = createIncidentOccurred(that.NAME, that._eventTrigger);
        that._layout = new _Layout;
        linkTarget && linkTarget.linkAfter("core");
        that._initPlugins();
        that._initCore();
        linkTarget && linkTarget.linkAfter();
        that._change(that._initialChanges)
    },
    _initialChanges: ["LAYOUT", "RESIZE_HANDLER", "THEME", "DISABLED"],
    _initPlugins: function() {
        var that = this;
        each(that._plugins, function(_, plugin) {
            plugin.init.call(that)
        })
    },
    _disposePlugins: function() {
        var that = this;
        each(that._plugins.slice().reverse(), function(_, plugin) {
            plugin.dispose.call(that)
        })
    },
    _change: function(codes) {
        this._changes.add(codes)
    },
    _suspendChanges: function() {
        ++this._changesLocker
    },
    _resumeChanges: function() {
        var that = this;
        if (0 === --that._changesLocker && that._changes.count() > 0 && !that._applyingChanges) {
            that._renderer.lock();
            that._applyingChanges = true;
            that._applyChanges();
            that._changes.reset();
            that._applyingChanges = false;
            that._renderer.unlock();
            if (that._optionsQueue) {
                that._applyQueuedOptions()
            }
            that._optionChangedLocker++;
            that._notify();
            that._optionChangedLocker--
        }
    },
    _applyQueuedOptions: function() {
        var that = this,
            queue = that._optionsQueue;
        that._optionsQueue = null;
        that.beginUpdate();
        each(queue, function(_, action) {
            action()
        });
        that.endUpdate()
    },
    _requestChange: function(codes) {
        this._suspendChanges();
        this._change(codes);
        this._resumeChanges()
    },
    _applyChanges: function() {
        var i, that = this,
            changes = that._changes,
            order = that._totalChangesOrder,
            ii = order.length;
        for (i = 0; i < ii; ++i) {
            if (changes.has(order[i])) {
                that["_change_" + order[i]]()
            }
        }
    },
    _optionChangesOrder: ["EVENTS", "THEME", "RENDERER", "RESIZE_HANDLER"],
    _layoutChangesOrder: ["ELEMENT_ATTR", "CONTAINER_SIZE", "LAYOUT"],
    _customChangesOrder: ["DISABLED"],
    _change_EVENTS: function() {
        this._eventTrigger.applyChanges()
    },
    _change_THEME: function() {
        this._setThemeAndRtl()
    },
    _change_RENDERER: function() {
        this._setRendererOptions()
    },
    _change_RESIZE_HANDLER: function() {
        this._setupResizeHandler()
    },
    _change_ELEMENT_ATTR: function() {
        this._renderElementAttributes();
        this._change(["CONTAINER_SIZE"])
    },
    _change_CONTAINER_SIZE: function() {
        this._updateSize()
    },
    _change_LAYOUT: function() {
        this._setContentSize()
    },
    _change_DISABLED: function() {
        var renderer = this._renderer,
            root = renderer.root;
        if (this.option("disabled")) {
            this._initDisabledState = root.attr("pointer-events");
            root.attr({
                "pointer-events": "none",
                filter: renderer.getGrayScaleFilter().id
            })
        } else {
            if ("none" === root.attr("pointer-events")) {
                root.attr({
                    "pointer-events": typeUtils.isDefined(this._initDisabledState) ? this._initDisabledState : null,
                    filter: null
                })
            }
        }
    },
    _themeDependentChanges: ["RENDERER"],
    _initRenderer: function() {
        var that = this;
        that._canvas = that._calculateCanvas();
        that._renderer = new rendererModule.Renderer({
            cssClass: that._rootClassPrefix + " " + that._rootClass,
            pathModified: that.option("pathModified"),
            container: that._$element[0]
        });
        that._renderer.resize(that._canvas.width, that._canvas.height)
    },
    _disposeRenderer: function() {
        this._renderer.dispose()
    },
    _getAnimationOptions: noop,
    render: function() {
        this._requestChange(["CONTAINER_SIZE"]);
        this._onRender()
    },
    _onRender: noop,
    _dispose: function() {
        var that = this;
        that.callBase.apply(that, arguments);
        that._removeResizeHandler();
        that._layout.dispose();
        that._eventTrigger.dispose();
        that._disposeCore();
        that._disposePlugins();
        that._disposeRenderer();
        that._themeManager.dispose();
        that._themeManager = that._renderer = that._eventTrigger = null
    },
    _initEventTrigger: function() {
        var that = this;
        that._eventTrigger = createEventTrigger(that._eventsMap, function(name) {
            return that._createActionByOption(name)
        })
    },
    _calculateCanvas: function() {
        var that = this,
            size = that.option("size") || {},
            margin = that.option("margin") || {},
            defaultCanvas = that._getDefaultSize() || {},
            elementWidth = !sizeIsValid(size.width) && windowUtils.hasWindow() ? that._$element.width() : 0,
            elementHeight = !sizeIsValid(size.height) && windowUtils.hasWindow() ? that._$element.height() : 0,
            canvas = {
                width: size.width <= 0 ? 0 : _floor(pickPositiveValue([size.width, elementWidth, defaultCanvas.width])),
                height: size.height <= 0 ? 0 : _floor(pickPositiveValue([size.height, elementHeight, defaultCanvas.height])),
                left: pickPositiveValue([margin.left, defaultCanvas.left]),
                top: pickPositiveValue([margin.top, defaultCanvas.top]),
                right: pickPositiveValue([margin.right, defaultCanvas.right]),
                bottom: pickPositiveValue([margin.bottom, defaultCanvas.bottom])
            };
        if (canvas.width - canvas.left - canvas.right <= 0 || canvas.height - canvas.top - canvas.bottom <= 0) {
            canvas = {
                width: 0,
                height: 0
            }
        }
        return canvas
    },
    _updateSize: function() {
        var that = this,
            canvas = that._calculateCanvas();
        that._renderer.fixPlacement();
        if (areCanvasesDifferent(that._canvas, canvas) || that.__forceRender) {
            that._canvas = canvas;
            that._recreateSizeDependentObjects(true);
            that._renderer.resize(canvas.width, canvas.height);
            that._change(["LAYOUT"])
        }
    },
    _recreateSizeDependentObjects: noop,
    _getMinSize: function() {
        return [0, 0]
    },
    _getAlignmentRect: noop,
    _setContentSize: function() {
        var nextRect, canvas = this._canvas,
            layout = this._layout,
            rect = canvas.width > 0 && canvas.height > 0 ? [canvas.left, canvas.top, canvas.width - canvas.right, canvas.height - canvas.bottom] : [0, 0, 0, 0];
        rect = layout.forward(rect, this._getMinSize());
        nextRect = this._applySize(rect) || rect;
        layout.backward(nextRect, this._getAlignmentRect() || nextRect)
    },
    _getOption: function(name, isScalar) {
        var theme = this._themeManager.theme(name),
            option = this.option(name);
        return isScalar ? void 0 !== option ? option : theme : extend(true, {}, theme, option)
    },
    _setupResizeHandler: function() {
        var that = this,
            redrawOnResize = _parseScalar(this._getOption("redrawOnResize", true), true);
        if (that._resizeHandler) {
            that._removeResizeHandler()
        }
        that._resizeHandler = createResizeHandler(function() {
            if (redrawOnResize) {
                that._requestChange(["CONTAINER_SIZE"])
            } else {
                that._renderer.fixPlacement()
            }
        });
        _windowResizeCallbacks.add(that._resizeHandler)
    },
    _removeResizeHandler: function() {
        if (this._resizeHandler) {
            _windowResizeCallbacks.remove(this._resizeHandler);
            this._resizeHandler.dispose();
            this._resizeHandler = null
        }
    },
    _onBeginUpdate: noop,
    beginUpdate: function() {
        var that = this;
        if (that._initialized && 0 === that._updateLockCount) {
            that._onBeginUpdate();
            that._suspendChanges()
        }
        that.callBase.apply(that, arguments);
        return that
    },
    endUpdate: function() {
        var that = this;
        that.callBase.apply(that, arguments);
        if (0 === that._updateLockCount) {
            that._resumeChanges()
        }
        return that
    },
    option: function(name) {
        var that = this;
        if (that._initialized && that._applyingChanges && (arguments.length > 1 || _isObject(name))) {
            that._optionsQueue = that._optionsQueue || [];
            that._optionsQueue.push(that._getActionForUpdating(arguments))
        } else {
            return _option.apply(that, arguments)
        }
    },
    _getActionForUpdating: function(args) {
        var that = this;
        return that._deprecatedOptionsSuppressed ? function() {
            that._suppressDeprecatedWarnings();
            _option.apply(that, args);
            that._resumeDeprecatedWarnings()
        } : function() {
            _option.apply(that, args)
        }
    },
    _clean: noop,
    _render: noop,
    _optionChanged: function(arg) {
        var that = this;
        if (that._optionChangedLocker) {
            return
        }
        var partialChanges = that.getPartialChangeOptionsName(arg);
        var changes = [];
        if (partialChanges.length > 0) {
            partialChanges.forEach(function(pc) {
                return changes.push(that._partialOptionChangesMap[pc])
            })
        } else {
            changes.push(that._optionChangesMap[arg.name])
        }
        changes = changes.filter(function(c) {
            return !!c
        });
        if (that._eventTrigger.change(arg.name)) {
            that._change(["EVENTS"])
        } else {
            if (changes.length > 0) {
                that._change(changes)
            } else {
                that.callBase.apply(that, arguments)
            }
        }
    },
    _notify: noop,
    _optionChangesMap: {
        size: "CONTAINER_SIZE",
        margin: "CONTAINER_SIZE",
        redrawOnResize: "RESIZE_HANDLER",
        theme: "THEME",
        rtlEnabled: "THEME",
        encodeHtml: "THEME",
        elementAttr: "ELEMENT_ATTR",
        disabled: "DISABLED"
    },
    _partialOptionChangesMap: {},
    _partialOptionChangesPath: {},
    getPartialChangeOptionsName: function(changedOption) {
        var that = this;
        var fullName = changedOption.fullName;
        var sections = fullName.split(/[.]/);
        var name = changedOption.name;
        var value = changedOption.value;
        var options = this._partialOptionChangesPath[name];
        var partialChangeOptionsName = [];
        if (options) {
            if (true === options) {
                partialChangeOptionsName.push(name)
            } else {
                options.forEach(function(op) {
                    fullName.indexOf(op) >= 0 && partialChangeOptionsName.push(op)
                });
                if (1 === sections.length) {
                    if ("object" === typeUtils.type(value)) {
                        that._addOptionsNameForPartialUpdate(value, options, partialChangeOptionsName)
                    } else {
                        if ("array" === typeUtils.type(value)) {
                            if (value.length > 0 && value.every(function(item) {
                                    return that._checkOptionsForPartialUpdate(item, options)
                                })) {
                                value.forEach(function(item) {
                                    return that._addOptionsNameForPartialUpdate(item, options, partialChangeOptionsName)
                                })
                            }
                        }
                    }
                }
            }
        }
        return partialChangeOptionsName.filter(function(value, index, self) {
            return self.indexOf(value) === index
        })
    },
    _checkOptionsForPartialUpdate: function(optionObject, options) {
        return !Object.keys(optionObject).some(function(key) {
            return options.indexOf(key) === -1
        })
    },
    _addOptionsNameForPartialUpdate: function(optionObject, options, partialChangeOptionsName) {
        var optionKeys = Object.keys(optionObject);
        if (this._checkOptionsForPartialUpdate(optionObject, options)) {
            optionKeys.forEach(function(key) {
                return options.indexOf(key) > -1 && partialChangeOptionsName.push(key)
            })
        }
    },
    _visibilityChanged: function() {
        this.render()
    },
    _setThemeAndRtl: function() {
        this._themeManager.setTheme(this.option("theme"), this.option(OPTION_RTL_ENABLED))
    },
    _getRendererOptions: function() {
        return {
            rtl: this.option(OPTION_RTL_ENABLED),
            encodeHtml: this.option("encodeHtml"),
            animation: this._getAnimationOptions()
        }
    },
    _setRendererOptions: function() {
        this._renderer.setOptions(this._getRendererOptions())
    },
    svg: function() {
        return this._renderer.svg()
    },
    getSize: function() {
        var canvas = this._canvas || {};
        return {
            width: canvas.width,
            height: canvas.height
        }
    },
    isReady: getFalse,
    _dataIsReady: getTrue,
    _resetIsReady: function() {
        this.isReady = getFalse
    },
    _drawn: function() {
        var that = this;
        that.isReady = getFalse;
        if (that._dataIsReady()) {
            that._renderer.onEndAnimation(function() {
                that.isReady = getTrue
            })
        }
        that._eventTrigger("drawn", {})
    }
});
helpers.replaceInherit(module.exports);

function createEventTrigger(eventsMap, callbackGetter) {
    var triggers = {};
    each(eventsMap, function(name, info) {
        if (info.name) {
            createEvent(name)
        }
    });
    var changes;
    triggerEvent.change = function(name) {
        var eventInfo = eventsMap[name];
        if (eventInfo) {
            (changes = changes || {})[name] = eventInfo
        }
        return !!eventInfo
    };
    triggerEvent.applyChanges = function() {
        if (changes) {
            each(changes, function(name, eventInfo) {
                createEvent(eventInfo.newName || name)
            });
            changes = null
        }
    };
    triggerEvent.dispose = function() {
        eventsMap = callbackGetter = triggers = null
    };
    return triggerEvent;

    function createEvent(name) {
        var eventInfo = eventsMap[name];
        triggers[eventInfo.name] = callbackGetter(name)
    }

    function triggerEvent(name, arg, complete) {
        triggers[name](arg);
        complete && complete()
    }
}
