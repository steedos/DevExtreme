/**
 * DevExtreme (viz/core/tooltip.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var domAdapter = require("../../core/dom_adapter"),
    windowUtils = require("../../core/utils/window"),
    inflector = require("../../core/utils/inflector"),
    window = windowUtils.getWindow(),
    $ = require("../../core/renderer"),
    rendererModule = require("./renderers/renderer"),
    typeUtils = require("../../core/utils/type"),
    extend = require("../../core/utils/extend").extend,
    HALF_ARROW_WIDTH = 10,
    vizUtils = require("./utils"),
    _format = require("../../format_helper").format,
    mathCeil = Math.ceil,
    mathMax = Math.max,
    mathMin = Math.min;

function hideElement($element) {
    $element.css({
        left: "-9999px"
    }).detach()
}

function getSpecialFormatOptions(options, specialFormat) {
    var result = options;
    switch (specialFormat) {
        case "argument":
            result = {
                format: options.argumentFormat
            };
            break;
        case "percent":
            result = {
                format: {
                    type: "percent",
                    precision: options.format && options.format.percentPrecision
                }
            }
    }
    return result
}

function Tooltip(params) {
    var renderer, root, that = this;
    that._eventTrigger = params.eventTrigger;
    that._widgetRoot = params.widgetRoot;
    that._wrapper = $("<div>").css({
        position: "absolute",
        overflow: "visible",
        height: "1px",
        pointerEvents: "none"
    }).addClass(params.cssClass);
    that._renderer = renderer = new rendererModule.Renderer({
        pathModified: params.pathModified,
        container: that._wrapper[0]
    });
    root = renderer.root;
    root.attr({
        "pointer-events": "none"
    });
    that._cloud = renderer.path([], "area").sharp().append(root);
    that._shadow = renderer.shadowFilter();
    that._textGroup = renderer.g().attr({
        align: "center"
    }).append(root);
    that._text = renderer.text(void 0, 0, 0).append(that._textGroup);
    that._textGroupHtml = $("<div>").css({
        position: "absolute",
        width: 0,
        padding: 0,
        margin: 0,
        border: "0px solid transparent"
    }).appendTo(that._wrapper);
    that._textHtml = $("<div>").css({
        position: "relative",
        display: "inline-block",
        padding: 0,
        margin: 0,
        border: "0px solid transparent"
    }).appendTo(that._textGroupHtml)
}
Tooltip.prototype = {
    constructor: Tooltip,
    dispose: function() {
        this._wrapper.remove();
        this._renderer.dispose();
        this._options = this._widgetRoot = null
    },
    _getContainer: function() {
        var options = this._options,
            container = $(this._widgetRoot).closest(options.container);
        if (0 === container.length) {
            container = $(options.container)
        }
        return (container.length ? container : $("body")).get(0)
    },
    setOptions: function(options) {
        options = options || {};
        var that = this,
            cloudSettings = that._cloudSettings = {
                opacity: options.opacity,
                filter: that._shadow.id,
                "stroke-width": null,
                stroke: null
            },
            borderOptions = options.border || {};
        that._shadowSettings = extend({
            x: "-50%",
            y: "-50%",
            width: "200%",
            height: "200%"
        }, options.shadow);
        that._options = options;
        if (borderOptions.visible) {
            extend(cloudSettings, {
                "stroke-width": borderOptions.width,
                stroke: borderOptions.color,
                "stroke-opacity": borderOptions.opacity,
                dashStyle: borderOptions.dashStyle
            })
        }
        that._textFontStyles = vizUtils.patchFontOptions(options.font);
        that._textFontStyles.color = options.font.color;
        that._wrapper.css({
            zIndex: options.zIndex
        });
        that._customizeTooltip = typeUtils.isFunction(options.customizeTooltip) ? options.customizeTooltip : null;
        return that
    },
    setRendererOptions: function(options) {
        this._renderer.setOptions(options);
        this._textGroupHtml.css({
            direction: options.rtl ? "rtl" : "ltr"
        });
        return this
    },
    render: function() {
        var that = this;
        hideElement(that._wrapper);
        that._cloud.attr(that._cloudSettings);
        that._shadow.attr(that._shadowSettings);
        var normalizedCSS = {};
        for (var name in that._textFontStyles) {
            normalizedCSS[inflector.camelize(name)] = that._textFontStyles[name]
        }
        that._textGroupHtml.css(normalizedCSS);
        that._textGroup.css(that._textFontStyles);
        that._text.css(that._textFontStyles);
        that._eventData = null;
        return that
    },
    update: function(options) {
        return this.setOptions(options).render()
    },
    _prepare: function(formatObject, state) {
        var options = this._options,
            customize = {};
        if (this._customizeTooltip) {
            customize = this._customizeTooltip.call(formatObject, formatObject);
            customize = typeUtils.isPlainObject(customize) ? customize : {};
            if ("text" in customize) {
                state.text = typeUtils.isDefined(customize.text) ? String(customize.text) : ""
            }
            if ("html" in customize) {
                state.html = typeUtils.isDefined(customize.html) ? String(customize.html) : ""
            }
        }
        if (!("text" in state) && !("html" in state)) {
            state.text = formatObject.valueText || ""
        }
        state.color = customize.color || options.color;
        state.borderColor = customize.borderColor || (options.border || {}).color;
        state.textColor = customize.fontColor || (options.font || {}).color;
        return !!state.text || !!state.html
    },
    show: function(formatObject, params, eventData) {
        var bBox, contentSize, that = this,
            state = {},
            options = that._options,
            paddingLeftRight = options.paddingLeftRight,
            paddingTopBottom = options.paddingTopBottom,
            textGroupHtml = that._textGroupHtml,
            textHtml = that._textHtml,
            ss = that._shadowSettings,
            xOff = ss.offsetX,
            yOff = ss.offsetY,
            blur = 2 * ss.blur + 1,
            getComputedStyle = window.getComputedStyle;
        if (!that._prepare(formatObject, state)) {
            return false
        }
        that._state = state;
        state.tc = {};
        that._wrapper.appendTo(that._getContainer());
        that._cloud.attr({
            fill: state.color,
            stroke: state.borderColor
        });
        if (state.html) {
            that._text.attr({
                text: ""
            });
            textGroupHtml.css({
                color: state.textColor,
                width: that._getCanvas().width
            });
            textHtml.html(state.html);
            if (getComputedStyle) {
                bBox = getComputedStyle(textHtml.get(0));
                bBox = {
                    x: 0,
                    y: 0,
                    width: mathCeil(parseFloat(bBox.width)),
                    height: mathCeil(parseFloat(bBox.height))
                }
            } else {
                bBox = textHtml.get(0).getBoundingClientRect();
                bBox = {
                    x: 0,
                    y: 0,
                    width: mathCeil(bBox.width ? bBox.width : bBox.right - bBox.left),
                    height: mathCeil(bBox.height ? bBox.height : bBox.bottom - bBox.top)
                }
            }
            textGroupHtml.width(bBox.width);
            textGroupHtml.height(bBox.height)
        } else {
            textHtml.html("");
            that._text.css({
                fill: state.textColor
            }).attr({
                text: state.text
            });
            bBox = that._textGroup.css({
                fill: state.textColor
            }).getBBox()
        }
        contentSize = state.contentSize = {
            x: bBox.x - paddingLeftRight,
            y: bBox.y - paddingTopBottom,
            width: bBox.width + 2 * paddingLeftRight,
            height: bBox.height + 2 * paddingTopBottom,
            lm: blur - xOff > 0 ? blur - xOff : 0,
            rm: blur + xOff > 0 ? blur + xOff : 0,
            tm: blur - yOff > 0 ? blur - yOff : 0,
            bm: blur + yOff > 0 ? blur + yOff : 0
        };
        contentSize.fullWidth = contentSize.width + contentSize.lm + contentSize.rm;
        contentSize.fullHeight = contentSize.height + contentSize.tm + contentSize.bm + options.arrowLength;
        that.move(params.x, params.y, params.offset);
        that._eventData && that._eventTrigger("tooltipHidden", that._eventData);
        that._eventData = eventData;
        that._eventTrigger("tooltipShown", that._eventData);
        return true
    },
    hide: function() {
        var that = this;
        hideElement(that._wrapper);
        that._eventData && that._eventTrigger("tooltipHidden", that._eventData);
        that._eventData = null
    },
    move: function(x, y, offset) {
        offset = offset || 0;
        var that = this,
            canvas = that._getCanvas(),
            state = that._state,
            coords = state.tc,
            contentSize = state.contentSize;
        if (that._calculatePosition(x, y, offset, canvas)) {
            that._cloud.attr({
                points: coords.cloudPoints
            }).move(contentSize.lm, contentSize.tm);
            if (state.html) {
                that._textGroupHtml.css({
                    left: -contentSize.x + contentSize.lm,
                    top: -contentSize.y + contentSize.tm + coords.correction
                })
            } else {
                that._textGroup.move(-contentSize.x + contentSize.lm, -contentSize.y + contentSize.tm + coords.correction)
            }
            that._renderer.resize("out" === coords.hp ? canvas.fullWidth + contentSize.lm : contentSize.fullWidth, "out" === coords.vp ? canvas.fullHeight : contentSize.fullHeight)
        }
        offset = that._wrapper.css({
            left: 0,
            top: 0
        }).offset();
        that._wrapper.css({
            left: coords.x - offset.left,
            top: coords.y - offset.top,
            width: "out" === coords.hp ? canvas.fullWidth + contentSize.lm : contentSize.fullWidth
        })
    },
    formatValue: function(value, _specialFormat) {
        var options = _specialFormat ? getSpecialFormatOptions(this._options, _specialFormat) : this._options;
        return _format(value, options.format)
    },
    getLocation: function() {
        return vizUtils.normalizeEnum(this._options.location)
    },
    isEnabled: function() {
        return !!this._options.enabled
    },
    isShared: function() {
        return !!this._options.shared
    },
    _calculatePosition: function(x, y, offset, canvas) {
        var cloudPoints, y1, y3, that = this,
            options = that._options,
            arrowLength = options.arrowLength,
            state = that._state,
            coords = state.tc,
            contentSize = state.contentSize,
            contentWidth = contentSize.width,
            halfContentWidth = contentWidth / 2,
            contentHeight = contentSize.height,
            cTop = y - canvas.top,
            cBottom = canvas.top + canvas.height - y,
            cLeft = x - canvas.left,
            cRight = canvas.width + canvas.left - x,
            tTop = contentHeight + arrowLength + offset + contentSize.tm,
            tBottom = contentHeight + arrowLength + offset + contentSize.bm,
            tLeft = contentWidth + contentSize.lm,
            tRight = contentWidth + contentSize.rm,
            tHalfLeft = halfContentWidth + contentSize.lm,
            tHalfRight = halfContentWidth + contentSize.rm,
            correction = 0,
            arrowPoints = [6, 0],
            x1 = halfContentWidth + HALF_ARROW_WIDTH,
            x2 = halfContentWidth,
            x3 = halfContentWidth - HALF_ARROW_WIDTH,
            y2 = contentHeight + arrowLength,
            hp = "center",
            vp = "bottom";
        y1 = y3 = contentHeight;
        if (tTop > cTop && tBottom > cBottom) {
            vp = "out"
        } else {
            if (tTop > cTop) {
                vp = "top"
            }
        }
        if (tLeft > cLeft && tRight > cRight) {
            hp = "out"
        } else {
            if (tHalfLeft > cLeft && tRight < cRight) {
                hp = "left"
            } else {
                if (tHalfRight > cRight && tLeft < cLeft) {
                    hp = "right"
                }
            }
        }
        if ("out" === hp) {
            x = canvas.left
        } else {
            if ("left" === hp) {
                x1 = HALF_ARROW_WIDTH;
                x2 = x3 = 0
            } else {
                if ("right" === hp) {
                    x1 = x2 = contentWidth;
                    x3 = contentWidth - HALF_ARROW_WIDTH;
                    x -= contentWidth
                } else {
                    if ("center" === hp) {
                        x -= halfContentWidth
                    }
                }
            }
        }
        if ("out" === vp) {
            y = canvas.top
        } else {
            if ("top" === vp) {
                "out" !== hp && (correction = arrowLength);
                arrowPoints[0] = 2;
                y1 = y3 = arrowLength;
                y2 = x1;
                x1 = x3;
                x3 = y2;
                y2 = 0;
                y += offset
            } else {
                y -= contentHeight + arrowLength + offset
            }
        }
        coords.x = x - contentSize.lm;
        coords.y = y - contentSize.tm;
        coords.correction = correction;
        if (hp === coords.hp && vp === coords.vp) {
            return false
        }
        coords.hp = hp;
        coords.vp = vp;
        cloudPoints = [0, 0 + correction, contentWidth, 0 + correction, contentWidth, contentHeight + correction, 0, contentHeight + correction];
        if ("out" !== hp && "out" !== vp) {
            arrowPoints.splice(2, 0, x1, y1, x2, y2, x3, y3);
            cloudPoints.splice.apply(cloudPoints, arrowPoints)
        }
        coords.cloudPoints = cloudPoints;
        return true
    },
    _getCanvas: function() {
        var container = this._getContainer(),
            containerBox = container.getBoundingClientRect(),
            html = domAdapter.getDocumentElement(),
            body = domAdapter.getBody(),
            left = window.pageXOffset || html.scrollLeft || 0,
            top = window.pageYOffset || html.scrollTop || 0;
        var box = {
            left: left,
            top: top,
            width: html.clientWidth || 0,
            height: html.clientHeight || 0,
            fullWidth: mathMax(body.scrollWidth, html.scrollWidth, body.offsetWidth, html.offsetWidth, body.clientWidth, html.clientWidth) - left,
            fullHeight: mathMax(body.scrollHeight, html.scrollHeight, body.offsetHeight, html.offsetHeight, body.clientHeight, html.clientHeight) - top
        };
        if (container !== body) {
            left = mathMax(box.left, box.left + containerBox.left);
            top = mathMax(box.top, box.top + containerBox.top);
            box.width = mathMin(box.width + box.left - left, containerBox.width + (containerBox.left > 0 ? 0 : containerBox.left));
            box.height = mathMin(box.height + box.top - top, containerBox.height + (containerBox.top > 0 ? 0 : containerBox.top));
            box.fullWidth = box.width;
            box.fullHeight = box.height;
            box.left = left;
            box.top = top
        }
        return box
    }
};
exports.Tooltip = Tooltip;
exports.plugin = {
    name: "tooltip",
    init: function() {
        this._initTooltip()
    },
    dispose: function() {
        this._disposeTooltip()
    },
    members: {
        _initTooltip: function() {
            this._tooltip = new exports.Tooltip({
                cssClass: this._rootClassPrefix + "-tooltip",
                eventTrigger: this._eventTrigger,
                pathModified: this.option("pathModified"),
                widgetRoot: this.element()
            })
        },
        _disposeTooltip: function() {
            this._tooltip.dispose();
            this._tooltip = null
        },
        _hideTooltip: function() {
            this._tooltip.hide()
        },
        _onRender: function() {
            if (!this._$element.is(":visible")) {
                this._hideTooltip()
            }
        },
        _setTooltipRendererOptions: function() {
            this._tooltip.setRendererOptions(this._getRendererOptions())
        },
        _setTooltipOptions: function() {
            this._tooltip.update(this._getOption("tooltip"))
        }
    },
    customize: function(constructor) {
        var proto = constructor.prototype;
        proto._eventsMap.onTooltipShown = {
            name: "tooltipShown"
        };
        proto._eventsMap.onTooltipHidden = {
            name: "tooltipHidden"
        };
        constructor.addChange({
            code: "TOOLTIP_RENDERER",
            handler: function() {
                this._setTooltipRendererOptions()
            },
            isThemeDependent: true,
            isOptionChange: true
        });
        constructor.addChange({
            code: "TOOLTIP",
            handler: function() {
                this._setTooltipOptions()
            },
            isThemeDependent: true,
            isOptionChange: true,
            option: "tooltip"
        })
    }
};
