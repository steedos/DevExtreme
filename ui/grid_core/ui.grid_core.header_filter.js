/**
 * DevExtreme (ui/grid_core/ui.grid_core.header_filter.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _filtering = require("../shared/filtering");
var _filtering2 = _interopRequireDefault(_filtering);
var _uiGrid_core3 = require("./ui.grid_core.utils");
var _uiGrid_core4 = _interopRequireDefault(_uiGrid_core3);
var _uiGrid_core5 = require("./ui.grid_core.header_filter_core");
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _click = require("../../events/click");
var _click2 = _interopRequireDefault(_click);
var _data = require("../../core/utils/data");
var _iterator = require("../../core/utils/iterator");
var _type = require("../../core/utils/type");
var _position = require("../../core/utils/position");
var _extend = require("../../core/utils/extend");
var _data_source = require("../../data/data_source/data_source");
var _date = require("../../localization/date");
var _date2 = _interopRequireDefault(_date);
var _variable_wrapper = require("../../core/utils/variable_wrapper");
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var DATE_INTERVAL_FORMATS = {
    month: function(value) {
        return _date2.default.getMonthNames()[value - 1]
    },
    quarter: function(value) {
        return _date2.default.format(new Date(2e3, 3 * value - 1), "quarter")
    }
};
var HeaderFilterController = _uiGrid_core2.default.ViewController.inherit(function() {
    var getFormatOptions = function(value, column, currentLevel) {
        var groupInterval = _filtering2.default.getGroupInterval(column),
            result = _uiGrid_core4.default.getFormatOptionsByColumn(column, "headerFilter");
        if (groupInterval) {
            result.groupInterval = groupInterval[currentLevel];
            if (_uiGrid_core4.default.isDateType(column.dataType)) {
                result.format = DATE_INTERVAL_FORMATS[groupInterval[currentLevel]]
            } else {
                if ("number" === column.dataType) {
                    result.getDisplayFormat = function() {
                        var formatOptions = {
                                format: column.format,
                                target: "headerFilter"
                            },
                            firstValueText = _uiGrid_core4.default.formatValue(value, formatOptions),
                            secondValue = value + groupInterval[currentLevel],
                            secondValueText = _uiGrid_core4.default.formatValue(secondValue, formatOptions);
                        return firstValueText && secondValueText ? firstValueText + " - " + secondValueText : ""
                    }
                }
            }
        }
        return result
    };
    return {
        init: function() {
            this._columnsController = this.getController("columns");
            this._dataController = this.getController("data");
            this._headerFilterView = this.getView("headerFilterView")
        },
        _updateSelectedState: function(items, column) {
            var i = items.length,
                isExclude = "exclude" === column.filterType;
            while (i--) {
                var item = items[i];
                if ("items" in items[i]) {
                    this._updateSelectedState(items[i].items, column)
                }(0, _uiGrid_core5.updateHeaderFilterItemSelectionState)(item, _uiGrid_core4.default.getIndexByKey(items[i].value, column.filterValues, null) > -1, isExclude)
            }
        },
        _normalizeGroupItem: function(item, currentLevel, options) {
            var value, displayValue, path = options.path,
                valueSelector = options.valueSelector,
                displaySelector = options.displaySelector,
                column = options.column;
            if (valueSelector && displaySelector) {
                value = valueSelector(item);
                displayValue = displaySelector(item)
            } else {
                value = item.key;
                displayValue = value
            }
            if (!(0, _type.isObject)(item)) {
                item = {}
            } else {
                if (item === value) {
                    item = (0, _extend.extend)({}, item)
                }
            }
            path.push(value);
            if (1 === path.length) {
                item.value = path[0]
            } else {
                item.value = path.join("/")
            }
            item.text = this.getHeaderItemText(displayValue, column, currentLevel, options.headerFilterOptions);
            delete item.key;
            return item
        },
        getHeaderItemText: function(displayValue, column, currentLevel, headerFilterOptions) {
            var text = _uiGrid_core4.default.formatValue(displayValue, getFormatOptions(displayValue, column, currentLevel));
            if (!text) {
                text = headerFilterOptions.texts.emptyValue
            }
            return text
        },
        _processGroupItems: function(groupItems, currentLevel, path, options) {
            var displaySelector, valueSelector, that = this,
                column = options.column,
                lookup = column.lookup,
                level = options.level;
            path = path || [];
            currentLevel = currentLevel || 0;
            if (lookup) {
                displaySelector = (0, _data.compileGetter)(lookup.displayExpr);
                valueSelector = (0, _data.compileGetter)(lookup.valueExpr)
            }
            for (var i = 0; i < groupItems.length; i++) {
                groupItems[i] = that._normalizeGroupItem(groupItems[i], currentLevel, {
                    column: options.column,
                    headerFilterOptions: options.headerFilterOptions,
                    displaySelector: displaySelector,
                    valueSelector: valueSelector,
                    path: path
                });
                if ("items" in groupItems[i]) {
                    if (currentLevel === level || !(0, _type.isDefined)(groupItems[i].value)) {
                        delete groupItems[i].items
                    } else {
                        that._processGroupItems(groupItems[i].items, currentLevel + 1, path, options)
                    }
                }
                path.pop()
            }
        },
        getDataSource: function(column) {
            var filter, cutoffLevel, origPostProcess, that = this,
                dataSource = that._dataController.dataSource(),
                group = _uiGrid_core4.default.getHeaderFilterGroupParameters(column, dataSource && dataSource.remoteOperations().grouping),
                headerFilterDataSource = column.headerFilter && column.headerFilter.dataSource,
                headerFilterOptions = that.option("headerFilter"),
                isLookup = false,
                options = {
                    component: that.component
                };
            if (!dataSource) {
                return
            }
            if ((0, _type.isDefined)(headerFilterDataSource) && !(0, _type.isFunction)(headerFilterDataSource)) {
                options.dataSource = (0, _data_source.normalizeDataSourceOptions)(headerFilterDataSource)
            } else {
                if (column.lookup) {
                    isLookup = true;
                    dataSource = column.lookup.dataSource;
                    if ((0, _type.isFunction)(dataSource) && !(0, _variable_wrapper.isWrapped)(dataSource)) {
                        dataSource = dataSource({})
                    }
                    dataSource = (0, _data_source.normalizeDataSourceOptions)(dataSource);
                    options.dataSource = dataSource
                } else {
                    cutoffLevel = Array.isArray(group) ? group.length - 1 : 0;
                    that._currentColumn = column;
                    filter = that._dataController.getCombinedFilter();
                    that._currentColumn = null;
                    options.dataSource = {
                        filter: filter,
                        group: group,
                        useDefaultSearch: true,
                        load: function(options) {
                            var d = new _deferred.Deferred;
                            options.dataField = column.dataField || column.name;
                            dataSource.load(options).done(function(data) {
                                that._processGroupItems(data, null, null, {
                                    level: cutoffLevel,
                                    column: column,
                                    headerFilterOptions: headerFilterOptions
                                });
                                d.resolve(data)
                            }).fail(d.reject);
                            return d
                        }
                    }
                }
            }
            if ((0, _type.isFunction)(headerFilterDataSource)) {
                headerFilterDataSource.call(column, options)
            }
            origPostProcess = options.dataSource.postProcess;
            options.dataSource.postProcess = function(data) {
                var items = data;
                if (isLookup) {
                    if (0 === this.pageIndex() && !this.searchValue()) {
                        items = items.slice(0);
                        items.unshift(null)
                    }
                    that._processGroupItems(items, null, null, {
                        level: 0,
                        column: column,
                        headerFilterOptions: headerFilterOptions
                    })
                }
                items = origPostProcess && origPostProcess.call(this, items) || items;
                that._updateSelectedState(items, column);
                return items
            };
            return options.dataSource
        },
        getCurrentColumn: function() {
            return this._currentColumn
        },
        showHeaderFilterMenu: function(columnIndex, isGroupPanel) {
            var columnsController = this._columnsController,
                column = (0, _extend.extend)(true, {}, this._columnsController.getColumns()[columnIndex]);
            if (column) {
                var visibleIndex = columnsController.getVisibleIndex(columnIndex),
                    view = isGroupPanel ? this.getView("headerPanel") : this.getView("columnHeadersView"),
                    $columnElement = $columnElement || view.getColumnElements().eq(isGroupPanel ? column.groupIndex : visibleIndex);
                this.showHeaderFilterMenuBase({
                    columnElement: $columnElement,
                    column: column,
                    applyFilter: true,
                    apply: function() {
                        columnsController.columnOption(columnIndex, {
                            filterValues: this.filterValues,
                            filterType: this.filterType
                        })
                    }
                })
            }
        },
        showHeaderFilterMenuBase: function(options) {
            var that = this,
                column = options.column;
            if (column) {
                var groupInterval = _filtering2.default.getGroupInterval(column);
                (0, _extend.extend)(options, column, {
                    type: groupInterval && groupInterval.length > 1 ? "tree" : "list",
                    onShowing: function(e) {
                        var dxResizableInstance = e.component.overlayContent().dxResizable("instance");
                        dxResizableInstance && dxResizableInstance.option("onResizeEnd", function(e) {
                            var columnsController = that.getController("columns"),
                                headerFilterByColumn = columnsController.columnOption(options.dataField, "headerFilter");
                            headerFilterByColumn = headerFilterByColumn || {};
                            headerFilterByColumn.width = e.width;
                            headerFilterByColumn.height = e.height;
                            columnsController.columnOption(options.dataField, "headerFilter", headerFilterByColumn, true)
                        })
                    }
                });
                options.dataSource = that.getDataSource(options);
                if (options.isFilterBuilder) {
                    options.dataSource.filter = null;
                    options.alignment = "right"
                }
                that._headerFilterView.showHeaderFilterMenu(options.columnElement, options)
            }
        },
        hideHeaderFilterMenu: function() {
            this._headerFilterView.hideHeaderFilterMenu()
        }
    }
}());
var ColumnHeadersViewHeaderFilterExtender = (0, _extend.extend)({}, _uiGrid_core5.headerFilterMixin, {
    _renderCellContent: function($cell, options) {
        var $headerFilterIndicator, that = this,
            column = options.column;
        if (!column.command && (0, _uiGrid_core5.allowHeaderFiltering)(column) && that.option("headerFilter.visible") && "header" === options.rowType) {
            $headerFilterIndicator = that._applyColumnState({
                name: "headerFilter",
                rootElement: $cell,
                column: column,
                showColumnLines: that.option("showColumnLines")
            });
            $headerFilterIndicator && that._subscribeToIndicatorEvent($headerFilterIndicator, column, "headerFilter")
        }
        that.callBase($cell, options)
    },
    _subscribeToIndicatorEvent: function($indicator, column, indicatorName) {
        var that = this;
        if ("headerFilter" === indicatorName) {
            _events_engine2.default.on($indicator, _click2.default.name, that.createAction(function(e) {
                var event = e.event;
                event.stopPropagation();
                that.getController("headerFilter").showHeaderFilterMenu(column.index, false)
            }))
        }
    },
    _updateIndicator: function($cell, column, indicatorName) {
        var $indicator = this.callBase($cell, column, indicatorName);
        $indicator && this._subscribeToIndicatorEvent($indicator, column, indicatorName)
    },
    _updateHeaderFilterIndicators: function() {
        if (this.option("headerFilter.visible")) {
            this._updateIndicators("headerFilter")
        }
    },
    _needUpdateFilterIndicators: function() {
        return true
    },
    _columnOptionChanged: function(e) {
        var optionNames = e.optionNames;
        if (_uiGrid_core4.default.checkChanges(optionNames, ["filterValues", "filterType"])) {
            if (this._needUpdateFilterIndicators()) {
                this._updateHeaderFilterIndicators()
            }
            return
        }
        this.callBase(e)
    }
});
var HeaderPanelHeaderFilterExtender = (0, _extend.extend)({}, _uiGrid_core5.headerFilterMixin, {
    _createGroupPanelItem: function($rootElement, groupColumn) {
        var $headerFilterIndicator, that = this,
            $item = that.callBase.apply(that, arguments);
        if (!groupColumn.command && (0, _uiGrid_core5.allowHeaderFiltering)(groupColumn) && that.option("headerFilter.visible")) {
            $headerFilterIndicator = that._applyColumnState({
                name: "headerFilter",
                rootElement: $item,
                column: {
                    alignment: (0, _position.getDefaultAlignment)(that.option("rtlEnabled")),
                    filterValues: groupColumn.filterValues,
                    allowHeaderFiltering: true
                },
                showColumnLines: true
            });
            $headerFilterIndicator && _events_engine2.default.on($headerFilterIndicator, _click2.default.name, that.createAction(function(e) {
                var event = e.event;
                event.stopPropagation();
                that.getController("headerFilter").showHeaderFilterMenu(groupColumn.index, true)
            }))
        }
        return $item
    }
});

function invertFilterExpression(filter) {
    return ["!", filter]
}
var DataControllerFilterRowExtender = {
    skipCalculateColumnFilters: function() {
        return false
    },
    _calculateAdditionalFilter: function() {
        if (this.skipCalculateColumnFilters()) {
            return this.callBase()
        }
        var that = this,
            filters = [that.callBase()],
            columns = that._columnsController.getVisibleColumns(),
            headerFilterController = that.getController("headerFilter"),
            currentColumn = headerFilterController.getCurrentColumn();
        (0, _iterator.each)(columns, function(_, column) {
            var filter;
            if (currentColumn && currentColumn.index === column.index) {
                return
            }
            if ((0, _uiGrid_core5.allowHeaderFiltering)(column) && column.calculateFilterExpression && Array.isArray(column.filterValues) && column.filterValues.length) {
                var filterValues = [];
                (0, _iterator.each)(column.filterValues, function(_, filterValue) {
                    if (Array.isArray(filterValue)) {
                        filter = filterValue
                    } else {
                        if (column.deserializeValue && !_uiGrid_core4.default.isDateType(column.dataType) && "number" !== column.dataType) {
                            filterValue = column.deserializeValue(filterValue)
                        }
                        filter = column.createFilterExpression(filterValue, "=", "headerFilter")
                    }
                    if (filter) {
                        filter.columnIndex = column.index
                    }
                    filterValues.push(filter)
                });
                filterValues = _uiGrid_core4.default.combineFilters(filterValues, "or");
                filters.push("exclude" === column.filterType ? ["!", filterValues] : filterValues)
            }
        });
        return _uiGrid_core4.default.combineFilters(filters)
    }
};
module.exports = {
    invertFilterExpression: invertFilterExpression,
    defaultOptions: function() {
        return {
            headerFilter: {
                visible: false,
                width: 252,
                height: 325,
                allowSearch: false,
                searchTimeout: 500,
                texts: {
                    emptyValue: _message2.default.format("dxDataGrid-headerFilterEmptyValue"),
                    ok: _message2.default.format("dxDataGrid-headerFilterOK"),
                    cancel: _message2.default.format("dxDataGrid-headerFilterCancel")
                }
            }
        }
    },
    controllers: {
        headerFilter: HeaderFilterController
    },
    views: {
        headerFilterView: _uiGrid_core5.HeaderFilterView
    },
    extenders: {
        controllers: {
            data: DataControllerFilterRowExtender
        },
        views: {
            columnHeadersView: ColumnHeadersViewHeaderFilterExtender,
            headerPanel: HeaderPanelHeaderFilterExtender
        }
    }
};
