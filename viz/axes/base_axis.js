/**
 * DevExtreme (viz/axes/base_axis.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _smart_formatter = require("./smart_formatter");
var _utils = require("../core/utils");
var _utils2 = _interopRequireDefault(_utils);
var _type = require("../../core/utils/type");
var _axes_constants = require("./axes_constants");
var _axes_constants2 = _interopRequireDefault(_axes_constants);
var _extend = require("../../core/utils/extend");
var _array = require("../../core/utils/array");
var _format_helper = require("../../format_helper");
var _format_helper2 = _interopRequireDefault(_format_helper);
var _parse_utils = require("../components/parse_utils");
var _parse_utils2 = _interopRequireDefault(_parse_utils);
var _tick_generator = require("./tick_generator");
var _tick_generator2 = _interopRequireDefault(_tick_generator);
var _translator2d = require("../translators/translator2d");
var _translator2d2 = _interopRequireDefault(_translator2d);
var _range = require("../translators/range");
var _tick = require("./tick");
var _math2 = require("../../core/utils/math");
var _date = require("../../core/utils/date");
var _common = require("../../core/utils/common");
var _xy_axes = require("./xy_axes");
var _xy_axes2 = _interopRequireDefault(_xy_axes);
var _polar_axes = require("./polar_axes");
var _polar_axes2 = _interopRequireDefault(_polar_axes);
var _constant_line = require("./constant_line");
var _constant_line2 = _interopRequireDefault(_constant_line);
var _strip = require("./strip");
var _strip2 = _interopRequireDefault(_strip);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        })
    } else {
        obj[key] = value
    }
    return obj
}
var convertTicksToValues = _axes_constants2.default.convertTicksToValues;
var patchFontOptions = _utils2.default.patchFontOptions;
var getVizRangeObject = _utils2.default.getVizRangeObject;
var _math = Math;
var _abs = _math.abs;
var _max = _math.max;
var _min = _math.min;
var _isArray = Array.isArray;
var DEFAULT_AXIS_LABEL_SPACING = 5;
var MAX_GRID_BORDER_ADHENSION = 4;
var TOP = _axes_constants2.default.top;
var BOTTOM = _axes_constants2.default.bottom;
var LEFT = _axes_constants2.default.left;
var RIGHT = _axes_constants2.default.right;
var CENTER = _axes_constants2.default.center;
var KEEP = "keep";
var SHIFT = "shift";
var RESET = "reset";
var DEFAULT_AXIS_DIVISION_FACTOR = 50;
var DEFAULT_MINOR_AXIS_DIVISION_FACTOR = 15;
var SCROLL_THRESHOLD = 5;
var dateIntervals = {
    day: 864e5,
    week: 6048e5
};

function getTickGenerator(options, incidentOccurred, skipTickGeneration, rangeIsEmpty, adjustDivisionFactor) {
    return _tick_generator2.default.tickGenerator({
        axisType: options.type,
        dataType: options.dataType,
        logBase: options.logarithmBase,
        axisDivisionFactor: adjustDivisionFactor(options.axisDivisionFactor || DEFAULT_AXIS_DIVISION_FACTOR),
        minorAxisDivisionFactor: adjustDivisionFactor(options.minorAxisDivisionFactor || DEFAULT_MINOR_AXIS_DIVISION_FACTOR),
        numberMultipliers: options.numberMultipliers,
        calculateMinors: options.minorTick.visible || options.minorGrid.visible || options.calculateMinors,
        allowDecimals: options.allowDecimals,
        endOnTick: options.endOnTick,
        incidentOccurred: incidentOccurred,
        firstDayOfWeek: options.workWeek && options.workWeek[0],
        skipTickGeneration: skipTickGeneration,
        skipCalculationLimits: options.skipCalculationLimits,
        generateExtraTick: options.generateExtraTick,
        minTickInterval: options.minTickInterval,
        rangeIsEmpty: rangeIsEmpty
    })
}

function createMajorTick(axis, renderer, skippedCategory) {
    var options = axis.getOptions();
    return (0, _tick.tick)(axis, renderer, options.tick, options.grid, skippedCategory, false)
}

function createMinorTick(axis, renderer) {
    var options = axis.getOptions();
    return (0, _tick.tick)(axis, renderer, options.minorTick, options.minorGrid)
}

function createBoundaryTick(axis, renderer, isFirst) {
    var options = axis.getOptions();
    return (0, _tick.tick)(axis, renderer, (0, _extend.extend)({}, options.tick, {
        visible: options.showCustomBoundaryTicks
    }), options.grid, void 0, false, isFirst ? -1 : 1)
}

function callAction(elements, action, actionArgument) {
    (elements || []).forEach(function(e) {
        return e[action](actionArgument)
    })
}

function initTickCoords(ticks) {
    callAction(ticks, "initCoords")
}

function drawTickMarks(ticks) {
    callAction(ticks, "drawMark")
}

function drawGrids(ticks, drawLine) {
    callAction(ticks, "drawGrid", drawLine)
}

function updateTicksPosition(ticks, animate) {
    callAction(ticks, "updateTickPosition", animate)
}

function updateGridsPosition(ticks, animate) {
    callAction(ticks, "updateGridPosition", animate)
}

function measureLabels(items) {
    items.forEach(function(item) {
        item.labelBBox = item.label ? item.label.getBBox() : {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
    })
}

function cleanUpInvalidTicks(ticks) {
    var i = ticks.length - 1;
    for (i; i >= 0; i--) {
        if (!removeInvalidTick(ticks, i)) {
            break
        }
    }
    for (i = 0; i < ticks.length; i++) {
        if (removeInvalidTick(ticks, i)) {
            i--
        } else {
            break
        }
    }
}

function removeInvalidTick(ticks, i) {
    if (null === ticks[i].coords.x || null === ticks[i].coords.y) {
        ticks.splice(i, 1);
        return true
    }
    return false
}

function validateAxisOptions(options) {
    var labelOptions = options.label,
        position = options.position,
        defaultPosition = options.isHorizontal ? BOTTOM : LEFT,
        secondaryPosition = options.isHorizontal ? TOP : RIGHT;
    if (position !== defaultPosition && position !== secondaryPosition) {
        position = defaultPosition
    }
    if (position === RIGHT && !labelOptions.userAlignment) {
        labelOptions.alignment = LEFT
    }
    options.position = position;
    options.hoverMode = options.hoverMode ? options.hoverMode.toLowerCase() : "none";
    labelOptions.minSpacing = (0, _type.isDefined)(labelOptions.minSpacing) ? labelOptions.minSpacing : DEFAULT_AXIS_LABEL_SPACING
}

function getOptimalAngle(boxes, labelOpt) {
    var angle = 180 * _math.asin((boxes[0].height + labelOpt.minSpacing) / (boxes[1].x - boxes[0].x)) / _math.PI;
    return angle < 45 ? -45 : -90
}

function updateLabels(ticks, step, func) {
    ticks.forEach(function(tick, index) {
        if (tick.label) {
            if (index % step !== 0) {
                tick.removeLabel()
            } else {
                if (func) {
                    func(tick, index)
                }
            }
        }
    })
}

function valueOf(value) {
    return value.valueOf()
}

function getZoomBoundValue(optionValue, dataValue) {
    if (void 0 === optionValue) {
        return dataValue
    } else {
        if (null === optionValue) {
            return
        } else {
            return optionValue
        }
    }
}

function correctMarginExtremum(value, margins, maxMinDistance, roundingMethod) {
    var dividerPower, distancePower, maxDivider;
    if (!(0, _type.isNumeric)(value) || 0 === value) {
        return value
    } else {
        if (!margins.size && !margins.checkInterval) {
            return (0, _math2.adjust)(value)
        }
    }
    dividerPower = _math.floor(_utils2.default.getAdjustedLog10(_abs(value)));
    distancePower = _math.floor(_utils2.default.getAdjustedLog10(_abs(maxMinDistance)));
    dividerPower = (dividerPower >= distancePower ? distancePower : dividerPower) - 2;
    if (0 === dividerPower) {
        dividerPower = -1
    }
    maxDivider = _utils2.default.raiseTo(dividerPower, 10);
    return (0, _math2.adjust)(roundingMethod((0, _math2.adjust)(value / maxDivider)) * maxDivider)
}

function configureGenerator(options, axisDivisionFactor, viewPort, screenDelta, minTickInterval) {
    var tickGeneratorOptions = (0, _extend.extend)({}, options, {
        endOnTick: true,
        axisDivisionFactor: axisDivisionFactor,
        skipCalculationLimits: true,
        generateExtraTick: true,
        minTickInterval: minTickInterval
    });
    return function(tickInterval, skipTickGeneration, min, max, breaks) {
        return getTickGenerator(tickGeneratorOptions, _common.noop, skipTickGeneration, viewPort.isEmpty(), function(v) {
            return v
        })({
            min: min,
            max: max,
            categories: viewPort.categories,
            isSpacedMargin: viewPort.isSpacedMargin,
            checkMinDataVisibility: viewPort.checkMinDataVisibility,
            checkMaxDataVisibility: viewPort.checkMaxDataVisibility
        }, screenDelta, tickInterval, (0, _type.isDefined)(tickInterval), void 0, void 0, void 0, breaks)
    }
}

function convertVisualRangeObject(visualRange, optionValue) {
    return _utils2.default.convertVisualRangeObject(visualRange, !_isArray(optionValue))
}
var Axis = exports.Axis = function(renderSettings) {
    var that = this;
    that._renderer = renderSettings.renderer;
    that._incidentOccurred = renderSettings.incidentOccurred;
    that._eventTrigger = renderSettings.eventTrigger;
    that._stripsGroup = renderSettings.stripsGroup;
    that._labelAxesGroup = renderSettings.labelAxesGroup;
    that._constantLinesGroup = renderSettings.constantLinesGroup;
    that._scaleBreaksGroup = renderSettings.scaleBreaksGroup;
    that._axesContainerGroup = renderSettings.axesContainerGroup;
    that._gridContainerGroup = renderSettings.gridGroup;
    that._axisCssPrefix = renderSettings.widgetClass + "-" + (renderSettings.axisClass ? renderSettings.axisClass + "-" : "");
    that._setType(renderSettings.axisType, renderSettings.drawingType);
    that._createAxisGroups();
    that._translator = that._createTranslator();
    that.isArgumentAxis = renderSettings.isArgumentAxis;
    that._viewport = {};
    that._firstDrawing = true;
    that._initRange = {}
};
Axis.prototype = {
    constructor: Axis,
    _drawAxis: function() {
        var options = this._options;
        if (!options.visible) {
            return
        }
        this._axisElement = this._createAxisElement();
        this._updateAxisElementPosition();
        this._axisElement.attr({
            "stroke-width": options.width,
            stroke: options.color,
            "stroke-opacity": options.opacity
        }).sharp(this._getSharpParam(true)).append(this._axisLineGroup)
    },
    _createPathElement: function(points, attr) {
        return this._renderer.path(points, "line").attr(attr).sharp(this._getSharpParam())
    },
    _getGridLineDrawer: function(borderOptions) {
        var that = this;
        return function(tick, gridStyle) {
            var grid = that._getGridPoints(tick.coords);
            if (grid.points) {
                return that._createPathElement(grid.points, gridStyle)
            }
            return null
        }
    },
    _getGridPoints: function(coords) {
        var that = this,
            isHorizontal = this._isHorizontal,
            tickPositionField = isHorizontal ? "x" : "y",
            orthogonalPositions = this._orthogonalPositions,
            positionFrom = orthogonalPositions.start,
            positionTo = orthogonalPositions.end;
        var borderOptions = that.borderOptions;
        var canvasStart = isHorizontal ? LEFT : TOP,
            canvasEnd = isHorizontal ? RIGHT : BOTTOM,
            axisCanvas = that.getCanvas(),
            canvas = {
                left: axisCanvas.left,
                right: axisCanvas.width - axisCanvas.right,
                top: axisCanvas.top,
                bottom: axisCanvas.height - axisCanvas.bottom
            },
            firstBorderLinePosition = borderOptions.visible && borderOptions[canvasStart] ? canvas[canvasStart] : void 0,
            lastBorderLinePosition = borderOptions.visible && borderOptions[canvasEnd] ? canvas[canvasEnd] : void 0,
            minDelta = MAX_GRID_BORDER_ADHENSION + firstBorderLinePosition,
            maxDelta = lastBorderLinePosition - MAX_GRID_BORDER_ADHENSION;
        if (that.areCoordsOutsideAxis(coords) || void 0 === coords[tickPositionField] || coords[tickPositionField] < minDelta || coords[tickPositionField] > maxDelta) {
            return {
                points: null
            }
        }
        return {
            points: isHorizontal ? null !== coords[tickPositionField] ? [coords[tickPositionField], positionFrom, coords[tickPositionField], positionTo] : null : null !== coords[tickPositionField] ? [positionFrom, coords[tickPositionField], positionTo, coords[tickPositionField]] : null
        }
    },
    _getConstantLinePos: function(parsedValue, canvasStart, canvasEnd) {
        var value = this._getTranslatedCoord(parsedValue);
        if (!(0, _type.isDefined)(value) || value < _min(canvasStart, canvasEnd) || value > _max(canvasStart, canvasEnd)) {
            return
        }
        return value
    },
    _getConstantLineGraphicAttributes: function(value) {
        var positionFrom = this._orthogonalPositions.start,
            positionTo = this._orthogonalPositions.end;
        return {
            points: this._isHorizontal ? [value, positionFrom, value, positionTo] : [positionFrom, value, positionTo, value]
        }
    },
    _createConstantLine: function(value, attr) {
        return this._createPathElement(this._getConstantLineGraphicAttributes(value).points, attr)
    },
    _drawConstantLineLabelText: function(text, x, y, constantLineLabelOptions, group) {
        var that = this,
            options = that._options,
            labelOptions = options.label;
        return that._renderer.text(text, x, y).css(patchFontOptions((0, _extend.extend)({}, labelOptions.font, constantLineLabelOptions.font))).attr({
            align: "center"
        }).append(group)
    },
    _drawConstantLineLabels: function(parsedValue, lineLabelOptions, value, group) {
        var coords, that = this,
            text = lineLabelOptions.text,
            options = that._options,
            labelOptions = options.label;
        that._checkAlignmentConstantLineLabels(lineLabelOptions);
        text = (0, _type.isDefined)(text) ? text : that.formatLabel(parsedValue, labelOptions);
        coords = that._getConstantLineLabelsCoords(value, lineLabelOptions);
        return that._drawConstantLineLabelText(text, coords.x, coords.y, lineLabelOptions, group)
    },
    _getStripPos: function(startValue, endValue, canvasStart, canvasEnd, range) {
        var start, end, swap, startCategoryIndex, endCategoryIndex, isContinuous = !!(range.minVisible || range.maxVisible),
            categories = (range.categories || []).reduce(function(result, cat) {
                result.push(cat.valueOf());
                return result
            }, []),
            min = range.minVisible;
        if (!isContinuous) {
            if ((0, _type.isDefined)(startValue) && (0, _type.isDefined)(endValue)) {
                startCategoryIndex = (0, _array.inArray)(startValue.valueOf(), categories);
                endCategoryIndex = (0, _array.inArray)(endValue.valueOf(), categories);
                if (startCategoryIndex === -1 || endCategoryIndex === -1) {
                    return {
                        from: 0,
                        to: 0
                    }
                }
                if (startCategoryIndex > endCategoryIndex) {
                    swap = endValue;
                    endValue = startValue;
                    startValue = swap
                }
            }
        }
        if ((0, _type.isDefined)(startValue)) {
            startValue = this._validateUnit(startValue, "E2105", "strip");
            start = this._getTranslatedCoord(startValue, -1);
            if (!(0, _type.isDefined)(start) && isContinuous) {
                start = startValue < min ? canvasStart : canvasEnd
            }
        } else {
            start = canvasStart
        }
        if ((0, _type.isDefined)(endValue)) {
            endValue = this._validateUnit(endValue, "E2105", "strip");
            end = this._getTranslatedCoord(endValue, 1);
            if (!(0, _type.isDefined)(end) && isContinuous) {
                end = endValue > min ? canvasEnd : canvasStart
            }
        } else {
            end = canvasEnd
        }
        return start < end ? {
            from: start,
            to: end
        } : {
            from: end,
            to: start
        }
    },
    _getStripGraphicAttributes: function(fromPoint, toPoint) {
        var x, y, width, height, orthogonalPositions = this._orthogonalPositions,
            positionFrom = orthogonalPositions.start,
            positionTo = orthogonalPositions.end;
        if (this._isHorizontal) {
            x = fromPoint;
            y = _min(positionFrom, positionTo);
            width = toPoint - fromPoint;
            height = _abs(positionFrom - positionTo)
        } else {
            x = _min(positionFrom, positionTo);
            y = fromPoint;
            width = _abs(positionFrom - positionTo);
            height = _abs(fromPoint - toPoint)
        }
        return {
            x: x,
            y: y,
            width: width,
            height: height
        }
    },
    _createStrip: function(attrs) {
        return this._renderer.rect(attrs.x, attrs.y, attrs.width, attrs.height)
    },
    _adjustStripLabels: function() {
        var that = this;
        this._strips.forEach(function(strip) {
            if (strip.label) {
                strip.label.attr(that._getAdjustedStripLabelCoords(strip))
            }
        })
    },
    _adjustLabels: function(offset) {
        var that = this,
            maxSize = that._majorTicks.reduce(function(size, tick) {
                var bBox = tick.labelRotationAngle ? _utils2.default.rotateBBox(tick.labelBBox, [tick.labelCoords.x, tick.labelCoords.y], -tick.labelRotationAngle) : tick.labelBBox;
                return {
                    width: _max(size.width || 0, bBox.width),
                    height: _max(size.height || 0, bBox.height),
                    offset: _max(size.offset || 0, tick.labelOffset || 0)
                }
            }, {}),
            additionalOffset = that._isHorizontal ? maxSize.height : maxSize.width;
        that._majorTicks.forEach(function(tick) {
            if (tick.label) {
                tick.label.attr(that._getLabelAdjustedCoord(tick, offset + (tick.labelOffset || 0), maxSize.width))
            }
        });
        return offset + additionalOffset + (additionalOffset && that._options.label.indentFromAxis) + maxSize.offset
    },
    _getLabelAdjustedCoord: function(tick, offset, maxWidth) {
        offset = offset || 0;
        var translateX, translateY, that = this,
            options = that._options,
            box = _utils2.default.rotateBBox(tick.labelBBox, [tick.labelCoords.x, tick.labelCoords.y], -tick.labelRotationAngle || 0),
            position = options.position,
            textAlign = tick.labelAlignment || options.label.alignment,
            indentFromAxis = options.label.indentFromAxis,
            axisPosition = that._axisPosition,
            labelCoords = tick.labelCoords,
            labelX = labelCoords.x;
        if (that._isHorizontal) {
            if (position === BOTTOM) {
                translateY = axisPosition + indentFromAxis - box.y + offset
            } else {
                translateY = axisPosition - indentFromAxis - (box.y + box.height) - offset
            }
            if (textAlign === RIGHT) {
                translateX = labelX - box.x - box.width
            } else {
                if (textAlign === LEFT) {
                    translateX = labelX - box.x
                } else {
                    translateX = labelX - box.x - box.width / 2
                }
            }
        } else {
            translateY = labelCoords.y - box.y - box.height / 2;
            if (position === LEFT) {
                if (textAlign === LEFT) {
                    translateX = axisPosition - indentFromAxis - maxWidth - box.x
                } else {
                    if (textAlign === CENTER) {
                        translateX = axisPosition - indentFromAxis - maxWidth / 2 - box.x - box.width / 2
                    } else {
                        translateX = axisPosition - indentFromAxis - box.x - box.width
                    }
                }
                translateX -= offset
            } else {
                if (textAlign === RIGHT) {
                    translateX = axisPosition + indentFromAxis + maxWidth - box.x - box.width
                } else {
                    if (textAlign === CENTER) {
                        translateX = axisPosition + indentFromAxis + maxWidth / 2 - box.x - box.width / 2
                    } else {
                        translateX = axisPosition + indentFromAxis - box.x
                    }
                }
                translateX += offset
            }
        }
        return {
            translateX: translateX,
            translateY: translateY
        }
    },
    _createAxisGroups: function() {
        var insideGroup, outsideGroup1, outsideGroup2, that = this,
            renderer = that._renderer,
            classSelector = that._axisCssPrefix,
            constantLinesClass = classSelector + "constant-lines";
        that._axisGroup = renderer.g().attr({
            "class": classSelector + "axis"
        });
        that._axisStripGroup = renderer.g().attr({
            "class": classSelector + "strips"
        });
        that._axisGridGroup = renderer.g().attr({
            "class": classSelector + "grid"
        });
        that._axisElementsGroup = renderer.g().attr({
            "class": classSelector + "elements"
        }).append(that._axisGroup);
        that._axisLineGroup = renderer.g().attr({
            "class": classSelector + "line"
        }).append(that._axisGroup);
        that._axisTitleGroup = renderer.g().attr({
            "class": classSelector + "title"
        }).append(that._axisGroup);
        insideGroup = renderer.g().attr({
            "class": constantLinesClass
        });
        outsideGroup1 = renderer.g().attr({
            "class": constantLinesClass
        });
        outsideGroup2 = renderer.g().attr({
            "class": constantLinesClass
        });
        that._axisConstantLineGroups = {
            inside: insideGroup,
            outside1: outsideGroup1,
            left: outsideGroup1,
            top: outsideGroup1,
            outside2: outsideGroup2,
            right: outsideGroup2,
            bottom: outsideGroup2
        };
        that._axisStripLabelGroup = renderer.g().attr({
            "class": classSelector + "axis-labels"
        })
    },
    _clearAxisGroups: function() {
        var that = this;
        that._axisGroup.remove();
        that._axisStripGroup.remove();
        that._axisStripLabelGroup.remove();
        that._axisConstantLineGroups.inside.remove();
        that._axisConstantLineGroups.outside1.remove();
        that._axisConstantLineGroups.outside2.remove();
        that._axisGridGroup.remove();
        that._axisTitleGroup.clear();
        that._axisElementsGroup.clear();
        that._axisLineGroup && that._axisLineGroup.clear();
        that._axisStripGroup && that._axisStripGroup.clear();
        that._axisGridGroup && that._axisGridGroup.clear();
        that._axisConstantLineGroups.inside.clear();
        that._axisConstantLineGroups.outside1.clear();
        that._axisConstantLineGroups.outside2.clear();
        that._axisStripLabelGroup && that._axisStripLabelGroup.clear()
    },
    _getLabelFormatObject: function(value, labelOptions, range, point, tickInterval, ticks) {
        range = range || this._getViewportRange();
        var formatObject = {
            value: value,
            valueText: (0, _smart_formatter.smartFormatter)(value, {
                labelOptions: labelOptions,
                ticks: ticks || convertTicksToValues(this._majorTicks),
                tickInterval: (0, _type.isDefined)(tickInterval) ? tickInterval : this._tickInterval,
                dataType: this._options.dataType,
                logarithmBase: this._options.logarithmBase,
                type: this._options.type,
                showTransition: !this._options.marker.visible,
                point: point
            }) || "",
            min: range.minVisible,
            max: range.maxVisible
        };
        if (point) {
            formatObject.point = point
        }
        return formatObject
    },
    formatLabel: function(value, labelOptions, range, point, tickInterval, ticks) {
        var formatObject = this._getLabelFormatObject(value, labelOptions, range, point, tickInterval, ticks);
        return (0, _type.isFunction)(labelOptions.customizeText) ? labelOptions.customizeText.call(formatObject, formatObject) : formatObject.valueText
    },
    formatHint: function(value, labelOptions, range) {
        var formatObject = this._getLabelFormatObject(value, labelOptions, range);
        return (0, _type.isFunction)(labelOptions.customizeHint) ? labelOptions.customizeHint.call(formatObject, formatObject) : void 0
    },
    formatRange: function(startValue, endValue, interval) {
        return (0, _smart_formatter.formatRange)(startValue, endValue, interval, this.getOptions())
    },
    _setTickOffset: function() {
        var options = this._options,
            discreteAxisDivisionMode = options.discreteAxisDivisionMode;
        this._tickOffset = +("crossLabels" !== discreteAxisDivisionMode || !discreteAxisDivisionMode)
    },
    getMargins: function() {
        var that = this,
            options = that._options,
            position = options.position,
            placeholderSize = options.placeholderSize,
            canvas = that.getCanvas(),
            cLeft = canvas.left,
            cTop = canvas.top,
            cRight = canvas.width - canvas.right,
            cBottom = canvas.height - canvas.bottom,
            edgeMarginCorrection = _max(options.grid.visible && options.grid.width || 0, options.tick.visible && options.tick.width || 0),
            boxes = [that._axisElementsGroup, that._axisConstantLineGroups.outside1, that._axisConstantLineGroups.outside2, that._axisLineGroup].map(function(group) {
                return group && group.getBBox()
            }).concat(function(group) {
                var box = group && group.getBBox();
                if (!box || box.isEmpty) {
                    return box
                }
                if (that._isHorizontal) {
                    box.x = cLeft;
                    box.width = cRight - cLeft
                } else {
                    box.y = cTop;
                    box.height = cBottom - cTop
                }
                return box
            }(that._axisTitleGroup)),
            margins = boxes.reduce(function(margins, bBox) {
                if (!bBox || bBox.isEmpty) {
                    return margins
                }
                return {
                    left: _max(margins.left, cLeft - bBox.x),
                    top: _max(margins.top, cTop - bBox.y),
                    right: _max(margins.right, bBox.x + bBox.width - cRight),
                    bottom: _max(margins.bottom, bBox.y + bBox.height - cBottom)
                }
            }, {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            });
        margins[position] += options.crosshairMargin;
        if (placeholderSize) {
            margins[position] = placeholderSize
        }
        if (edgeMarginCorrection) {
            if (that._isHorizontal && canvas.right < edgeMarginCorrection && margins.right < edgeMarginCorrection) {
                margins.right = edgeMarginCorrection
            }
            if (!that._isHorizontal && canvas.bottom < edgeMarginCorrection && margins.bottom < edgeMarginCorrection) {
                margins.bottom = edgeMarginCorrection
            }
        }
        return margins
    },
    _validateUnit: function(unit, idError, parameters) {
        var that = this;
        unit = that.parser(unit);
        if (void 0 === unit && idError) {
            that._incidentOccurred(idError, [parameters])
        }
        return unit
    },
    _setType: function(axisType, drawingType) {
        var axisTypeMethods, that = this;
        switch (axisType) {
            case "xyAxes":
                axisTypeMethods = _xy_axes2.default;
                break;
            case "polarAxes":
                axisTypeMethods = _polar_axes2.default
        }(0, _extend.extend)(that, axisTypeMethods[drawingType])
    },
    _getSharpParam: function() {
        return true
    },
    _disposeBreaksGroup: _common.noop,
    dispose: function() {
        var that = this;
        [that._axisElementsGroup, that._axisStripGroup, that._axisGroup].forEach(function(g) {
            g.dispose()
        });
        that._strips = that._title = null;
        that._axisStripGroup = that._axisConstantLineGroups = that._axisStripLabelGroup = that._axisBreaksGroup = null;
        that._axisLineGroup = that._axisElementsGroup = that._axisGridGroup = null;
        that._axisGroup = that._axisTitleGroup = null;
        that._axesContainerGroup = that._stripsGroup = that._constantLinesGroup = null;
        that._renderer = that._options = that._textOptions = that._textFontStyles = null;
        that._translator = null;
        that._majorTicks = that._minorTicks = null;
        that._disposeBreaksGroup()
    },
    getOptions: function() {
        return this._options
    },
    setPane: function(pane) {
        this.pane = pane;
        this._options.pane = pane
    },
    setTypes: function(type, axisType, typeSelector) {
        this._options.type = type || this._options.type;
        this._options[typeSelector] = axisType || this._options[typeSelector];
        this._updateTranslator()
    },
    resetTypes: function(typeSelector) {
        this._options.type = this._initTypes.type;
        this._options[typeSelector] = this._initTypes[typeSelector]
    },
    getTranslator: function() {
        return this._translator
    },
    updateOptions: function(options) {
        var that = this,
            labelOpt = options.label;
        that._options = options;
        options.tick = options.tick || {};
        options.minorTick = options.minorTick || {};
        options.grid = options.grid || {};
        options.minorGrid = options.minorGrid || {};
        options.title = options.title || {};
        options.marker = options.marker || {};
        that._initTypes = {
            type: options.type,
            argumentType: options.argumentType,
            valueType: options.valueType
        };
        validateAxisOptions(options);
        that._setTickOffset();
        that._isHorizontal = options.isHorizontal;
        that.pane = options.pane;
        that.name = options.name;
        that.priority = options.priority;
        that._hasLabelFormat = "" !== labelOpt.format && (0, _type.isDefined)(labelOpt.format);
        that._textOptions = {
            opacity: labelOpt.opacity,
            align: "center"
        };
        that._textFontStyles = _utils2.default.patchFontOptions(labelOpt.font);
        if (options.type === _axes_constants2.default.logarithmic) {
            if (options.logarithmBaseError) {
                that._incidentOccurred("E2104");
                delete options.logarithmBaseError
            }
        }
        that._updateTranslator();
        that._createConstantLines();
        that._strips = (options.strips || []).map(function(o) {
            return (0, _strip2.default)(that, o)
        });
        that._majorTicks = that._minorTicks = null;
        that._firstDrawing = true
    },
    calculateInterval: function(value, prevValue) {
        var options = this._options;
        return !options || options.type !== _axes_constants2.default.logarithmic ? _abs(value - prevValue) : _utils2.default.getLog(value / prevValue, options.logarithmBase)
    },
    _processCanvas: function(canvas) {
        return canvas
    },
    updateCanvas: function(canvas) {
        var positions = this._orthogonalPositions = {
            start: !this._isHorizontal ? canvas.left : canvas.top,
            end: !this._isHorizontal ? canvas.width - canvas.right : canvas.height - canvas.bottom
        };
        this._canvas = canvas;
        positions.center = positions.start + (positions.end - positions.start) / 2;
        this._translator.updateCanvas(this._processCanvas(canvas));
        this._initAxisPositions()
    },
    getCanvas: function() {
        return this._canvas
    },
    hideTitle: function() {
        var that = this;
        if (that._options.title.text) {
            that._incidentOccurred("W2105", [that._isHorizontal ? "horizontal" : "vertical"]);
            that._axisTitleGroup.clear()
        }
    },
    hideOuterElements: function() {
        var that = this,
            options = that._options;
        if ((options.label.visible || that._outsideConstantLines.length) && !that._translator.getBusinessRange().isEmpty()) {
            that._incidentOccurred("W2106", [that._isHorizontal ? "horizontal" : "vertical"]);
            that._axisElementsGroup.clear();
            callAction(that._outsideConstantLines, "removeLabel")
        }
    },
    adjustViewport: function(businessRange) {
        var that = this;
        var options = that._options;
        var isDiscrete = options.type === _axes_constants2.default.discrete;
        var categories = that._seriesData && that._seriesData.categories || [];
        var wholeRange = that.adjustRange(getVizRangeObject(options.wholeRange));
        var visualRange = that.getViewport() || {};
        var result = new _range.Range(businessRange);
        that._addConstantLinesToRange(result, "minVisible", "maxVisible");
        var minDefined = (0, _type.isDefined)(visualRange.startValue);
        var maxDefined = (0, _type.isDefined)(visualRange.endValue);
        if (!isDiscrete) {
            minDefined = minDefined && (!(0, _type.isDefined)(wholeRange.endValue) || visualRange.startValue < wholeRange.endValue);
            maxDefined = maxDefined && (!(0, _type.isDefined)(wholeRange.startValue) || visualRange.endValue > wholeRange.startValue)
        }
        var minVisible = minDefined ? visualRange.startValue : result.minVisible;
        var maxVisible = maxDefined ? visualRange.endValue : result.maxVisible;
        if (!isDiscrete) {
            result.min = (0, _type.isDefined)(wholeRange.startValue) ? wholeRange.startValue : result.min;
            result.max = (0, _type.isDefined)(wholeRange.endValue) ? wholeRange.endValue : result.max
        } else {
            var categoriesInfo = _utils2.default.getCategoriesInfo(categories, wholeRange.startValue, wholeRange.endValue);
            categories = categoriesInfo.categories;
            result.categories = categories
        }
        var adjustedVisualRange = _utils2.default.adjustVisualRange({
            axisType: options.type,
            dataType: options.dataType,
            base: options.logarithmBase
        }, {
            startValue: minDefined ? visualRange.startValue : void 0,
            endValue: maxDefined ? visualRange.endValue : void 0,
            length: visualRange.length
        }, {
            categories: categories,
            min: wholeRange.startValue,
            max: wholeRange.endValue
        }, {
            categories: categories,
            min: minVisible,
            max: maxVisible
        });
        result.minVisible = adjustedVisualRange.startValue;
        result.maxVisible = adjustedVisualRange.endValue;
        !(0, _type.isDefined)(result.min) && (result.min = result.minVisible);
        !(0, _type.isDefined)(result.max) && (result.max = result.maxVisible);
        return result
    },
    adjustRange: function(range) {
        range = range || {};
        var isDiscrete = this._options.type === _axes_constants2.default.discrete;
        var isLogarithmic = this._options.type === _axes_constants2.default.logarithmic;
        if (isLogarithmic) {
            range.startValue = range.startValue <= 0 ? null : range.startValue;
            range.endValue = range.endValue <= 0 ? null : range.endValue
        }
        if (!isDiscrete && (0, _type.isDefined)(range.startValue) && (0, _type.isDefined)(range.endValue) && range.startValue > range.endValue) {
            var tmp = range.endValue;
            range.endValue = range.startValue;
            range.startValue = tmp
        }
        return range
    },
    _getVisualRangeUpdateMode: function(viewport, newRange, oppositeValue) {
        var value = this._options.visualRangeUpdateMode;
        var translator = this._translator;
        var range = translator.getBusinessRange();
        if (this.isArgumentAxis) {
            if ([SHIFT, KEEP, RESET].indexOf(value) === -1) {
                if (range.axisType === _axes_constants2.default.discrete) {
                    var categories = range.categories;
                    var newCategories = newRange.categories;
                    var visualRange = this.visualRange();
                    if (categories && newCategories && categories.length && newCategories.map(function(c) {
                            return c.valueOf()
                        }).join(",").indexOf(categories.map(function(c) {
                            return c.valueOf()
                        }).join(",")) !== -1 && (visualRange.startValue.valueOf() !== categories[0].valueOf() || visualRange.endValue.valueOf() !== categories[categories.length - 1].valueOf())) {
                        value = KEEP
                    } else {
                        value = RESET
                    }
                } else {
                    var minPoint = translator.translate(range.min);
                    var minVisiblePoint = translator.translate(viewport.startValue);
                    var maxPoint = translator.translate(range.max);
                    var maxVisiblePoint = translator.translate(viewport.endValue);
                    if (minPoint === minVisiblePoint && maxPoint === maxVisiblePoint) {
                        value = RESET
                    } else {
                        if (minPoint !== minVisiblePoint && maxPoint === maxVisiblePoint) {
                            value = SHIFT
                        } else {
                            value = KEEP
                        }
                    }
                }
            }
        } else {
            if ([KEEP, RESET].indexOf(value) === -1) {
                if (oppositeValue === KEEP) {
                    value = KEEP
                } else {
                    value = RESET
                }
            }
        }
        return value
    },
    _handleBusinessRangeChanged: function(oppositeVisualRangeUpdateMode, axisReinitialized) {
        var that = this;
        var visualRange = this.visualRange();
        if (axisReinitialized || that._translator.getBusinessRange().isEmpty()) {
            return
        }
        var visualRangeUpdateMode = that._lastVisualRangeUpdateMode = that._getVisualRangeUpdateMode(visualRange, that._seriesData, oppositeVisualRangeUpdateMode);
        if (!that.isArgumentAxis) {
            var viewport = that.getViewport();
            if (!(0, _type.isDefined)(viewport.startValue) && !(0, _type.isDefined)(viewport.endValue) && !(0, _type.isDefined)(viewport.length)) {
                visualRangeUpdateMode = RESET
            }
        }
        that._prevDataWasEmpty && (visualRangeUpdateMode = KEEP);
        if (visualRangeUpdateMode === KEEP) {
            that._setVisualRange([visualRange.startValue, visualRange.endValue])
        }
        if (visualRangeUpdateMode === RESET) {
            that._setVisualRange([null, null])
        }
        if (visualRangeUpdateMode === SHIFT) {
            that._setVisualRange({
                length: that.getVisualRangeLength()
            })
        }
    },
    getVisualRangeLength: function(range) {
        var currentBusinessRange = range || this._translator.getBusinessRange();
        var _options = this._options,
            type = _options.type,
            logarithmBase = _options.logarithmBase;
        var length = void 0;
        if (type === _axes_constants2.default.logarithmic) {
            length = (0, _math2.adjust)(_utils2.default.getLog(currentBusinessRange.maxVisible / currentBusinessRange.minVisible, logarithmBase))
        } else {
            if (type === _axes_constants2.default.discrete) {
                var categoriesInfo = _utils2.default.getCategoriesInfo(currentBusinessRange.categories, currentBusinessRange.minVisible, currentBusinessRange.maxVisible);
                length = categoriesInfo.categories.length
            } else {
                length = currentBusinessRange.maxVisible - currentBusinessRange.minVisible
            }
        }
        return length
    },
    getVisualRangeCenter: function(range) {
        var businessRange = this._translator.getBusinessRange();
        var currentBusinessRange = range || businessRange;
        var _options2 = this._options,
            type = _options2.type,
            logarithmBase = _options2.logarithmBase;
        var center = void 0;
        if (!(0, _type.isDefined)(currentBusinessRange.minVisible) || !(0, _type.isDefined)(currentBusinessRange.maxVisible)) {
            return
        }
        if (type === _axes_constants2.default.logarithmic) {
            center = _utils2.default.raiseTo((0, _math2.adjust)(_utils2.default.getLog(currentBusinessRange.maxVisible * currentBusinessRange.minVisible, logarithmBase)) / 2, logarithmBase)
        } else {
            if (type === _axes_constants2.default.discrete) {
                var categoriesInfo = _utils2.default.getCategoriesInfo(currentBusinessRange.categories, currentBusinessRange.minVisible, currentBusinessRange.maxVisible);
                var index = Math.ceil(categoriesInfo.categories.length / 2) - 1;
                center = businessRange.categories.indexOf(categoriesInfo.categories[index])
            } else {
                center = (currentBusinessRange.maxVisible.valueOf() + currentBusinessRange.minVisible.valueOf()) / 2
            }
        }
        return center
    },
    setBusinessRange: function(range, axisReinitialized, oppositeVisualRangeUpdateMode) {
        var that = this;
        var options = that._options;
        var isDiscrete = options.type === _axes_constants2.default.discrete;
        that._seriesData = new _range.Range(range);
        var dataIsEmpty = that._seriesData.isEmpty();
        that._handleBusinessRangeChanged(oppositeVisualRangeUpdateMode, axisReinitialized);
        that._prevDataWasEmpty = dataIsEmpty;
        that._seriesData.addRange({
            categories: options.categories,
            dataType: options.dataType,
            axisType: options.type,
            base: options.logarithmBase,
            invert: options.inverted
        });
        if (!isDiscrete) {
            if (!(0, _type.isDefined)(that._seriesData.min) && !(0, _type.isDefined)(that._seriesData.max)) {
                var visualRange = that.getViewport();
                visualRange && that._seriesData.addRange({
                    min: visualRange.startValue,
                    max: visualRange.endValue
                })
            }
            var synchronizedValue = options.synchronizedValue;
            if ((0, _type.isDefined)(synchronizedValue)) {
                that._seriesData.addRange({
                    min: synchronizedValue,
                    max: synchronizedValue
                })
            }
        }
        that._seriesData.minVisible = void 0 === that._seriesData.minVisible ? that._seriesData.min : that._seriesData.minVisible;
        that._seriesData.maxVisible = void 0 === that._seriesData.maxVisible ? that._seriesData.max : that._seriesData.maxVisible;
        if (!that.isArgumentAxis && options.showZero) {
            that._seriesData.correctValueZeroLevel()
        }
        that._seriesData.sortCategories(that.getCategoriesSorter());
        that._breaks = that._getScaleBreaks(options, that._seriesData, that._series, that.isArgumentAxis);
        that._translator.updateBusinessRange(that.adjustViewport(that._seriesData))
    },
    _addConstantLinesToRange: function(dataRange, minValueField, maxValueField) {
        this._outsideConstantLines.concat(this._insideConstantLines || []).forEach(function(cl) {
            if (cl.options.extendAxis) {
                var _dataRange$addRange;
                var value = cl.getParsedValue();
                dataRange.addRange((_dataRange$addRange = {}, _defineProperty(_dataRange$addRange, minValueField, value), _defineProperty(_dataRange$addRange, maxValueField, value), _dataRange$addRange))
            }
        })
    },
    setGroupSeries: function(series) {
        this._series = series
    },
    getLabelsPosition: function() {
        var that = this,
            options = that._options,
            position = options.position,
            labelShift = options.label.indentFromAxis + (that._axisShift || 0) + that._constantLabelOffset,
            axisPosition = that._axisPosition;
        return position === TOP || position === LEFT ? axisPosition - labelShift : axisPosition + labelShift
    },
    getFormattedValue: function(value, options, point) {
        var labelOptions = this._options.label;
        return (0, _type.isDefined)(value) ? this.formatLabel(value, (0, _extend.extend)(true, {}, labelOptions, options), void 0, point) : null
    },
    _getBoundaryTicks: function(majors, viewPort) {
        var that = this,
            length = majors.length,
            options = that._options,
            customBounds = options.customBoundTicks,
            min = viewPort.minVisible,
            max = viewPort.maxVisible,
            addMinMax = options.showCustomBoundaryTicks ? that._boundaryTicksVisibility : {},
            boundaryTicks = [];
        if (options.type === _axes_constants2.default.discrete) {
            if (that._tickOffset && 0 !== majors.length) {
                boundaryTicks = [majors[0], majors[majors.length - 1]]
            }
        } else {
            if (customBounds) {
                if (addMinMax.min && (0, _type.isDefined)(customBounds[0])) {
                    boundaryTicks.push(customBounds[0])
                }
                if (addMinMax.max && (0, _type.isDefined)(customBounds[1])) {
                    boundaryTicks.push(customBounds[1])
                }
            } else {
                if (addMinMax.min && (0 === length || majors[0] > min)) {
                    boundaryTicks.push(min)
                }
                if (addMinMax.max && (0 === length || majors[length - 1] < max)) {
                    boundaryTicks.push(max)
                }
            }
        }
        return boundaryTicks
    },
    setPercentLabelFormat: function() {
        if (!this._hasLabelFormat) {
            this._options.label.format = "percent"
        }
    },
    resetAutoLabelFormat: function() {
        if (!this._hasLabelFormat) {
            delete this._options.label.format
        }
    },
    getMultipleAxesSpacing: function() {
        return this._options.multipleAxesSpacing || 0
    },
    getTicksValues: function() {
        return {
            majorTicksValues: convertTicksToValues(this._majorTicks),
            minorTicksValues: convertTicksToValues(this._minorTicks)
        }
    },
    setTicks: function(ticks) {
        var majors = ticks.majorTicks || [];
        this._majorTicks = majors.map(createMajorTick(this, this._renderer, this._getSkippedCategory(majors)));
        this._minorTicks = (ticks.minorTicks || []).map(createMinorTick(this, this._renderer));
        this._isSynchronized = true
    },
    _adjustDivisionFactor: function(val) {
        return val
    },
    _getTicks: function(viewPort, incidentOccurred, skipTickGeneration) {
        var that = this,
            options = that._options,
            customTicks = options.customTicks,
            customMinorTicks = options.customMinorTicks;
        return getTickGenerator(options, incidentOccurred || that._incidentOccurred, skipTickGeneration, that._translator.getBusinessRange().isEmpty(), that._adjustDivisionFactor.bind(that))({
            min: viewPort.minVisible,
            max: viewPort.maxVisible,
            categories: viewPort.categories,
            isSpacedMargin: viewPort.isSpacedMargin,
            checkMinDataVisibility: viewPort.checkMinDataVisibility,
            checkMaxDataVisibility: viewPort.checkMaxDataVisibility
        }, that._getScreenDelta(), options.tickInterval, "ignore" === options.label.overlappingBehavior || options.forceUserTickInterval, {
            majors: customTicks,
            minors: customMinorTicks
        }, options.minorTickInterval, options.minorTickCount, that._breaks)
    },
    _createTicksAndLabelFormat: function(range, incidentOccurred) {
        var ticks, options = this._options;
        ticks = this._getTicks(range, incidentOccurred, false);
        if (!range.isEmpty() && options.type === _axes_constants2.default.discrete && "datetime" === options.dataType && !this._hasLabelFormat && ticks.ticks.length) {
            options.label.format = _format_helper2.default.getDateFormatByTicks(ticks.ticks)
        }
        return ticks
    },
    getAggregationInfo: function(useAllAggregatedPoints, range) {
        var that = this,
            options = that._options,
            marginOptions = that._marginOptions,
            businessRange = new _range.Range(that.getTranslator().getBusinessRange()).addRange(range),
            visualRange = that.getViewport(),
            minVisible = visualRange && (0, _type.isDefined)(visualRange.startValue) ? visualRange.startValue : businessRange.minVisible,
            maxVisible = visualRange && (0, _type.isDefined)(visualRange.endValue) ? visualRange.endValue : businessRange.maxVisible,
            ticks = [];
        var aggregationInterval = options.aggregationInterval;
        var aggregationGroupWidth = options.aggregationGroupWidth;
        if (!aggregationGroupWidth && marginOptions) {
            if (marginOptions.checkInterval) {
                aggregationGroupWidth = options.axisDivisionFactor
            }
            if (marginOptions.sizePointNormalState) {
                aggregationGroupWidth = Math.min(marginOptions.sizePointNormalState, options.axisDivisionFactor)
            }
        }
        var minInterval = !options.aggregationGroupWidth && !aggregationInterval && range.interval;
        var generateTicks = configureGenerator(options, aggregationGroupWidth, businessRange, that._getScreenDelta(), minInterval);
        var tickInterval = generateTicks(aggregationInterval, true, minVisible, maxVisible, that._breaks).tickInterval;
        if (options.type !== _axes_constants2.default.discrete) {
            var min = useAllAggregatedPoints ? businessRange.min : minVisible;
            var max = useAllAggregatedPoints ? businessRange.max : maxVisible;
            if ((0, _type.isDefined)(min) && (0, _type.isDefined)(max)) {
                var add = _utils2.default.getAddFunction({
                    base: options.logarithmBase,
                    axisType: options.type,
                    dataType: options.dataType
                }, false);
                var start = min;
                var end = max;
                if (!useAllAggregatedPoints) {
                    var maxMinDistance = Math.max(that.calculateInterval(max, min), "datetime" === options.dataType ? (0, _date.dateToMilliseconds)(tickInterval) : tickInterval);
                    start = add(min, maxMinDistance, -1);
                    end = add(max, maxMinDistance)
                }
                start = start < businessRange.min ? businessRange.min : start;
                end = end > businessRange.max ? businessRange.max : end;
                var breaks = that._getScaleBreaks(options, {
                    minVisible: start,
                    maxVisible: end
                }, that._series, that.isArgumentAxis);
                ticks = generateTicks(tickInterval, false, start, end, breaks).ticks
            }
        }
        that._aggregationInterval = tickInterval;
        return {
            interval: tickInterval,
            ticks: ticks
        }
    },
    createTicks: function(canvas) {
        var ticks, boundaryTicks, range, that = this,
            renderer = that._renderer,
            options = that._options;
        if (!canvas) {
            return
        }
        that._isSynchronized = false;
        that.updateCanvas(canvas);
        that._estimatedTickInterval = that._getTicks(that.adjustViewport(this._seriesData), _common.noop, true).tickInterval;
        range = that._getViewportRange();
        ticks = that._createTicksAndLabelFormat(range);
        boundaryTicks = that._getBoundaryTicks(ticks.ticks, range);
        if (options.showCustomBoundaryTicks && boundaryTicks.length) {
            that._boundaryTicks = [boundaryTicks[0]].map(createBoundaryTick(that, renderer, true));
            if (boundaryTicks.length > 1) {
                that._boundaryTicks = that._boundaryTicks.concat([boundaryTicks[1]].map(createBoundaryTick(that, renderer, false)))
            }
        } else {
            that._boundaryTicks = []
        }
        var minors = (ticks.minorTicks || []).filter(function(minor) {
            return !boundaryTicks.some(function(boundary) {
                return valueOf(boundary) === valueOf(minor)
            })
        });
        that._tickInterval = ticks.tickInterval;
        that._minorTickInterval = ticks.minorTickInterval;
        var oldMajorTicks = that._majorTicks || [];
        var majorTicksByValues = oldMajorTicks.reduce(function(r, t) {
            r[t.value.valueOf()] = t;
            return r
        }, {});
        var sameType = (0, _type.type)(ticks.ticks[0]) === (0, _type.type)(oldMajorTicks[0] && oldMajorTicks[0].value);
        var skippedCategory = that._getSkippedCategory(ticks.ticks);
        var majorTicks = ticks.ticks.map(function(v) {
            var tick = majorTicksByValues[v.valueOf()];
            if (tick && sameType) {
                delete majorTicksByValues[v.valueOf()];
                tick.setSkippedCategory(skippedCategory);
                return tick
            } else {
                return createMajorTick(that, renderer, skippedCategory)(v)
            }
        });
        that._majorTicks = majorTicks;
        var oldMinorTicks = that._minorTicks || [];
        that._minorTicks = minors.map(function(v, i) {
            var minorTick = oldMinorTicks[i];
            if (minorTick) {
                minorTick.updateValue(v);
                return minorTick
            }
            return createMinorTick(that, renderer)(v)
        });
        that._ticksToRemove = Object.keys(majorTicksByValues).map(function(k) {
            return majorTicksByValues[k]
        }).concat(oldMinorTicks.slice(that._minorTicks.length, oldMinorTicks.length));
        that._correctedBreaks = ticks.breaks;
        that._reinitTranslator(range)
    },
    _reinitTranslator: function(range) {
        var that = this,
            min = range.min,
            max = range.max,
            minVisible = range.minVisible,
            maxVisible = range.maxVisible,
            interval = range.interval,
            ticks = that._majorTicks,
            length = ticks.length,
            translator = that._translator;
        if (that._isSynchronized) {
            return
        }
        if (that._options.type !== _axes_constants2.default.discrete) {
            if (length && !that._options.skipViewportExtending) {
                if (that.allowToExtendVisualRange(false) && ticks[0].value < range.minVisible) {
                    minVisible = ticks[0].value
                }
                if (that.allowToExtendVisualRange(true) && length > 1 && ticks[length - 1].value > range.maxVisible) {
                    maxVisible = ticks[length - 1].value
                }
            }
            interval = that._calculateRangeInterval(interval);
            range.addRange({
                minVisible: minVisible,
                maxVisible: maxVisible,
                interval: interval
            });
            if ((0, _type.isDefined)(min) && (0, _type.isDefined)(max) && min.valueOf() === max.valueOf()) {
                range.min = range.max = min
            }
        }
        range.breaks = that._correctedBreaks;
        translator.updateBusinessRange(that.adjustViewport(range))
    },
    _getViewportRange: function() {
        return this.adjustViewport(this._applyMargins(this._seriesData))
    },
    setMarginOptions: function(options) {
        this._marginOptions = options
    },
    allowToExtendVisualRange: function(isEnd) {
        var wholeRange = this.adjustRange(getVizRangeObject(this._options.wholeRange));
        var bound = isEnd ? wholeRange.endValue : wholeRange.startValue;
        return !this.isArgumentAxis || !(0, _type.isDefined)(bound) && this.isExtremePosition(isEnd)
    },
    _calculateRangeInterval: function(interval) {
        var isDateTime = "datetime" === this._options.dataType,
            minArgs = [],
            addToArgs = function(value) {
                (0, _type.isDefined)(value) && minArgs.push(isDateTime ? (0, _date.dateToMilliseconds)(value) : value)
            };
        addToArgs(this._tickInterval);
        addToArgs(this._estimatedTickInterval);
        (0, _type.isDefined)(interval) && minArgs.push(interval);
        addToArgs(this._aggregationInterval);
        return this._calculateWorkWeekInterval(_min.apply(this, minArgs))
    },
    _calculateWorkWeekInterval: function(businessInterval) {
        var options = this._options;
        if ("datetime" === options.dataType && options.workdaysOnly && businessInterval) {
            var workWeek = options.workWeek.length * dateIntervals.day;
            var weekend = dateIntervals.week - workWeek;
            if (workWeek !== businessInterval && weekend < businessInterval) {
                var weekendsCount = Math.ceil(businessInterval / dateIntervals.week);
                businessInterval = weekend >= businessInterval ? dateIntervals.day : businessInterval - weekend * weekendsCount
            } else {
                if (weekend >= businessInterval && businessInterval > dateIntervals.day) {
                    businessInterval = dateIntervals.day
                }
            }
        }
        return businessInterval
    },
    _applyMargins: function(dataRange) {
        var marginSizeMultiplier, that = this,
            range = new _range.Range(dataRange),
            options = that._options,
            margins = (0, _type.isDefined)(that._marginOptions) ? that._marginOptions : {},
            marginSize = margins.size,
            marginValue = 0,
            type = options.type,
            valueMarginsEnabled = options.valueMarginsEnabled && type !== _axes_constants2.default.discrete && "semidiscrete" !== type,
            minValueMargin = options.minValueMargin,
            maxValueMargin = options.maxValueMargin,
            add = _utils2.default.getAddFunction(range, !that.isArgumentAxis),
            minVisible = range.minVisible,
            maxVisible = range.maxVisible,
            interval = range.interval,
            maxMinDistance = that.calculateInterval(maxVisible, minVisible) - (that._breaks || []).reduce(function(sum, b) {
                return sum += that.calculateInterval(b.to, b.from)
            }, 0),
            isArgumentAxis = this.isArgumentAxis,
            isBarValueAxis = !isArgumentAxis && margins.checkInterval;

        function addMargin(value, margin, marginOption) {
            if (!(0, _type.isDefined)(marginOption) && !(margins.percentStick && 1 === _abs(value) && !isArgumentAxis)) {
                value = add(value, margin)
            }
            return value
        }
        if (valueMarginsEnabled && !range.isEmpty()) {
            if ((0, _type.isDefined)(minValueMargin)) {
                minVisible = add(minVisible, -maxMinDistance * minValueMargin)
            }
            if ((0, _type.isDefined)(maxValueMargin)) {
                maxVisible = add(maxVisible, maxMinDistance * maxValueMargin)
            }
            if (!(0, _type.isDefined)(minValueMargin) || !(0, _type.isDefined)(maxValueMargin)) {
                if (isArgumentAxis && margins.checkInterval) {
                    if (0 !== maxMinDistance) {
                        interval = that._calculateRangeInterval(range.interval);
                        marginValue = interval / 2
                    }
                }
                if (marginSize) {
                    marginSizeMultiplier = 1 / (that._getScreenDelta() / marginSize - 1) / 2;
                    marginValue = _max(marginValue, maxMinDistance * (marginSizeMultiplier > 1 ? marginSizeMultiplier / 10 : marginSizeMultiplier))
                }
                if (0 !== maxMinDistance) {
                    minVisible = addMargin(minVisible, -marginValue, minValueMargin);
                    maxVisible = addMargin(maxVisible, marginValue, maxValueMargin);
                    maxMinDistance = maxVisible - minVisible;
                    minVisible = correctMarginExtremum(minVisible, margins, maxMinDistance, _math.floor);
                    maxVisible = correctMarginExtremum(maxVisible, margins, maxMinDistance, _math.ceil)
                }
            }
            range.addRange({
                minVisible: minVisible,
                maxVisible: maxVisible,
                interval: interval,
                isSpacedMargin: 0 !== marginValue,
                checkMinDataVisibility: isBarValueAxis && !(0, _type.isDefined)(options.min) && minVisible.valueOf() > 0,
                checkMaxDataVisibility: isBarValueAxis && !(0, _type.isDefined)(options.max) && maxVisible.valueOf() < 0
            })
        }
        return range
    },
    _createConstantLines: function() {
        var _this = this;
        var constantLines = (this._options.constantLines || []).map(function(o) {
            return (0, _constant_line2.default)(_this, o)
        });
        this._outsideConstantLines = constantLines.filter(function(l) {
            return "outside" === l.labelPosition
        });
        this._insideConstantLines = constantLines.filter(function(l) {
            return "inside" === l.labelPosition
        })
    },
    draw: function(canvas, borderOptions) {
        var that = this;
        that.borderOptions = borderOptions || {
            visible: false
        };
        that.createTicks(canvas);
        that._clearAxisGroups();
        initTickCoords(that._majorTicks);
        initTickCoords(that._minorTicks);
        initTickCoords(that._boundaryTicks);
        that._drawAxis();
        that._drawTitle();
        drawTickMarks(that._majorTicks);
        drawTickMarks(that._minorTicks);
        drawTickMarks(that._boundaryTicks);
        var drawGridLine = that._getGridLineDrawer();
        drawGrids(that._majorTicks, drawGridLine);
        drawGrids(that._minorTicks, drawGridLine);
        callAction(that._majorTicks, "drawLabel", that._getViewportRange());
        that._majorTicks.forEach(function(tick) {
            tick.labelRotationAngle = 0;
            tick.labelAlignment = void 0;
            tick.labelOffset = 0
        });
        callAction(that._outsideConstantLines.concat(that._insideConstantLines), "draw");
        callAction(that._strips, "draw");
        that._dateMarkers = that._drawDateMarkers() || [];
        that._axisGroup.append(that._axesContainerGroup);
        that._labelAxesGroup && that._axisStripLabelGroup.append(that._labelAxesGroup);
        that._gridContainerGroup && that._axisGridGroup.append(that._gridContainerGroup);
        that._stripsGroup && that._axisStripGroup.append(that._stripsGroup);
        if (that._constantLinesGroup) {
            that._axisConstantLineGroups.inside.append(that._constantLinesGroup);
            that._axisConstantLineGroups.outside1.append(that._constantLinesGroup);
            that._axisConstantLineGroups.outside2.append(that._constantLinesGroup)
        }
        that._measureTitle();
        measureLabels(that._majorTicks);
        measureLabels(that._outsideConstantLines);
        measureLabels(that._insideConstantLines);
        measureLabels(that._strips);
        measureLabels(that._dateMarkers);
        that._adjustConstantLineLabels(that._insideConstantLines);
        that._adjustStripLabels();
        var offset = that._constantLabelOffset = that._adjustConstantLineLabels(that._outsideConstantLines);
        if (!that._translator.getBusinessRange().isEmpty()) {
            that._setLabelsPlacement();
            offset = that._adjustLabels(offset)
        }
        offset = that._adjustDateMarkers(offset);
        that._adjustTitle(offset)
    },
    _measureTitle: _common.noop,
    animate: function() {
        callAction(this._majorTicks, "animateLabels")
    },
    updateSize: function(canvas, animate) {
        var that = this;
        that.updateCanvas(canvas);
        that._reinitTranslator(that._getViewportRange());
        var animationEnabled = !that._firstDrawing && animate;
        initTickCoords(that._majorTicks);
        initTickCoords(that._minorTicks);
        initTickCoords(that._boundaryTicks);
        cleanUpInvalidTicks(that._majorTicks);
        cleanUpInvalidTicks(that._minorTicks);
        cleanUpInvalidTicks(that._boundaryTicks);
        that._updateAxisElementPosition();
        updateTicksPosition(that._majorTicks, animationEnabled);
        updateTicksPosition(that._minorTicks, animationEnabled);
        updateTicksPosition(that._boundaryTicks);
        callAction(that._majorTicks, "updateLabelPosition", animationEnabled);
        that._outsideConstantLines.concat(that._insideConstantLines || []).forEach(function(l) {
            return l.updatePosition(animationEnabled)
        });
        callAction(that._strips, "updatePosition", animationEnabled);
        that._updateTitleCoords();
        that._checkTitleOverflow();
        updateGridsPosition(that._majorTicks, animationEnabled);
        updateGridsPosition(that._minorTicks, animationEnabled);
        if (animationEnabled) {
            callAction(that._ticksToRemove || [], "fadeOutElements")
        }
        that.prepareAnimation();
        that._ticksToRemove = null;
        if (!that._translator.getBusinessRange().isEmpty()) {
            that._firstDrawing = false
        }
    },
    prepareAnimation: function() {
        var that = this;
        var action = "saveCoords";
        callAction(that._majorTicks, action);
        callAction(that._minorTicks, action);
        callAction(that._insideConstantLines, action);
        callAction(that._outsideConstantLines, action);
        callAction(that._strips, action)
    },
    applyClipRects: function(elementsClipID, canvasClipID) {
        this._axisGroup.attr({
            "clip-path": canvasClipID
        });
        this._axisStripGroup.attr({
            "clip-path": elementsClipID
        })
    },
    _mergeViewportOptions: function() {
        var that = this;
        var options = that._options;
        var visualRange = {};
        var visualRangeOptionValue = options._customVisualRange;
        if (((0, _type.isDefined)(options.max) || (0, _type.isDefined)(options.min)) && !(0, _type.isDefined)(visualRangeOptionValue.startValue) && !(0, _type.isDefined)(visualRangeOptionValue.endValue) && !(0, _type.isDefined)(visualRangeOptionValue.length)) {
            visualRange = {
                startValue: options.min,
                endValue: options.max
            }
        } else {
            visualRange = visualRangeOptionValue
        }
        that._setVisualRange(visualRange)
    },
    _validateVisualRange: function(visualRange) {
        var range = getVizRangeObject(visualRange);
        if (void 0 !== range.startValue) {
            range.startValue = this._validateUnit(range.startValue)
        }
        if (void 0 !== range.endValue) {
            range.endValue = this._validateUnit(range.endValue)
        }
        return convertVisualRangeObject(range, visualRange)
    },
    _validateOptions: function(options) {
        var that = this;
        if (void 0 !== options.min) {
            options.min = that._validateUnit(options.min, "E2106")
        }
        if (void 0 !== options.max) {
            options.max = that._validateUnit(options.max, "E2106")
        }
        options.wholeRange = that._validateVisualRange(options.wholeRange);
        options.visualRange = options._customVisualRange = that._validateVisualRange(options._customVisualRange);
        that._mergeViewportOptions()
    },
    validate: function() {
        var that = this;
        var options = that._options;
        var dataType = that.isArgumentAxis ? options.argumentType : options.valueType;
        var parser = dataType ? _parse_utils2.default.getParser(dataType) : function(unit) {
            return unit
        };
        that.parser = parser;
        options.dataType = dataType;
        that._validateOptions(options)
    },
    resetVisualRange: function(isSilent) {
        this._seriesData.minVisible = this._seriesData.min;
        this._seriesData.maxVisible = this._seriesData.max;
        this.handleZooming([null, null], {
            start: !!isSilent,
            end: !!isSilent
        })
    },
    _applyZooming: function(visualRange) {
        var that = this;
        that._resetVisualRangeOption();
        that._setVisualRange(visualRange);
        var viewPort = that.getViewport();
        that._breaks = that._getScaleBreaks(that._options, {
            minVisible: viewPort.startValue,
            maxVisible: viewPort.endValue
        }, that._series, that.isArgumentAxis);
        that._translator.updateBusinessRange(that._getViewportRange())
    },
    getZoomStartEventArg: function(event, actionType) {
        return {
            axis: this,
            range: this.visualRange(),
            cancel: false,
            event: event,
            actionType: actionType
        }
    },
    getZoomEndEventArg: function(previousRange, event, actionType, zoomFactor, shift) {
        var newRange = this.visualRange();
        return {
            axis: this,
            previousRange: previousRange,
            range: newRange,
            cancel: false,
            event: event,
            actionType: actionType,
            zoomFactor: zoomFactor,
            shift: shift,
            rangeStart: newRange.startValue,
            rangeEnd: newRange.endValue
        }
    },
    getZoomBounds: function() {
        var wholeRange = _utils2.default.getVizRangeObject(this._options.wholeRange);
        var range = this.getTranslator().getBusinessRange();
        var secondPriorityRange = {
            startValue: getZoomBoundValue(this._initRange.startValue, range.min),
            endValue: getZoomBoundValue(this._initRange.endValue, range.max)
        };
        return {
            startValue: getZoomBoundValue(wholeRange.startValue, secondPriorityRange.startValue),
            endValue: getZoomBoundValue(wholeRange.endValue, secondPriorityRange.endValue)
        }
    },
    setInitRange: function() {
        this._initRange = {};
        if (0 === Object.keys(this._options.wholeRange || {}).length) {
            this._initRange = this.getZoomBounds()
        }
    },
    _resetVisualRangeOption: function() {
        this._options._customVisualRange = {}
    },
    setCustomVisualRange: function(range) {
        this._options._customVisualRange = range
    },
    visualRange: function visualRange() {
        var that = this;
        var args = arguments;
        var visualRange = void 0;
        if (0 === args.length) {
            var adjustedRange = that._getAdjustedBusinessRange();
            var startValue = adjustedRange.minVisible;
            var endValue = adjustedRange.maxVisible;
            if (that._options.type === _axes_constants2.default.discrete) {
                startValue = (0, _type.isDefined)(startValue) ? startValue : adjustedRange.categories[0];
                endValue = (0, _type.isDefined)(endValue) ? endValue : adjustedRange.categories[adjustedRange.categories.length - 1];
                return {
                    startValue: startValue,
                    endValue: endValue,
                    categories: _utils2.default.getCategoriesInfo(adjustedRange.categories, startValue, endValue).categories
                }
            }
            return {
                startValue: startValue,
                endValue: endValue
            }
        } else {
            if (_isArray(args[0])) {
                visualRange = args[0]
            } else {
                if ((0, _type.isPlainObject)(args[0])) {
                    visualRange = (0, _extend.extend)({}, args[0])
                } else {
                    visualRange = [args[0], args[1]]
                }
            }
        }
        var zoomResults = that.handleZooming(visualRange, args[1]);
        if (!zoomResults.isPrevented) {
            that._visualRange(that, zoomResults.range)
        }
    },
    handleZooming: function(visualRange, preventEvents, domEvent, action) {
        var that = this;
        preventEvents = preventEvents || {};
        if ((0, _type.isDefined)(visualRange)) {
            visualRange = that._validateVisualRange(visualRange);
            visualRange.action = action
        }
        var zoomStartEvent = that.getZoomStartEventArg(domEvent, action);
        var previousRange = zoomStartEvent.range;
        !preventEvents.start && that._eventTrigger("zoomStart", zoomStartEvent);
        var zoomResults = {
            isPrevented: zoomStartEvent.cancel,
            range: visualRange || zoomStartEvent.range
        };
        if (!zoomStartEvent.cancel) {
            (0, _type.isDefined)(visualRange) && that._applyZooming(visualRange);
            if (!(0, _type.isDefined)(that._storedZoomEndParams)) {
                that._storedZoomEndParams = {
                    startRange: previousRange
                }
            }
            that._storedZoomEndParams.event = domEvent;
            that._storedZoomEndParams.action = action;
            that._storedZoomEndParams.prevent = !!preventEvents.end
        }
        return zoomResults
    },
    handleZoomEnd: function() {
        var that = this;
        if ((0, _type.isDefined)(that._storedZoomEndParams) && !that._storedZoomEndParams.prevent) {
            var previousRange = that._storedZoomEndParams.startRange;
            var domEvent = that._storedZoomEndParams.event;
            var action = that._storedZoomEndParams.action;
            var previousBusinessRange = {
                minVisible: previousRange.startValue,
                maxVisible: previousRange.endValue,
                categories: previousRange.categories
            };
            var shift = (0, _math2.adjust)(that.getVisualRangeCenter() - that.getVisualRangeCenter(previousBusinessRange));
            var zoomFactor = +(Math.round(that.getVisualRangeLength(previousBusinessRange) / that.getVisualRangeLength() + "e+2") + "e-2");
            var zoomEndEvent = that.getZoomEndEventArg(previousRange, domEvent, action, zoomFactor, shift);
            zoomEndEvent.cancel = that.isZoomingLowerLimitOvercome(1 === zoomFactor ? "pan" : "zoom", zoomFactor);
            that._eventTrigger("zoomEnd", zoomEndEvent);
            if (zoomEndEvent.cancel) {
                that.restorePreviousVisualRange(previousRange)
            }
            that._storedZoomEndParams = null
        }
    },
    restorePreviousVisualRange: function(previousRange) {
        var that = this;
        that._storedZoomEndParams = null;
        that._applyZooming(previousRange);
        that._visualRange(that, previousRange)
    },
    isZoomingLowerLimitOvercome: function(actionType, zoomFactor, range) {
        var that = this;
        var options = that._options;
        var minZoom = options.minVisualRangeLength;
        var isOvercoming = "zoom" === actionType && zoomFactor >= 1;
        var businessRange = that._translator.getBusinessRange();
        var visualRange = void 0;
        if ((0, _type.isDefined)(range)) {
            visualRange = that.adjustRange(_utils2.default.getVizRangeObject(range));
            visualRange = {
                minVisible: visualRange.startValue,
                maxVisible: visualRange.endValue,
                categories: businessRange.categories
            }
        }
        var visualRangeLength = that.getVisualRangeLength(visualRange);
        if ("discrete" !== options.type) {
            if ((0, _type.isDefined)(minZoom)) {
                if ("datetime" === options.dataType && !(0, _type.isNumeric)(minZoom)) {
                    minZoom = (0, _date.dateToMilliseconds)(minZoom)
                }
                isOvercoming &= minZoom >= visualRangeLength
            } else {
                var canvasLength = that._translator.canvasLength;
                var fullRange = {
                    minVisible: businessRange.min,
                    maxVisible: businessRange.max,
                    categories: businessRange.categories
                };
                isOvercoming &= that.getVisualRangeLength(fullRange) / canvasLength >= visualRangeLength
            }
        } else {
            !(0, _type.isDefined)(minZoom) && (minZoom = 1);
            isOvercoming &= (0, _type.isDefined)(range) && that.getVisualRangeLength() === minZoom && visualRangeLength <= minZoom
        }
        return !!isOvercoming
    },
    dataVisualRangeIsReduced: function() {
        var minDataValue = void 0;
        var maxDataValue = void 0;
        var translator = this.getTranslator();
        if ("discrete" === this._options.type) {
            var categories = translator.getBusinessRange().categories;
            minDataValue = categories[0];
            maxDataValue = categories[categories.length - 1]
        } else {
            var seriesData = this._seriesData;
            minDataValue = seriesData.min;
            maxDataValue = seriesData.max
        }
        if (!(0, _type.isDefined)(minDataValue) || !(0, _type.isDefined)(maxDataValue)) {
            return false
        }
        var startPoint = translator.translate(minDataValue);
        var endPoint = translator.translate(maxDataValue);
        var edges = [Math.min(startPoint, endPoint), Math.max(startPoint, endPoint)];
        var visualRange = this.visualRange();
        var visualRangeStartPoint = translator.translate(visualRange.startValue);
        var visualRangeEndPoint = translator.translate(visualRange.endValue);
        return visualRangeStartPoint > edges[0] && visualRangeStartPoint < edges[1] || visualRangeEndPoint > edges[0] && visualRangeEndPoint < edges[1] || visualRangeStartPoint === visualRangeEndPoint && edges[0] !== edges[1]
    },
    isExtremePosition: function(isMax) {
        var extremeDataValue = void 0;
        var seriesData = void 0;
        if ("discrete" === this._options.type) {
            seriesData = this._translator.getBusinessRange();
            extremeDataValue = isMax ? seriesData.categories[seriesData.categories.length - 1] : seriesData.categories[0]
        } else {
            seriesData = this.getZoomBounds();
            extremeDataValue = isMax ? seriesData.endValue : seriesData.startValue
        }
        var translator = this.getTranslator();
        var extremePoint = translator.translate(extremeDataValue);
        var visualRange = this.visualRange();
        var visualRangePoint = isMax ? translator.translate(visualRange.endValue) : translator.translate(visualRange.startValue);
        return Math.abs(visualRangePoint - extremePoint) < SCROLL_THRESHOLD
    },
    getViewport: function() {
        return this._viewport
    },
    getFullTicks: function() {
        var majors = this._majorTicks || [];
        if (this._options.type === _axes_constants2.default.discrete) {
            return convertTicksToValues(majors)
        } else {
            return convertTicksToValues(majors.concat(this._minorTicks, this._boundaryTicks)).sort(function(a, b) {
                return valueOf(a) - valueOf(b)
            })
        }
    },
    measureLabels: function(canvas, withIndents) {
        var ticks, maxText, text, box, tickInterval, that = this,
            options = that._options,
            widthAxis = options.visible ? options.width : 0,
            indent = withIndents ? options.label.indentFromAxis + .5 * options.tick.length : 0,
            viewportRange = that._getViewportRange();
        if (viewportRange.isEmpty() || !options.label.visible || !that._axisElementsGroup) {
            return {
                height: widthAxis,
                width: widthAxis,
                x: 0,
                y: 0
            }
        }
        if (that._majorTicks) {
            ticks = convertTicksToValues(that._majorTicks)
        } else {
            this.updateCanvas(canvas);
            ticks = that._createTicksAndLabelFormat(viewportRange, _common.noop);
            tickInterval = ticks.tickInterval;
            ticks = ticks.ticks
        }
        maxText = ticks.reduce(function(prevLabel, tick, index) {
            var label = that.formatLabel(tick, options.label, viewportRange, void 0, tickInterval, ticks);
            if (prevLabel.length < label.length) {
                return label
            } else {
                return prevLabel
            }
        }, that.formatLabel(ticks[0], options.label, viewportRange, void 0, tickInterval, ticks));
        text = that._renderer.text(maxText, 0, 0).css(that._textFontStyles).attr(that._textOptions).append(that._renderer.root);
        box = text.getBBox();
        text.remove();
        return {
            x: box.x,
            y: box.y,
            width: box.width + indent,
            height: box.height + indent
        }
    },
    _setLabelsPlacement: function() {
        if (!this._options.label.visible) {
            return
        }
        var notRecastStep, step, that = this,
            labelOpt = that._options.label,
            displayMode = that._validateDisplayMode(labelOpt.displayMode),
            overlappingMode = that._validateOverlappingMode(labelOpt.overlappingBehavior, displayMode),
            ignoreOverlapping = "none" === overlappingMode || "ignore" === overlappingMode,
            behavior = {
                rotationAngle: labelOpt.rotationAngle,
                staggeringSpacing: labelOpt.staggeringSpacing
            },
            boxes = that._majorTicks.map(function(tick) {
                return tick.labelBBox
            });
        step = that._getStep(boxes);
        switch (displayMode) {
            case "rotate":
                if (ignoreOverlapping) {
                    notRecastStep = true;
                    step = 1
                }
                that._applyLabelMode(displayMode, step, boxes, labelOpt, notRecastStep);
                break;
            case "stagger":
                if (ignoreOverlapping) {
                    step = 2
                }
                that._applyLabelMode(displayMode, _max(step, 2), boxes, labelOpt);
                break;
            default:
                that._applyLabelOverlapping(boxes, overlappingMode, step, behavior)
        }
    },
    _applyLabelOverlapping: function(boxes, mode, step, behavior) {
        var that = this,
            labelOpt = that._options.label,
            majorTicks = that._majorTicks;
        if ("none" === mode || "ignore" === mode) {
            return
        }
        var checkLabels = function(box, index, array) {
            if (0 === index) {
                return false
            }
            return _axes_constants2.default.areLabelsOverlap(box, array[index - 1], labelOpt.minSpacing, labelOpt.alignment)
        };
        if (step > 1 && boxes.some(checkLabels)) {
            that._applyLabelMode(mode, step, boxes, behavior)
        }
        if ("hide" === mode) {
            that._checkBoundedLabelsOverlapping(step, majorTicks, boxes)
        }
    },
    _applyLabelMode: function(mode, step, boxes, behavior, notRecastStep) {
        var labelHeight, alignment, func, that = this,
            majorTicks = that._majorTicks,
            labelOpt = that._options.label,
            angle = behavior.rotationAngle;
        switch (mode) {
            case "rotate":
                if (!labelOpt.userAlignment) {
                    alignment = angle < 0 ? RIGHT : LEFT;
                    if (angle % 90 === 0) {
                        alignment = CENTER
                    }
                }
                step = notRecastStep ? step : that._getStep(boxes, angle);
                func = function(tick) {
                    tick.label.rotate(angle);
                    tick.labelRotationAngle = angle;
                    alignment && (tick.labelAlignment = alignment)
                };
                updateLabels(majorTicks, step, func);
                break;
            case "stagger":
                labelHeight = that._getMaxLabelHeight(boxes, behavior.staggeringSpacing);
                func = function(tick, index) {
                    if (index / (step - 1) % 2 !== 0) {
                        tick.labelOffset = labelHeight
                    }
                };
                updateLabels(majorTicks, step - 1, func);
                break;
            case "auto":
            case "_auto":
                if (2 === step) {
                    that._applyLabelMode("stagger", step, boxes, behavior)
                } else {
                    that._applyLabelMode("rotate", step, boxes, {
                        rotationAngle: getOptimalAngle(boxes, labelOpt)
                    })
                }
                break;
            default:
                updateLabels(majorTicks, step)
        }
    },
    getMarkerTrackers: _common.noop,
    _drawDateMarkers: _common.noop,
    _adjustDateMarkers: _common.noop,
    coordsIn: _common.noop,
    areCoordsOutsideAxis: _common.noop,
    _getSkippedCategory: _common.noop,
    _initAxisPositions: _common.noop,
    _drawTitle: _common.noop,
    _updateTitleCoords: _common.noop,
    _adjustConstantLineLabels: _common.noop,
    _createTranslator: function() {
        return new _translator2d2.default.Translator2D({}, {}, {})
    },
    _updateTranslator: function() {
        var translator = this._translator;
        translator.update(translator.getBusinessRange(), this._canvas || {}, this._getTranslatorOptions())
    },
    _getTranslatorOptions: function() {
        var options = this._options;
        return {
            isHorizontal: this._isHorizontal,
            shiftZeroValue: !this.isArgumentAxis,
            interval: options.semiDiscreteInterval,
            stick: this._getStick(),
            breaksSize: options.breakStyle ? options.breakStyle.width : 0
        }
    },
    _getCanvasStartEnd: function() {
        var isHorizontal = this._isHorizontal,
            canvas = this._canvas,
            invert = this._translator.getBusinessRange().invert,
            coords = isHorizontal ? [canvas.left, canvas.width - canvas.right] : [canvas.height - canvas.bottom, canvas.top];
        invert && coords.reverse();
        return {
            start: coords[0],
            end: coords[1]
        }
    },
    _getScreenDelta: function() {
        var that = this,
            canvas = that._getCanvasStartEnd(),
            breaks = that._breaks,
            breaksLength = breaks ? breaks.length : 0,
            screenDelta = _math.abs(canvas.start - canvas.end);
        return screenDelta - (breaksLength ? breaks[breaksLength - 1].cumulativeWidth : 0)
    },
    _getScaleBreaks: function() {
        return []
    },
    _adjustTitle: _common.noop,
    _checkTitleOverflow: _common.noop,
    getSpiderTicks: _common.noop,
    setSpiderTicks: _common.noop,
    _checkBoundedLabelsOverlapping: _common.noop,
    drawScaleBreaks: _common.noop,
    _visualRange: _common.noop,
    applyVisualRangeSetter: _common.noop,
    getCategoriesSorter: function() {
        var categoriesSortingMethod = this._options.categoriesSortingMethod;
        return (0, _type.isDefined)(categoriesSortingMethod) ? categoriesSortingMethod : this._options.categories
    },
    _getAdjustedBusinessRange: function() {
        return this.adjustViewport(this._translator.getBusinessRange())
    }
};
