/**
 * DevExtreme (viz/series/pie_series.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var noop = require("../../core/utils/common").noop,
    each = require("../../core/utils/iterator").each,
    scatterSeries = require("./scatter_series"),
    vizUtils = require("../core/utils"),
    extend = require("../../core/utils/extend").extend,
    chartScatterSeries = scatterSeries.chart,
    barSeries = require("./bar_series").chart.bar,
    _extend = extend,
    _each = each,
    _noop = noop,
    _map = vizUtils.map,
    _isFinite = isFinite,
    _max = Math.max,
    ANIMATION_DURATION = .7,
    INSIDE = "inside";
exports.pie = _extend({}, barSeries, {
    _setGroupsSettings: chartScatterSeries._setGroupsSettings,
    _createErrorBarGroup: _noop,
    _drawPoint: function(options) {
        var point = options.point,
            legendCallback = this._legendCallback;
        chartScatterSeries._drawPoint.call(this, options);
        !point.isVisible() && point.setInvisibility();
        point.isSelected() && legendCallback()
    },
    _getOldPoint: function(data, oldPointsByArgument, index) {
        var point = (this._points || [])[index];
        if (point) {
            oldPointsByArgument[point.argument] = oldPointsByArgument[point.argument].filter(function(p) {
                return p !== point
            })
        }
        return point
    },
    adjustLabels: function(moveLabelsFromCenter) {
        (this._points || []).forEach(function(point) {
            if (point._label.isVisible()) {
                point.setLabelTrackerData();
                point.setLabelEllipsis(moveLabelsFromCenter);
                point.updateLabelCoord(moveLabelsFromCenter)
            }
        })
    },
    _applyElementsClipRect: _noop,
    getColor: _noop,
    areErrorBarsVisible: _noop,
    drawLabelsWOPoints: function() {
        var that = this;
        if (that._options.label.position === INSIDE) {
            return false
        }
        that._labelsGroup.append(that._extGroups.labelsGroup);
        (that._points || []).forEach(function(point) {
            point.drawLabel()
        });
        return true
    },
    getPointsCount: function() {
        var _this = this;
        return this._data.filter(function(d) {
            return _this._checkData(d)
        }).length
    },
    setMaxPointsCount: function(count) {
        this._pointsCount = count
    },
    _getCreatingPointOptions: function(data, dataIndex) {
        return this._getPointOptions(data, dataIndex)
    },
    _updateOptions: function(options) {
        this.labelSpace = 0;
        this.innerRadius = "pie" === this.type ? 0 : options.innerRadius
    },
    _checkData: function(data, skippedFields) {
        var base = barSeries._checkData.call(this, data, skippedFields, {
            value: this.getValueFields()[0]
        });
        return this._options.paintNullPoints ? base : base && null !== data.value
    },
    _createGroups: chartScatterSeries._createGroups,
    _setMarkerGroupSettings: function() {
        var that = this;
        that._markersGroup.attr({
            "class": "dxc-markers"
        })
    },
    _getMainColor: function(data, point) {
        var pointsByArg = this.getPointsByArg(data.argument);
        var argumentIndex = point ? pointsByArg.indexOf(point) : pointsByArg.length;
        return this._options.mainSeriesColor(data.argument, argumentIndex, this._pointsCount)
    },
    _getPointOptions: function(data) {
        return this._parsePointOptions(this._preparePointOptions(), this._options.label, data)
    },
    _getRangeData: function() {
        return this._rangeData
    },
    _createPointStyles: function(pointOptions, data, point) {
        var that = this,
            mainColor = pointOptions.color || that._getMainColor(data, point);
        return {
            normal: that._parsePointStyle(pointOptions, mainColor, mainColor),
            hover: that._parsePointStyle(pointOptions.hoverStyle, mainColor, mainColor),
            selection: that._parsePointStyle(pointOptions.selectionStyle, mainColor, mainColor),
            legendStyles: {
                normal: that._createLegendState(pointOptions, mainColor),
                hover: that._createLegendState(pointOptions.hoverStyle, mainColor),
                selection: that._createLegendState(pointOptions.selectionStyle, mainColor)
            }
        }
    },
    _getArrangeMinShownValue: function(points, total) {
        var minSegmentSize = this._options.minSegmentSize,
            totalMinSegmentSize = 0,
            totalNotMinValues = 0;
        total = total || points.length;
        _each(points, function(_, point) {
            if (point.isVisible()) {
                if (point.normalInitialValue < minSegmentSize * total / 360) {
                    totalMinSegmentSize += minSegmentSize
                } else {
                    totalNotMinValues += point.normalInitialValue
                }
            }
        });
        return totalMinSegmentSize < 360 ? minSegmentSize * totalNotMinValues / (360 - totalMinSegmentSize) : 0
    },
    _applyArrangeCorrection: function(points, minShownValue, total) {
        var percent, options = this._options,
            isClockWise = "anticlockwise" !== options.segmentsDirection,
            shiftedAngle = _isFinite(options.startAngle) ? vizUtils.normalizeAngle(options.startAngle) : 0,
            minSegmentSize = options.minSegmentSize,
            correction = 0,
            zeroTotalCorrection = 0;
        if (0 === total) {
            total = points.filter(function(el) {
                return el.isVisible()
            }).length;
            zeroTotalCorrection = 1
        }
        _each(isClockWise ? points : points.concat([]).reverse(), function(_, point) {
            var updatedZeroValue, val = point.isVisible() ? zeroTotalCorrection || point.normalInitialValue : 0;
            if (minSegmentSize && point.isVisible() && val < minShownValue) {
                updatedZeroValue = minShownValue
            }
            percent = val / total;
            point.correctValue(correction, percent, zeroTotalCorrection + (updatedZeroValue || 0));
            point.shiftedAngle = shiftedAngle;
            correction += updatedZeroValue || val
        });
        this._rangeData = {
            val: {
                min: 0,
                max: correction
            }
        }
    },
    _removePoint: function(point) {
        var points = this.getPointsByArg(point.argument);
        points.splice(points.indexOf(point), 1);
        point.dispose()
    },
    arrangePoints: function() {
        var minShownValue, total, points, maxValue, that = this,
            originalPoints = that._points || [],
            minSegmentSize = that._options.minSegmentSize,
            isAllPointsNegative = true,
            i = 0,
            len = originalPoints.length;
        while (i < len && isAllPointsNegative) {
            isAllPointsNegative = originalPoints[i].value <= 0;
            i++
        }
        points = that._points = _map(originalPoints, function(point) {
            if (null === point.value || !isAllPointsNegative && point.value < 0) {
                that._removePoint(point);
                return null
            } else {
                return point
            }
        });
        maxValue = points.reduce(function(max, p) {
            return _max(max, Math.abs(p.initialValue))
        }, 0);
        points.forEach(function(p) {
            p.normalInitialValue = p.initialValue / (0 !== maxValue ? maxValue : 1)
        });
        total = points.reduce(function(total, point) {
            return total + (point.isVisible() ? point.normalInitialValue : 0)
        }, 0);
        if (minSegmentSize) {
            minShownValue = this._getArrangeMinShownValue(points, total)
        }
        that._applyArrangeCorrection(points, minShownValue, total)
    },
    correctPosition: function(correction, canvas) {
        _each(this._points, function(_, point) {
            point.correctPosition(correction)
        });
        this.setVisibleArea(canvas)
    },
    correctRadius: function(correction) {
        this._points.forEach(function(point) {
            point.correctRadius(correction)
        })
    },
    correctLabelRadius: function(labelRadius) {
        this._points.forEach(function(point) {
            point.correctLabelRadius(labelRadius)
        })
    },
    setVisibleArea: function(canvas) {
        this._visibleArea = {
            minX: canvas.left,
            maxX: canvas.width - canvas.right,
            minY: canvas.top,
            maxY: canvas.height - canvas.bottom
        }
    },
    _applyVisibleArea: _noop,
    _animate: function(firstDrawing) {
        var animatePoint, that = this,
            points = that._points,
            pointsCount = points && points.length,
            completeFunc = function() {
                that._animateComplete()
            };
        if (firstDrawing) {
            animatePoint = function(p, i) {
                p.animate(i === pointsCount - 1 ? completeFunc : void 0, ANIMATION_DURATION, (1 - ANIMATION_DURATION) * i / (pointsCount - 1))
            }
        } else {
            animatePoint = function(p, i) {
                p.animate(i === pointsCount - 1 ? completeFunc : void 0)
            }
        }
        points.forEach(animatePoint)
    },
    getVisiblePoints: function() {
        return _map(this._points, function(p) {
            return p.isVisible() ? p : null
        })
    },
    getPointsByKeys: function(arg, argumentIndex) {
        var pointsByArg = this.getPointsByArg(arg);
        return pointsByArg[argumentIndex] && [pointsByArg[argumentIndex]] || []
    }
});
exports.doughnut = exports.donut = exports.pie;
