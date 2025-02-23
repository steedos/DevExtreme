/**
 * DevExtreme (viz/chart_components/zoom_and_pan.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _type = require("../../core/utils/type");
var _extend = require("../../core/utils/extend");
var _utils = require("../core/utils");
var _wheel = require("../../events/core/wheel");
var _transform = require("../../events/transform");
var _transform2 = _interopRequireDefault(_transform);
var _drag = require("../../events/drag");
var _drag2 = _interopRequireDefault(_drag);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var EVENTS_NS = ".zoomAndPanNS";
var DRAG_START_EVENT_NAME = _drag2.default.start + EVENTS_NS;
var DRAG_EVENT_NAME = _drag2.default.move + EVENTS_NS;
var DRAG_END_EVENT_NAME = _drag2.default.end + EVENTS_NS;
var PINCH_START_EVENT_NAME = _transform2.default.pinchstart + EVENTS_NS;
var PINCH_EVENT_NAME = _transform2.default.pinch + EVENTS_NS;
var PINCH_END_EVENT_NAME = _transform2.default.pinchend + EVENTS_NS;
var SCROLL_BAR_START_EVENT_NAME = "dxc-scroll-start" + EVENTS_NS;
var SCROLL_BAR_MOVE_EVENT_NAME = "dxc-scroll-move" + EVENTS_NS;
var SCROLL_BAR_END_EVENT_NAME = "dxc-scroll-end" + EVENTS_NS;
var GESTURE_TIMEOUT = 300;
var MIN_DRAG_DELTA = 5;
var _min = Math.min;
var _max = Math.max;
var _abs = Math.abs;

function canvasToRect(canvas) {
    return {
        x: canvas.left,
        y: canvas.top,
        width: canvas.width - canvas.left - canvas.right,
        height: canvas.height - canvas.top - canvas.bottom
    }
}

function checkCoords(rect, coords) {
    var x = coords.x,
        y = coords.y;
    return x >= rect.x && x <= rect.width + rect.x && y >= rect.y && y <= rect.height + rect.y
}

function sortAxes(axes, onlyAxisToNotify) {
    if (onlyAxisToNotify) {
        axes = axes.sort(function(a, b) {
            if (a === onlyAxisToNotify) {
                return -1
            }
            if (b === onlyAxisToNotify) {
                return 1
            }
            return 0
        })
    }
    return axes
}

function isNotEmptyAxisBusinessRange(axis) {
    return !axis.getTranslator().getBusinessRange().isEmpty()
}
module.exports = {
    name: "zoom_and_pan",
    init: function() {
        var chart = this,
            renderer = this._renderer;

        function cancelEvent(e) {
            if (e.originalEvent) {
                cancelEvent(e.originalEvent)
            }
            try {
                e.cancel = true
            } catch (e) {
                return
            }
        }

        function startAxesViewportChanging(zoomAndPan, actionField, e) {
            var options = zoomAndPan.options;
            var actionData = zoomAndPan.actionData;
            var axes = [];
            if (options.argumentAxis[actionField]) {
                axes.push(chart.getArgumentAxis())
            }
            if (options.valueAxis[actionField]) {
                axes = axes.concat(actionData.valueAxes)
            }
            axes.reduce(function(isPrevented, axis) {
                if (isPrevented) {
                    return isPrevented
                }
                if (isNotEmptyAxisBusinessRange(axis)) {
                    return axis.handleZooming(null, {
                        end: true
                    }, e, actionField).isPrevented
                }
                return isPrevented
            }, false) && cancelEvent(e)
        }

        function axesViewportChanging(zoomAndPan, actionField, e, offsetCalc, centerCalc) {
            function zoomAxes(axes, criteria, coordField, e, actionData) {
                var zoom = {
                    zoomed: false
                };
                criteria && axes.filter(isNotEmptyAxisBusinessRange).forEach(function(axis) {
                    var options = axis.getOptions();
                    var viewport = axis.visualRange();
                    var scale = axis.getTranslator().getEventScale(e);
                    var translate = -offsetCalc(e, actionData, coordField, scale);
                    zoom = (0, _extend.extend)(true, zoom, axis.getTranslator().zoom(translate, scale, axis.getZoomBounds()));
                    var range = axis.adjustRange((0, _utils.getVizRangeObject)([zoom.min, zoom.max]));
                    var isMinZoom = axis.isZoomingLowerLimitOvercome(actionField, scale, range);
                    if (!(0, _type.isDefined)(viewport) || viewport.startValue.valueOf() !== range.startValue.valueOf() || viewport.endValue.valueOf() !== range.endValue.valueOf()) {
                        axis.handleZooming(isMinZoom ? null : range, {
                            start: true,
                            end: true
                        }, e, actionField);
                        if (!isMinZoom) {
                            zoom.zoomed = true;
                            zoom.deltaTranslate = translate - zoom.translate
                        }
                    } else {
                        if ("touch" === e.pointerType && "discrete" === options.type) {
                            var isMinPosition = axis.isExtremePosition(false);
                            var isMaxPosition = axis.isExtremePosition(true);
                            var zoomInEnabled = scale > 1 && !isMinZoom;
                            var zoomOutEnabled = scale < 1 && (!isMinPosition || !isMaxPosition);
                            var panningEnabled = 1 === scale && !(isMinPosition && (translate < 0 && !options.inverted || translate > 0 && options.inverted) || isMaxPosition && (translate > 0 && !options.inverted || translate < 0 && options.inverted));
                            zoom.enabled = zoomInEnabled || zoomOutEnabled || panningEnabled
                        }
                    }
                });
                return zoom
            }

            function storeOffset(e, actionData, zoom, coordField) {
                if (zoom.zoomed) {
                    actionData.offset[coordField] = (e.offset ? e.offset[coordField] : actionData.offset[coordField]) + zoom.deltaTranslate
                }
            }

            function storeCenter(center, actionData, zoom, coordField) {
                if (zoom.zoomed) {
                    actionData.center[coordField] = center[coordField] + zoom.deltaTranslate
                }
            }
            var rotated = chart.option("rotated");
            var actionData = zoomAndPan.actionData;
            var options = zoomAndPan.options;
            var argZoom = {};
            var valZoom = {};
            if (!actionData.fallback) {
                argZoom = zoomAxes(chart._argumentAxes, options.argumentAxis[actionField], rotated ? "y" : "x", e, actionData);
                valZoom = zoomAxes(actionData.valueAxes, options.valueAxis[actionField], rotated ? "x" : "y", e, actionData);
                chart._requestChange(["VISUAL_RANGE"]);
                storeOffset(e, actionData, argZoom, rotated ? "y" : "x");
                storeOffset(e, actionData, valZoom, rotated ? "x" : "y")
            }
            var center = centerCalc(e);
            storeCenter(center, actionData, argZoom, rotated ? "y" : "x");
            storeCenter(center, actionData, valZoom, rotated ? "x" : "y");
            if (!argZoom.zoomed && !valZoom.zoomed) {
                actionData.center = center
            }
            return argZoom.zoomed || valZoom.zoomed || actionData.fallback || argZoom.enabled || valZoom.enabled
        }

        function finishAxesViewportChanging(zoomAndPan, actionField, e, offsetCalc) {
            function zoomAxes(axes, criteria, coordField, e, actionData, onlyAxisToNotify) {
                var zoomStarted = false;
                criteria && axes.forEach(function(axis) {
                    var silent = onlyAxisToNotify && axis !== onlyAxisToNotify;
                    var scale = e.scale || 1;
                    var zoom = axis.getTranslator().zoom(-offsetCalc(e, actionData, coordField, scale), scale, axis.getZoomBounds());
                    var range = {
                        startValue: zoom.min,
                        endValue: zoom.max
                    };
                    var isMinZoom = axis.isZoomingLowerLimitOvercome(actionField, scale, range);
                    axis.handleZooming(isMinZoom ? null : range, {
                        start: true,
                        end: silent
                    }, e, actionField);
                    isMinZoom ? axis.handleZoomEnd() : zoomStarted = true
                });
                return zoomStarted
            }
            var rotated = chart.option("rotated");
            var actionData = zoomAndPan.actionData;
            var options = zoomAndPan.options;
            var zoomStarted = true;
            if (actionData.fallback) {
                zoomStarted &= zoomAxes(chart._argumentAxes, options.argumentAxis[actionField], rotated ? "y" : "x", e, actionData, chart.getArgumentAxis());
                zoomStarted |= zoomAxes(actionData.valueAxes, options.valueAxis[actionField], rotated ? "x" : "y", e, actionData)
            } else {
                var axes = [];
                if (options.argumentAxis[actionField]) {
                    axes.push(chart.getArgumentAxis())
                }
                if (options.valueAxis[actionField]) {
                    axes = axes.concat(actionData.valueAxes)
                }
                axes.filter(isNotEmptyAxisBusinessRange).forEach(function(axis) {
                    axis.handleZooming(null, {
                        start: true
                    }, e, actionField)
                });
                zoomStarted = zoomStarted && axes.length
            }
            zoomStarted && chart._requestChange(["VISUAL_RANGE"])
        }

        function prepareActionData(coords, action) {
            var axes = chart._argumentAxes.filter(function(axis) {
                return checkCoords(canvasToRect(axis.getCanvas()), coords)
            });
            return {
                fallback: chart._lastRenderingTime > GESTURE_TIMEOUT,
                cancel: !axes.length || !(0, _type.isDefined)(action),
                action: action,
                curAxisRect: axes.length && canvasToRect(axes[0].getCanvas()),
                valueAxes: axes.length && chart._valueAxes.filter(function(axis) {
                    return checkCoords(canvasToRect(axis.getCanvas()), coords)
                }),
                offset: {
                    x: 0,
                    y: 0
                },
                center: coords,
                startCenter: coords
            }
        }

        function getPointerCoord(rect, e) {
            var rootOffset = renderer.getRootOffset();
            return {
                x: _min(_max(e.pageX - rootOffset.left, rect.x), rect.width + rect.x),
                y: _min(_max(e.pageY - rootOffset.top, rect.y), rect.height + rect.y)
            }
        }

        function calcCenterForPinch(e) {
            var rootOffset = renderer.getRootOffset();
            var x1 = e.pointers[0].pageX,
                x2 = e.pointers[1].pageX,
                y1 = e.pointers[0].pageY,
                y2 = e.pointers[1].pageY;
            return {
                x: _min(x1, x2) + _abs(x2 - x1) / 2 - rootOffset.left,
                y: _min(y1, y2) + _abs(y2 - y1) / 2 - rootOffset.top
            }
        }

        function calcCenterForDrag(e) {
            var rootOffset = renderer.getRootOffset();
            return {
                x: e.pageX - rootOffset.left,
                y: e.pageY - rootOffset.top
            }
        }

        function calcOffsetForDrag(e, actionData, coordField) {
            return e.offset[coordField] - actionData.offset[coordField]
        }

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
            chart._tracker.stopCurrentHandling()
        }
        var zoomAndPan = {
            dragStartHandler: function(e) {
                var options = zoomAndPan.options;
                var isTouch = "touch" === e.pointerType;
                var wantPan = options.argumentAxis.pan || options.valueAxis.pan;
                var wantZoom = options.argumentAxis.zoom || options.valueAxis.zoom;
                var panKeyPressed = (0, _type.isDefined)(options.panKey) && e[(0, _utils.normalizeEnum)(options.panKey) + "Key"];
                var dragToZoom = options.dragToZoom;
                var action = void 0;
                if (isTouch) {
                    if (options.allowTouchGestures && wantPan) {
                        var cancelPanning = !zoomAndPan.panningVisualRangeEnabled() || zoomAndPan.skipEvent;
                        action = cancelPanning ? null : "pan"
                    }
                } else {
                    if (dragToZoom && wantPan && panKeyPressed) {
                        action = "pan"
                    } else {
                        if (!dragToZoom && wantPan) {
                            action = "pan"
                        } else {
                            if (dragToZoom && wantZoom) {
                                action = "zoom"
                            }
                        }
                    }
                }
                var actionData = prepareActionData(calcCenterForDrag(e), action);
                if (actionData.cancel) {
                    zoomAndPan.skipEvent = false;
                    e.cancel = true;
                    return
                }
                zoomAndPan.actionData = actionData;
                preventDefaults(e);
                if ("zoom" === action) {
                    actionData.startCoords = getPointerCoord(actionData.curAxisRect, e);
                    actionData.rect = renderer.rect(0, 0, 0, 0).attr(options.dragBoxStyle).append(renderer.root)
                } else {
                    startAxesViewportChanging(zoomAndPan, "pan", e)
                }
            },
            dragHandler: function(e) {
                var rotated = chart.option("rotated");
                var options = zoomAndPan.options;
                var actionData = zoomAndPan.actionData;
                var isTouch = "touch" === e.pointerType;
                if (!actionData || isTouch && !zoomAndPan.panningVisualRangeEnabled()) {
                    return
                }
                if ("zoom" === actionData.action) {
                    preventDefaults(e);
                    var curCanvas = actionData.curAxisRect,
                        startCoords = actionData.startCoords,
                        curCoords = getPointerCoord(curCanvas, e),
                        zoomArg = options.argumentAxis.zoom,
                        zoomVal = options.valueAxis.zoom;
                    var rect = {
                        x: _min(startCoords.x, curCoords.x),
                        y: _min(startCoords.y, curCoords.y),
                        width: _abs(startCoords.x - curCoords.x),
                        height: _abs(startCoords.y - curCoords.y)
                    };
                    if (!zoomArg || !zoomVal) {
                        if (!zoomArg && !rotated || !zoomVal && rotated) {
                            rect.x = curCanvas.x;
                            rect.width = curCanvas.width
                        } else {
                            rect.y = curCanvas.y;
                            rect.height = curCanvas.height
                        }
                    }
                    actionData.rect.attr(rect)
                } else {
                    if ("pan" === actionData.action) {
                        var viewportChanged = axesViewportChanging(zoomAndPan, "pan", e, calcOffsetForDrag, function(e) {
                            return e.offset
                        });
                        if (isTouch) {
                            zoomAndPan.defineTouchBehavior(!viewportChanged, e);
                            if (!viewportChanged && zoomAndPan.panningVisualRangeEnabled()) {
                                cancelEvent(e);
                                zoomAndPan.skipEvent = true;
                                zoomAndPan.actionData = null
                            }
                        } else {
                            preventDefaults(e)
                        }
                    }
                }
            },
            dragEndHandler: function(e) {
                var rotated = chart.option("rotated");
                var options = zoomAndPan.options;
                var actionData = zoomAndPan.actionData;
                var isTouch = "touch" === e.pointerType;
                if (!actionData || isTouch && !zoomAndPan.panningVisualRangeEnabled()) {
                    return
                }(!isTouch || !zoomAndPan.actionData.isNative) && preventDefaults(e);
                if ("zoom" === actionData.action) {
                    var zoomAxes = function(axes, criteria, coordField, startCoords, curCoords, onlyAxisToNotify) {
                        axes = sortAxes(axes, onlyAxisToNotify);
                        var curCoord = curCoords[coordField];
                        var startCoord = startCoords[coordField];
                        var zoomStarted = false;
                        if (criteria && _abs(curCoord - startCoord) > MIN_DRAG_DELTA) {
                            axes.some(function(axis) {
                                var tr = axis.getTranslator();
                                if (tr.getBusinessRange().isEmpty()) {
                                    return
                                }
                                var silent = onlyAxisToNotify && axis !== onlyAxisToNotify;
                                var range = [tr.from(startCoord), tr.from(curCoord)];
                                var isMinZoom = axis.isZoomingLowerLimitOvercome(actionData.action, tr.getMinScale(true), range);
                                var result = axis.handleZooming(isMinZoom ? null : range, {
                                    start: !!silent,
                                    end: !!silent
                                }, e, actionData.action);
                                isMinZoom ? axis.handleZoomEnd() : zoomStarted = true;
                                return onlyAxisToNotify && result.isPrevented
                            })
                        }
                        return zoomStarted
                    };
                    var curCoords = getPointerCoord(actionData.curAxisRect, e);
                    var argumentAxesZoomed = zoomAxes(chart._argumentAxes, options.argumentAxis.zoom, rotated ? "y" : "x", actionData.startCoords, curCoords, chart.getArgumentAxis());
                    var valueAxesZoomed = zoomAxes(actionData.valueAxes, options.valueAxis.zoom, rotated ? "x" : "y", actionData.startCoords, curCoords);
                    if (valueAxesZoomed || argumentAxesZoomed) {
                        chart._requestChange(["VISUAL_RANGE"])
                    }
                    actionData.rect.dispose()
                } else {
                    if ("pan" === actionData.action) {
                        finishAxesViewportChanging(zoomAndPan, "pan", e, calcOffsetForDrag)
                    }
                }
                zoomAndPan.actionData = null
            },
            pinchStartHandler: function(e) {
                preventDefaults(e);
                var actionData = prepareActionData(calcCenterForPinch(e), "zoom");
                actionData.isNative = !zoomAndPan.panningVisualRangeEnabled();
                if (actionData.cancel) {
                    cancelEvent(e);
                    return
                }
                zoomAndPan.actionData = actionData;
                startAxesViewportChanging(zoomAndPan, "zoom", e)
            },
            pinchHandler: function(e) {
                if (zoomAndPan.actionData && zoomAndPan.actionData.isNative && e.deltaScale <= 1) {
                    zoomAndPan.defineTouchBehavior(true, e);
                    zoomAndPan.actionData = null
                }
                if (!zoomAndPan.actionData) {
                    return
                }
                var viewportChanged = axesViewportChanging(zoomAndPan, "zoom", e, function(e, actionData, coordField, scale) {
                    return calcCenterForPinch(e)[coordField] - actionData.center[coordField] + (actionData.center[coordField] - actionData.center[coordField] * scale)
                }, calcCenterForPinch);
                zoomAndPan.defineTouchBehavior(!viewportChanged, e)
            },
            pinchEndHandler: function(e) {
                if (!zoomAndPan.actionData) {
                    return
                }!zoomAndPan.actionData.isNative && preventDefaults(e);
                finishAxesViewportChanging(zoomAndPan, "zoom", e, function(e, actionData, coordField, scale) {
                    return actionData.center[coordField] - actionData.startCenter[coordField] + (actionData.startCenter[coordField] - actionData.startCenter[coordField] * scale)
                });
                zoomAndPan.actionData = null
            },
            cleanup: function() {
                renderer.root.off(EVENTS_NS);
                zoomAndPan.actionData && zoomAndPan.actionData.rect && zoomAndPan.actionData.rect.dispose();
                zoomAndPan.actionData = null;
                renderer.root.css({
                    "touch-action": "",
                    "-ms-touch-action": ""
                })
            },
            setup: function(options) {
                zoomAndPan.cleanup();
                if (!options.argumentAxis.pan) {
                    renderer.root.on(SCROLL_BAR_START_EVENT_NAME, cancelEvent)
                }
                if (options.argumentAxis.none && options.valueAxis.none) {
                    return
                }
                zoomAndPan.options = options;
                var rotated = chart.option("rotated");
                if ((options.argumentAxis.zoom || options.valueAxis.zoom) && options.allowMouseWheel) {
                    renderer.root.on(_wheel.name + EVENTS_NS, function(e) {
                        function zoomAxes(axes, coord, delta, onlyAxisToNotify) {
                            axes = sortAxes(axes, onlyAxisToNotify);
                            var zoomStarted = false;
                            axes.some(function(axis) {
                                var translator = axis.getTranslator();
                                if (translator.getBusinessRange().isEmpty()) {
                                    return
                                }
                                var silent = onlyAxisToNotify && axis !== onlyAxisToNotify;
                                var scale = translator.getMinScale(delta > 0);
                                var zoom = translator.zoom(-(coord - coord * scale), scale, axis.getZoomBounds());
                                var range = {
                                    startValue: zoom.min,
                                    endValue: zoom.max
                                };
                                var isMinZoom = axis.isZoomingLowerLimitOvercome("zoom", scale, range);
                                var result = axis.handleZooming(isMinZoom ? null : range, {
                                    start: !!silent,
                                    end: !!silent
                                }, e, "zoom");
                                isMinZoom ? axis.handleZoomEnd() : zoomStarted = true;
                                return onlyAxisToNotify && result.isPrevented
                            });
                            return !!zoomStarted
                        }
                        var coords = calcCenterForDrag(e);
                        var axesZoomed = false;
                        var targetAxes = void 0;
                        if (options.valueAxis.zoom) {
                            targetAxes = chart._valueAxes.filter(function(axis) {
                                return checkCoords(canvasToRect(axis.getCanvas()), coords)
                            });
                            if (0 === targetAxes.length) {
                                var targetCanvas = chart._valueAxes.reduce(function(r, axis) {
                                    if (!r && axis.coordsIn(coords.x, coords.y)) {
                                        r = axis.getCanvas()
                                    }
                                    return r
                                }, null);
                                if (targetCanvas) {
                                    targetAxes = chart._valueAxes.filter(function(axis) {
                                        return checkCoords(canvasToRect(axis.getCanvas()), {
                                            x: targetCanvas.left,
                                            y: targetCanvas.top
                                        })
                                    })
                                }
                            }
                            axesZoomed |= zoomAxes(targetAxes, rotated ? coords.x : coords.y, e.delta)
                        }
                        if (options.argumentAxis.zoom) {
                            var canZoom = chart._argumentAxes.some(function(axis) {
                                if (checkCoords(canvasToRect(axis.getCanvas()), coords) || axis.coordsIn(coords.x, coords.y)) {
                                    return true
                                }
                                return false
                            });
                            axesZoomed |= canZoom && zoomAxes(chart._argumentAxes, rotated ? coords.y : coords.x, e.delta, chart.getArgumentAxis())
                        }
                        if (axesZoomed) {
                            chart._requestChange(["VISUAL_RANGE"]);
                            zoomAndPan.panningVisualRangeEnabled(targetAxes) && preventDefaults(e)
                        }
                    })
                }
                if (options.allowTouchGestures) {
                    if (options.argumentAxis.zoom || options.valueAxis.zoom) {
                        renderer.root.on(PINCH_START_EVENT_NAME, {
                            immediate: true
                        }, zoomAndPan.pinchStartHandler).on(PINCH_EVENT_NAME, zoomAndPan.pinchHandler).on(PINCH_END_EVENT_NAME, zoomAndPan.pinchEndHandler)
                    }
                    zoomAndPan.setTouchAction(false)
                }
                renderer.root.on(DRAG_START_EVENT_NAME, {
                    immediate: true
                }, zoomAndPan.dragStartHandler).on(DRAG_EVENT_NAME, zoomAndPan.dragHandler).on(DRAG_END_EVENT_NAME, zoomAndPan.dragEndHandler);
                if (options.argumentAxis.pan) {
                    renderer.root.on(SCROLL_BAR_START_EVENT_NAME, function(e) {
                        zoomAndPan.actionData = {
                            valueAxes: [],
                            offset: {
                                x: 0,
                                y: 0
                            },
                            center: {
                                x: 0,
                                y: 0
                            }
                        };
                        preventDefaults(e);
                        startAxesViewportChanging(zoomAndPan, "pan", e)
                    }).on(SCROLL_BAR_MOVE_EVENT_NAME, function(e) {
                        preventDefaults(e);
                        axesViewportChanging(zoomAndPan, "pan", e, calcOffsetForDrag, function(e) {
                            return e.offset
                        })
                    }).on(SCROLL_BAR_END_EVENT_NAME, function(e) {
                        preventDefaults(e);
                        finishAxesViewportChanging(zoomAndPan, "pan", e, calcOffsetForDrag);
                        zoomAndPan.actionData = null
                    })
                }
            },
            defineTouchBehavior: function(isDefault, e) {
                zoomAndPan.setTouchAction(isDefault);
                zoomAndPan.actionData && (zoomAndPan.actionData.isNative = isDefault);
                if (!isDefault) {
                    preventDefaults(e)
                }
            },
            setTouchAction: function(isDefault) {
                var options = zoomAndPan.options;
                if (!options.allowTouchGestures) {
                    return
                }
                var touchAction = isDefault ? "" : "none";
                if (!isDefault) {
                    if (!options.argumentAxis.zoom && !options.valueAxis.zoom) {
                        touchAction = "pinch-zoom"
                    }
                    if (!options.argumentAxis.pan && !options.valueAxis.pan) {
                        touchAction = "pan-x pan-y"
                    }
                }
                renderer.root.css({
                    "touch-action": touchAction,
                    "-ms-touch-action": touchAction
                })
            },
            panningVisualRangeEnabled: function(targetAxes) {
                if (targetAxes && targetAxes.length) {
                    return targetAxes.some(function(axis) {
                        return !axis.isExtremePosition(false) || !axis.isExtremePosition(true)
                    })
                }
                var enablePanByValueAxis = chart._valueAxes.some(function(axis) {
                    return !axis.isExtremePosition(false) || !axis.isExtremePosition(true)
                });
                var enablePanByArgumentAxis = chart._argumentAxes.some(function(axis) {
                    return !axis.isExtremePosition(false) || !axis.isExtremePosition(true)
                });
                return enablePanByValueAxis || enablePanByArgumentAxis
            }
        };
        this._zoomAndPan = zoomAndPan
    },
    members: {
        _setupZoomAndPan: function() {
            this._zoomAndPan.setup(this._themeManager.getOptions("zoomAndPan"))
        }
    },
    dispose: function() {
        this._zoomAndPan.cleanup()
    },
    customize: function(constructor) {
        constructor.addChange({
            code: "ZOOM_AND_PAN",
            handler: function() {
                this._setupZoomAndPan()
            },
            isThemeDependent: true,
            isOptionChange: true,
            option: "zoomAndPan"
        })
    }
};
