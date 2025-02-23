/**
 * DevExtreme (ui/grid_core/ui.grid_core.columns_controller.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _callbacks = require("../../core/utils/callbacks");
var _callbacks2 = _interopRequireDefault(_callbacks);
var _variable_wrapper = require("../../core/utils/variable_wrapper");
var _data = require("../../core/utils/data");
var _data2 = _interopRequireDefault(_data);
var _common = require("../../core/utils/common");
var _type = require("../../core/utils/type");
var _iterator = require("../../core/utils/iterator");
var _iterator2 = _interopRequireDefault(_iterator);
var _position = require("../../core/utils/position");
var _extend = require("../../core/utils/extend");
var _array = require("../../core/utils/array");
var _config = require("../../core/config");
var _config2 = _interopRequireDefault(_config);
var _object = require("../../core/utils/object");
var _ui = require("../widget/ui.errors");
var _ui2 = _interopRequireDefault(_ui);
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _uiGrid_core3 = require("./ui.grid_core.utils");
var _inflector = require("../../core/utils/inflector");
var _inflector2 = _interopRequireDefault(_inflector);
var _date_serialization = require("../../core/utils/date_serialization");
var _date_serialization2 = _interopRequireDefault(_date_serialization);
var _number = require("../../localization/number");
var _number2 = _interopRequireDefault(_number);
var _date = require("../../localization/date");
var _date2 = _interopRequireDefault(_date);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _deferred = require("../../core/utils/deferred");
var _abstract_store = require("../../data/abstract_store");
var _abstract_store2 = _interopRequireDefault(_abstract_store);
var _data_source = require("../../data/data_source/data_source");
var _filtering = require("../shared/filtering");
var _filtering2 = _interopRequireDefault(_filtering);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var USER_STATE_FIELD_NAMES_15_1 = ["filterValues", "filterType", "fixed", "fixedPosition"],
    USER_STATE_FIELD_NAMES = ["visibleIndex", "dataField", "name", "dataType", "width", "visible", "sortOrder", "lastSortOrder", "sortIndex", "groupIndex", "filterValue", "selectedFilterOperation", "added"].concat(USER_STATE_FIELD_NAMES_15_1),
    IGNORE_COLUMN_OPTION_NAMES = {
        visibleWidth: true,
        bestFitWidth: true,
        bufferedFilterValue: true
    },
    COMMAND_EXPAND_CLASS = "dx-command-expand",
    MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991,
    GROUP_COMMAND_COLUMN_NAME = "groupExpand";
var regExp = /columns\[(\d+)\]\.?/gi;
var globalColumnId = 1;
module.exports = {
    defaultOptions: function() {
        return {
            commonColumnSettings: {
                allowFiltering: true,
                allowHiding: true,
                allowSorting: true,
                allowEditing: true,
                encodeHtml: true,
                trueText: _message2.default.format("dxDataGrid-trueText"),
                falseText: _message2.default.format("dxDataGrid-falseText")
            },
            allowColumnReordering: false,
            allowColumnResizing: false,
            columnResizingMode: "nextColumn",
            columnMinWidth: void 0,
            columnWidth: void 0,
            adaptColumnWidthByRatio: true,
            columns: void 0,
            regenerateColumnsByVisibleItems: false,
            customizeColumns: null,
            dateSerializationFormat: void 0
        }
    },
    controllers: {
        columns: _uiGrid_core2.default.Controller.inherit(function() {
            var DEFAULT_COLUMN_OPTIONS = {
                    visible: true,
                    showInColumnChooser: true
                },
                DATATYPE_OPERATIONS = {
                    number: ["=", "<>", "<", ">", "<=", ">=", "between"],
                    string: ["contains", "notcontains", "startswith", "endswith", "=", "<>"],
                    date: ["=", "<>", "<", ">", "<=", ">=", "between"],
                    datetime: ["=", "<>", "<", ">", "<=", ">=", "between"]
                },
                COLUMN_INDEX_OPTIONS = {
                    visibleIndex: true,
                    groupIndex: true,
                    grouped: true,
                    sortIndex: true,
                    sortOrder: true
                },
                GROUP_LOCATION = "group",
                COLUMN_CHOOSER_LOCATION = "columnChooser";
            var setFilterOperationsAsDefaultValues = function(column) {
                column.filterOperations = column.defaultFilterOperations
            };
            var createColumn = function(that, columnOptions, userStateColumnOptions, bandColumn) {
                var calculatedColumnOptions, commonColumnOptions = {};
                if (columnOptions) {
                    if ((0, _type.isString)(columnOptions)) {
                        columnOptions = {
                            dataField: columnOptions
                        }
                    }
                    var result = void 0;
                    if (columnOptions.command) {
                        result = (0, _object.deepExtendArraySafe)(commonColumnOptions, columnOptions)
                    } else {
                        commonColumnOptions = that.getCommonSettings(columnOptions);
                        if (userStateColumnOptions && userStateColumnOptions.name && userStateColumnOptions.dataField) {
                            columnOptions = (0, _extend.extend)({}, columnOptions, {
                                dataField: userStateColumnOptions.dataField
                            })
                        }
                        calculatedColumnOptions = that._createCalculatedColumnOptions(columnOptions, bandColumn);
                        result = (0, _object.deepExtendArraySafe)({
                            headerId: "dx-col-" + globalColumnId++
                        }, DEFAULT_COLUMN_OPTIONS);
                        (0, _object.deepExtendArraySafe)(result, commonColumnOptions);
                        (0, _object.deepExtendArraySafe)(result, calculatedColumnOptions);
                        (0, _object.deepExtendArraySafe)(result, columnOptions);
                        (0, _object.deepExtendArraySafe)(result, {
                            selector: null
                        })
                    }
                    if (columnOptions.filterOperations === columnOptions.defaultFilterOperations) {
                        setFilterOperationsAsDefaultValues(result)
                    }
                    return result
                }
            };
            var createColumnsFromOptions = function createColumnsFromOptions(that, columnsOptions, bandColumn) {
                var result = [];
                if (columnsOptions) {
                    _iterator2.default.each(columnsOptions, function(index, columnOptions) {
                        var userStateColumnOptions = that._columnsUserState && checkUserStateColumn(columnOptions, that._columnsUserState[index]) && that._columnsUserState[index],
                            column = createColumn(that, columnOptions, userStateColumnOptions, bandColumn);
                        if (column) {
                            if (bandColumn) {
                                column.ownerBand = bandColumn
                            }
                            result.push(column);
                            if (column.isBand) {
                                result = result.concat(createColumnsFromOptions(that, column.columns, column));
                                delete column.columns
                            }
                        }
                    })
                }
                return result
            };
            var getParentBandColumns = function(columnIndex, columnParentByIndex) {
                var result = [],
                    parent = columnParentByIndex[columnIndex];
                while (parent) {
                    result.unshift(parent);
                    columnIndex = parent.index;
                    parent = columnParentByIndex[columnIndex]
                }
                return result
            };
            var _getChildrenByBandColumn = function _getChildrenByBandColumn(columnIndex, columnChildrenByIndex, recursive) {
                var column, result = [],
                    children = columnChildrenByIndex[columnIndex];
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        column = children[i];
                        if (!(0, _type.isDefined)(column.groupIndex) || column.showWhenGrouped) {
                            result.push(column);
                            if (recursive && column.isBand) {
                                result = result.concat(_getChildrenByBandColumn(column.index, columnChildrenByIndex, recursive))
                            }
                        }
                    }
                }
                return result
            };
            var getColumnByIndexes = function(that, columnIndexes) {
                var result, callbackFilter = function(column) {
                        var ownerBand = result ? result.index : void 0;
                        return column.ownerBand === ownerBand
                    },
                    columns = that._columns.filter(callbackFilter);
                for (var i = 0; i < columnIndexes.length; i++) {
                    result = columns[columnIndexes[i]];
                    if (result) {
                        columns = that._columns.filter(callbackFilter)
                    }
                }
                return result
            };
            var getColumnFullPath = function(that, column) {
                var result = [],
                    bandColumnsCache = that.getBandColumnsCache(),
                    callbackFilter = function(item) {
                        return item.ownerBand === column.ownerBand
                    },
                    columns = that._columns.filter(callbackFilter);
                while (columns.length && columns.indexOf(column) !== -1) {
                    result.unshift("columns[" + columns.indexOf(column) + "]");
                    column = bandColumnsCache.columnParentByIndex[column.index];
                    columns = column ? that._columns.filter(callbackFilter) : []
                }
                return result.join(".")
            };
            var calculateColspan = function calculateColspan(that, columnID) {
                var colspan = 0,
                    columns = that.getChildrenByBandColumn(columnID, true);
                _iterator2.default.each(columns, function(_, column) {
                    if (column.isBand) {
                        column.colspan = column.colspan || calculateColspan(that, column.index);
                        colspan += column.colspan || 1
                    } else {
                        colspan += 1
                    }
                });
                return colspan
            };
            var processBandColumns = function(that, columns, bandColumnsCache) {
                var i, column, rowspan, rowCount = that.getRowCount();
                for (i = 0; i < columns.length; i++) {
                    column = columns[i];
                    if (column.visible || column.command) {
                        if (column.isBand) {
                            column.colspan = column.colspan || calculateColspan(that, column.index)
                        }
                        if (!column.isBand || !column.colspan) {
                            rowspan = rowCount - (!column.command && !(0, _type.isDefined)(column.groupIndex) ? getParentBandColumns(column.index, bandColumnsCache.columnParentByIndex).length : 0);
                            if (rowspan > 1) {
                                column.rowspan = rowspan
                            }
                        }
                    }
                }
            };
            var getValueDataType = function(value) {
                var dataType = (0, _type.type)(value);
                if ("string" !== dataType && "boolean" !== dataType && "number" !== dataType && "date" !== dataType && "object" !== dataType) {
                    dataType = void 0
                }
                return dataType
            };
            var getSerializationFormat = function(dataType, value) {
                switch (dataType) {
                    case "date":
                    case "datetime":
                        return _date_serialization2.default.getDateSerializationFormat(value);
                    case "number":
                        if ((0, _type.isString)(value)) {
                            return "string"
                        }
                        if ((0, _type.isNumeric)(value)) {
                            return null
                        }
                }
            };
            var updateSerializers = function(options, dataType) {
                if (!options.deserializeValue) {
                    if ((0, _uiGrid_core3.isDateType)(dataType)) {
                        options.deserializeValue = function(value) {
                            return _date_serialization2.default.deserializeDate(value)
                        };
                        options.serializeValue = function(value) {
                            return (0, _type.isString)(value) ? value : _date_serialization2.default.serializeDate(value, this.serializationFormat)
                        }
                    }
                    if ("number" === dataType) {
                        options.deserializeValue = function(value) {
                            var parsedValue = parseFloat(value);
                            return isNaN(parsedValue) ? value : parsedValue
                        };
                        options.serializeValue = function(value, target) {
                            if ("filter" === target) {
                                return value
                            }
                            return (0, _type.isDefined)(value) && "string" === this.serializationFormat ? value.toString() : value
                        }
                    }
                }
            };
            var getAlignmentByDataType = function(dataType, isRTL) {
                switch (dataType) {
                    case "number":
                        return "right";
                    case "boolean":
                        return "center";
                    default:
                        return (0, _position.getDefaultAlignment)(isRTL)
                }
            };
            var getCustomizeTextByDataType = function(dataType) {
                if ("boolean" === dataType) {
                    return function(e) {
                        if (true === e.value) {
                            return this.trueText || "true"
                        } else {
                            if (false === e.value) {
                                return this.falseText || "false"
                            } else {
                                return e.valueText || ""
                            }
                        }
                    }
                }
            };
            var createColumnsFromDataSource = function(that, dataSource) {
                var fieldName, i, firstItems = that._getFirstItems(dataSource),
                    processedFields = {},
                    result = [];
                for (i = 0; i < firstItems.length; i++) {
                    if (firstItems[i]) {
                        for (fieldName in firstItems[i]) {
                            if (!(0, _type.isFunction)(firstItems[i][fieldName]) || (0, _variable_wrapper.isWrapped)(firstItems[i][fieldName])) {
                                processedFields[fieldName] = true
                            }
                        }
                    }
                }
                for (fieldName in processedFields) {
                    if (0 !== fieldName.indexOf("__")) {
                        var column = createColumn(that, fieldName);
                        result.push(column)
                    }
                }
                return result
            };
            var updateColumnIndexes = function(that) {
                _iterator2.default.each(that._columns, function(index, column) {
                    column.index = index
                });
                _iterator2.default.each(that._columns, function(index, column) {
                    if ((0, _type.isObject)(column.ownerBand)) {
                        column.ownerBand = column.ownerBand.index
                    }
                });
                _iterator2.default.each(that._commandColumns, function(index, column) {
                    column.index = -(index + 1)
                })
            };
            var updateColumnGroupIndexes = function(that, currentColumn) {
                (0, _array.normalizeIndexes)(that._columns, "groupIndex", currentColumn, function(column) {
                    var grouped = column.grouped;
                    delete column.grouped;
                    return grouped
                })
            };
            var updateColumnSortIndexes = function(that, currentColumn) {
                _iterator2.default.each(that._columns, function(index, column) {
                    if ((0, _type.isDefined)(column.sortIndex) && !isSortOrderValid(column.sortOrder)) {
                        delete column.sortIndex
                    }
                });
                (0, _array.normalizeIndexes)(that._columns, "sortIndex", currentColumn, function(column) {
                    return !(0, _type.isDefined)(column.groupIndex) && isSortOrderValid(column.sortOrder)
                })
            };
            var updateColumnVisibleIndexes = function(that, currentColumn) {
                var i, key, column, bandColumnIndex, parentBandColumns, bandColumns = {},
                    result = [],
                    bandColumnsCache = that.getBandColumnsCache(),
                    columns = that._columns.filter(function(column) {
                        return !column.command
                    });
                for (i = 0; i < columns.length; i++) {
                    column = columns[i];
                    parentBandColumns = getParentBandColumns(i, bandColumnsCache.columnParentByIndex);
                    if (parentBandColumns.length) {
                        bandColumnIndex = parentBandColumns[parentBandColumns.length - 1].index;
                        bandColumns[bandColumnIndex] = bandColumns[bandColumnIndex] || [];
                        bandColumns[bandColumnIndex].push(column)
                    } else {
                        result.push(column)
                    }
                }
                for (key in bandColumns) {
                    (0, _array.normalizeIndexes)(bandColumns[key], "visibleIndex", currentColumn)
                }(0, _array.normalizeIndexes)(result, "visibleIndex", currentColumn)
            };
            var getColumnIndexByVisibleIndex = function(that, visibleIndex, location) {
                var column, rowIndex = (0, _type.isObject)(visibleIndex) ? visibleIndex.rowIndex : null,
                    columns = location === GROUP_LOCATION ? that.getGroupColumns() : location === COLUMN_CHOOSER_LOCATION ? that.getChooserColumns() : that.getVisibleColumns(rowIndex);
                visibleIndex = (0, _type.isObject)(visibleIndex) ? visibleIndex.columnIndex : visibleIndex;
                column = columns[visibleIndex];
                if (column && column.type === GROUP_COMMAND_COLUMN_NAME) {
                    column = that._columns.filter(function(col) {
                        return column.type === col.type
                    })[0] || column
                }
                return column && (0, _type.isDefined)(column.index) ? column.index : -1
            };
            var moveColumnToGroup = function(that, column, groupIndex) {
                var i, groupColumns = that.getGroupColumns();
                if (groupIndex >= 0) {
                    for (i = 0; i < groupColumns.length; i++) {
                        if (groupColumns[i].groupIndex >= groupIndex) {
                            groupColumns[i].groupIndex++
                        }
                    }
                } else {
                    groupIndex = 0;
                    for (i = 0; i < groupColumns.length; i++) {
                        groupIndex = Math.max(groupIndex, groupColumns[i].groupIndex + 1)
                    }
                }
                return groupIndex
            };
            var checkUserStateColumn = function(column, userStateColumn) {
                return column && userStateColumn && userStateColumn.name === column.name && (userStateColumn.dataField === column.dataField || column.name)
            };
            var applyUserState = function(that) {
                var column, columnUserState, userStateColumnIndex, i, columnsUserState = that._columnsUserState,
                    ignoreColumnOptionNames = that._ignoreColumnOptionNames || [],
                    columns = that._columns,
                    columnCountById = {},
                    resultColumns = [],
                    allColumnsHaveState = true,
                    userStateColumnIndexes = [];

                function applyFieldsState(column, userStateColumn) {
                    var fieldName;
                    if (!userStateColumn) {
                        return
                    }
                    for (var index = 0; index < USER_STATE_FIELD_NAMES.length; index++) {
                        fieldName = USER_STATE_FIELD_NAMES[index];
                        if ((0, _array.inArray)(fieldName, ignoreColumnOptionNames) >= 0) {
                            continue
                        }
                        if ("dataType" === fieldName) {
                            column[fieldName] = column[fieldName] || userStateColumn[fieldName]
                        } else {
                            if ((0, _array.inArray)(fieldName, USER_STATE_FIELD_NAMES_15_1) >= 0) {
                                if (fieldName in userStateColumn) {
                                    column[fieldName] = userStateColumn[fieldName]
                                }
                            } else {
                                if ("selectedFilterOperation" === fieldName && userStateColumn[fieldName]) {
                                    column.defaultSelectedFilterOperation = column[fieldName] || null
                                }
                                column[fieldName] = userStateColumn[fieldName]
                            }
                        }
                    }
                }

                function findUserStateColumn(columnsUserState, column) {
                    var id = column.name || column.dataField,
                        count = columnCountById[id] || 0;
                    for (var j = 0; j < columnsUserState.length; j++) {
                        if (checkUserStateColumn(column, columnsUserState[j])) {
                            if (count) {
                                count--
                            } else {
                                columnCountById[id] = columnCountById[id] || 0;
                                columnCountById[id]++;
                                return j
                            }
                        }
                    }
                    return -1
                }
                if (columnsUserState) {
                    for (i = 0; i < columns.length; i++) {
                        userStateColumnIndex = findUserStateColumn(columnsUserState, columns[i]);
                        allColumnsHaveState = allColumnsHaveState && userStateColumnIndex >= 0;
                        userStateColumnIndexes.push(userStateColumnIndex)
                    }
                    for (i = 0; i < columns.length; i++) {
                        column = columns[i];
                        userStateColumnIndex = userStateColumnIndexes[i];
                        if (that._hasUserState || allColumnsHaveState) {
                            applyFieldsState(column, columnsUserState[userStateColumnIndex])
                        }
                        if (userStateColumnIndex >= 0 && (0, _type.isDefined)(columnsUserState[userStateColumnIndex].initialIndex)) {
                            resultColumns[userStateColumnIndex] = column
                        } else {
                            resultColumns.push(column)
                        }
                    }
                    var hasAddedBands = false;
                    for (i = 0; i < columnsUserState.length; i++) {
                        columnUserState = columnsUserState[i];
                        if (columnUserState.added && findUserStateColumn(columns, columnUserState) < 0) {
                            column = createColumn(that, columnUserState.added);
                            applyFieldsState(column, columnUserState);
                            resultColumns.push(column);
                            if (columnUserState.added.columns) {
                                hasAddedBands = true
                            }
                        }
                    }
                    if (hasAddedBands) {
                        updateColumnIndexes(that);
                        resultColumns = createColumnsFromOptions(that, resultColumns)
                    }
                    assignColumns(that, resultColumns)
                }
            };
            var updateIndexes = function(that, column) {
                updateColumnIndexes(that);
                updateColumnGroupIndexes(that, column);
                updateColumnSortIndexes(that, column);
                updateColumnVisibleIndexes(that, column)
            };
            var resetColumnsCache = function(that) {
                that.resetColumnsCache()
            };
            var assignColumns = function(that, columns) {
                that._columns = columns;
                resetColumnsCache(that);
                that.updateColumnDataTypes()
            };
            var updateColumnChanges = function(that, changeType, optionName, columnIndex) {
                var columnChanges = that._columnChanges || {
                    optionNames: {
                        length: 0
                    },
                    changeTypes: {
                        length: 0
                    },
                    columnIndex: columnIndex
                };
                optionName = optionName || "all";
                optionName = optionName.split(".")[0];
                var changeTypes = columnChanges.changeTypes;
                if (changeType && !changeTypes[changeType]) {
                    changeTypes[changeType] = true;
                    changeTypes.length++
                }
                var optionNames = columnChanges.optionNames;
                if (optionName && !optionNames[optionName]) {
                    optionNames[optionName] = true;
                    optionNames.length++
                }
                if (void 0 === columnIndex || columnIndex !== columnChanges.columnIndex) {
                    delete columnChanges.columnIndex
                }
                that._columnChanges = columnChanges;
                resetColumnsCache(that)
            };
            var fireColumnsChanged = function(that) {
                var onColumnsChanging = that.option("onColumnsChanging"),
                    columnChanges = that._columnChanges;
                if (that.isInitialized() && !that._updateLockCount && columnChanges) {
                    if (onColumnsChanging) {
                        that._updateLockCount++;
                        onColumnsChanging((0, _extend.extend)({
                            component: that.component
                        }, columnChanges));
                        that._updateLockCount--
                    }
                    that._columnChanges = void 0;
                    if (columnChanges.optionNames && (columnChanges.optionNames.dataField || columnChanges.optionNames.lookup || columnChanges.optionNames.dataType)) {
                        that.reinit()
                    } else {
                        that.columnsChanged.fire(columnChanges)
                    }
                }
            };
            var updateSortOrderWhenGrouping = function(column, groupIndex, prevGroupIndex) {
                var columnWasGrouped = prevGroupIndex >= 0;
                if (groupIndex >= 0) {
                    if (!columnWasGrouped) {
                        column.lastSortOrder = column.sortOrder
                    }
                } else {
                    column.sortOrder = column.lastSortOrder
                }
            };
            var fireOptionChanged = function(that, options) {
                var value = options.value,
                    optionName = options.optionName,
                    prevValue = options.prevValue,
                    fullOptionName = options.fullOptionName;
                if (!IGNORE_COLUMN_OPTION_NAMES[optionName]) {
                    that._skipProcessingColumnsChange = true;
                    that.component._notifyOptionChanged(fullOptionName + "." + optionName, value, prevValue);
                    that._skipProcessingColumnsChange = false
                }
            };
            var columnOptionCore = function(that, column, optionName, value, notFireEvent) {
                var prevValue, optionSetter, columns, changeType, fullOptionName, initialColumn, optionGetter = _data2.default.compileGetter(optionName),
                    columnIndex = column.index;
                if (3 === arguments.length) {
                    return optionGetter(column, {
                        functionsAsIs: true
                    })
                }
                prevValue = optionGetter(column, {
                    functionsAsIs: true
                });
                if (prevValue !== value) {
                    if ("groupIndex" === optionName || "calculateGroupValue" === optionName) {
                        changeType = "grouping";
                        updateSortOrderWhenGrouping(column, value, prevValue)
                    } else {
                        if ("sortIndex" === optionName || "sortOrder" === optionName || "calculateSortValue" === optionName) {
                            changeType = "sorting"
                        } else {
                            changeType = "columns"
                        }
                    }
                    optionSetter = _data2.default.compileSetter(optionName);
                    optionSetter(column, value, {
                        functionsAsIs: true
                    });
                    fullOptionName = getColumnFullPath(that, column);
                    fullOptionName && fireOptionChanged(that, {
                        fullOptionName: fullOptionName,
                        optionName: optionName,
                        value: value,
                        prevValue: prevValue
                    });
                    if (!(0, _type.isDefined)(prevValue) && !(0, _type.isDefined)(value) && 0 !== optionName.indexOf("buffer")) {
                        notFireEvent = true
                    }
                    if (!notFireEvent) {
                        if ((0, _array.inArray)(optionName, USER_STATE_FIELD_NAMES) < 0 && "visibleWidth" !== optionName) {
                            columns = that.option("columns");
                            initialColumn = that.getColumnByPath(fullOptionName, columns);
                            if ((0, _type.isString)(initialColumn)) {
                                initialColumn = columns[columnIndex] = {
                                    dataField: initialColumn
                                }
                            }
                            if (initialColumn && checkUserStateColumn(initialColumn, column)) {
                                optionSetter(initialColumn, value, {
                                    functionsAsIs: true
                                })
                            }
                        }
                        updateColumnChanges(that, changeType, optionName, columnIndex)
                    } else {
                        resetColumnsCache(that)
                    }
                }
            };
            var isSortOrderValid = function(sortOrder) {
                return "asc" === sortOrder || "desc" === sortOrder
            };
            var addExpandColumn = function(that) {
                var options = that._getExpandColumnOptions();
                that.addCommandColumn(options)
            };
            var defaultSetCellValue = function(data, value) {
                var name, i, path = this.dataField.split("."),
                    dotCount = path.length - 1;
                if (this.serializeValue) {
                    value = this.serializeValue(value)
                }
                for (i = 0; i < dotCount; i++) {
                    name = path[i];
                    data = data[name] = data[name] || {}
                }
                data[path[dotCount]] = value
            };
            var getDataColumns = function getDataColumns(columns, rowIndex, bandColumnID) {
                var result = [];
                rowIndex = rowIndex || 0;
                columns[rowIndex] && _iterator2.default.each(columns[rowIndex], function(_, column) {
                    if (column.ownerBand === bandColumnID || (0, _type.isDefined)(column.groupIndex)) {
                        if (!column.isBand || !column.colspan) {
                            if (!column.command || rowIndex < 1) {
                                result.push(column)
                            }
                        } else {
                            result.push.apply(result, getDataColumns(columns, rowIndex + 1, column.index))
                        }
                    }
                });
                return result
            };
            var _getRowCount = function(that, level, bandColumnIndex) {
                var rowCount = 1,
                    bandColumnsCache = that.getBandColumnsCache(),
                    columnParentByIndex = bandColumnsCache.columnParentByIndex;
                that._columns.forEach(function(column) {
                    var parents = getParentBandColumns(column.index, columnParentByIndex),
                        invisibleParents = parents.filter(function(column) {
                            return !column.visible
                        });
                    if (column.visible && !invisibleParents.length) {
                        rowCount = Math.max(rowCount, parents.length + 1)
                    }
                });
                return rowCount
            };
            var getFixedPosition = function(that, column) {
                var rtlEnabled = that.option("rtlEnabled");
                if (column.command && !isCustomCommandColumn(that, column) || !column.fixedPosition) {
                    return rtlEnabled ? "right" : "left"
                }
                return column.fixedPosition
            };
            var processExpandColumns = function(columns, expandColumns, type, columnIndex) {
                var customColumnIndex, rowCount = this.getRowCount(),
                    rowspan = columns[columnIndex] && columns[columnIndex].rowspan,
                    expandColumnsByType = expandColumns.filter(function(column) {
                        return column.type === type
                    });
                columns.forEach(function(column, index) {
                    if (column.type === type) {
                        customColumnIndex = index;
                        rowspan = columns[index + 1] ? columns[index + 1].rowspan : rowCount
                    }
                });
                if (rowspan > 1) {
                    expandColumnsByType = _iterator2.default.map(expandColumnsByType, function(expandColumn) {
                        return (0, _extend.extend)({}, expandColumn, {
                            rowspan: rowspan
                        })
                    })
                }
                expandColumnsByType.unshift.apply(expandColumnsByType, (0, _type.isDefined)(customColumnIndex) ? [customColumnIndex, 1] : [columnIndex, 0]);
                columns.splice.apply(columns, expandColumnsByType);
                return rowspan || 1
            };
            var digitsCount = function(number) {
                var i;
                for (i = 0; number > 1; i++) {
                    number /= 10
                }
                return i
            };
            var numberToString = function(number, digitsCount) {
                var str = number ? number.toString() : "0";
                while (str.length < digitsCount) {
                    str = "0" + str
                }
                return str
            };
            var mergeColumns = function(that, columns, commandColumns, needToExtend) {
                var i, column, columnOptions, commandColumnIndex, result = columns.slice().map(function(column) {
                        return (0, _extend.extend)({}, column)
                    }),
                    isColumnFixing = that._isColumnFixing(),
                    defaultCommandColumns = commandColumns.slice().map(function(column) {
                        return (0, _extend.extend)({
                            fixed: isColumnFixing
                        }, column)
                    }),
                    getCommandColumnIndex = function(column) {
                        return commandColumns.reduce(function(result, commandColumn, index) {
                            var columnType = needToExtend && column.type === GROUP_COMMAND_COLUMN_NAME ? "expand" : column.type;
                            return commandColumn.type === columnType || commandColumn.command === column.command ? index : result
                        }, -1)
                    },
                    callbackFilter = function(commandColumn) {
                        return commandColumn.command !== commandColumns[commandColumnIndex].command
                    };
                for (i = 0; i < columns.length; i++) {
                    column = columns[i];
                    commandColumnIndex = column && (column.type || column.command) ? getCommandColumnIndex(column) : -1;
                    if (commandColumnIndex >= 0) {
                        if (needToExtend) {
                            result[i] = (0, _extend.extend)({
                                fixed: isColumnFixing
                            }, commandColumns[commandColumnIndex], column);
                            if (column.type !== GROUP_COMMAND_COLUMN_NAME) {
                                defaultCommandColumns = defaultCommandColumns.filter(callbackFilter)
                            }
                        } else {
                            columnOptions = {
                                visibleIndex: column.visibleIndex,
                                index: column.index,
                                headerId: column.headerId,
                                allowFixing: 0 === column.groupIndex,
                                allowReordering: 0 === column.groupIndex,
                                groupIndex: column.groupIndex
                            };
                            result[i] = (0, _extend.extend)({}, column, commandColumns[commandColumnIndex], column.type === GROUP_COMMAND_COLUMN_NAME && columnOptions)
                        }
                    }
                }
                if (columns.length && needToExtend && defaultCommandColumns.length) {
                    result = result.concat(defaultCommandColumns)
                }
                return result
            };
            var isCustomCommandColumn = function(that, commandColumn) {
                return !!that._columns.filter(function(column) {
                    return column.type === commandColumn.type
                }).length
            };
            var isColumnFixed = function(that, column) {
                return (0, _type.isDefined)(column.fixed) || !column.type ? column.fixed : that._isColumnFixing()
            };
            return {
                _getExpandColumnOptions: function() {
                    return {
                        type: "expand",
                        command: "expand",
                        width: "auto",
                        cssClass: COMMAND_EXPAND_CLASS,
                        allowEditing: false,
                        allowGrouping: false,
                        allowSorting: false,
                        allowResizing: false,
                        allowReordering: false,
                        allowHiding: false
                    }
                },
                _getFirstItems: function(dataSource) {
                    var groupsCount, items = [];
                    var getFirstItemsCore = function getFirstItemsCore(items, groupsCount) {
                        var i, childItems;
                        if (!items || !groupsCount) {
                            return items
                        }
                        for (i = 0; i < items.length; i++) {
                            childItems = getFirstItemsCore(items[i].items || items[i].collapsedItems, groupsCount - 1);
                            if (childItems && childItems.length) {
                                return childItems
                            }
                        }
                    };
                    if (dataSource && dataSource.items().length > 0) {
                        groupsCount = (0, _uiGrid_core3.normalizeSortingInfo)(dataSource.group()).length;
                        items = getFirstItemsCore(dataSource.items(), groupsCount) || []
                    }
                    return items
                },
                _endUpdateCore: function() {
                    !this._skipProcessingColumnsChange && fireColumnsChanged(this)
                },
                init: function() {
                    var that = this,
                        columns = that.option("columns");
                    that._commandColumns = that._commandColumns || [];
                    that._columns = that._columns || [];
                    that._isColumnsFromOptions = !!columns;
                    if (that._isColumnsFromOptions) {
                        assignColumns(that, columns ? createColumnsFromOptions(that, columns) : []);
                        applyUserState(that)
                    } else {
                        assignColumns(that, that._columnsUserState ? createColumnsFromOptions(that, that._columnsUserState) : that._columns)
                    }
                    addExpandColumn(that);
                    if (that._dataSourceApplied) {
                        that.applyDataSource(that._dataSource, true)
                    } else {
                        updateIndexes(that)
                    }
                },
                callbackNames: function() {
                    return ["columnsChanged"]
                },
                getColumnByPath: function(path, columns) {
                    var column, that = this,
                        columnIndexes = [];
                    path.replace(regExp, function(_, columnIndex) {
                        columnIndexes.push(parseInt(columnIndex));
                        return ""
                    });
                    if (columnIndexes.length) {
                        if (columns) {
                            column = columnIndexes.reduce(function(column, index) {
                                return column && column.columns && column.columns[index]
                            }, {
                                columns: columns
                            })
                        } else {
                            column = getColumnByIndexes(that, columnIndexes)
                        }
                    }
                    return column
                },
                optionChanged: function(args) {
                    switch (args.name) {
                        case "adaptColumnWidthByRatio":
                            args.handled = true;
                            break;
                        case "columns":
                            args.handled = true;
                            if (!this._skipProcessingColumnsChange) {
                                if (args.name === args.fullName) {
                                    this._columnsUserState = null;
                                    this._ignoreColumnOptionNames = null;
                                    this.init()
                                } else {
                                    this._columnOptionChanged(args)
                                }
                            } else {
                                this._updateRequireResize(args)
                            }
                            break;
                        case "commonColumnSettings":
                        case "columnAutoWidth":
                        case "allowColumnResizing":
                        case "allowColumnReordering":
                        case "columnFixing":
                        case "grouping":
                        case "groupPanel":
                        case "regenerateColumnsByVisibleItems":
                        case "customizeColumns":
                        case "editing":
                        case "columnHidingEnabled":
                        case "dateSerializationFormat":
                        case "columnResizingMode":
                        case "columnMinWidth":
                        case "columnWidth":
                            args.handled = true;
                            if (!(args.fullName && 0 === args.fullName.indexOf("editing.popup"))) {
                                this.reinit()
                            }
                            break;
                        case "rtlEnabled":
                            this.reinit();
                            break;
                        default:
                            this.callBase(args)
                    }
                },
                _columnOptionChanged: function(args) {
                    var columnOptionValue = {},
                        column = this.getColumnByPath(args.fullName),
                        columnOptionName = args.fullName.replace(regExp, "");
                    if (column) {
                        if (columnOptionName) {
                            columnOptionValue[columnOptionName] = args.value
                        } else {
                            columnOptionValue = args.value
                        }
                        this.columnOption(column.index, columnOptionValue)
                    }
                },
                _updateRequireResize: function(args) {
                    var component = this.component;
                    if ("width" === args.fullName.replace(regExp, "") && component._updateLockCount) {
                        component._requireResize = true
                    }
                },
                publicMethods: function() {
                    return ["addColumn", "deleteColumn", "columnOption", "columnCount", "clearSorting", "clearGrouping", "getVisibleColumns"]
                },
                applyDataSource: function(dataSource, forceApplying) {
                    var that = this,
                        isDataSourceLoaded = dataSource && dataSource.isLoaded();
                    that._dataSource = dataSource;
                    if (!that._dataSourceApplied || 0 === that._dataSourceColumnsCount || forceApplying || that.option("regenerateColumnsByVisibleItems")) {
                        if (isDataSourceLoaded) {
                            if (!that._isColumnsFromOptions) {
                                var columnsFromDataSource = createColumnsFromDataSource(that, dataSource);
                                if (columnsFromDataSource.length) {
                                    assignColumns(that, columnsFromDataSource);
                                    that._dataSourceColumnsCount = that._columns.length;
                                    applyUserState(that)
                                }
                            }
                            return that.updateColumns(dataSource, forceApplying)
                        } else {
                            that._dataSourceApplied = false
                        }
                    } else {
                        if (isDataSourceLoaded && !that.isAllDataTypesDefined(true) && that.updateColumnDataTypes(dataSource)) {
                            updateColumnChanges(that, "columns");
                            fireColumnsChanged(that);
                            return (new _deferred.Deferred).reject().promise()
                        }
                    }
                },
                reset: function() {
                    this._dataSourceApplied = false;
                    this._dataSourceColumnsCount = void 0;
                    this.reinit()
                },
                resetColumnsCache: function() {
                    var that = this;
                    that._visibleColumns = void 0;
                    that._fixedColumns = void 0;
                    that._rowCount = void 0;
                    that._bandColumnsCache = void 0
                },
                reinit: function() {
                    this._columnsUserState = this.getUserState();
                    this._ignoreColumnOptionNames = null;
                    this.init()
                },
                isInitialized: function() {
                    return !!this._columns.length || !!this.option("columns")
                },
                isDataSourceApplied: function() {
                    return this._dataSourceApplied
                },
                getCommonSettings: function(column) {
                    var commonColumnSettings = (!column || !column.type) && this.option("commonColumnSettings") || {},
                        groupingOptions = this.option("grouping") || {},
                        groupPanelOptions = this.option("groupPanel") || {};
                    return (0, _extend.extend)({
                        allowFixing: this.option("columnFixing.enabled"),
                        allowResizing: this.option("allowColumnResizing") || void 0,
                        allowReordering: this.option("allowColumnReordering"),
                        minWidth: this.option("columnMinWidth"),
                        width: this.option("columnWidth"),
                        autoExpandGroup: groupingOptions.autoExpandAll,
                        allowCollapsing: groupingOptions.allowCollapsing,
                        allowGrouping: groupPanelOptions.allowColumnDragging && groupPanelOptions.visible || groupingOptions.contextMenuEnabled
                    }, commonColumnSettings)
                },
                isColumnOptionUsed: function(optionName) {
                    for (var i = 0; i < this._columns.length; i++) {
                        if (this._columns[i][optionName]) {
                            return true
                        }
                    }
                },
                isAllDataTypesDefined: function(checkSerializers) {
                    var i, columns = this._columns;
                    if (!columns.length) {
                        return false
                    }
                    for (i = 0; i < columns.length; i++) {
                        if (!columns[i].dataField && columns[i].calculateCellValue === columns[i].defaultCalculateCellValue) {
                            continue
                        }
                        if (!columns[i].dataType || checkSerializers && columns[i].deserializeValue && void 0 === columns[i].serializationFormat) {
                            return false
                        }
                    }
                    return true
                },
                getColumns: function() {
                    return this._columns
                },
                isBandColumnsUsed: function() {
                    return this.getColumns().some(function(column) {
                        return column.isBand
                    })
                },
                getGroupColumns: function() {
                    var result = [];
                    _iterator2.default.each(this._columns, function() {
                        var column = this;
                        if ((0, _type.isDefined)(column.groupIndex)) {
                            result[column.groupIndex] = column
                        }
                    });
                    return result
                },
                getVisibleColumns: function(rowIndex) {
                    this._visibleColumns = this._visibleColumns || this._getVisibleColumnsCore();
                    rowIndex = (0, _type.isDefined)(rowIndex) ? rowIndex : this._visibleColumns.length - 1;
                    return this._visibleColumns[rowIndex] || []
                },
                getFixedColumns: function(rowIndex) {
                    this._fixedColumns = this._fixedColumns || this._getFixedColumnsCore();
                    rowIndex = (0, _type.isDefined)(rowIndex) ? rowIndex : this._fixedColumns.length - 1;
                    return this._fixedColumns[rowIndex] || []
                },
                getFilteringColumns: function() {
                    return this.getColumns().filter(function(item) {
                        return (item.dataField || item.name) && (item.allowFiltering || item.allowHeaderFiltering)
                    }).map(function(item) {
                        var field = (0, _extend.extend)(true, {}, item);
                        if (!(0, _type.isDefined)(field.dataField)) {
                            field.dataField = field.name
                        }
                        field.filterOperations = item.filterOperations !== item.defaultFilterOperations ? field.filterOperations : null;
                        return field
                    })
                },
                _getFixedColumnsCore: function() {
                    var i, j, column, prevColumn, notFixedColumnCount, transparentColumnIndex, lastFixedPosition, visibleColumns, that = this,
                        result = [],
                        rowCount = that.getRowCount(),
                        isColumnFixing = that._isColumnFixing(),
                        transparentColumn = {
                            command: "transparent"
                        },
                        transparentColspan = 0;
                    if (isColumnFixing) {
                        for (i = 0; i <= rowCount; i++) {
                            notFixedColumnCount = 0;
                            lastFixedPosition = null;
                            transparentColumnIndex = null;
                            visibleColumns = that.getVisibleColumns(i, true);
                            for (j = 0; j < visibleColumns.length; j++) {
                                prevColumn = visibleColumns[j - 1];
                                column = visibleColumns[j];
                                if (!column.fixed) {
                                    if (0 === i) {
                                        if (column.isBand && column.colspan) {
                                            transparentColspan += column.colspan
                                        } else {
                                            transparentColspan++
                                        }
                                    }
                                    notFixedColumnCount++;
                                    if (!(0, _type.isDefined)(transparentColumnIndex)) {
                                        transparentColumnIndex = j
                                    }
                                } else {
                                    if (prevColumn && prevColumn.fixed && getFixedPosition(that, prevColumn) !== getFixedPosition(that, column)) {
                                        if (!(0, _type.isDefined)(transparentColumnIndex)) {
                                            transparentColumnIndex = j
                                        }
                                    } else {
                                        lastFixedPosition = column.fixedPosition
                                    }
                                }
                            }
                            if (0 === i && (0 === notFixedColumnCount || notFixedColumnCount >= visibleColumns.length)) {
                                return []
                            }
                            if (!(0, _type.isDefined)(transparentColumnIndex)) {
                                transparentColumnIndex = "right" === lastFixedPosition ? 0 : visibleColumns.length
                            }
                            result[i] = visibleColumns.slice(0);
                            if (!transparentColumn.colspan) {
                                transparentColumn.colspan = transparentColspan
                            }
                            result[i].splice(transparentColumnIndex, notFixedColumnCount, transparentColumn)
                        }
                    }
                    return result
                },
                _isColumnFixing: function() {
                    var isColumnFixing = this.option("columnFixing.enabled");
                    !isColumnFixing && _iterator2.default.each(this._columns, function(_, column) {
                        if (column.fixed) {
                            isColumnFixing = true;
                            return false
                        }
                    });
                    return isColumnFixing
                },
                _getExpandColumnsCore: function() {
                    return this.getGroupColumns()
                },
                getExpandColumns: function() {
                    var expandColumn, expandColumns = this._getExpandColumnsCore(),
                        firstGroupColumn = expandColumns.filter(function(column) {
                            return 0 === column.groupIndex
                        })[0],
                        isFixedFirstGroupColumn = firstGroupColumn && firstGroupColumn.fixed,
                        isColumnFixing = this._isColumnFixing();
                    if (expandColumns.length) {
                        expandColumn = this.columnOption("command:expand")
                    }
                    expandColumns = _iterator2.default.map(expandColumns, function(column) {
                        return (0, _extend.extend)({}, column, {
                            visibleWidth: null,
                            minWidth: null,
                            cellTemplate: !(0, _type.isDefined)(column.groupIndex) ? column.cellTemplate : null,
                            headerCellTemplate: null,
                            fixed: !(0, _type.isDefined)(column.groupIndex) || !isFixedFirstGroupColumn ? isColumnFixing : true
                        }, expandColumn, {
                            index: column.index,
                            type: column.type || GROUP_COMMAND_COLUMN_NAME
                        })
                    });
                    return expandColumns
                },
                getBandColumnsCache: function() {
                    if (!this._bandColumnsCache) {
                        var columns = this._columns,
                            columnChildrenByIndex = {},
                            columnParentByIndex = {};
                        columns.forEach(function(column) {
                            var parentIndex = column.ownerBand,
                                parent = columns[parentIndex];
                            if (column.colspan) {
                                column.colspan = void 0
                            }
                            if (column.rowspan) {
                                column.rowspan = void 0
                            }
                            if (parent) {
                                columnParentByIndex[column.index] = parent
                            } else {
                                parentIndex = -1
                            }
                            columnChildrenByIndex[parentIndex] = columnChildrenByIndex[parentIndex] || [];
                            columnChildrenByIndex[parentIndex].push(column)
                        });
                        this._bandColumnsCache = {
                            columnChildrenByIndex: columnChildrenByIndex,
                            columnParentByIndex: columnParentByIndex
                        }
                    }
                    return this._bandColumnsCache
                },
                _isColumnVisible: function(column) {
                    return column.visible && this.isParentColumnVisible(column.index)
                },
                _getVisibleColumnsCore: function() {
                    var i, firstPositiveIndexColumn, isFixedToEnd, that = this,
                        result = [],
                        rowspanGroupColumns = 0,
                        rowspanExpandColumns = 0,
                        rowCount = that.getRowCount(),
                        positiveIndexedColumns = [],
                        negativeIndexedColumns = [],
                        notGroupedColumnsCount = 0,
                        rtlEnabled = that.option("rtlEnabled"),
                        bandColumnsCache = that.getBandColumnsCache(),
                        expandColumns = mergeColumns(that, that.getExpandColumns(), that._columns),
                        columns = mergeColumns(that, that._columns, that._commandColumns, true),
                        columnDigitsCount = digitsCount(columns.length);
                    processBandColumns(that, columns, bandColumnsCache);
                    for (i = 0; i < rowCount; i++) {
                        result[i] = [];
                        negativeIndexedColumns[i] = [{}];
                        positiveIndexedColumns[i] = [{}, {}, {}]
                    }
                    _iterator2.default.each(columns, function() {
                        var rowIndex, indexedColumns, column = this,
                            visibleIndex = column.visibleIndex,
                            parentBandColumns = getParentBandColumns(column.index, bandColumnsCache.columnParentByIndex),
                            visible = that._isColumnVisible(column);
                        if (visible && (!(0, _type.isDefined)(column.groupIndex) || column.showWhenGrouped)) {
                            rowIndex = parentBandColumns.length;
                            if (visibleIndex < 0) {
                                visibleIndex = -visibleIndex;
                                indexedColumns = negativeIndexedColumns[rowIndex]
                            } else {
                                column.fixed = parentBandColumns.length ? parentBandColumns[0].fixed : column.fixed;
                                column.fixedPosition = parentBandColumns.length ? parentBandColumns[0].fixedPosition : column.fixedPosition;
                                if (column.fixed) {
                                    isFixedToEnd = "right" === column.fixedPosition;
                                    if (rtlEnabled && (!column.command || isCustomCommandColumn(that, column))) {
                                        isFixedToEnd = !isFixedToEnd
                                    }
                                    if (isFixedToEnd) {
                                        indexedColumns = positiveIndexedColumns[rowIndex][2]
                                    } else {
                                        indexedColumns = positiveIndexedColumns[rowIndex][0]
                                    }
                                } else {
                                    indexedColumns = positiveIndexedColumns[rowIndex][1]
                                }
                            }
                            if (parentBandColumns.length) {
                                visibleIndex = numberToString(visibleIndex, columnDigitsCount);
                                for (i = parentBandColumns.length - 1; i >= 0; i--) {
                                    visibleIndex = numberToString(parentBandColumns[i].visibleIndex, columnDigitsCount) + visibleIndex
                                }
                            }
                            indexedColumns[visibleIndex] = indexedColumns[visibleIndex] || [];
                            indexedColumns[visibleIndex].push(column);
                            notGroupedColumnsCount++
                        }
                    });
                    _iterator2.default.each(result, function(rowIndex) {
                        (0, _object.orderEach)(negativeIndexedColumns[rowIndex], function(_, columns) {
                            result[rowIndex].unshift.apply(result[rowIndex], columns)
                        });
                        firstPositiveIndexColumn = result[rowIndex].length;
                        _iterator2.default.each(positiveIndexedColumns[rowIndex], function(index, columnsByFixing) {
                            (0, _object.orderEach)(columnsByFixing, function(_, columnsByVisibleIndex) {
                                result[rowIndex].push.apply(result[rowIndex], columnsByVisibleIndex)
                            })
                        });
                        if (rowspanExpandColumns < rowIndex + 1) {
                            rowspanExpandColumns += processExpandColumns.call(that, result[rowIndex], expandColumns, "detailExpand", firstPositiveIndexColumn)
                        }
                        if (rowspanGroupColumns < rowIndex + 1) {
                            rowspanGroupColumns += processExpandColumns.call(that, result[rowIndex], expandColumns, GROUP_COMMAND_COLUMN_NAME, firstPositiveIndexColumn)
                        }
                    });
                    result.push(getDataColumns(result));
                    if (!notGroupedColumnsCount && that._columns.length) {
                        result[rowCount].push({
                            command: "empty"
                        })
                    }
                    return result
                },
                getInvisibleColumns: function(columns, bandColumnIndex) {
                    var hiddenColumnsByBand, that = this,
                        result = [];
                    columns = columns || that._columns;
                    _iterator2.default.each(columns, function(_, column) {
                        if (column.ownerBand !== bandColumnIndex) {
                            return
                        }
                        if (column.isBand) {
                            if (!column.visible) {
                                hiddenColumnsByBand = that.getChildrenByBandColumn(column.index)
                            } else {
                                hiddenColumnsByBand = that.getInvisibleColumns(that.getChildrenByBandColumn(column.index), column.index)
                            }
                            if (hiddenColumnsByBand.length) {
                                result.push(column);
                                result = result.concat(hiddenColumnsByBand)
                            }
                            return
                        }
                        if (!column.visible) {
                            result.push(column)
                        }
                    });
                    return result
                },
                getChooserColumns: function(getAllColumns) {
                    var columns = getAllColumns ? this.getColumns() : this.getInvisibleColumns();
                    return (0, _common.grep)(columns, function(column) {
                        return column.showInColumnChooser
                    })
                },
                allowMoveColumn: function(fromVisibleIndex, toVisibleIndex, sourceLocation, targetLocation) {
                    var that = this,
                        columnIndex = getColumnIndexByVisibleIndex(that, fromVisibleIndex, sourceLocation),
                        sourceColumn = that._columns[columnIndex];
                    if (sourceColumn && (sourceColumn.allowReordering || sourceColumn.allowGrouping || sourceColumn.allowHiding)) {
                        if (sourceLocation === targetLocation) {
                            if (sourceLocation === COLUMN_CHOOSER_LOCATION) {
                                return false
                            }
                            fromVisibleIndex = (0, _type.isObject)(fromVisibleIndex) ? fromVisibleIndex.columnIndex : fromVisibleIndex;
                            toVisibleIndex = (0, _type.isObject)(toVisibleIndex) ? toVisibleIndex.columnIndex : toVisibleIndex;
                            return fromVisibleIndex !== toVisibleIndex && fromVisibleIndex + 1 !== toVisibleIndex
                        } else {
                            if (sourceLocation === GROUP_LOCATION && targetLocation !== COLUMN_CHOOSER_LOCATION || targetLocation === GROUP_LOCATION) {
                                return sourceColumn && sourceColumn.allowGrouping
                            } else {
                                if (sourceLocation === COLUMN_CHOOSER_LOCATION || targetLocation === COLUMN_CHOOSER_LOCATION) {
                                    return sourceColumn && sourceColumn.allowHiding
                                }
                            }
                        }
                        return true
                    }
                    return false
                },
                moveColumn: function(fromVisibleIndex, toVisibleIndex, sourceLocation, targetLocation) {
                    var prevGroupIndex, targetGroupIndex, column, that = this,
                        options = {},
                        fromIndex = getColumnIndexByVisibleIndex(that, fromVisibleIndex, sourceLocation),
                        toIndex = getColumnIndexByVisibleIndex(that, toVisibleIndex, targetLocation);
                    if (fromIndex >= 0) {
                        column = that._columns[fromIndex];
                        toVisibleIndex = (0, _type.isObject)(toVisibleIndex) ? toVisibleIndex.columnIndex : toVisibleIndex;
                        targetGroupIndex = toIndex >= 0 ? that._columns[toIndex].groupIndex : -1;
                        if ((0, _type.isDefined)(column.groupIndex) && sourceLocation === GROUP_LOCATION) {
                            if (targetGroupIndex > column.groupIndex) {
                                targetGroupIndex--
                            }
                            if (targetLocation !== GROUP_LOCATION) {
                                options.groupIndex = void 0
                            } else {
                                prevGroupIndex = column.groupIndex;
                                delete column.groupIndex;
                                updateColumnGroupIndexes(that)
                            }
                        }
                        if (targetLocation === GROUP_LOCATION) {
                            options.groupIndex = moveColumnToGroup(that, column, targetGroupIndex);
                            column.groupIndex = prevGroupIndex
                        } else {
                            if (toVisibleIndex >= 0) {
                                var targetColumn = that._columns[toIndex];
                                if (!targetColumn || column.ownerBand !== targetColumn.ownerBand) {
                                    options.visibleIndex = MAX_SAFE_INTEGER
                                } else {
                                    if (isColumnFixed(that, column) ^ isColumnFixed(that, targetColumn)) {
                                        options.visibleIndex = MAX_SAFE_INTEGER
                                    } else {
                                        options.visibleIndex = targetColumn.visibleIndex
                                    }
                                }
                            }
                        }
                        var isVisible = targetLocation !== COLUMN_CHOOSER_LOCATION;
                        if (column.visible !== isVisible) {
                            options.visible = isVisible
                        }
                        that.columnOption(column.index, options)
                    }
                },
                changeSortOrder: function(columnIndex, sortOrder) {
                    var that = this,
                        options = {},
                        sortingOptions = that.option("sorting"),
                        sortingMode = sortingOptions && sortingOptions.mode,
                        needResetSorting = "single" === sortingMode || !sortOrder,
                        allowSorting = "single" === sortingMode || "multiple" === sortingMode,
                        column = that._columns[columnIndex],
                        nextSortOrder = function(column) {
                            if ("ctrl" === sortOrder) {
                                if (!("sortOrder" in column && "sortIndex" in column)) {
                                    return false
                                }
                                options.sortOrder = void 0;
                                options.sortIndex = void 0
                            } else {
                                if ((0, _type.isDefined)(column.groupIndex) || (0, _type.isDefined)(column.sortIndex)) {
                                    options.sortOrder = "desc" === column.sortOrder ? "asc" : "desc"
                                } else {
                                    options.sortOrder = "asc"
                                }
                            }
                            return true
                        };
                    if (allowSorting && column && column.allowSorting) {
                        if (needResetSorting && !(0, _type.isDefined)(column.groupIndex)) {
                            _iterator2.default.each(that._columns, function(index) {
                                if (index !== columnIndex && this.sortOrder && !(0, _type.isDefined)(this.groupIndex)) {
                                    delete this.sortOrder;
                                    delete this.sortIndex
                                }
                            })
                        }
                        if (isSortOrderValid(sortOrder)) {
                            if (column.sortOrder !== sortOrder) {
                                options.sortOrder = sortOrder
                            }
                        } else {
                            if ("none" === sortOrder) {
                                if (column.sortOrder) {
                                    options.sortIndex = void 0;
                                    options.sortOrder = void 0
                                }
                            } else {
                                nextSortOrder(column)
                            }
                        }
                    }
                    that.columnOption(column.index, options)
                },
                getSortDataSourceParameters: function(useLocalSelector) {
                    var that = this,
                        sortColumns = [],
                        sort = [];
                    _iterator2.default.each(that._columns, function() {
                        if ((this.dataField || this.selector || this.calculateCellValue) && (0, _type.isDefined)(this.sortIndex) && !(0, _type.isDefined)(this.groupIndex)) {
                            sortColumns[this.sortIndex] = this
                        }
                    });
                    _iterator2.default.each(sortColumns, function() {
                        var sortOrder = this && this.sortOrder;
                        if (isSortOrderValid(sortOrder)) {
                            var sortItem = {
                                selector: this.calculateSortValue || this.displayField || this.calculateDisplayValue || useLocalSelector && this.selector || this.dataField || this.calculateCellValue,
                                desc: "desc" === this.sortOrder
                            };
                            if (this.sortingMethod) {
                                sortItem.compare = this.sortingMethod.bind(this)
                            }
                            sort.push(sortItem)
                        }
                    });
                    return sort.length > 0 ? sort : null
                },
                getGroupDataSourceParameters: function(useLocalSelector) {
                    var group = [];
                    _iterator2.default.each(this.getGroupColumns(), function() {
                        var selector = this.calculateGroupValue || this.displayField || this.calculateDisplayValue || useLocalSelector && this.selector || this.dataField || this.calculateCellValue;
                        if (selector) {
                            var groupItem = {
                                selector: selector,
                                desc: "desc" === this.sortOrder,
                                isExpanded: !!this.autoExpandGroup
                            };
                            if (this.sortingMethod) {
                                groupItem.compare = this.sortingMethod.bind(this)
                            }
                            group.push(groupItem)
                        }
                    });
                    return group.length > 0 ? group : null
                },
                refresh: function(updateNewLookupsOnly) {
                    var deferreds = [];
                    _iterator2.default.each(this._columns, function() {
                        var lookup = this.lookup;
                        if (lookup && !this.calculateDisplayValue) {
                            if (updateNewLookupsOnly && lookup.valueMap) {
                                return
                            }
                            if (lookup.update) {
                                deferreds.push(lookup.update())
                            }
                        }
                    });
                    return _deferred.when.apply(_renderer2.default, deferreds).done(resetColumnsCache.bind(null, this))
                },
                _updateColumnOptions: function(column) {
                    column.selector = column.selector || function(data) {
                        return column.calculateCellValue(data)
                    };
                    _iterator2.default.each(["calculateSortValue", "calculateGroupValue", "calculateDisplayValue"], function(_, calculateCallbackName) {
                        var calculateCallback = column[calculateCallbackName];
                        if ((0, _type.isFunction)(calculateCallback) && !calculateCallback.originalCallback) {
                            column[calculateCallbackName] = function(data) {
                                return calculateCallback.call(column, data)
                            };
                            column[calculateCallbackName].originalCallback = calculateCallback
                        }
                    });
                    if ((0, _type.isString)(column.calculateDisplayValue)) {
                        column.displayField = column.calculateDisplayValue;
                        column.calculateDisplayValue = _data2.default.compileGetter(column.displayField)
                    }
                    if (column.calculateDisplayValue) {
                        column.displayValueMap = column.displayValueMap || {}
                    }
                    updateSerializers(column, column.dataType);
                    var lookup = column.lookup;
                    if (lookup) {
                        updateSerializers(lookup, lookup.dataType)
                    }
                    var dataType = lookup ? lookup.dataType : column.dataType;
                    if (dataType) {
                        column.alignment = column.alignment || getAlignmentByDataType(dataType, this.option("rtlEnabled"));
                        column.format = column.format || (0, _uiGrid_core3.getFormatByDataType)(dataType);
                        column.customizeText = column.customizeText || getCustomizeTextByDataType(dataType);
                        column.defaultFilterOperations = column.defaultFilterOperations || !lookup && DATATYPE_OPERATIONS[dataType] || [];
                        if (!(0, _type.isDefined)(column.filterOperations)) {
                            setFilterOperationsAsDefaultValues(column)
                        }
                        column.defaultFilterOperation = column.filterOperations && column.filterOperations[0] || "=";
                        column.showEditorAlways = (0, _type.isDefined)(column.showEditorAlways) ? column.showEditorAlways : "boolean" === dataType && !column.cellTemplate
                    }
                },
                updateColumnDataTypes: function(dataSource) {
                    var that = this,
                        dateSerializationFormat = that.option("dateSerializationFormat"),
                        firstItems = that._getFirstItems(dataSource),
                        isColumnDataTypesUpdated = false;
                    _iterator2.default.each(that._columns, function(index, column) {
                        var i, value, dataType, lookupDataType, valueDataType, lookup = column.lookup;
                        if ((0, _uiGrid_core3.isDateType)(column.dataType) && void 0 === column.serializationFormat) {
                            column.serializationFormat = dateSerializationFormat
                        }
                        if (lookup && (0, _uiGrid_core3.isDateType)(lookup.dataType) && void 0 === column.serializationFormat) {
                            lookup.serializationFormat = dateSerializationFormat
                        }
                        if (column.calculateCellValue && firstItems.length) {
                            if (!column.dataType || lookup && !lookup.dataType) {
                                for (i = 0; i < firstItems.length; i++) {
                                    value = column.calculateCellValue(firstItems[i]);
                                    if (!column.dataType) {
                                        valueDataType = getValueDataType(value);
                                        dataType = dataType || valueDataType;
                                        if (dataType && valueDataType && dataType !== valueDataType) {
                                            dataType = "string"
                                        }
                                    }
                                    if (lookup && !lookup.dataType) {
                                        valueDataType = getValueDataType((0, _uiGrid_core3.getDisplayValue)(column, value, firstItems[i]));
                                        lookupDataType = lookupDataType || valueDataType;
                                        if (lookupDataType && valueDataType && lookupDataType !== valueDataType) {
                                            lookupDataType = "string"
                                        }
                                    }
                                }
                                if (dataType || lookupDataType) {
                                    if (dataType) {
                                        column.dataType = dataType
                                    }
                                    if (lookup && lookupDataType) {
                                        lookup.dataType = lookupDataType
                                    }
                                    isColumnDataTypesUpdated = true
                                }
                            }
                            if (void 0 === column.serializationFormat || lookup && void 0 === lookup.serializationFormat) {
                                for (i = 0; i < firstItems.length; i++) {
                                    value = column.calculateCellValue(firstItems[i], true);
                                    if (void 0 === column.serializationFormat) {
                                        column.serializationFormat = getSerializationFormat(column.dataType, value)
                                    }
                                    if (lookup && void 0 === lookup.serializationFormat) {
                                        lookup.serializationFormat = getSerializationFormat(lookup.dataType, lookup.calculateCellValue(value, true))
                                    }
                                }
                            }
                        }
                        that._updateColumnOptions(column)
                    });
                    return isColumnDataTypesUpdated
                },
                _customizeColumns: function(columns) {
                    var hasOwnerBand, that = this,
                        customizeColumns = that.option("customizeColumns");
                    if (customizeColumns) {
                        hasOwnerBand = columns.some(function(column) {
                            return (0, _type.isObject)(column.ownerBand)
                        });
                        if (hasOwnerBand) {
                            updateIndexes(that)
                        }
                        customizeColumns(columns);
                        assignColumns(that, createColumnsFromOptions(that, columns))
                    }
                },
                updateColumns: function(dataSource, forceApplying) {
                    var sortParameters, groupParameters, that = this;
                    if (!forceApplying) {
                        that.updateSortingGrouping(dataSource)
                    }
                    if (!dataSource || dataSource.isLoaded()) {
                        sortParameters = dataSource ? dataSource.sort() || [] : that.getSortDataSourceParameters();
                        groupParameters = dataSource ? dataSource.group() || [] : that.getGroupDataSourceParameters();
                        that._customizeColumns(that._columns);
                        updateIndexes(that);
                        var columns = that._columns;
                        return (0, _deferred.when)(that.refresh(true)).always(function() {
                            if (that._columns !== columns) {
                                return
                            }
                            that._updateChanges(dataSource, {
                                sorting: sortParameters,
                                grouping: groupParameters
                            });
                            fireColumnsChanged(that)
                        })
                    }
                },
                _updateChanges: function(dataSource, parameters) {
                    var that = this;
                    if (dataSource) {
                        that.updateColumnDataTypes(dataSource);
                        that._dataSourceApplied = true
                    }
                    if (!(0, _uiGrid_core3.equalSortParameters)(parameters.sorting, that.getSortDataSourceParameters())) {
                        updateColumnChanges(that, "sorting")
                    }
                    if (!(0, _uiGrid_core3.equalSortParameters)(parameters.grouping, that.getGroupDataSourceParameters())) {
                        updateColumnChanges(that, "grouping")
                    }
                    updateColumnChanges(that, "columns")
                },
                updateSortingGrouping: function(dataSource, fromDataSource) {
                    var sortParameters, groupParameters, columnsGroupParameters, columnsSortParameters, isColumnsChanged, that = this,
                        updateSortGroupParameterIndexes = function(columns, sortParameters, indexParameterName) {
                            var i, selector, isExpanded;
                            _iterator2.default.each(columns, function(index, column) {
                                delete column[indexParameterName];
                                if (sortParameters) {
                                    for (i = 0; i < sortParameters.length; i++) {
                                        selector = sortParameters[i].selector;
                                        isExpanded = sortParameters[i].isExpanded;
                                        if (selector === column.dataField || selector === column.name || selector === column.selector || selector === column.calculateCellValue || selector === column.calculateGroupValue) {
                                            column.sortOrder = column.sortOrder || (sortParameters[i].desc ? "desc" : "asc");
                                            if (void 0 !== isExpanded) {
                                                column.autoExpandGroup = isExpanded
                                            }
                                            column[indexParameterName] = i;
                                            break
                                        }
                                    }
                                }
                            })
                        };
                    if (dataSource) {
                        sortParameters = (0, _uiGrid_core3.normalizeSortingInfo)(dataSource.sort());
                        groupParameters = (0, _uiGrid_core3.normalizeSortingInfo)(dataSource.group());
                        columnsGroupParameters = that.getGroupDataSourceParameters();
                        columnsSortParameters = that.getSortDataSourceParameters();
                        if (!that._columns.length) {
                            _iterator2.default.each(groupParameters, function(index, group) {
                                that._columns.push(group.selector)
                            });
                            _iterator2.default.each(sortParameters, function(index, sort) {
                                that._columns.push(sort.selector)
                            });
                            assignColumns(that, createColumnsFromOptions(that, that._columns))
                        }
                        if ((fromDataSource || !columnsGroupParameters && !that._hasUserState) && !(0, _uiGrid_core3.equalSortParameters)(groupParameters, columnsGroupParameters)) {
                            updateSortGroupParameterIndexes(that._columns, groupParameters, "groupIndex");
                            if (fromDataSource) {
                                updateColumnChanges(that, "grouping");
                                isColumnsChanged = true
                            }
                        }
                        if ((fromDataSource || !columnsSortParameters && !that._hasUserState) && !(0, _uiGrid_core3.equalSortParameters)(sortParameters, columnsSortParameters)) {
                            updateSortGroupParameterIndexes(that._columns, sortParameters, "sortIndex");
                            if (fromDataSource) {
                                updateColumnChanges(that, "sorting");
                                isColumnsChanged = true
                            }
                        }
                        if (isColumnsChanged) {
                            fireColumnsChanged(that)
                        }
                    }
                },
                updateFilter: function(filter, remoteFiltering, columnIndex, filterValue) {
                    var that = this;
                    if (!Array.isArray(filter)) {
                        return filter
                    }
                    var column, i;
                    filter = (0, _extend.extend)([], filter);
                    columnIndex = filter.columnIndex || columnIndex;
                    filterValue = filter.filterValue || filterValue;
                    if ((0, _type.isString)(filter[0])) {
                        column = that.columnOption(filter[0]);
                        if (remoteFiltering) {
                            if ((0, _config2.default)().forceIsoDateParsing && column && column.serializeValue && filter.length > 1) {
                                filter[filter.length - 1] = column.serializeValue(filter[filter.length - 1], "filter")
                            }
                        } else {
                            if (column && column.selector) {
                                filter[0] = column.selector;
                                filter[0].columnIndex = column.index
                            }
                        }
                    } else {
                        if ((0, _type.isFunction)(filter[0])) {
                            filter[0].columnIndex = columnIndex;
                            filter[0].filterValue = filterValue
                        }
                    }
                    for (i = 0; i < filter.length; i++) {
                        filter[i] = that.updateFilter(filter[i], remoteFiltering, columnIndex, filterValue)
                    }
                    return filter
                },
                columnCount: function() {
                    return this._columns ? this._columns.length : 0
                },
                columnOption: function(identifier, option, value, notFireEvent) {
                    var i, needUpdateIndexes, column, that = this,
                        identifierOptionName = (0, _type.isString)(identifier) && identifier.substr(0, identifier.indexOf(":")),
                        columns = that._columns.concat(that._commandColumns);
                    if (void 0 === identifier) {
                        return
                    }
                    if (identifierOptionName) {
                        identifier = identifier.substr(identifierOptionName.length + 1)
                    }
                    for (i = 0; i < columns.length; i++) {
                        if (identifierOptionName) {
                            if ("" + columns[i][identifierOptionName] === identifier) {
                                column = columns[i];
                                break
                            }
                        } else {
                            if (columns[i].index === identifier || columns[i].name === identifier || columns[i].dataField === identifier || columns[i].caption === identifier) {
                                column = columns[i];
                                break
                            }
                        }
                    }
                    if (column) {
                        if (1 === arguments.length) {
                            return (0, _extend.extend)({}, column)
                        }
                        if ((0, _type.isString)(option)) {
                            if (2 === arguments.length) {
                                return columnOptionCore(that, column, option)
                            } else {
                                needUpdateIndexes = needUpdateIndexes || COLUMN_INDEX_OPTIONS[option];
                                columnOptionCore(that, column, option, value, notFireEvent)
                            }
                        } else {
                            if ((0, _type.isObject)(option)) {
                                _iterator2.default.each(option, function(optionName, value) {
                                    needUpdateIndexes = needUpdateIndexes || COLUMN_INDEX_OPTIONS[optionName];
                                    columnOptionCore(that, column, optionName, value, notFireEvent)
                                })
                            }
                        }
                        if (needUpdateIndexes) {
                            updateIndexes(that, column)
                        }
                        fireColumnsChanged(that)
                    }
                },
                clearSorting: function() {
                    var i, that = this,
                        columnCount = this.columnCount();
                    that.beginUpdate();
                    for (i = 0; i < columnCount; i++) {
                        that.columnOption(i, "sortOrder", void 0)
                    }
                    that.endUpdate()
                },
                clearGrouping: function() {
                    var i, that = this,
                        columnCount = this.columnCount();
                    that.beginUpdate();
                    for (i = 0; i < columnCount; i++) {
                        that.columnOption(i, "groupIndex", void 0)
                    }
                    that.endUpdate()
                },
                getVisibleIndex: function(index, rowIndex) {
                    var i, columns = this.getVisibleColumns(rowIndex);
                    for (i = columns.length - 1; i >= 0; i--) {
                        if (columns[i].index === index) {
                            return i
                        }
                    }
                    return -1
                },
                addColumn: function(options) {
                    var that = this,
                        column = createColumn(that, options),
                        index = that._columns.length;
                    that._columns.push(column);
                    if (column.isBand) {
                        that._columns = createColumnsFromOptions(that, that._columns);
                        column = that._columns[index]
                    }
                    column.added = options;
                    updateIndexes(that, column);
                    that.updateColumns(that._dataSource)
                },
                deleteColumn: function(id) {
                    var childIndexes, that = this,
                        column = that.columnOption(id);
                    if (column && column.index >= 0) {
                        that._columns.splice(column.index, 1);
                        if (column.isBand) {
                            childIndexes = that.getChildrenByBandColumn(column.index).map(function(column) {
                                return column.index
                            });
                            that._columns = that._columns.filter(function(column) {
                                return childIndexes.indexOf(column.index) < 0
                            })
                        }
                        updateIndexes(that);
                        that.updateColumns(that._dataSource)
                    }
                },
                addCommandColumn: function(options) {
                    var commandColumn = this._commandColumns.filter(function(column) {
                        return column.command === options.command
                    })[0];
                    if (!commandColumn) {
                        commandColumn = options;
                        this._commandColumns.push(commandColumn)
                    }
                },
                getUserState: function() {
                    var i, columns = this._columns,
                        result = [];

                    function handleStateField(index, value) {
                        if (void 0 !== columns[i][value]) {
                            result[i][value] = columns[i][value]
                        }
                    }
                    for (i = 0; i < columns.length; i++) {
                        result[i] = {};
                        _iterator2.default.each(USER_STATE_FIELD_NAMES, handleStateField)
                    }
                    return result
                },
                setUserState: function(state) {
                    var commonColumnSettings, that = this,
                        dataSource = that._dataSource,
                        ignoreColumnOptionNames = that.option("stateStoring.ignoreColumnOptionNames");
                    if (!ignoreColumnOptionNames) {
                        ignoreColumnOptionNames = [];
                        commonColumnSettings = that.getCommonSettings();
                        if (!that.option("columnChooser.enabled")) {
                            ignoreColumnOptionNames.push("visible")
                        }
                        if ("none" === that.option("sorting.mode")) {
                            ignoreColumnOptionNames.push("sortIndex", "sortOrder")
                        }
                        if (!commonColumnSettings.allowGrouping) {
                            ignoreColumnOptionNames.push("groupIndex")
                        }
                        if (!commonColumnSettings.allowFixing) {
                            ignoreColumnOptionNames.push("fixed", "fixedPosition")
                        }
                        if (!commonColumnSettings.allowResizing) {
                            ignoreColumnOptionNames.push("width", "visibleWidth")
                        }
                        if (!that.option("filterRow.visible")) {
                            ignoreColumnOptionNames.push("filterValue", "selectedFilterOperation")
                        }
                        if (!that.option("headerFilter.visible")) {
                            ignoreColumnOptionNames.push("filterValues", "filterType")
                        }
                    }
                    that._columnsUserState = state;
                    that._ignoreColumnOptionNames = ignoreColumnOptionNames;
                    that._hasUserState = !!state;
                    if (dataSource) {
                        dataSource.sort(null);
                        dataSource.group(null)
                    }
                    updateColumnChanges(that, "filtering");
                    that.init()
                },
                _createCalculatedColumnOptions: function(columnOptions, bandColumn) {
                    var getter, calculatedColumnOptions = {},
                        dataField = columnOptions.dataField;
                    if (Array.isArray(columnOptions.columns) && columnOptions.columns.length || columnOptions.isBand) {
                        calculatedColumnOptions.isBand = true;
                        dataField = null
                    }
                    if (dataField) {
                        if ((0, _type.isString)(dataField)) {
                            getter = _data2.default.compileGetter(dataField);
                            calculatedColumnOptions = {
                                caption: _inflector2.default.captionize(dataField),
                                calculateCellValue: function(data, skipDeserialization) {
                                    var value = getter(data);
                                    return this.deserializeValue && !skipDeserialization ? this.deserializeValue(value) : value
                                },
                                setCellValue: defaultSetCellValue,
                                parseValue: function(text) {
                                    var result, parsedValue, column = this;
                                    if ("number" === column.dataType) {
                                        if ((0, _type.isString)(text) && column.format) {
                                            parsedValue = _number2.default.parse(text);
                                            if ((0, _type.isNumeric)(parsedValue)) {
                                                result = parsedValue
                                            }
                                        } else {
                                            if ((0, _type.isDefined)(text) && (0, _type.isNumeric)(text)) {
                                                result = Number(text)
                                            }
                                        }
                                    } else {
                                        if ("boolean" === column.dataType) {
                                            if (text === column.trueText) {
                                                result = true
                                            } else {
                                                if (text === column.falseText) {
                                                    result = false
                                                }
                                            }
                                        } else {
                                            if ((0, _uiGrid_core3.isDateType)(column.dataType)) {
                                                parsedValue = _date2.default.parse(text, column.format);
                                                if (parsedValue) {
                                                    result = parsedValue
                                                }
                                            } else {
                                                result = text
                                            }
                                        }
                                    }
                                    return result
                                }
                            }
                        }
                        calculatedColumnOptions.allowFiltering = true
                    } else {
                        calculatedColumnOptions.allowFiltering = !!columnOptions.calculateFilterExpression
                    }
                    calculatedColumnOptions.calculateFilterExpression = function() {
                        return _filtering2.default.defaultCalculateFilterExpression.apply(this, arguments)
                    };
                    calculatedColumnOptions.createFilterExpression = function(filterValue) {
                        var result;
                        if (this.calculateFilterExpression) {
                            result = this.calculateFilterExpression.apply(this, arguments)
                        }
                        if ((0, _type.isFunction)(result)) {
                            result = [result, "=", true]
                        } else {
                            if (result) {
                                result.columnIndex = this.index;
                                result.filterValue = filterValue
                            }
                        }
                        return result
                    };
                    if (!dataField || !(0, _type.isString)(dataField)) {
                        (0, _extend.extend)(true, calculatedColumnOptions, {
                            allowSorting: false,
                            allowGrouping: false,
                            calculateCellValue: function() {
                                return null
                            }
                        })
                    }
                    if (bandColumn) {
                        calculatedColumnOptions.allowFixing = false
                    }
                    if (columnOptions.dataType) {
                        calculatedColumnOptions.userDataType = columnOptions.dataType
                    }
                    if (columnOptions.selectedFilterOperation && !("defaultSelectedFilterOperation" in calculatedColumnOptions)) {
                        calculatedColumnOptions.defaultSelectedFilterOperation = columnOptions.selectedFilterOperation
                    }
                    if (columnOptions.lookup) {
                        calculatedColumnOptions.lookup = {
                            calculateCellValue: function(value, skipDeserialization) {
                                if (this.valueExpr) {
                                    value = this.valueMap && this.valueMap[value]
                                }
                                return this.deserializeValue && !skipDeserialization ? this.deserializeValue(value) : value
                            },
                            updateValueMap: function() {
                                var calculateValue, calculateDisplayValue, item, i;
                                this.valueMap = {};
                                if (this.items) {
                                    calculateValue = _data2.default.compileGetter(this.valueExpr);
                                    calculateDisplayValue = _data2.default.compileGetter(this.displayExpr);
                                    for (i = 0; i < this.items.length; i++) {
                                        item = this.items[i];
                                        var displayValue = calculateDisplayValue(item);
                                        this.valueMap[calculateValue(item)] = displayValue;
                                        this.dataType = this.dataType || getValueDataType(displayValue)
                                    }
                                }
                            },
                            update: function() {
                                var dataSourceOptions, that = this,
                                    dataSource = that.dataSource;
                                if (dataSource) {
                                    if ((0, _type.isFunction)(dataSource) && !(0, _variable_wrapper.isWrapped)(dataSource)) {
                                        dataSource = dataSource({})
                                    }
                                    if ((0, _type.isPlainObject)(dataSource) || dataSource instanceof _abstract_store2.default || Array.isArray(dataSource)) {
                                        if (that.valueExpr) {
                                            dataSourceOptions = (0, _data_source.normalizeDataSourceOptions)(dataSource);
                                            dataSourceOptions.paginate = false;
                                            dataSource = new _data_source.DataSource(dataSourceOptions);
                                            return dataSource.load().done(function(data) {
                                                that.items = data;
                                                that.updateValueMap && that.updateValueMap()
                                            })
                                        }
                                    } else {
                                        _ui2.default.log("E1016")
                                    }
                                } else {
                                    that.updateValueMap && that.updateValueMap()
                                }
                            }
                        }
                    }
                    calculatedColumnOptions.resizedCallbacks = (0, _callbacks2.default)();
                    if (columnOptions.resized) {
                        calculatedColumnOptions.resizedCallbacks.add(columnOptions.resized.bind(columnOptions))
                    }
                    _iterator2.default.each(calculatedColumnOptions, function(optionName) {
                        var defaultOptionName;
                        if ((0, _type.isFunction)(calculatedColumnOptions[optionName]) && 0 !== optionName.indexOf("default")) {
                            defaultOptionName = "default" + optionName.charAt(0).toUpperCase() + optionName.substr(1);
                            calculatedColumnOptions[defaultOptionName] = calculatedColumnOptions[optionName]
                        }
                    });
                    return calculatedColumnOptions
                },
                getRowCount: function() {
                    this._rowCount = this._rowCount || _getRowCount(this);
                    return this._rowCount
                },
                getRowIndex: function(columnIndex, alwaysGetRowIndex) {
                    var column = this._columns[columnIndex],
                        bandColumnsCache = this.getBandColumnsCache();
                    return column && (alwaysGetRowIndex || column.visible && !(column.command || (0, _type.isDefined)(column.groupIndex))) ? getParentBandColumns(columnIndex, bandColumnsCache.columnParentByIndex).length : 0
                },
                getChildrenByBandColumn: function(bandColumnIndex, onlyVisibleDirectChildren) {
                    var that = this,
                        bandColumnsCache = that.getBandColumnsCache(),
                        result = _getChildrenByBandColumn(bandColumnIndex, bandColumnsCache.columnChildrenByIndex, !onlyVisibleDirectChildren);
                    if (onlyVisibleDirectChildren) {
                        return result.filter(function(column) {
                            return column.visible && !column.command
                        }).sort(function(column1, column2) {
                            return column1.visibleIndex - column2.visibleIndex
                        })
                    }
                    return result
                },
                isParentBandColumn: function(columnIndex, bandColumnIndex) {
                    var result = false,
                        column = this._columns[columnIndex],
                        bandColumnsCache = this.getBandColumnsCache(),
                        parentBandColumns = column && getParentBandColumns(columnIndex, bandColumnsCache.columnParentByIndex);
                    if (parentBandColumns) {
                        _iterator2.default.each(parentBandColumns, function(_, bandColumn) {
                            if (bandColumn.index === bandColumnIndex) {
                                result = true;
                                return false
                            }
                        })
                    }
                    return result
                },
                isParentColumnVisible: function(columnIndex) {
                    var result = true,
                        bandColumnsCache = this.getBandColumnsCache(),
                        bandColumns = columnIndex >= 0 && getParentBandColumns(columnIndex, bandColumnsCache.columnParentByIndex);
                    bandColumns && _iterator2.default.each(bandColumns, function(_, bandColumn) {
                        result = result && bandColumn.visible;
                        return result
                    });
                    return result
                },
                getColumnId: function(column) {
                    if (column.command && column.type === GROUP_COMMAND_COLUMN_NAME) {
                        if (isCustomCommandColumn(this, column)) {
                            return "type:" + column.type
                        }
                        return "command:" + column.command
                    }
                    return column.index
                }
            }
        }())
    }
};
