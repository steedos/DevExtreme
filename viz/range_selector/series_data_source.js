/**
 * DevExtreme (viz/range_selector/series_data_source.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var seriesModule = require("../series/base_series"),
    seriesFamilyModule = require("../core/series_family"),
    typeUtils = require("../../core/utils/type"),
    extend = require("../../core/utils/extend").extend,
    inArray = require("../../core/utils/array").inArray,
    each = require("../../core/utils/iterator").each,
    vizUtils = require("../core/utils"),
    rangeModule = require("../translators/range"),
    dataValidatorModule = require("../components/data_validator"),
    ChartThemeManager = require("../components/chart_theme_manager").ThemeManager,
    SeriesDataSource;
var createThemeManager = function(chartOptions) {
    return new ChartThemeManager(chartOptions, "rangeSelector.chart")
};
var processSeriesFamilies = function(series, equalBarWidth, minBubbleSize, maxBubbleSize, barOptions, negativesAsZeroes) {
    var families = [],
        types = [];
    each(series, function(i, item) {
        if (inArray(item.type, types) === -1) {
            types.push(item.type)
        }
    });
    each(types, function(_, type) {
        var family = new seriesFamilyModule.SeriesFamily({
            type: type,
            equalBarWidth: equalBarWidth,
            minBubbleSize: minBubbleSize,
            maxBubbleSize: maxBubbleSize,
            barWidth: barOptions.barWidth,
            barGroupPadding: barOptions.barGroupPadding,
            barGroupWidth: barOptions.barGroupWidth,
            negativesAsZeroes: negativesAsZeroes
        });
        family.add(series);
        family.adjustSeriesValues();
        families.push(family)
    });
    return families
};
SeriesDataSource = function(options) {
    var topIndent, bottomIndent, that = this,
        themeManager = that._themeManager = createThemeManager(options.chart);
    themeManager._fontFields = ["commonSeriesSettings.label.font"];
    themeManager.setTheme(options.chart.theme);
    topIndent = themeManager.getOptions("topIndent");
    bottomIndent = themeManager.getOptions("bottomIndent");
    that._indent = {
        top: topIndent >= 0 && topIndent < 1 ? topIndent : 0,
        bottom: bottomIndent >= 0 && bottomIndent < 1 ? bottomIndent : 0
    };
    that._valueAxis = themeManager.getOptions("valueAxisRangeSelector") || {};
    that._hideChart = false;
    that._series = that._calculateSeries(options);
    that._seriesFamilies = []
};
SeriesDataSource.prototype = {
    constructor: SeriesDataSource,
    _calculateSeries: function(options) {
        var particularSeriesOptions, seriesTheme, parsedData, dataSourceField, i, newSeries, groupsData, that = this,
            series = [],
            data = options.dataSource || [],
            chartThemeManager = that._themeManager,
            seriesTemplate = chartThemeManager.getOptions("seriesTemplate"),
            allSeriesOptions = seriesTemplate ? vizUtils.processSeriesTemplate(seriesTemplate, data) : options.chart.series,
            valueAxis = that._valueAxis;
        if (options.dataSource && !allSeriesOptions) {
            dataSourceField = options.dataSourceField || "arg";
            allSeriesOptions = {
                argumentField: dataSourceField,
                valueField: dataSourceField
            };
            that._hideChart = true
        }
        allSeriesOptions = Array.isArray(allSeriesOptions) ? allSeriesOptions : allSeriesOptions ? [allSeriesOptions] : [];
        for (i = 0; i < allSeriesOptions.length; i++) {
            particularSeriesOptions = extend(true, {}, allSeriesOptions[i]);
            particularSeriesOptions.rotated = false;
            seriesTheme = chartThemeManager.getOptions("series", particularSeriesOptions, allSeriesOptions.length);
            seriesTheme.argumentField = seriesTheme.argumentField || options.dataSourceField;
            if (!seriesTheme.name) {
                seriesTheme.name = "Series " + (i + 1).toString()
            }
            if (data && data.length > 0) {
                newSeries = new seriesModule.Series({
                    renderer: options.renderer,
                    argumentAxis: options.argumentAxis,
                    valueAxis: options.valueAxis,
                    incidentOccurred: options.incidentOccurred
                }, seriesTheme);
                series.push(newSeries)
            }
        }
        if (series.length) {
            groupsData = {
                groups: [{
                    series: series,
                    valueOptions: {
                        type: valueAxis.type,
                        valueType: dataSourceField ? options.valueType : valueAxis.valueType
                    }
                }],
                argumentOptions: {
                    categories: options.categories,
                    argumentType: options.valueType,
                    type: options.axisType
                }
            };
            parsedData = dataValidatorModule.validateData(data, groupsData, options.incidentOccurred, chartThemeManager.getOptions("dataPrepareSettings"));
            that.argCategories = groupsData.categories;
            for (i = 0; i < series.length; i++) {
                series[i].updateData(parsedData[series[i].getArgumentField()])
            }
        }
        return series
    },
    createPoints: function() {
        if (0 === this._series.length) {
            return
        }
        var series = this._series,
            viewport = new rangeModule.Range,
            axis = series[0].getArgumentAxis(),
            themeManager = this._themeManager,
            negativesAsZeroes = themeManager.getOptions("negativesAsZeroes"),
            negativesAsZeros = themeManager.getOptions("negativesAsZeros");
        series.forEach(function(s) {
            viewport.addRange(s.getArgumentRange())
        });
        axis.getTranslator().updateBusinessRange(viewport);
        series.forEach(function(s) {
            s.createPoints()
        });
        this._seriesFamilies = processSeriesFamilies(series, themeManager.getOptions("equalBarWidth"), themeManager.getOptions("minBubbleSize"), themeManager.getOptions("maxBubbleSize"), {
            barWidth: themeManager.getOptions("barWidth"),
            barGroupPadding: themeManager.getOptions("barGroupPadding"),
            barGroupWidth: themeManager.getOptions("barGroupWidth")
        }, typeUtils.isDefined(negativesAsZeroes) ? negativesAsZeroes : negativesAsZeros)
    },
    adjustSeriesDimensions: function() {
        each(this._seriesFamilies, function(_, family) {
            family.adjustSeriesDimensions()
        })
    },
    getBoundRange: function() {
        var rangeData, rangeYSize, rangeVisibleSizeY, minIndent, maxIndent, that = this,
            valueAxis = that._valueAxis,
            valRange = new rangeModule.Range({
                min: valueAxis.min,
                minVisible: valueAxis.min,
                max: valueAxis.max,
                maxVisible: valueAxis.max,
                axisType: valueAxis.type,
                base: valueAxis.logarithmBase
            }),
            argRange = new rangeModule.Range({});
        each(that._series, function(_, series) {
            rangeData = series.getRangeData();
            valRange.addRange(rangeData.val);
            argRange.addRange(rangeData.arg)
        });
        if (!valRange.isEmpty() && !argRange.isEmpty()) {
            minIndent = valueAxis.inverted ? that._indent.top : that._indent.bottom;
            maxIndent = valueAxis.inverted ? that._indent.bottom : that._indent.top;
            rangeYSize = valRange.max - valRange.min;
            rangeVisibleSizeY = (typeUtils.isNumeric(valRange.maxVisible) ? valRange.maxVisible : valRange.max) - (typeUtils.isNumeric(valRange.minVisible) ? valRange.minVisible : valRange.min);
            if (typeUtils.isDate(valRange.min)) {
                valRange.min = new Date(valRange.min.valueOf() - rangeYSize * minIndent)
            } else {
                valRange.min -= rangeYSize * minIndent
            }
            if (typeUtils.isDate(valRange.max)) {
                valRange.max = new Date(valRange.max.valueOf() + rangeYSize * maxIndent)
            } else {
                valRange.max += rangeYSize * maxIndent
            }
            if (typeUtils.isNumeric(rangeVisibleSizeY)) {
                valRange.maxVisible = valRange.maxVisible ? valRange.maxVisible + rangeVisibleSizeY * maxIndent : void 0;
                valRange.minVisible = valRange.minVisible ? valRange.minVisible - rangeVisibleSizeY * minIndent : void 0
            }
            valRange.invert = valueAxis.inverted
        }
        return {
            arg: argRange,
            val: valRange
        }
    },
    getMarginOptions: function(canvas) {
        var bubbleSize = Math.min(canvas.width, canvas.height) * this._themeManager.getOptions("maxBubbleSize");
        return this._series.reduce(function(marginOptions, series) {
            var seriesOptions = series.getMarginOptions();
            if (true === seriesOptions.processBubbleSize) {
                seriesOptions.size = bubbleSize
            }
            return vizUtils.mergeMarginOptions(marginOptions, seriesOptions)
        }, {})
    },
    getSeries: function() {
        return this._series
    },
    isEmpty: function() {
        return 0 === this.getSeries().length
    },
    isShowChart: function() {
        return !this._hideChart
    },
    getCalculatedValueType: function() {
        var series = this._series[0];
        return series && series.argumentType
    },
    getThemeManager: function() {
        return this._themeManager
    }
};
exports.SeriesDataSource = SeriesDataSource;
