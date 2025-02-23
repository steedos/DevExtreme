/**
 * DevExtreme (viz/core/loading_indicator.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _patchFontOptions = require("./utils").patchFontOptions,
    STATE_HIDDEN = 0,
    STATE_SHOWN = 1,
    ANIMATION_EASING = "linear",
    ANIMATION_DURATION = 400,
    LOADING_INDICATOR_READY = "loadingIndicatorReady";

function LoadingIndicator(parameters) {
    var that = this,
        renderer = parameters.renderer;
    that._group = renderer.g().attr({
        "class": "dx-loading-indicator"
    }).linkOn(renderer.root, {
        name: "loading-indicator",
        after: "peripheral"
    });
    that._rect = renderer.rect().attr({
        opacity: 0
    }).append(that._group);
    that._text = renderer.text().attr({
        align: "center"
    }).append(that._group);
    that._createStates(parameters.eventTrigger, that._group, renderer.root, parameters.notify)
}
LoadingIndicator.prototype = {
    constructor: LoadingIndicator,
    _createStates: function(eventTrigger, group, root, notify) {
        var that = this;
        that._states = [{
            opacity: 0,
            start: function() {
                notify(false)
            },
            complete: function() {
                group.linkRemove();
                root.css({
                    "pointer-events": ""
                });
                eventTrigger(LOADING_INDICATOR_READY)
            }
        }, {
            opacity: .85,
            start: function() {
                group.linkAppend();
                root.css({
                    "pointer-events": "none"
                });
                notify(true)
            },
            complete: function() {
                eventTrigger(LOADING_INDICATOR_READY)
            }
        }];
        that._state = STATE_HIDDEN
    },
    setSize: function(size) {
        var width = size.width,
            height = size.height;
        this._rect.attr({
            width: width,
            height: height
        });
        this._text.attr({
            x: width / 2,
            y: height / 2
        })
    },
    setOptions: function(options) {
        this._rect.attr({
            fill: options.backgroundColor
        });
        this._text.css(_patchFontOptions(options.font)).attr({
            text: options.text
        });
        this[options.show ? "show" : "hide"]()
    },
    dispose: function() {
        var that = this;
        that._group.linkRemove().linkOff();
        that._group = that._rect = that._text = that._states = null
    },
    _transit: function(stateId) {
        var state, that = this;
        if (that._state !== stateId) {
            that._state = stateId;
            that._isHiding = false;
            state = that._states[stateId];
            that._rect.stopAnimation().animate({
                opacity: state.opacity
            }, {
                complete: state.complete,
                easing: ANIMATION_EASING,
                duration: ANIMATION_DURATION,
                unstoppable: true
            });
            that._noHiding = true;
            state.start();
            that._noHiding = false
        }
    },
    show: function() {
        this._transit(STATE_SHOWN)
    },
    hide: function() {
        this._transit(STATE_HIDDEN)
    },
    scheduleHiding: function() {
        if (!this._noHiding) {
            this._isHiding = true
        }
    },
    fulfillHiding: function() {
        if (this._isHiding) {
            this.hide()
        }
    }
};
exports.LoadingIndicator = LoadingIndicator;
exports.plugin = {
    name: "loading_indicator",
    init: function() {
        var that = this;
        that._loadingIndicator = new exports.LoadingIndicator({
            eventTrigger: that._eventTrigger,
            renderer: that._renderer,
            notify: notify
        });
        that._scheduleLoadingIndicatorHiding();

        function notify(state) {
            that._skipLoadingIndicatorOptions = true;
            that.option("loadingIndicator", {
                show: state
            });
            that._skipLoadingIndicatorOptions = false;
            if (state) {
                that._hideTooltip && that._hideTooltip()
            }
        }
    },
    dispose: function() {
        this._loadingIndicator.dispose();
        this._loadingIndicator = null
    },
    members: {
        _scheduleLoadingIndicatorHiding: function() {
            this._loadingIndicator.scheduleHiding()
        },
        _fulfillLoadingIndicatorHiding: function() {
            this._loadingIndicator.fulfillHiding()
        },
        showLoadingIndicator: function() {
            this._loadingIndicator.show()
        },
        hideLoadingIndicator: function() {
            this._loadingIndicator.hide()
        },
        _onBeginUpdate: function() {
            if (!this._optionChangedLocker) {
                this._scheduleLoadingIndicatorHiding()
            }
        }
    },
    customize: function(constructor) {
        var proto = constructor.prototype;
        if (proto._dataSourceChangedHandler) {
            var _dataSourceChangedHandler = proto._dataSourceChangedHandler;
            proto._dataSourceChangedHandler = function() {
                this._scheduleLoadingIndicatorHiding();
                _dataSourceChangedHandler.apply(this, arguments)
            }
        }
        var _setContentSize = proto._setContentSize;
        proto._setContentSize = function() {
            _setContentSize.apply(this, arguments);
            this._loadingIndicator.setSize(this._canvas)
        };
        constructor.addChange({
            code: "LOADING_INDICATOR",
            handler: function() {
                if (!this._skipLoadingIndicatorOptions) {
                    this._loadingIndicator.setOptions(this._getOption("loadingIndicator"))
                }
                this._scheduleLoadingIndicatorHiding()
            },
            isThemeDependent: true,
            option: "loadingIndicator",
            isOptionChange: true
        });
        proto._eventsMap.onLoadingIndicatorReady = {
            name: "loadingIndicatorReady"
        };
        var _drawn = proto._drawn;
        proto._drawn = function() {
            _drawn.apply(this, arguments);
            if (this._dataIsReady()) {
                this._fulfillLoadingIndicatorHiding()
            }
        }
    }
};
