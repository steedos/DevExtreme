/**
 * DevExtreme (viz/sparklines/sparkline.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var BaseSparkline = require("./base_sparkline"),
    dataValidatorModule = require("../components/data_validator"),
    seriesModule = require("../series/base_series"),
    MIN_BAR_WIDTH = 1,
    MAX_BAR_WIDTH = 50,
    DEFAULT_BAR_INTERVAL = 4,
    DEFAULT_CANVAS_WIDTH = 250,
    DEFAULT_CANVAS_HEIGHT = 30,
    DEFAULT_POINT_BORDER = 2,
    ALLOWED_TYPES = {
        line: true,
        spline: true,
        stepline: true,
        area: true,
        steparea: true,
        splinearea: true,
        bar: true,
        winloss: true
    },
    _math = Math,
    _abs = _math.abs,
    _round = _math.round,
    _max = _math.max,
    _min = _math.min,
    _isFinite = isFinite,
    vizUtils = require("../core/utils"),
    _map = vizUtils.map,
    _normalizeEnum = vizUtils.normalizeEnum,
    _isDefined = require("../../core/utils/type").isDefined,
    _Number = Number,
    _String = String;

function findMinMax(data, valField) {
    var value, i, firstItem = data[0] || {},
        firstValue = firstItem[valField] || 0,
        min = firstValue,
        max = firstValue,
        minIndexes = [0],
        maxIndexes = [0],
        dataLength = data.length;
    for (i = 1; i < dataLength; i++) {
        value = data[i][valField];
        if (value < min) {
            min = value;
            minIndexes = [i]
        } else {
            if (value === min) {
                minIndexes.push(i)
            }
        }
        if (value > max) {
            max = value;
            maxIndexes = [i]
        } else {
            if (value === max) {
                maxIndexes.push(i)
            }
        }
    }
    if (max === min) {
        minIndexes = maxIndexes = []
    }
    return {
        minIndexes: minIndexes,
        maxIndexes: maxIndexes
    }
}

function parseNumericDataSource(data, argField, valField, ignoreEmptyPoints) {
    return _map(data, function(dataItem, index) {
        var isDataNumber, value, item = null;
        if (void 0 !== dataItem) {
            item = {};
            isDataNumber = _isFinite(dataItem);
            item[argField] = isDataNumber ? _String(index) : dataItem[argField];
            value = isDataNumber ? dataItem : dataItem[valField];
            item[valField] = null === value ? ignoreEmptyPoints ? void 0 : value : _Number(value);
            item = void 0 !== item[argField] && void 0 !== item[valField] ? item : null
        }
        return item
    })
}

function parseWinlossDataSource(data, argField, valField, target) {
    var lowBarValue = -1,
        zeroBarValue = 0,
        highBarValue = 1,
        delta = 1e-4;
    return _map(data, function(dataItem) {
        var item = {};
        item[argField] = dataItem[argField];
        if (_abs(dataItem[valField] - target) < delta) {
            item[valField] = zeroBarValue
        } else {
            if (dataItem[valField] > target) {
                item[valField] = highBarValue
            } else {
                item[valField] = lowBarValue
            }
        }
        return item
    })
}

function selectPointColor(color, options, index, pointIndexes) {
    if (index === pointIndexes.first || index === pointIndexes.last) {
        color = options.firstLastColor
    }
    if ((pointIndexes.min || []).indexOf(index) >= 0) {
        color = options.minColor
    }
    if ((pointIndexes.max || []).indexOf(index) >= 0) {
        color = options.maxColor
    }
    return color
}

function createLineCustomizeFunction(pointIndexes, options) {
    return function() {
        var color = selectPointColor(void 0, options, this.index, pointIndexes);
        return color ? {
            visible: true,
            border: {
                color: color
            }
        } : {}
    }
}

function createBarCustomizeFunction(pointIndexes, options, winlossData) {
    return function() {
        var index = this.index,
            isWinloss = "winloss" === options.type,
            target = isWinloss ? options.winlossThreshold : 0,
            value = isWinloss ? winlossData[index][options.valueField] : this.value,
            positiveColor = isWinloss ? options.winColor : options.barPositiveColor,
            negativeColor = isWinloss ? options.lossColor : options.barNegativeColor;
        return {
            color: selectPointColor(value >= target ? positiveColor : negativeColor, options, index, pointIndexes)
        }
    }
}
var dxSparkline = BaseSparkline.inherit({
    _rootClassPrefix: "dxsl",
    _rootClass: "dxsl-sparkline",
    _widgetType: "sparkline",
    _defaultSize: {
        width: DEFAULT_CANVAS_WIDTH,
        height: DEFAULT_CANVAS_HEIGHT
    },
    _initCore: function() {
        this.callBase();
        this._createSeries()
    },
    _initialChanges: ["DATA_SOURCE"],
    _dataSourceChangedHandler: function() {
        this._requestChange(["UPDATE"])
    },
    _updateWidgetElements: function() {
        this._updateSeries();
        this.callBase()
    },
    _disposeWidgetElements: function() {
        var that = this;
        that._series && that._series.dispose();
        that._series = that._seriesGroup = that._seriesLabelGroup = null
    },
    _cleanWidgetElements: function() {
        this._seriesGroup.remove();
        this._seriesLabelGroup.remove();
        this._seriesGroup.clear();
        this._seriesLabelGroup.clear()
    },
    _drawWidgetElements: function() {
        if (this._dataIsLoaded()) {
            this._drawSeries();
            this._drawn()
        }
    },
    _getCorrectCanvas: function() {
        var options = this._allOptions,
            canvas = this._canvas,
            halfPointSize = options.pointSize && Math.ceil(options.pointSize / 2) + DEFAULT_POINT_BORDER,
            type = options.type;
        if ("bar" !== type && "winloss" !== type && (options.showFirstLast || options.showMinMax)) {
            return {
                width: canvas.width,
                height: canvas.height,
                left: canvas.left + halfPointSize,
                right: canvas.right + halfPointSize,
                top: canvas.top + halfPointSize,
                bottom: canvas.bottom + halfPointSize
            }
        }
        return canvas
    },
    _prepareOptions: function() {
        var that = this;
        that._allOptions = that.callBase();
        that._allOptions.type = _normalizeEnum(that._allOptions.type);
        if (!ALLOWED_TYPES[that._allOptions.type]) {
            that._allOptions.type = "line"
        }
    },
    _createHtmlElements: function() {
        this._seriesGroup = this._renderer.g().attr({
            "class": "dxsl-series"
        });
        this._seriesLabelGroup = this._renderer.g().attr({
            "class": "dxsl-series-labels"
        })
    },
    _createSeries: function() {
        this._series = new seriesModule.Series({
            renderer: this._renderer,
            seriesGroup: this._seriesGroup,
            labelsGroup: this._seriesLabelGroup,
            argumentAxis: this._argumentAxis,
            valueAxis: this._valueAxis
        }, {
            widgetType: "chart",
            type: "line"
        })
    },
    _updateSeries: function() {
        var groupsData, seriesOptions, that = this,
            singleSeries = that._series;
        that._prepareDataSource();
        seriesOptions = that._prepareSeriesOptions();
        singleSeries.updateOptions(seriesOptions);
        groupsData = {
            groups: [{
                series: [singleSeries]
            }]
        };
        groupsData.argumentOptions = {
            type: "bar" === seriesOptions.type ? "discrete" : void 0
        };
        that._simpleDataSource = dataValidatorModule.validateData(that._simpleDataSource, groupsData, that._incidentOccurred, {
            checkTypeForAllData: false,
            convertToAxisDataType: true,
            sortingMethod: true
        })[singleSeries.getArgumentField()];
        seriesOptions.customizePoint = that._getCustomizeFunction();
        singleSeries.updateData(that._simpleDataSource);
        singleSeries.createPoints();
        that._groupsDataCategories = groupsData.categories
    },
    _optionChangesMap: {
        dataSource: "DATA_SOURCE"
    },
    _optionChangesOrder: ["DATA_SOURCE"],
    _change_DATA_SOURCE: function() {
        this._updateDataSource()
    },
    _prepareDataSource: function() {
        var that = this,
            options = that._allOptions,
            argField = options.argumentField,
            valField = options.valueField,
            dataSource = that._dataSourceItems() || [],
            data = parseNumericDataSource(dataSource, argField, valField, that.option("ignoreEmptyPoints"));
        if ("winloss" === options.type) {
            that._winlossDataSource = data;
            that._simpleDataSource = parseWinlossDataSource(data, argField, valField, options.winlossThreshold)
        } else {
            that._simpleDataSource = data
        }
    },
    _prepareSeriesOptions: function() {
        var that = this,
            options = that._allOptions,
            type = "winloss" === options.type ? "bar" : options.type;
        return {
            visible: true,
            argumentField: options.argumentField,
            valueField: options.valueField,
            color: options.lineColor,
            width: options.lineWidth,
            widgetType: "chart",
            type: type,
            opacity: type.indexOf("area") !== -1 ? that._allOptions.areaOpacity : void 0,
            point: {
                size: options.pointSize,
                symbol: options.pointSymbol,
                border: {
                    visible: true,
                    width: DEFAULT_POINT_BORDER
                },
                color: options.pointColor,
                visible: false,
                hoverStyle: {
                    border: {}
                },
                selectionStyle: {
                    border: {}
                }
            },
            border: {
                color: options.lineColor,
                width: options.lineWidth,
                visible: "bar" !== type
            }
        }
    },
    _getCustomizeFunction: function() {
        var customizeFunction, that = this,
            options = that._allOptions,
            dataSource = that._winlossDataSource || that._simpleDataSource,
            drawnPointIndexes = that._getExtremumPointsIndexes(dataSource);
        if ("winloss" === options.type || "bar" === options.type) {
            customizeFunction = createBarCustomizeFunction(drawnPointIndexes, options, that._winlossDataSource)
        } else {
            customizeFunction = createLineCustomizeFunction(drawnPointIndexes, options)
        }
        return customizeFunction
    },
    _getExtremumPointsIndexes: function(data) {
        var that = this,
            options = that._allOptions,
            lastIndex = data.length - 1,
            indexes = {};
        that._minMaxIndexes = findMinMax(data, options.valueField);
        if (options.showFirstLast) {
            indexes.first = 0;
            indexes.last = lastIndex
        }
        if (options.showMinMax) {
            indexes.min = that._minMaxIndexes.minIndexes;
            indexes.max = that._minMaxIndexes.maxIndexes
        }
        return indexes
    },
    _getStick: function() {
        return {
            stick: "bar" !== this._series.type
        }
    },
    _updateRange: function() {
        var valCoef, argCoef, that = this,
            series = that._series,
            type = series.type,
            isBarType = "bar" === type,
            isWinlossType = "winloss" === type,
            DEFAULT_VALUE_RANGE_MARGIN = .15,
            DEFAULT_ARGUMENT_RANGE_MARGIN = .1,
            WINLOSS_MAX_RANGE = 1,
            WINLOSS_MIN_RANGE = -1,
            rangeData = series.getRangeData(),
            minValue = that._allOptions.minValue,
            hasMinY = _isDefined(minValue) && _isFinite(minValue),
            maxValue = that._allOptions.maxValue,
            hasMaxY = _isDefined(maxValue) && _isFinite(maxValue);
        valCoef = (rangeData.val.max - rangeData.val.min) * DEFAULT_VALUE_RANGE_MARGIN;
        if (isBarType || isWinlossType || "area" === type) {
            if (0 !== rangeData.val.min) {
                rangeData.val.min -= valCoef
            }
            if (0 !== rangeData.val.max) {
                rangeData.val.max += valCoef
            }
        } else {
            rangeData.val.min -= valCoef;
            rangeData.val.max += valCoef
        }
        if (hasMinY || hasMaxY) {
            if (hasMinY && hasMaxY) {
                rangeData.val.minVisible = _min(minValue, maxValue);
                rangeData.val.maxVisible = _max(minValue, maxValue)
            } else {
                rangeData.val.minVisible = hasMinY ? _Number(minValue) : void 0;
                rangeData.val.maxVisible = hasMaxY ? _Number(maxValue) : void 0
            }
            if (isWinlossType) {
                rangeData.val.minVisible = hasMinY ? _max(rangeData.val.minVisible, WINLOSS_MIN_RANGE) : void 0;
                rangeData.val.maxVisible = hasMaxY ? _min(rangeData.val.maxVisible, WINLOSS_MAX_RANGE) : void 0
            }
        }
        if (series.getPoints().length > 1) {
            if (isBarType) {
                argCoef = (rangeData.arg.max - rangeData.arg.min) * DEFAULT_ARGUMENT_RANGE_MARGIN;
                rangeData.arg.min = rangeData.arg.min - argCoef;
                rangeData.arg.max = rangeData.arg.max + argCoef
            }
        }
        rangeData.arg.categories = that._groupsDataCategories;
        that._ranges = rangeData
    },
    _getBarWidth: function(pointsCount) {
        var that = this,
            canvas = that._canvas,
            intervalWidth = pointsCount * DEFAULT_BAR_INTERVAL,
            rangeWidth = canvas.width - canvas.left - canvas.right - intervalWidth,
            width = _round(rangeWidth / pointsCount);
        if (width < MIN_BAR_WIDTH) {
            width = MIN_BAR_WIDTH
        }
        if (width > MAX_BAR_WIDTH) {
            width = MAX_BAR_WIDTH
        }
        return width
    },
    _correctPoints: function() {
        var barWidth, i, that = this,
            seriesType = that._allOptions.type,
            seriesPoints = that._series.getPoints(),
            pointsLength = seriesPoints.length;
        if ("bar" === seriesType || "winloss" === seriesType) {
            barWidth = that._getBarWidth(pointsLength);
            for (i = 0; i < pointsLength; i++) {
                seriesPoints[i].correctCoordinates({
                    width: barWidth,
                    offset: 0
                })
            }
        }
    },
    _drawSeries: function() {
        var that = this;
        if (that._simpleDataSource.length > 0) {
            that._correctPoints();
            that._series.draw();
            that._seriesGroup.append(that._renderer.root)
        }
    },
    _isTooltipEnabled: function() {
        return !!this._simpleDataSource.length
    },
    _getTooltipData: function() {
        var that = this,
            options = that._allOptions,
            dataSource = that._winlossDataSource || that._simpleDataSource,
            tooltip = that._tooltip;
        if (0 === dataSource.length) {
            return {}
        }
        var minMax = that._minMaxIndexes,
            valueField = options.valueField,
            first = dataSource[0][valueField],
            last = dataSource[dataSource.length - 1][valueField],
            min = _isDefined(minMax.minIndexes[0]) ? dataSource[minMax.minIndexes[0]][valueField] : first,
            max = _isDefined(minMax.maxIndexes[0]) ? dataSource[minMax.maxIndexes[0]][valueField] : first,
            formattedFirst = tooltip.formatValue(first),
            formattedLast = tooltip.formatValue(last),
            formattedMin = tooltip.formatValue(min),
            formattedMax = tooltip.formatValue(max),
            customizeObject = {
                firstValue: formattedFirst,
                lastValue: formattedLast,
                minValue: formattedMin,
                maxValue: formattedMax,
                originalFirstValue: first,
                originalLastValue: last,
                originalMinValue: min,
                originalMaxValue: max,
                valueText: ["Start:", formattedFirst, "End:", formattedLast, "Min:", formattedMin, "Max:", formattedMax]
            };
        if ("winloss" === options.type) {
            customizeObject.originalThresholdValue = options.winlossThreshold;
            customizeObject.thresholdValue = tooltip.formatValue(options.winlossThreshold)
        }
        return customizeObject
    }
});
_map(["lineColor", "lineWidth", "areaOpacity", "minColor", "maxColor", "barPositiveColor", "barNegativeColor", "winColor", "lessColor", "firstLastColor", "pointSymbol", "pointColor", "pointSize", "type", "argumentField", "valueField", "winlossThreshold", "showFirstLast", "showMinMax", "ignoreEmptyPoints", "minValue", "maxValue"], function(name) {
    dxSparkline.prototype._optionChangesMap[name] = "OPTIONS"
});
require("../../core/component_registrator")("dxSparkline", dxSparkline);
module.exports = dxSparkline;
dxSparkline.addPlugin(require("../core/data_source").plugin);
