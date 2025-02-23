/**
 * DevExtreme (ui/pivot_grid/remote_store.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _type = require("../../core/utils/type");
var _class = require("../../core/class");
var _class2 = _interopRequireDefault(_class);
var _extend = require("../../core/utils/extend");
var _iterator = require("../../core/utils/iterator");
var _data_source = require("../../data/data_source/data_source");
var _data_source2 = _interopRequireDefault(_data_source);
var _deferred = require("../../core/utils/deferred");
var _uiPivot_grid = require("./ui.pivot_grid.utils");
var _uiPivot_grid2 = _interopRequireDefault(_uiPivot_grid);
var _date_serialization = require("../../core/utils/date_serialization");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function createGroupingOptions(dimensionOptions) {
    var groupingOptions = [];
    (0, _iterator.each)(dimensionOptions, function(index, dimensionOption) {
        groupingOptions.push({
            selector: dimensionOption.dataField,
            groupInterval: dimensionOption.groupInterval,
            isExpanded: index < dimensionOptions.length - 1
        })
    });
    return groupingOptions
}

function getFieldFilterSelector(field) {
    var selector = field.dataField,
        groupInterval = field.groupInterval;
    if ("date" === field.dataType && "string" === typeof groupInterval) {
        if ("quarter" === groupInterval.toLowerCase()) {
            groupInterval = "Month"
        }
        selector = selector + "." + _uiPivot_grid2.default.capitalizeFirstLetter(groupInterval)
    }
    return selector
}

function getIntervalFilterExpression(selector, numericInterval, numericValue, isExcludedFilterType) {
    var startFilterValue = [selector, isExcludedFilterType ? "<" : ">=", numericValue],
        endFilterValue = [selector, isExcludedFilterType ? ">=" : "<", numericValue + numericInterval];
    return [startFilterValue, isExcludedFilterType ? "or" : "and", endFilterValue]
}

function getFilterExpressionForFilterValue(field, filterValue) {
    var selector = getFieldFilterSelector(field),
        isExcludedFilterType = "exclude" === field.filterType,
        expression = [selector, isExcludedFilterType ? "<>" : "=", filterValue];
    if ((0, _type.isDefined)(field.groupInterval)) {
        if ("string" === typeof field.groupInterval && "quarter" === field.groupInterval.toLowerCase()) {
            expression = getIntervalFilterExpression(selector, 3, 3 * (filterValue - 1) + 1, isExcludedFilterType)
        } else {
            if ("number" === typeof field.groupInterval && "date" !== field.dataType) {
                expression = getIntervalFilterExpression(selector, field.groupInterval, filterValue, isExcludedFilterType)
            }
        }
    }
    return expression
}

function createFieldFilterExpressions(field, operation) {
    var fieldFilterExpressions = [];
    if ("exclude" === field.filterType) {
        operation = operation || "and"
    } else {
        operation = operation || "or"
    }(0, _iterator.each)(field.filterValues, function(index, filterValue) {
        var currentExpression = [],
            currentField = field.levels ? field.levels[index] : field;
        if (Array.isArray(filterValue)) {
            var parseLevelsRecursive = field.levels && field.levels.length;
            if (parseLevelsRecursive) {
                currentExpression = createFieldFilterExpressions({
                    filterValues: filterValue,
                    filterType: currentField.filterType,
                    levels: field.levels
                }, "and")
            }
        } else {
            currentExpression = getFilterExpressionForFilterValue(currentField, filterValue)
        }
        if (!currentExpression.length) {
            return
        }
        if (fieldFilterExpressions.length) {
            fieldFilterExpressions.push(operation)
        }
        fieldFilterExpressions.push(currentExpression)
    });
    return fieldFilterExpressions
}

function createFilterExpressions(fields) {
    var filterExpressions = [];
    (0, _iterator.each)(fields, function(_, field) {
        var fieldExpressions = createFieldFilterExpressions(field);
        if (!fieldExpressions.length) {
            return []
        }
        if (filterExpressions.length) {
            filterExpressions.push("and")
        }
        filterExpressions.push(fieldExpressions)
    });
    if (1 === filterExpressions.length) {
        filterExpressions = filterExpressions[0]
    }
    return filterExpressions
}

function mergeFilters(filter1, filter2) {
    var mergedFilter, notEmpty = function(filter) {
        return filter && filter.length
    };
    if (notEmpty(filter1) && notEmpty(filter2)) {
        mergedFilter = [filter1, "and", filter2]
    } else {
        mergedFilter = notEmpty(filter1) ? filter1 : filter2
    }
    return mergedFilter
}

function createLoadOptions(options, externalFilterExpr) {
    var filterExpressions = createFilterExpressions(options.filters),
        groupingOptions = createGroupingOptions(options.rows).concat(createGroupingOptions(options.columns)),
        loadOptions = {
            groupSummary: [],
            totalSummary: [],
            group: groupingOptions.length ? groupingOptions : void 0,
            take: groupingOptions.length ? void 0 : 1
        };
    if (externalFilterExpr) {
        filterExpressions = mergeFilters(filterExpressions, externalFilterExpr)
    }
    if (filterExpressions.length) {
        loadOptions.filter = filterExpressions
    }(0, _iterator.each)(options.values, function(_, value) {
        var summaryOption = {
            selector: value.dataField,
            summaryType: value.summaryType || "count"
        };
        loadOptions.groupSummary.push(summaryOption);
        options.includeTotalSummary && loadOptions.totalSummary.push(summaryOption)
    });
    return loadOptions
}

function forEachGroup(data, callback, level) {
    data = data || [];
    level = level || 0;
    (0, _iterator.each)(data, function(_, group) {
        callback(group, level);
        if (group.items && group.items.length) {
            forEachGroup(group.items, callback, level + 1)
        }
    })
}

function setValue(valuesArray, value, rowIndex, columnIndex, dataIndex) {
    valuesArray[rowIndex] = valuesArray[rowIndex] || [];
    valuesArray[rowIndex][columnIndex] = valuesArray[rowIndex][columnIndex] || [];
    if (!(0, _type.isDefined)(valuesArray[rowIndex][columnIndex][dataIndex])) {
        valuesArray[rowIndex][columnIndex][dataIndex] = value
    }
}

function parseValue(value, field) {
    if (field && "number" === field.dataType && (0, _type.isString)(value)) {
        return Number(value)
    }
    if (field && "date" === field.dataType && !field.groupInterval && !(value instanceof Date)) {
        return (0, _date_serialization.deserializeDate)(value)
    }
    return value
}

function parseResult(data, total, descriptions, result) {
    var rowPath = [],
        columnPath = [],
        rowHash = result.rowHash,
        columnHash = result.columnHash;
    if (total && total.summary) {
        (0, _iterator.each)(total.summary, function(index, summary) {
            setValue(result.values, summary, result.grandTotalRowIndex, result.grandTotalColumnIndex, index)
        })
    }

    function getItem(dataItem, dimensionName, path, level, field) {
        var parentItem, parentItemChildren, item, parentPathValue, dimensionHash = result[dimensionName + "Hash"],
            pathValue = path.slice(0, level + 1).join("/");
        if (void 0 !== dimensionHash[pathValue]) {
            item = dimensionHash[pathValue]
        } else {
            item = {
                value: parseValue(dataItem.key, field),
                index: result[dimensionName + "Index"]++
            };
            parentPathValue = path.slice(0, level).join("/");
            if (level > 0 && void 0 !== dimensionHash[parentPathValue]) {
                parentItem = dimensionHash[parentPathValue];
                parentItemChildren = parentItem.children = parentItem.children || []
            } else {
                parentItemChildren = result[dimensionName + "s"]
            }
            parentItemChildren.push(item);
            dimensionHash[pathValue] = item
        }
        return item
    }
    forEachGroup(data, function(item, level) {
        var columnItem, rowItem, rowLevel = level >= descriptions.rows.length ? descriptions.rows.length : level,
            columnLevel = level >= descriptions.rows.length ? level - descriptions.rows.length : 0;
        if (level >= descriptions.rows.length && columnLevel >= descriptions.columns.length) {
            return
        }
        if (level < descriptions.rows.length) {
            columnPath = []
        }
        if (level >= descriptions.rows.length) {
            columnPath[columnLevel] = item.key + "";
            columnItem = getItem(item, "column", columnPath, columnLevel, descriptions.columns[columnPath.length - 1]);
            rowItem = rowHash[rowPath.slice(0, rowLevel + 1).join("/")]
        } else {
            rowPath[rowLevel] = item.key + "";
            rowItem = getItem(item, "row", rowPath, rowLevel);
            columnItem = columnHash[columnPath.slice(0, columnLevel + 1).join("/")]
        }
        var currentRowIndex = rowItem && rowItem.index || result.grandTotalRowIndex,
            currentColumnIndex = columnItem && columnItem.index || result.grandTotalColumnIndex;
        (0, _iterator.each)(item.summary || [], function(i, summary) {
            setValue(result.values, summary, currentRowIndex, currentColumnIndex, i)
        })
    });
    return result
}

function getFiltersForDimension(fields) {
    return (fields || []).filter(function(f) {
        return f.filterValues && f.filterValues.length
    })
}

function getExpandedIndex(options, axis) {
    if (axis === options.headerName) {
        return options.path.length
    }
    return 0
}

function getFiltersForExpandedDimension(options) {
    return (0, _uiPivot_grid.getFiltersByPath)(options[options.headerName], options.path)
}

function getExpandedPathSliceFilter(options, dimensionName, level, firstCollapsedFieldIndex) {
    var result = [],
        startSliceIndex = level > firstCollapsedFieldIndex ? 0 : firstCollapsedFieldIndex,
        fields = options.headerName !== dimensionName ? options[dimensionName].slice(startSliceIndex, level) : [],
        paths = "rows" === dimensionName ? options.rowExpandedPaths : options.columnExpandedPaths;
    (0, _iterator.each)(fields, function(index, field) {
        var filterValues = [];
        (0, _iterator.each)(paths, function(_, path) {
            path = path.slice(startSliceIndex, level);
            if (index < path.length) {
                filterValues.push(path[index])
            }
        });
        if (filterValues.length) {
            result.push((0, _extend.extend)({}, field, {
                filterType: "include",
                filterValues: filterValues
            }))
        }
    });
    return result
}

function getGrandTotalRequest(options, dimensionName, expandedIndex, expandedLevel, commonFilters, firstCollapsedFieldIndex) {
    var newOptions, expandedPaths = ("columns" === dimensionName ? options.columnExpandedPaths : options.rowExpandedPaths) || [],
        oppositeDimensionName = "columns" === dimensionName ? "rows" : "columns",
        fields = options[dimensionName],
        result = [];
    if (expandedPaths.length) {
        for (var i = expandedIndex; i < expandedLevel + 1; i++) {
            newOptions = {
                filters: commonFilters.concat(getExpandedPathSliceFilter(options, dimensionName, i, firstCollapsedFieldIndex))
            };
            newOptions[dimensionName] = fields.slice(expandedIndex, i + 1);
            newOptions[oppositeDimensionName] = [];
            if (i === expandedLevel) {
                newOptions.includeTotalSummary = true
            }
            result.push((0, _extend.extend)({}, options, newOptions))
        }
    } else {
        newOptions = {
            filters: commonFilters,
            includeTotalSummary: true
        };
        newOptions[dimensionName] = fields.slice(expandedIndex, expandedLevel + 1);
        newOptions[oppositeDimensionName] = [];
        result.push((0, _extend.extend)({}, options, newOptions))
    }
    return result
}

function getFirstCollapsedIndex(fields) {
    var firstCollapsedIndex = 0;
    (0, _iterator.each)(fields, function(index, field) {
        if (!field.expanded) {
            firstCollapsedIndex = index;
            return false
        }
    });
    return firstCollapsedIndex
}

function getRequestsData(options) {
    var columnTotalsOptions, rowExpandedLevel = _uiPivot_grid2.default.getExpandedLevel(options, "rows"),
        columnExpandedLevel = _uiPivot_grid2.default.getExpandedLevel(options, "columns"),
        filters = options.filters || [],
        columnExpandedIndex = getExpandedIndex(options, "columns"),
        firstCollapsedColumnIndex = getFirstCollapsedIndex(options.columns),
        firstCollapsedRowIndex = getFirstCollapsedIndex(options.rows),
        rowExpandedIndex = getExpandedIndex(options, "rows"),
        data = [];
    filters = filters.concat(getFiltersForDimension(options.rows)).concat(getFiltersForDimension(options.columns)).concat(getFiltersForExpandedDimension(options));
    columnTotalsOptions = getGrandTotalRequest(options, "columns", columnExpandedIndex, columnExpandedLevel, filters, firstCollapsedColumnIndex);
    if (options.rows.length && options.columns.length) {
        if (!options.headerName) {
            data = data.concat(columnTotalsOptions)
        }
        for (var i = rowExpandedIndex; i < rowExpandedLevel + 1; i++) {
            var rows = options.rows.slice(rowExpandedIndex, i + 1),
                rowFilterByExpandedPaths = getExpandedPathSliceFilter(options, "rows", i, firstCollapsedRowIndex);
            for (var j = columnExpandedIndex; j < columnExpandedLevel + 1; j++) {
                var preparedOptions = (0, _extend.extend)({}, options, {
                    columns: options.columns.slice(columnExpandedIndex, j + 1),
                    rows: rows,
                    filters: filters.concat(getExpandedPathSliceFilter(options, "columns", j, firstCollapsedColumnIndex)).concat(rowFilterByExpandedPaths)
                });
                data.push(preparedOptions)
            }
        }
    } else {
        data = options.columns.length ? columnTotalsOptions : getGrandTotalRequest(options, "rows", rowExpandedIndex, rowExpandedLevel, filters, firstCollapsedRowIndex)
    }
    return data
}

function prepareFields(fields) {
    (0, _iterator.each)(fields || [], function(_, field) {
        var levels = field.levels;
        if (levels) {
            prepareFields(levels)
        }
        _uiPivot_grid2.default.setDefaultFieldValueFormatting(field)
    })
}
module.exports = _class2.default.inherit(function() {
    return {
        ctor: function(options) {
            this._dataSource = new _data_source2.default.DataSource(options);
            this._store = this._dataSource.store()
        },
        getFields: function(fields) {
            var d = new _deferred.Deferred;
            this._store.load({
                skip: 0,
                take: 20
            }).done(function(data) {
                d.resolve(_uiPivot_grid2.default.discoverObjectFields(data, fields))
            }).fail(d.reject);
            return d
        },
        key: function() {
            return this._store.key()
        },
        load: function(options) {
            var that = this,
                d = new _deferred.Deferred,
                result = {
                    rows: [],
                    columns: [],
                    values: [
                        [
                            []
                        ]
                    ],
                    grandTotalRowIndex: 0,
                    grandTotalColumnIndex: 0,
                    rowHash: {},
                    columnHash: {},
                    rowIndex: 1,
                    columnIndex: 1
                },
                requestsData = getRequestsData(options),
                deferreds = [];
            prepareFields(options.rows);
            prepareFields(options.columns);
            prepareFields(options.filters);
            (0, _iterator.each)(requestsData, function(_, dataItem) {
                deferreds.push(that._store.load(createLoadOptions(dataItem, that.filter())))
            });
            _deferred.when.apply(null, deferreds).done(function() {
                var args = deferreds.length > 1 ? arguments : [arguments];
                (0, _iterator.each)(args, function(index, argument) {
                    parseResult(argument[0], argument[1], requestsData[index], result)
                });
                d.resolve({
                    rows: result.rows,
                    columns: result.columns,
                    values: result.values,
                    grandTotalRowIndex: result.grandTotalRowIndex,
                    grandTotalColumnIndex: result.grandTotalColumnIndex
                })
            }).fail(d.reject);
            return d
        },
        filter: function() {
            return this._dataSource.filter.apply(this._dataSource, arguments)
        },
        supportSorting: function() {
            return false
        },
        createDrillDownDataSource: function(loadOptions, params) {
            loadOptions = loadOptions || {};
            params = params || {};
            var store = this._store,
                filters = (0, _uiPivot_grid.getFiltersByPath)(loadOptions.rows, params.rowPath).concat((0, _uiPivot_grid.getFiltersByPath)(loadOptions.columns, params.columnPath)).concat(getFiltersForDimension(loadOptions.rows)).concat(loadOptions.filters || []).concat(getFiltersForDimension(loadOptions.columns)),
                filterExp = createFilterExpressions(filters);
            return new _data_source2.default.DataSource({
                load: function(loadOptions) {
                    return store.load((0, _extend.extend)({}, loadOptions, {
                        filter: mergeFilters(filterExp, loadOptions.filter),
                        select: params.customColumns
                    }))
                }
            })
        }
    }
}());
