/**
 * DevExtreme (viz/chart_components/advanced_chart.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var extend = require("../../core/utils/extend").extend,
    inArray = require("../../core/utils/array").inArray,
    iteratorModule = require("../../core/utils/iterator"),
    rangeModule = require("../translators/range"),
    DEFAULT_AXIS_NAME = "defaultAxisName",
    axisModule = require("../axes/base_axis"),
    seriesFamilyModule = require("../core/series_family"),
    BaseChart = require("./base_chart").BaseChart,
    crosshairModule = require("./crosshair"),
    _isArray = Array.isArray,
    _isDefined = require("../../core/utils/type").isDefined,
    _each = iteratorModule.each,
    _reverseEach = iteratorModule.reverseEach,
    _noop = require("../../core/utils/common").noop,
    _extend = extend,
    vizUtils = require("../core/utils"),
    _map = vizUtils.map,
    mergeMarginOptions = vizUtils.mergeMarginOptions;

function prepareAxis(axisOptions) {
    return _isArray(axisOptions) ? 0 === axisOptions.length ? [{}] : axisOptions : [axisOptions]
}

function processBubbleMargin(opt, bubbleSize) {
    if (opt.processBubbleSize) {
        opt.size = bubbleSize
    }
    return opt
}

function estimateBubbleSize(size, panesCount, maxSize, rotated) {
    var width = rotated ? size.width / panesCount : size.width,
        height = rotated ? size.height : size.height / panesCount;
    return Math.min(width, height) * maxSize
}
var AdvancedChart = BaseChart.inherit({
    _setDeprecatedOptions: function() {
        this.callBase.apply(this, arguments);
        _extend(this._deprecatedOptions, {
            barWidth: {
                since: "18.1",
                message: "Use the 'commonSeriesSettings.barPadding' or 'series.barPadding' option instead"
            },
            equalBarWidth: {
                since: "18.1",
                message: "Use the 'commonSeriesSettings.ignoreEmptyPoints' or 'series.ignoreEmptyPoints' option instead"
            }
        })
    },
    _dispose: function() {
        var that = this,
            disposeObjectsInArray = this._disposeObjectsInArray;
        that.callBase();
        that.panes = null;
        if (that._legend) {
            that._legend.dispose();
            that._legend = null
        }
        disposeObjectsInArray.call(that, "panesBackground");
        disposeObjectsInArray.call(that, "seriesFamilies");
        that._disposeAxes()
    },
    _reinitAxes: function() {
        this.panes = this._createPanes();
        this._populateAxes();
        this._axesReinitialized = true
    },
    _getCrosshairMargins: function() {
        var crosshairOptions = this._getCrosshairOptions() || {},
            crosshairEnabled = crosshairOptions.enabled,
            margins = crosshairModule.getMargins();
        return {
            x: crosshairEnabled && crosshairOptions.horizontalLine.visible ? margins.x : 0,
            y: crosshairEnabled && crosshairOptions.verticalLine.visible ? margins.y : 0
        }
    },
    _populateAxes: function() {
        var that = this;
        var panes = that.panes;
        var rotated = that._isRotated();
        var argumentAxesOptions = prepareAxis(that.option("argumentAxis") || {})[0];
        var valueAxisOption = that.option("valueAxis");
        var valueAxesOptions = prepareAxis(valueAxisOption || {});
        var argumentAxesPopulatedOptions = [];
        var valueAxesPopulatedOptions = [];
        var axisNames = [];
        var valueAxesCounter = 0;
        var paneWithNonVirtualAxis = void 0;
        var crosshairMargins = that._getCrosshairMargins();

        function getNextAxisName() {
            return DEFAULT_AXIS_NAME + valueAxesCounter++
        }
        if (rotated) {
            paneWithNonVirtualAxis = "right" === argumentAxesOptions.position ? panes[panes.length - 1].name : panes[0].name
        } else {
            paneWithNonVirtualAxis = "top" === argumentAxesOptions.position ? panes[0].name : panes[panes.length - 1].name
        }
        argumentAxesPopulatedOptions = _map(panes, function(pane) {
            var virtual = pane.name !== paneWithNonVirtualAxis;
            return that._populateAxesOptions("argumentAxis", argumentAxesOptions, {
                pane: pane.name,
                name: null,
                optionPath: "argumentAxis",
                crosshairMargin: rotated ? crosshairMargins.x : crosshairMargins.y
            }, rotated, virtual)
        });
        _each(valueAxesOptions, function(priority, axisOptions) {
            var axisPanes = [],
                name = axisOptions.name;
            if (name && inArray(name, axisNames) !== -1) {
                that._incidentOccurred("E2102");
                return
            }
            name && axisNames.push(name);
            if (axisOptions.pane) {
                axisPanes.push(axisOptions.pane)
            }
            if (axisOptions.panes && axisOptions.panes.length) {
                axisPanes = axisPanes.concat(axisOptions.panes.slice(0))
            }
            axisPanes = vizUtils.unique(axisPanes);
            if (!axisPanes.length) {
                axisPanes.push(void 0)
            }
            _each(axisPanes, function(_, pane) {
                var optionPath = _isArray(valueAxisOption) ? "valueAxis[" + priority + "]" : "valueAxis";
                valueAxesPopulatedOptions.push(that._populateAxesOptions("valueAxis", axisOptions, {
                    name: name || getNextAxisName(),
                    pane: pane,
                    priority: priority,
                    optionPath: optionPath,
                    crosshairMargin: rotated ? crosshairMargins.y : crosshairMargins.x
                }, rotated))
            })
        });
        that._redesignAxes(argumentAxesPopulatedOptions, true, paneWithNonVirtualAxis);
        that._redesignAxes(valueAxesPopulatedOptions, false)
    },
    _redesignAxes: function(options, isArgumentAxes, paneWithNonVirtualAxis) {
        var that = this;
        var axesBasis = [];
        var axes = isArgumentAxes ? that._argumentAxes : that._valueAxes;
        _each(options, function(_, opt) {
            var curAxes = axes && axes.filter(function(a) {
                return a.name === opt.name && (!_isDefined(opt.pane) && that.panes.some(function(p) {
                    return p.name === a.pane
                }) || a.pane === opt.pane)
            });
            if (curAxes && curAxes.length > 0) {
                _each(curAxes, function(_, axis) {
                    axis.updateOptions(opt);
                    axesBasis.push({
                        axis: axis
                    })
                })
            } else {
                axesBasis.push({
                    options: opt
                })
            }
        });
        if (axes) {
            _reverseEach(axes, function(index, axis) {
                if (!axesBasis.some(function(basis) {
                        return basis.axis && basis.axis === axis
                    })) {
                    that._disposeAxis(index, isArgumentAxes)
                }
            })
        } else {
            if (isArgumentAxes) {
                axes = that._argumentAxes = []
            } else {
                axes = that._valueAxes = []
            }
        }
        _each(axesBasis, function(index, basis) {
            var axis = basis.axis;
            if (basis.axis && isArgumentAxes) {
                basis.axis.isVirtual = basis.axis.pane !== paneWithNonVirtualAxis
            } else {
                if (basis.options) {
                    axis = that._createAxis(isArgumentAxes, basis.options, isArgumentAxes ? basis.options.pane !== paneWithNonVirtualAxis : void 0, isArgumentAxes ? index : void 0);
                    axes.push(axis)
                }
            }
            axis.applyVisualRangeSetter(that._getVisualRangeSetter())
        })
    },
    _disposeAxis: function(index, isArgumentAxis) {
        var axes = isArgumentAxis ? this._argumentAxes : this._valueAxes;
        var axis = axes[index];
        if (!axis) {
            return
        }
        axis.dispose();
        axes.splice(index, 1)
    },
    _prepareStackPoints: function(singleSeries, stackPoints) {
        var points = singleSeries.getPoints(),
            stackName = singleSeries.getStackName();
        _each(points, function(_, point) {
            var argument = point.argument;
            if (!stackPoints[argument]) {
                stackPoints[argument] = {};
                stackPoints[argument][null] = []
            }
            if (stackName && !_isArray(stackPoints[argument][stackName])) {
                stackPoints[argument][stackName] = [];
                _each(stackPoints[argument][null], function(_, point) {
                    if (!point.stackName) {
                        stackPoints[argument][stackName].push(point)
                    }
                })
            }
            if (stackName) {
                stackPoints[argument][stackName].push(point);
                stackPoints[argument][null].push(point)
            } else {
                _each(stackPoints[argument], function(_, stack) {
                    stack.push(point)
                })
            }
            point.stackPoints = stackPoints[argument][stackName];
            point.stackName = stackName
        })
    },
    _resetStackPoints: function(singleSeries) {
        _each(singleSeries.getPoints(), function(_, point) {
            point.stackPoints = null;
            point.stackName = null
        })
    },
    _disposeAxes: function() {
        var that = this,
            disposeObjectsInArray = that._disposeObjectsInArray;
        disposeObjectsInArray.call(that, "_argumentAxes");
        disposeObjectsInArray.call(that, "_valueAxes")
    },
    _appendAdditionalSeriesGroups: function() {
        this._crosshairCursorGroup.linkAppend();
        this._scrollBar && this._scrollBarGroup.linkAppend()
    },
    _getLegendTargets: function() {
        var that = this;
        return _map(that.series, function(item) {
            if (item.getOptions().showInLegend) {
                return that._getLegendOptions(item)
            }
            return null
        })
    },
    _legendItemTextField: "name",
    _seriesPopulatedHandlerCore: function() {
        this._processSeriesFamilies();
        this._processValueAxisFormat()
    },
    _renderTrackers: function() {
        var i, that = this;
        for (i = 0; i < that.series.length; ++i) {
            that.series[i].drawTrackers()
        }
    },
    _specialProcessSeries: function() {
        this._processSeriesFamilies()
    },
    _processSeriesFamilies: function() {
        var paneSeries, that = this,
            types = [],
            families = [],
            themeManager = that._themeManager,
            negativesAsZeroes = themeManager.getOptions("negativesAsZeroes"),
            negativesAsZeros = themeManager.getOptions("negativesAsZeros"),
            familyOptions = {
                equalBarWidth: themeManager.getOptions("equalBarWidth"),
                minBubbleSize: themeManager.getOptions("minBubbleSize"),
                maxBubbleSize: themeManager.getOptions("maxBubbleSize"),
                barWidth: themeManager.getOptions("barWidth"),
                barGroupPadding: themeManager.getOptions("barGroupPadding"),
                barGroupWidth: themeManager.getOptions("barGroupWidth"),
                negativesAsZeroes: _isDefined(negativesAsZeroes) ? negativesAsZeroes : negativesAsZeros
            };
        if (that.seriesFamilies && that.seriesFamilies.length) {
            _each(that.seriesFamilies, function(_, family) {
                family.updateOptions(familyOptions);
                family.adjustSeriesValues()
            });
            return
        }
        _each(that.series, function(_, item) {
            if (inArray(item.type, types) === -1) {
                types.push(item.type)
            }
        });
        _each(that._getLayoutTargets(), function(_, pane) {
            paneSeries = that._getSeriesForPane(pane.name);
            _each(types, function(_, type) {
                var family = new seriesFamilyModule.SeriesFamily({
                    type: type,
                    pane: pane.name,
                    equalBarWidth: familyOptions.equalBarWidth,
                    minBubbleSize: familyOptions.minBubbleSize,
                    maxBubbleSize: familyOptions.maxBubbleSize,
                    barWidth: familyOptions.barWidth,
                    barGroupPadding: familyOptions.barGroupPadding,
                    barGroupWidth: familyOptions.barGroupWidth,
                    negativesAsZeroes: familyOptions.negativesAsZeroes,
                    rotated: that._isRotated()
                });
                family.add(paneSeries);
                family.adjustSeriesValues();
                families.push(family)
            })
        });
        that.seriesFamilies = families
    },
    _updateSeriesDimensions: function() {
        var i, that = this,
            seriesFamilies = that.seriesFamilies || [];
        for (i = 0; i < seriesFamilies.length; i++) {
            var family = seriesFamilies[i];
            family.updateSeriesValues();
            family.adjustSeriesDimensions()
        }
    },
    _getLegendCallBack: function(series) {
        return this._legend && this._legend.getActionCallback(series)
    },
    _appendAxesGroups: function() {
        var that = this;
        that._stripsGroup.linkAppend();
        that._gridGroup.linkAppend();
        that._axesGroup.linkAppend();
        that._constantLinesGroup.linkAppend();
        that._labelAxesGroup.linkAppend();
        that._scaleBreaksGroup.linkAppend()
    },
    _populateMarginOptions: function() {
        var that = this;
        var bubbleSize = estimateBubbleSize(that.getSize(), that.panes.length, that._themeManager.getOptions("maxBubbleSize"), that._isRotated());
        var argumentMarginOptions = {};
        that._valueAxes.forEach(function(valueAxis) {
            var groupSeries = that.series.filter(function(series) {
                return series.getValueAxis() === valueAxis
            });
            var marginOptions = {};
            groupSeries.forEach(function(series) {
                if (series.isVisible()) {
                    var seriesMarginOptions = processBubbleMargin(series.getMarginOptions(), bubbleSize);
                    marginOptions = mergeMarginOptions(marginOptions, seriesMarginOptions);
                    argumentMarginOptions = mergeMarginOptions(argumentMarginOptions, seriesMarginOptions)
                }
            });
            valueAxis.setMarginOptions(marginOptions)
        });
        that._argumentAxes.forEach(function(a) {
            return a.setMarginOptions(argumentMarginOptions)
        })
    },
    _populateBusinessRange: function(updatedAxis) {
        var that = this;
        var rotated = that._isRotated();
        var argRange = new rangeModule.Range({
            rotated: !!rotated
        });
        var series = that._getVisibleSeries();
        that._valueAxes.forEach(function(valueAxis) {
            var groupRange = new rangeModule.Range({
                    rotated: !!rotated,
                    pane: valueAxis.pane,
                    axis: valueAxis.name
                }),
                groupSeries = series.filter(function(series) {
                    return series.getValueAxis() === valueAxis
                });
            groupSeries.forEach(function(series) {
                var seriesRange = series.getRangeData();
                groupRange.addRange(seriesRange.val);
                argRange.addRange(seriesRange.arg)
            });
            if (!updatedAxis || updatedAxis && groupSeries.length && valueAxis === updatedAxis) {
                valueAxis.setGroupSeries(groupSeries);
                valueAxis.setBusinessRange(groupRange, that._axesReinitialized, that._argumentAxes[0]._lastVisualRangeUpdateMode)
            }
        });
        if (!updatedAxis || updatedAxis && series.length) {
            that._argumentAxes.forEach(function(a) {
                return a.setBusinessRange(argRange, that._axesReinitialized)
            })
        }
        that._populateMarginOptions()
    },
    getArgumentAxis: function() {
        return (this._argumentAxes || []).filter(function(a) {
            return !a.isVirtual
        })[0]
    },
    getValueAxis: function(name) {
        var _this = this;
        return (this._valueAxes || []).filter(_isDefined(name) ? function(a) {
            return a.name === name
        } : function(a) {
            return a.pane === _this.defaultPane
        })[0]
    },
    _getGroupsData: function() {
        var that = this,
            groups = [];
        that._valueAxes.forEach(function(axis) {
            groups.push({
                series: that.series.filter(function(series) {
                    return series.getValueAxis() === axis
                }),
                valueAxis: axis,
                valueOptions: axis.getOptions()
            })
        });
        return {
            groups: groups,
            argumentAxes: that._argumentAxes,
            argumentOptions: that._argumentAxes[0].getOptions()
        }
    },
    _groupSeries: function() {
        var that = this;
        that._correctValueAxes(false);
        that._groupsData = that._getGroupsData()
    },
    _processValueAxisFormat: function() {
        var axesWithFullStackedFormat = [];
        this.series.forEach(function(series) {
            var axis = series.getValueAxis();
            if (series.isFullStackedSeries()) {
                axis.setPercentLabelFormat();
                axesWithFullStackedFormat.push(axis)
            }
        });
        this._valueAxes.forEach(function(axis) {
            if (axesWithFullStackedFormat.indexOf(axis) === -1) {
                axis.resetAutoLabelFormat()
            }
        })
    },
    _populateAxesOptions: function(typeSelector, userOptions, axisOptions, rotated, virtual) {
        var that = this;
        var preparedUserOptions = that._prepareStripsAndConstantLines(typeSelector, userOptions, rotated);
        var options = _extend(true, {}, preparedUserOptions, axisOptions, that._prepareAxisOptions(typeSelector, preparedUserOptions, rotated));
        if (virtual) {
            options.visible = options.tick.visible = options.minorTick.visible = options.label.visible = false;
            options.title = {}
        }
        return options
    },
    _createAxis: function(isArgumentAxes, options, virtual, index) {
        var that = this;
        var typeSelector = isArgumentAxes ? "argumentAxis" : "valueAxis";
        var renderingSettings = _extend({
            renderer: that._renderer,
            incidentOccurred: that._incidentOccurred,
            eventTrigger: that._eventTrigger,
            axisClass: isArgumentAxes ? "arg" : "val",
            widgetClass: "dxc",
            stripsGroup: that._stripsGroup,
            labelAxesGroup: that._labelAxesGroup,
            constantLinesGroup: that._constantLinesGroup,
            scaleBreaksGroup: that._scaleBreaksGroup,
            axesContainerGroup: that._axesGroup,
            gridGroup: that._gridGroup,
            isArgumentAxis: isArgumentAxes
        }, that._getAxisRenderingOptions(typeSelector));
        var axis = new axisModule.Axis(renderingSettings);
        axis.updateOptions(options);
        axis.isVirtual = virtual;
        return axis
    },
    _getVisualRangeSetter: _noop,
    _getTrackerSettings: function() {
        return _extend(this.callBase(), {
            argumentAxis: this.getArgumentAxis()
        })
    },
    _prepareStripsAndConstantLines: function(typeSelector, userOptions, rotated) {
        userOptions = this._themeManager.getOptions(typeSelector, userOptions, rotated);
        if (userOptions.strips) {
            _each(userOptions.strips, function(i) {
                userOptions.strips[i] = _extend(true, {}, userOptions.stripStyle, userOptions.strips[i])
            })
        }
        if (userOptions.constantLines) {
            _each(userOptions.constantLines, function(i, line) {
                userOptions.constantLines[i] = _extend(true, {}, userOptions.constantLineStyle, line)
            })
        }
        return userOptions
    },
    _legendDataField: "series",
    _adjustSeriesLabels: _noop,
    _correctValueAxes: _noop,
    refresh: function() {
        this._disposeAxes();
        this.callBase()
    },
    _notify: function() {
        this._axesReinitialized = false
    }
});
exports.AdvancedChart = AdvancedChart;
