/**
 * DevExtreme (ui/pivot_grid/ui.pivot_grid.chart_integration.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    extend = require("../../core/utils/extend").extend,
    pivotUtils = require("./ui.pivot_grid.utils"),
    each = require("../../core/utils/iterator").each,
    foreachTree = pivotUtils.foreachTree,
    FORMAT_DICTIONARY = {
        number: "numeric",
        date: "datetime"
    },
    UNBIND_KEY = "dxPivotGridUnbinding";

function getFormattedValue(path, fields) {
    var value = [],
        lastFieldIndex = fields.length - 1;
    each(path, function(i, item) {
        value.push(item.text || pivotUtils.formatValue(item.value, fields[lastFieldIndex - i]))
    });
    return value.reverse()
}

function getExpandedLevel(node) {
    var level = 0;
    foreachTree(node, function(members) {
        level = Math.max(level, members.length - 1)
    });
    return level
}

function processDataCell(processCellArgs, processCell) {
    var chartDataItem = processCellArgs.chartDataItem,
        processedCell = processCell && processCell(processCellArgs);
    if (processedCell) {
        chartDataItem = extend({}, chartDataItem, processedCell.chartDataItem);
        processedCell = extend({}, processCellArgs, processedCell, {
            chartDataItem: chartDataItem
        });
        return processedCell
    }
    return processCellArgs
}

function createChartDataSource(pivotGridDataSource, mapOptions, axisDictionary) {
    var measureIndex, dataField, rowMemberIndex, rowVisibility, rowPathFormatted, rowPath, columnMemberIndex, columnVisibility, columnPath, columnPathFormatted, data = pivotGridDataSource.getData(),
        dataSource = [],
        dataFields = pivotGridDataSource.getAreaFields("data"),
        rowFields = pivotGridDataSource.getAreaFields("row"),
        columnFields = pivotGridDataSource.getAreaFields("column"),
        columnElements = [{
            index: data.grandTotalColumnIndex,
            children: data.columns
        }],
        rowElements = [{
            index: data.grandTotalRowIndex,
            children: data.rows
        }],
        rowLevel = getExpandedLevel(rowElements),
        columnLevel = getExpandedLevel(columnElements);

    function createDataItem() {
        var axis, dataCell = (data.values[rowMemberIndex] || [])[columnMemberIndex] || [],
            value = dataCell[measureIndex],
            processCellArgs = {
                rowPath: rowPath,
                maxRowLevel: rowLevel,
                rowPathFormatted: rowPathFormatted,
                rowFields: rowFields,
                columnPathFormatted: columnPathFormatted,
                maxColumnLevel: columnLevel,
                columnPath: columnPath,
                columnFields: columnFields,
                dataFields: dataFields,
                dataIndex: measureIndex,
                dataValues: dataCell,
                visible: columnVisibility && rowVisibility
            },
            seriesName = (mapOptions.inverted ? columnPathFormatted : rowPathFormatted).join(" - "),
            argument = (mapOptions.inverted ? rowPathFormatted : columnPathFormatted).join("/");
        if (dataFields.length > 1) {
            if ("args" === mapOptions.putDataFieldsInto || "both" === mapOptions.putDataFieldsInto) {
                argument += " | " + dataField.caption
            }
            if ("args" !== mapOptions.putDataFieldsInto) {
                seriesName += " | " + dataField.caption;
                if ("singleAxis" !== mapOptions.dataFieldsDisplayMode) {
                    axis = dataField.caption
                }
            }
        }
        processCellArgs.chartDataItem = {
            val: void 0 === value ? null : value,
            series: seriesName,
            arg: argument
        };
        processCellArgs = processDataCell(processCellArgs, mapOptions.processCell);
        if (processCellArgs.visible) {
            axisDictionary[processCellArgs.chartDataItem.series] = axisDictionary[processCellArgs.chartDataItem.series] || axis;
            dataSource.push(processCellArgs.chartDataItem)
        }
    }

    function foreachRowColumn(callBack) {
        foreachTree(rowElements, function(rowMembers) {
            rowMemberIndex = rowMembers[0].index;
            rowMembers = rowMembers.slice(0, rowMembers.length - 1);
            rowVisibility = rowLevel === rowMembers.length;
            rowPath = pivotUtils.createPath(rowMembers);
            rowPathFormatted = getFormattedValue(rowMembers, rowFields);
            if (0 === rowPath.length) {
                rowPathFormatted = [mapOptions.grandTotalText]
            }
            foreachTree(columnElements, function(columnMembers) {
                columnMemberIndex = columnMembers[0].index;
                columnMembers = columnMembers.slice(0, columnMembers.length - 1);
                columnVisibility = columnLevel === columnMembers.length;
                columnPath = pivotUtils.createPath(columnMembers);
                columnPathFormatted = getFormattedValue(columnMembers, columnFields);
                if (0 === columnPath.length) {
                    columnPathFormatted = [mapOptions.grandTotalText]
                }
                callBack()
            })
        })
    }

    function foreachDataField(callback) {
        each(dataFields, function(index, field) {
            dataField = field;
            measureIndex = index;
            callback()
        })
    }
    if (false === mapOptions.alternateDataFields) {
        foreachDataField(function() {
            foreachRowColumn(createDataItem)
        })
    } else {
        foreachRowColumn(function() {
            foreachDataField(createDataItem)
        })
    }
    return dataSource
}

function createValueAxisOptions(dataSource, options) {
    var dataFields = dataSource.getAreaFields("data");
    if ("args" !== options.putDataFieldsInto && "singleAxis" !== options.dataFieldsDisplayMode || 1 === dataFields.length) {
        var valueAxisSettings = [];
        each(dataFields, function(_, dataField) {
            var valueAxisOptions = {
                name: dataField.caption,
                title: dataField.caption,
                valueType: FORMAT_DICTIONARY[dataField.dataType] || dataField.dataType,
                label: {
                    format: dataField.format
                }
            };
            if (dataField.customizeText) {
                valueAxisOptions.label.customizeText = function(formatObject) {
                    return dataField.customizeText.call(dataField, formatObject)
                }
            }
            if ("splitPanes" === options.dataFieldsDisplayMode) {
                valueAxisOptions.pane = dataField.caption
            }
            valueAxisSettings.push(valueAxisOptions)
        });
        return valueAxisSettings
    }
    return [{}]
}

function createPanesOptions(dataSource, options) {
    var panes = [];
    var dataFields = dataSource.getAreaFields("data");
    if (dataFields.length > 1 && "splitPanes" === options.dataFieldsDisplayMode && "args" !== options.putDataFieldsInto) {
        each(dataFields, function(_, dataField) {
            panes.push({
                name: dataField.caption
            })
        })
    }
    if (!panes.length) {
        panes.push({})
    }
    return panes
}

function createChartOptions(dataSource, options) {
    var _customizeSeries = options.customizeSeries,
        customizeChart = options.customizeChart,
        chartOptions = {
            valueAxis: createValueAxisOptions(dataSource, options),
            panes: createPanesOptions(dataSource, options)
        },
        axisDictionary = {};
    if (customizeChart) {
        chartOptions = extend(true, {}, chartOptions, customizeChart(chartOptions))
    }
    chartOptions.dataSource = createChartDataSource(dataSource, options, axisDictionary);
    chartOptions.seriesTemplate = {
        nameField: "series",
        customizeSeries: function(seriesName) {
            var seriesOptions = {};
            if ("splitPanes" === options.dataFieldsDisplayMode) {
                seriesOptions.pane = axisDictionary[seriesName]
            } else {
                if ("singleAxis" !== options.dataFieldsDisplayMode) {
                    seriesOptions.axis = axisDictionary[seriesName]
                }
            }
            if (_customizeSeries) {
                seriesOptions = extend(seriesOptions, _customizeSeries(seriesName, seriesOptions))
            }
            return seriesOptions
        }
    };
    return chartOptions
}

function getChartInstance(chartElement) {
    if (!chartElement) {
        return false
    }
    if (chartElement.NAME) {
        return "dxChart" === chartElement.NAME && chartElement
    }
    var element = $(chartElement);
    return element.data("dxChart") && element.dxChart("instance")
}

function removeBinding(chart) {
    var unbind = chart.$element().data(UNBIND_KEY);
    unbind && unbind()
}
module.exports = {
    bindChart: function(chart, integrationOptions) {
        integrationOptions = extend({}, integrationOptions);
        var disposeBinding, that = this,
            updateChart = function() {
                integrationOptions.grandTotalText = that.option("texts.grandTotal");
                var chartOptions = createChartOptions(that.getDataSource(), integrationOptions);
                chart.option(chartOptions)
            };
        chart = getChartInstance(chart);
        if (!chart) {
            return null
        }
        removeBinding(chart);
        that.on("changed", updateChart);
        updateChart();
        disposeBinding = function() {
            chart.$element().removeData(UNBIND_KEY);
            that.off("changed", updateChart)
        };
        chart.on("disposing", disposeBinding);
        this.on("disposing", disposeBinding);
        chart.$element().data(UNBIND_KEY, disposeBinding);
        return disposeBinding
    }
};
