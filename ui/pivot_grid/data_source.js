/**
 * DevExtreme (ui/pivot_grid/data_source.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var DataSourceModule = require("../../data/data_source/data_source"),
    Store = require("../../data/abstract_store"),
    commonUtils = require("../../core/utils/common"),
    typeUtils = require("../../core/utils/type"),
    extend = require("../../core/utils/extend").extend,
    inArray = require("../../core/utils/array").inArray,
    iteratorUtils = require("../../core/utils/iterator"),
    isDefined = typeUtils.isDefined,
    each = iteratorUtils.each,
    deferredUtils = require("../../core/utils/deferred"),
    when = deferredUtils.when,
    Deferred = deferredUtils.Deferred,
    Class = require("../../core/class"),
    EventsMixin = require("../../core/events_mixin"),
    inflector = require("../../core/utils/inflector"),
    normalizeIndexes = require("../../core/utils/array").normalizeIndexes,
    localStore = require("./local_store"),
    RemoteStore = require("./remote_store"),
    xmlaStore = require("./xmla_store/xmla_store"),
    summaryDisplayModes = require("./ui.pivot_grid.summary_display_modes"),
    pivotGridUtils = require("./ui.pivot_grid.utils"),
    foreachTree = pivotGridUtils.foreachTree,
    foreachTreeAsync = pivotGridUtils.foreachTreeAsync,
    findField = pivotGridUtils.findField,
    formatValue = pivotGridUtils.formatValue,
    getCompareFunction = pivotGridUtils.getCompareFunction,
    createPath = pivotGridUtils.createPath,
    foreachDataLevel = pivotGridUtils.foreachDataLevel,
    setFieldProperty = pivotGridUtils.setFieldProperty,
    DESCRIPTION_NAME_BY_AREA = {
        row: "rows",
        column: "columns",
        data: "values",
        filter: "filters"
    },
    STATE_PROPERTIES = ["area", "areaIndex", "sortOrder", "filterType", "filterValues", "sortBy", "sortBySummaryField", "sortBySummaryPath", "expanded", "summaryType", "summaryDisplayMode"],
    CALCULATED_PROPERTIES = ["format", "selector", "customizeText", "caption"],
    ALL_CALCULATED_PROPERTIES = CALCULATED_PROPERTIES.concat(["allowSorting", "allowSortingBySummary", "allowFiltering", "allowExpandAll"]);

function createCaption(field) {
    var caption = field.dataField || field.groupName || "",
        summaryType = (field.summaryType || "").toLowerCase();
    if (typeUtils.isString(field.groupInterval)) {
        caption += "_" + field.groupInterval
    }
    if (summaryType && "custom" !== summaryType) {
        summaryType = summaryType.replace(/^./, summaryType[0].toUpperCase());
        if (caption.length) {
            summaryType = " (" + summaryType + ")"
        }
    } else {
        summaryType = ""
    }
    return inflector.titleize(caption) + summaryType
}

function resetFieldState(field, properties) {
    var initialProperties = field._initProperties || {};
    iteratorUtils.each(properties, function(_, prop) {
        if (initialProperties.hasOwnProperty(prop)) {
            field[prop] = initialProperties[prop]
        }
    })
}

function updateCalculatedFieldProperties(field, calculatedProperties) {
    resetFieldState(field, calculatedProperties);
    if (!isDefined(field.caption)) {
        setFieldProperty(field, "caption", createCaption(field))
    }
}

function areExpressionsUsed(dataFields) {
    return dataFields.some(function(field) {
        return field.summaryDisplayMode || field.calculateSummaryValue
    })
}

function isRunningTotalUsed(dataFields) {
    return dataFields.some(function(field) {
        return !!field.runningTotal
    })
}
module.exports = Class.inherit(function() {
    var findHeaderItem = function(headerItems, path) {
        if (headerItems._cacheByPath) {
            return headerItems._cacheByPath[path.join(".")] || null
        }
    };
    var getHeaderItemsLastIndex = function getHeaderItemsLastIndex(headerItems, grandTotalIndex) {
        var i, headerItem, lastIndex = -1;
        if (headerItems) {
            for (i = 0; i < headerItems.length; i++) {
                headerItem = headerItems[i];
                lastIndex = Math.max(lastIndex, headerItem.index);
                if (headerItem.children) {
                    lastIndex = Math.max(lastIndex, getHeaderItemsLastIndex(headerItem.children))
                } else {
                    if (headerItem.collapsedChildren) {
                        lastIndex = Math.max(lastIndex, getHeaderItemsLastIndex(headerItem.collapsedChildren))
                    }
                }
            }
        }
        if (isDefined(grandTotalIndex)) {
            lastIndex = Math.max(lastIndex, grandTotalIndex)
        }
        return lastIndex
    };
    var updateHeaderItemChildren = function(headerItems, headerItem, children, grandTotalIndex) {
        var index, applyingHeaderItemsCount = getHeaderItemsLastIndex(children) + 1,
            emptyIndex = getHeaderItemsLastIndex(headerItems, grandTotalIndex) + 1,
            applyingItemIndexesToCurrent = [],
            d = new Deferred;
        for (index = 0; index < applyingHeaderItemsCount; index++) {
            applyingItemIndexesToCurrent[index] = emptyIndex++
        }
        headerItem.children = children;
        when(foreachTreeAsync(headerItem.children, function(items) {
            items[0].index = applyingItemIndexesToCurrent[items[0].index]
        })).done(function() {
            d.resolve(applyingItemIndexesToCurrent)
        });
        return d
    };
    var updateHeaderItems = function(headerItems, newHeaderItems) {
        var d = new Deferred;
        var applyingItemIndexesToCurrent = [];
        when(foreachTreeAsync(headerItems, function(items) {
            delete items[0].collapsedChildren
        })).done(function() {
            when(foreachTreeAsync(newHeaderItems, function(items) {
                var headerItem = findHeaderItem(headerItems, createPath(items));
                if (headerItem) {
                    applyingItemIndexesToCurrent[items[0].index] = headerItem.index
                }
            })).done(function() {
                d.resolve(applyingItemIndexesToCurrent)
            })
        });
        return d
    };
    var updateDataSourceCells = function(dataSource, newDataSourceCells, newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent) {
        var newRowIndex, newColumnIndex, newRowCells, newCell, rowIndex, columnIndex, dataSourceCells = dataSource.values;
        if (newDataSourceCells) {
            for (newRowIndex = 0; newRowIndex <= newDataSourceCells.length; newRowIndex++) {
                newRowCells = newDataSourceCells[newRowIndex];
                rowIndex = newRowItemIndexesToCurrent[newRowIndex];
                if (!isDefined(rowIndex)) {
                    rowIndex = dataSource.grandTotalRowIndex
                }
                if (newRowCells && isDefined(rowIndex)) {
                    if (!dataSourceCells[rowIndex]) {
                        dataSourceCells[rowIndex] = []
                    }
                    for (newColumnIndex = 0; newColumnIndex <= newRowCells.length; newColumnIndex++) {
                        newCell = newRowCells[newColumnIndex];
                        columnIndex = newColumnItemIndexesToCurrent[newColumnIndex];
                        if (!isDefined(columnIndex)) {
                            columnIndex = dataSource.grandTotalColumnIndex
                        }
                        if (isDefined(newCell) && isDefined(columnIndex)) {
                            dataSourceCells[rowIndex][columnIndex] = newCell
                        }
                    }
                }
            }
        }
    };

    function createLocalOrRemoteStore(dataSourceOptions, notifyProgress) {
        var StoreConstructor = dataSourceOptions.remoteOperations ? RemoteStore : localStore.LocalStore;
        return new StoreConstructor(extend(DataSourceModule.normalizeDataSourceOptions(dataSourceOptions), {
            onChanged: null,
            onLoadingChanged: null,
            onProgressChanged: notifyProgress
        }))
    }

    function createStore(dataSourceOptions, notifyProgress) {
        var store, storeOptions;
        if (typeUtils.isPlainObject(dataSourceOptions) && dataSourceOptions.load) {
            store = createLocalOrRemoteStore(dataSourceOptions, notifyProgress)
        } else {
            if (dataSourceOptions && !dataSourceOptions.store) {
                dataSourceOptions = {
                    store: dataSourceOptions
                }
            }
            storeOptions = dataSourceOptions.store;
            if ("xmla" === storeOptions.type) {
                store = new xmlaStore.XmlaStore(storeOptions)
            } else {
                if (typeUtils.isPlainObject(storeOptions) && storeOptions.type || storeOptions instanceof Store || Array.isArray(storeOptions)) {
                    store = createLocalOrRemoteStore(dataSourceOptions, notifyProgress)
                } else {
                    if (storeOptions instanceof Class) {
                        store = storeOptions
                    }
                }
            }
        }
        return store
    }

    function equalFields(fields, prevFields, count) {
        for (var i = 0; i < count; i++) {
            if (!fields[i] || !prevFields[i] || fields[i].index !== prevFields[i].index) {
                return false
            }
        }
        return true
    }

    function getExpandedPaths(dataSource, loadOptions, dimensionName, prevLoadOptions) {
        var result = [],
            fields = loadOptions && loadOptions[dimensionName] || [],
            prevFields = prevLoadOptions && prevLoadOptions[dimensionName] || [];
        foreachTree(dataSource[dimensionName], function(items) {
            var item = items[0],
                path = createPath(items);
            if (item.children && fields[path.length - 1] && !fields[path.length - 1].expanded) {
                if (path.length < fields.length && (!prevLoadOptions || equalFields(fields, prevFields, path.length))) {
                    result.push(path.slice())
                }
            }
        }, true);
        return result
    }

    function setFieldProperties(field, srcField, skipInitPropertySave, properties) {
        if (srcField) {
            each(properties, function(_, name) {
                if (skipInitPropertySave) {
                    field[name] = srcField[name]
                } else {
                    if (("summaryType" === name || "summaryDisplayMode" === name) && void 0 === srcField[name]) {
                        return
                    }
                    setFieldProperty(field, name, srcField[name])
                }
            })
        } else {
            resetFieldState(field, properties)
        }
        return field
    }

    function getFieldsState(fields, properties) {
        var result = [];
        each(fields, function(_, field) {
            result.push(setFieldProperties({
                dataField: field.dataField,
                name: field.name
            }, field, true, properties))
        });
        return result
    }

    function getFieldStateId(field) {
        if (field.name) {
            return field.name
        }
        return field.dataField + ""
    }

    function getFieldsById(fields, id) {
        var result = [];
        each(fields || [], function(_, field) {
            if (getFieldStateId(field) === id) {
                result.push(field)
            }
        });
        return result
    }

    function setFieldsStateCore(stateFields, fields) {
        stateFields = stateFields || [];
        each(fields, function(index, field) {
            setFieldProperties(field, stateFields[index], false, STATE_PROPERTIES);
            updateCalculatedFieldProperties(field, CALCULATED_PROPERTIES)
        });
        return fields
    }

    function setFieldsState(stateFields, fields) {
        stateFields = stateFields || [];
        var id, fieldsById = {};
        each(fields, function(_, field) {
            id = getFieldStateId(field);
            if (!fieldsById[id]) {
                fieldsById[id] = getFieldsById(fields, getFieldStateId(field))
            }
        });
        each(fieldsById, function(id, fields) {
            setFieldsStateCore(getFieldsById(stateFields, id), fields)
        });
        return fields
    }

    function getFieldsByGroup(fields, groupingField) {
        return fields.filter(function(field) {
            return field.groupName === groupingField.groupName && typeUtils.isNumeric(field.groupIndex) && false !== field.visible
        }).map(function(field) {
            return extend(field, {
                areaIndex: groupingField.areaIndex,
                area: groupingField.area,
                expanded: isDefined(field.expanded) ? field.expanded : groupingField.expanded,
                dataField: field.dataField || groupingField.dataField,
                dataType: field.dataType || groupingField.dataType,
                sortBy: field.sortBy || groupingField.sortBy,
                sortOrder: field.sortOrder || groupingField.sortOrder,
                sortBySummaryField: field.sortBySummaryField || groupingField.sortBySummaryField,
                sortBySummaryPath: field.sortBySummaryPath || groupingField.sortBySummaryPath,
                visible: field.visible || groupingField.visible,
                showTotals: isDefined(field.showTotals) ? field.showTotals : groupingField.showTotals,
                showGrandTotals: isDefined(field.showGrandTotals) ? field.showGrandTotals : groupingField.showGrandTotals
            })
        }).sort(function(a, b) {
            return a.groupIndex - b.groupIndex
        })
    }

    function sortFieldsByAreaIndex(fields) {
        fields.sort(function(field1, field2) {
            return field1.areaIndex - field2.areaIndex || field1.groupIndex - field2.groupIndex
        })
    }

    function isAreaField(field, area) {
        var canAddFieldInArea = "data" === area || false !== field.visible;
        return field.area === area && !isDefined(field.groupIndex) && canAddFieldInArea
    }

    function getFieldId(field, retrieveFieldsOptionValue) {
        var groupName = field.groupName || "";
        return (field.dataField || groupName) + (field.groupInterval ? groupName + field.groupInterval : "NOGROUP") + (retrieveFieldsOptionValue ? "" : groupName)
    }

    function mergeFields(fields, storeFields, retrieveFieldsOptionValue) {
        var result = [],
            fieldsDictionary = {},
            removedFields = {},
            mergedGroups = [],
            dataTypes = pivotGridUtils.getFieldsDataType(fields);
        if (storeFields) {
            each(storeFields, function(_, field) {
                fieldsDictionary[getFieldId(field, retrieveFieldsOptionValue)] = field
            });
            each(fields, function(_, field) {
                var mergedField, fieldKey = getFieldId(field, retrieveFieldsOptionValue),
                    storeField = fieldsDictionary[fieldKey] || removedFields[fieldKey];
                if (storeField) {
                    if (storeField._initProperties) {
                        resetFieldState(storeField, ALL_CALCULATED_PROPERTIES)
                    }
                    mergedField = extend({}, storeField, field, {
                        _initProperties: null
                    })
                } else {
                    fieldsDictionary[fieldKey] = mergedField = field
                }
                extend(mergedField, {
                    dataType: dataTypes[field.dataField]
                });
                delete fieldsDictionary[fieldKey];
                removedFields[fieldKey] = storeField;
                result.push(mergedField)
            });
            if (retrieveFieldsOptionValue) {
                each(fieldsDictionary, function(_, field) {
                    result.push(field)
                })
            }
        } else {
            result = fields
        }
        result.push.apply(result, mergedGroups);
        return result
    }

    function getFields(that) {
        var mergedFields, result = new Deferred,
            store = that._store,
            storeFields = store && store.getFields(that._fields);
        when(storeFields).done(function(storeFields) {
            that._storeFields = storeFields;
            mergedFields = mergeFields(that._fields, storeFields, that._retrieveFields);
            result.resolve(mergedFields)
        }).fail(result.reject);
        return result
    }

    function getSliceIndex(items, path) {
        var index = null,
            pathValue = (path || []).join(".");
        if (pathValue.length) {
            foreachTree(items, function(items) {
                var item = items[0],
                    itemPath = createPath(items).join("."),
                    textPath = iteratorUtils.map(items, function(item) {
                        return item.text
                    }).reverse().join(".");
                if (pathValue === itemPath || item.key && textPath === pathValue) {
                    index = items[0].index;
                    return false
                }
            })
        }
        return index
    }

    function getFieldSummaryValueSelector(field, dataSource, loadOptions, dimensionName) {
        var values = dataSource.values,
            sortBySummaryFieldIndex = findField(loadOptions.values, field.sortBySummaryField),
            areRows = "rows" === dimensionName,
            sortByDimension = areRows ? dataSource.columns : dataSource.rows,
            grandTotalIndex = areRows ? dataSource.grandTotalRowIndex : dataSource.grandTotalColumnIndex,
            sortBySummaryPath = field.sortBySummaryPath || [],
            sliceIndex = sortBySummaryPath.length ? getSliceIndex(sortByDimension, sortBySummaryPath) : grandTotalIndex;
        if (values && values.length && sortBySummaryFieldIndex >= 0 && isDefined(sliceIndex)) {
            return function(field) {
                var rowIndex = areRows ? field.index : sliceIndex,
                    columnIndex = areRows ? sliceIndex : field.index,
                    value = ((values[rowIndex] || [
                        []
                    ])[columnIndex] || [])[sortBySummaryFieldIndex];
                return isDefined(value) ? value : null
            }
        }
    }

    function getMemberForSortBy(sortBy, getAscOrder) {
        var member = "text";
        if ("none" === sortBy) {
            member = "index"
        } else {
            if (getAscOrder || "displayText" !== sortBy) {
                member = "value"
            }
        }
        return member
    }

    function getSortingMethod(field, dataSource, loadOptions, dimensionName, getAscOrder) {
        var sortOrder = getAscOrder ? "asc" : field.sortOrder,
            sortBy = getMemberForSortBy(field.sortBy, getAscOrder),
            defaultCompare = field.sortingMethod ? function(a, b) {
                return field.sortingMethod(a, b)
            } : getCompareFunction(function(item) {
                return item[sortBy]
            }),
            summaryValueSelector = !getAscOrder && getFieldSummaryValueSelector(field, dataSource, loadOptions, dimensionName),
            summaryCompare = summaryValueSelector && getCompareFunction(summaryValueSelector),
            sortingMethod = function(a, b) {
                var result = summaryCompare && summaryCompare(a, b) || defaultCompare(a, b);
                return "desc" === sortOrder ? -result : result
            };
        return sortingMethod
    }

    function sortDimension(dataSource, loadOptions, dimensionName, getAscOrder) {
        var fields = loadOptions[dimensionName] || [],
            baseIndex = loadOptions.headerName === dimensionName ? loadOptions.path.length : 0,
            sortingMethodByLevel = [];
        foreachDataLevel(dataSource[dimensionName], function(item, index) {
            var field = fields[index] || {},
                sortingMethod = sortingMethodByLevel[index] = sortingMethodByLevel[index] || getSortingMethod(field, dataSource, loadOptions, dimensionName, getAscOrder);
            item.sort(sortingMethod)
        }, baseIndex)
    }

    function sort(loadOptions, dataSource, getAscOrder) {
        sortDimension(dataSource, loadOptions, "rows", getAscOrder);
        sortDimension(dataSource, loadOptions, "columns", getAscOrder)
    }

    function formatHeaderItems(data, loadOptions, headerName) {
        return foreachTreeAsync(data[headerName], function(items) {
            var item = items[0];
            item.text = item.text || formatValue(item.value, loadOptions[headerName][createPath(items).length - 1])
        })
    }

    function formatHeaders(loadOptions, data) {
        return when(formatHeaderItems(data, loadOptions, "columns"), formatHeaderItems(data, loadOptions, "rows"))
    }

    function updateCache(headerItems) {
        var d = new Deferred;
        var cacheByPath = {};
        when(foreachTreeAsync(headerItems, function(items) {
            var path = createPath(items).join(".");
            cacheByPath[path] = items[0]
        })).done(d.resolve);
        headerItems._cacheByPath = cacheByPath;
        return d
    }

    function _getAreaFields(fields, area) {
        var areaFields = [];
        each(fields, function() {
            if (isAreaField(this, area)) {
                areaFields.push(this)
            }
        });
        return areaFields
    }
    return {
        ctor: function(options) {
            options = options || {};
            var that = this,
                store = createStore(options, function(progress) {
                    that.fireEvent("progressChanged", [progress])
                });
            that._store = store;
            that._data = {
                rows: [],
                columns: [],
                values: []
            };
            that._loadingCount = 0;
            each(["changed", "loadError", "loadingChanged", "progressChanged", "fieldsPrepared", "expandValueChanging"], function(_, eventName) {
                var optionName = "on" + eventName[0].toUpperCase() + eventName.slice(1);
                if (options.hasOwnProperty(optionName)) {
                    this.on(eventName, options[optionName])
                }
            }.bind(this));
            that._retrieveFields = isDefined(options.retrieveFields) ? options.retrieveFields : true;
            that._fields = options.fields || [];
            that._descriptions = options.descriptions ? extend(that._createDescriptions(), options.descriptions) : void 0;
            if (!store) {
                extend(true, that._data, options.store || options)
            }
        },
        getData: function() {
            return this._data
        },
        getAreaFields: function(area, collectGroups) {
            var descriptions, areaFields = [];
            if (collectGroups || "data" === area) {
                areaFields = _getAreaFields(this._fields, area);
                sortFieldsByAreaIndex(areaFields)
            } else {
                descriptions = this._descriptions || {};
                areaFields = descriptions[DESCRIPTION_NAME_BY_AREA[area]] || []
            }
            return areaFields
        },
        fields: function(_fields) {
            var that = this;
            if (_fields) {
                that._fields = mergeFields(_fields, that._storeFields, that._retrieveFields);
                that._fieldsPrepared(that._fields)
            }
            return that._fields
        },
        field: function field(id, options) {
            var levels, that = this,
                fields = that._fields,
                field = fields && fields[typeUtils.isNumeric(id) ? id : findField(fields, id)];
            if (field && options) {
                each(options, function(optionName, optionValue) {
                    var isInitialization = inArray(optionName, STATE_PROPERTIES) < 0;
                    setFieldProperty(field, optionName, optionValue, isInitialization);
                    if ("sortOrder" === optionName) {
                        levels = field.levels || [];
                        for (var i = 0; i < levels.length; i++) {
                            levels[i][optionName] = optionValue
                        }
                    }
                });
                updateCalculatedFieldProperties(field, CALCULATED_PROPERTIES);
                that._descriptions = that._createDescriptions(field)
            }
            return field
        },
        getFieldValues: function(index) {
            var that = this,
                field = this._fields && this._fields[index],
                store = this.store(),
                loadFields = [],
                loadOptions = {
                    columns: loadFields,
                    rows: [],
                    values: this.getAreaFields("data"),
                    filters: [],
                    skipValues: true
                },
                d = new Deferred;
            if (field && store) {
                each(field.levels || [field], function() {
                    loadFields.push(extend({}, this, {
                        expanded: true,
                        filterValues: null,
                        sortOrder: "asc",
                        sortBySummaryField: null
                    }))
                });
                store.load(loadOptions).done(function(data) {
                    formatHeaders(loadOptions, data);
                    that._sort(loadOptions, data);
                    d.resolve(data.columns)
                }).fail(d)
            } else {
                d.reject()
            }
            return d
        },
        reload: function() {
            return this.load({
                reload: true
            })
        },
        filter: function() {
            var store = this._store;
            return store.filter.apply(store, arguments)
        },
        load: function(options) {
            var that = this,
                d = new Deferred;
            options = options || {};
            that.beginLoading();
            d.fail(function(e) {
                that.fireEvent("loadError", [e])
            }).always(function() {
                that.endLoading()
            });

            function loadTask() {
                that._delayedLoadTask = void 0;
                if (!that._descriptions) {
                    when(getFields(that)).done(function(fields) {
                        that._fieldsPrepared(fields);
                        that._loadCore(options, d)
                    }).fail(d.reject).fail(that._loadErrorHandler)
                } else {
                    that._loadCore(options, d)
                }
            }
            if (that.store()) {
                that._delayedLoadTask = commonUtils.executeAsync(loadTask)
            } else {
                loadTask()
            }
            return d
        },
        createDrillDownDataSource: function(params) {
            return this._store.createDrillDownDataSource(this._descriptions, params)
        },
        _createDescriptions: function(currentField) {
            var that = this,
                fields = that.fields(),
                descriptions = {
                    rows: [],
                    columns: [],
                    values: [],
                    filters: []
                };
            each(["row", "column", "data", "filter"], function(_, areaName) {
                normalizeIndexes(_getAreaFields(fields, areaName), "areaIndex", currentField)
            });
            each(fields || [], function(_, field) {
                var descriptionName = DESCRIPTION_NAME_BY_AREA[field.area],
                    dimension = descriptions[descriptionName],
                    groupName = field.groupName;
                if (groupName && !typeUtils.isNumeric(field.groupIndex)) {
                    field.levels = getFieldsByGroup(fields, field)
                }
                if (!dimension || groupName && typeUtils.isNumeric(field.groupIndex) || false === field.visible && "data" !== field.area && "filter" !== field.area) {
                    return
                }
                if (field.levels && dimension !== descriptions.filters && dimension !== descriptions.values) {
                    dimension.push.apply(dimension, field.levels);
                    if (field.filterValues && field.filterValues.length) {
                        descriptions.filters.push(field)
                    }
                } else {
                    dimension.push(field)
                }
            });
            each(descriptions, function(_, fields) {
                sortFieldsByAreaIndex(fields)
            });
            var indices = {};
            each(descriptions.values, function(_, field) {
                var expression = field.calculateSummaryValue;
                if (typeUtils.isFunction(expression)) {
                    var summaryCell = summaryDisplayModes.createMockSummaryCell(descriptions, fields, indices);
                    expression(summaryCell)
                }
            });
            return descriptions
        },
        _fieldsPrepared: function(fields) {
            var that = this;
            that._fields = fields;
            each(fields, function(index, field) {
                field.index = index;
                updateCalculatedFieldProperties(field, ALL_CALCULATED_PROPERTIES)
            });
            var currentFieldState = getFieldsState(fields, ["caption"]);
            that.fireEvent("fieldsPrepared", [fields]);
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].caption !== currentFieldState[i].caption) {
                    setFieldProperty(fields[i], "caption", fields[i].caption, true)
                }
            }
            that._descriptions = that._createDescriptions()
        },
        isLoading: function() {
            return this._loadingCount > 0
        },
        state: function(_state, skipLoading) {
            var that = this;
            if (arguments.length) {
                _state = extend({
                    rowExpandedPaths: [],
                    columnExpandedPaths: []
                }, _state);
                if (!that._descriptions) {
                    that.beginLoading();
                    when(getFields(that)).done(function(fields) {
                        that._fields = setFieldsState(_state.fields, fields);
                        that._fieldsPrepared(fields);
                        !skipLoading && that.load(_state)
                    }).always(function() {
                        that.endLoading()
                    })
                } else {
                    that._fields = setFieldsState(_state.fields, that._fields);
                    that._descriptions = that._createDescriptions();
                    !skipLoading && that.load(_state)
                }
            } else {
                return {
                    fields: getFieldsState(that._fields, STATE_PROPERTIES),
                    columnExpandedPaths: getExpandedPaths(that._data, that._descriptions, "columns"),
                    rowExpandedPaths: getExpandedPaths(that._data, that._descriptions, "rows")
                }
            }
        },
        beginLoading: function() {
            this._changeLoadingCount(1)
        },
        endLoading: function() {
            this._changeLoadingCount(-1)
        },
        _changeLoadingCount: function(increment) {
            var newLoading, oldLoading = this.isLoading();
            this._loadingCount += increment;
            newLoading = this.isLoading();
            if (oldLoading ^ newLoading) {
                this.fireEvent("loadingChanged", [newLoading])
            }
        },
        _loadCore: function(options, deferred) {
            var that = this,
                store = this._store,
                descriptions = this._descriptions,
                headerName = DESCRIPTION_NAME_BY_AREA[options.area];
            options = options || {};
            if (store) {
                extend(options, descriptions);
                options.columnExpandedPaths = options.columnExpandedPaths || getExpandedPaths(this._data, options, "columns", that._lastLoadOptions);
                options.rowExpandedPaths = options.rowExpandedPaths || getExpandedPaths(this._data, options, "rows", that._lastLoadOptions);
                if (headerName) {
                    options.headerName = headerName
                }
                that.beginLoading();
                deferred.always(function() {
                    that.endLoading()
                });
                when(store.load(options)).done(function(data) {
                    if (options.path) {
                        that.applyPartialDataSource(options.area, options.path, data, deferred)
                    } else {
                        extend(that._data, data);
                        that._lastLoadOptions = options;
                        that._update(deferred)
                    }
                }).fail(deferred.reject)
            } else {
                that._update(deferred)
            }
        },
        _sort: function(descriptions, data, getAscOrder) {
            var store = this._store;
            if (store) {
                sort(descriptions, data, getAscOrder)
            }
        },
        isEmpty: function() {
            var dataFields = this.getAreaFields("data"),
                data = this.getData();
            return !dataFields.length || !data.values.length
        },
        _update: function(deferred) {
            var that = this,
                descriptions = that._descriptions,
                loadedData = that._data,
                dataFields = descriptions.values,
                expressionsUsed = areExpressionsUsed(dataFields);
            when(formatHeaders(descriptions, loadedData), updateCache(loadedData.rows), updateCache(loadedData.columns)).done(function() {
                if (expressionsUsed) {
                    that._sort(descriptions, loadedData, expressionsUsed);
                    !that.isEmpty() && summaryDisplayModes.applyDisplaySummaryMode(descriptions, loadedData)
                }
                that._sort(descriptions, loadedData);
                !that.isEmpty() && isRunningTotalUsed(dataFields) && summaryDisplayModes.applyRunningTotal(descriptions, loadedData);
                that._data = loadedData;
                when(deferred).done(function() {
                    that.fireEvent("changed");
                    if (isDefined(that._data.grandTotalRowIndex)) {
                        loadedData.grandTotalRowIndex = that._data.grandTotalRowIndex
                    }
                    if (isDefined(that._data.grandTotalColumnIndex)) {
                        loadedData.grandTotalColumnIndex = that._data.grandTotalColumnIndex
                    }
                });
                deferred && deferred.resolve(that._data)
            });
            return deferred
        },
        store: function() {
            return this._store
        },
        collapseHeaderItem: function(area, path) {
            var that = this,
                headerItems = "column" === area ? that._data.columns : that._data.rows,
                headerItem = findHeaderItem(headerItems, path),
                field = that.getAreaFields(area)[path.length - 1];
            if (headerItem && headerItem.children) {
                that.fireEvent("expandValueChanging", [{
                    area: area,
                    path: path,
                    expanded: false
                }]);
                if (field) {
                    field.expanded = false
                }
                headerItem.collapsedChildren = headerItem.children;
                delete headerItem.children;
                that._update();
                return true
            }
            return false
        },
        collapseAll: function(id) {
            var _this = this;
            var dataChanged = false,
                field = this.field(id) || {},
                areaOffsets = [inArray(field, this.getAreaFields(field.area))];
            field.expanded = false;
            if (field && field.levels) {
                areaOffsets = [];
                field.levels.forEach(function(f) {
                    areaOffsets.push(inArray(f, _this.getAreaFields(field.area)));
                    f.expanded = false
                })
            }
            foreachTree(this._data[field.area + "s"], function(items) {
                var item = items[0],
                    path = createPath(items);
                if (item && item.children && areaOffsets.indexOf(path.length - 1) !== -1) {
                    item.collapsedChildren = item.children;
                    delete item.children;
                    dataChanged = true
                }
            }, true);
            dataChanged && this._update()
        },
        expandAll: function(id) {
            var field = this.field(id);
            if (field && field.area) {
                field.expanded = true;
                if (field && field.levels) {
                    field.levels.forEach(function(f) {
                        f.expanded = true
                    })
                }
                this.load()
            }
        },
        expandHeaderItem: function(area, path) {
            var hasCache, options, that = this,
                headerItems = "column" === area ? that._data.columns : that._data.rows,
                headerItem = findHeaderItem(headerItems, path);
            if (headerItem && !headerItem.children) {
                hasCache = !!headerItem.collapsedChildren;
                options = {
                    area: area,
                    path: path,
                    expanded: true,
                    needExpandData: !hasCache
                };
                that.fireEvent("expandValueChanging", [options]);
                if (hasCache) {
                    headerItem.children = headerItem.collapsedChildren;
                    delete headerItem.collapsedChildren;
                    that._update()
                } else {
                    that.load(options)
                }
                return hasCache
            }
            return false
        },
        applyPartialDataSource: function(area, path, dataSource, deferred) {
            var headerItem, newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent, that = this,
                loadedData = that._data,
                headerItems = "column" === area ? loadedData.columns : loadedData.rows;
            if (dataSource && dataSource.values) {
                dataSource.rows = dataSource.rows || [];
                dataSource.columns = dataSource.columns || [];
                headerItem = findHeaderItem(headerItems, path);
                if (headerItem) {
                    if ("column" === area) {
                        newColumnItemIndexesToCurrent = updateHeaderItemChildren(headerItems, headerItem, dataSource.columns, loadedData.grandTotalColumnIndex);
                        newRowItemIndexesToCurrent = updateHeaderItems(loadedData.rows, dataSource.rows)
                    } else {
                        newRowItemIndexesToCurrent = updateHeaderItemChildren(headerItems, headerItem, dataSource.rows, loadedData.grandTotalRowIndex);
                        newColumnItemIndexesToCurrent = updateHeaderItems(loadedData.columns, dataSource.columns)
                    }
                    when(newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent).done(function(newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent) {
                        if ("row" === area && newRowItemIndexesToCurrent.length || "column" === area && newColumnItemIndexesToCurrent.length) {
                            updateDataSourceCells(loadedData, dataSource.values, newRowItemIndexesToCurrent, newColumnItemIndexesToCurrent)
                        }
                        that._update(deferred)
                    })
                }
            }
        },
        dispose: function() {
            var that = this,
                delayedLoadTask = that._delayedLoadTask;
            this._disposeEvents();
            if (delayedLoadTask) {
                delayedLoadTask.abort()
            }
            this._isDisposed = true
        },
        isDisposed: function() {
            return !!this._isDisposed
        }
    }
}()).include(EventsMixin);
module.exports.default = module.exports;
