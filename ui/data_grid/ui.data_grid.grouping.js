/**
 * DevExtreme (ui/data_grid/ui.data_grid.grouping.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _uiData_grid = require("./ui.data_grid.core");
var _uiData_grid2 = _interopRequireDefault(_uiData_grid);
var _uiData_gridGrouping = require("./ui.data_grid.grouping.expanded");
var _uiData_gridGrouping2 = require("./ui.data_grid.grouping.collapsed");
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _uiData_grid3 = require("./ui.data_grid.data_source_adapter");
var _uiData_grid4 = _interopRequireDefault(_uiData_grid3);
var _type = require("../../core/utils/type");
var _iterator = require("../../core/utils/iterator");
var _devices = require("../../core/devices");
var _devices2 = _interopRequireDefault(_devices);
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var DATAGRID_GROUP_PANEL_CLASS = "dx-datagrid-group-panel",
    DATAGRID_GROUP_PANEL_MESSAGE_CLASS = "dx-group-panel-message",
    DATAGRID_GROUP_PANEL_ITEM_CLASS = "dx-group-panel-item",
    DATAGRID_GROUP_PANEL_LABEL_CLASS = "dx-toolbar-label",
    DATAGRID_EXPAND_CLASS = "dx-datagrid-expand",
    DATAGRID_GROUP_ROW_CLASS = "dx-group-row";
var GroupingDataSourceAdapterExtender = function() {
    return {
        init: function() {
            this.callBase.apply(this, arguments);
            this._initGroupingHelper()
        },
        _initGroupingHelper: function(options) {
            var grouping = this._grouping,
                isAutoExpandAll = this.option("grouping.autoExpandAll"),
                isFocusedRowEnabled = this.option("focusedRowEnabled"),
                remoteOperations = options ? options.remoteOperations : this.remoteOperations(),
                isODataRemoteOperations = remoteOperations.filtering && remoteOperations.sorting && remoteOperations.paging;
            if (isODataRemoteOperations && !remoteOperations.grouping && (isAutoExpandAll || !isFocusedRowEnabled)) {
                if (!grouping || grouping instanceof _uiData_gridGrouping2.GroupingHelper) {
                    this._grouping = new _uiData_gridGrouping.GroupingHelper(this)
                }
            } else {
                if (!grouping || grouping instanceof _uiData_gridGrouping.GroupingHelper) {
                    this._grouping = new _uiData_gridGrouping2.GroupingHelper(this)
                }
            }
        },
        totalItemsCount: function() {
            var that = this,
                totalCount = that.callBase();
            return totalCount > 0 && that._dataSource.group() && that._dataSource.requireTotalCount() ? totalCount + that._grouping.totalCountCorrection() : totalCount
        },
        itemsCount: function() {
            return this._dataSource.group() ? this._grouping.itemsCount() || 0 : this.callBase.apply(this, arguments)
        },
        allowCollapseAll: function() {
            return this._grouping.allowCollapseAll()
        },
        isGroupItemCountable: function(item) {
            return this._grouping.isGroupItemCountable(item)
        },
        isRowExpanded: function(key) {
            var groupInfo = this._grouping.findGroupInfo(key);
            return groupInfo ? groupInfo.isExpanded : !this._grouping.allowCollapseAll()
        },
        collapseAll: function(groupIndex) {
            return this._collapseExpandAll(groupIndex, false)
        },
        expandAll: function(groupIndex) {
            return this._collapseExpandAll(groupIndex, true)
        },
        _collapseExpandAll: function(groupIndex, isExpand) {
            var i, that = this,
                dataSource = that._dataSource,
                group = dataSource.group(),
                groups = _uiData_grid2.default.normalizeSortingInfo(group || []);
            if (groups.length) {
                for (i = 0; i < groups.length; i++) {
                    if (void 0 === groupIndex || groupIndex === i) {
                        groups[i].isExpanded = isExpand
                    } else {
                        if (group && group[i]) {
                            groups[i].isExpanded = group[i].isExpanded
                        }
                    }
                }
                dataSource.group(groups);
                that._grouping.foreachGroups(function(groupInfo, parents) {
                    if (void 0 === groupIndex || groupIndex === parents.length - 1) {
                        groupInfo.isExpanded = isExpand
                    }
                }, false, true);
                that.resetPagesCache()
            }
            return true
        },
        refresh: function() {
            this.callBase.apply(this, arguments);
            return this._grouping.refresh.apply(this._grouping, arguments)
        },
        changeRowExpand: function(path) {
            var that = this,
                dataSource = that._dataSource;
            if (dataSource.group()) {
                dataSource.beginLoading();
                if (that._lastLoadOptions) {
                    that._lastLoadOptions.groupExpand = true
                }
                return that._changeRowExpandCore(path).always(function() {
                    dataSource.endLoading()
                })
            }
        },
        _changeRowExpandCore: function(path) {
            return this._grouping.changeRowExpand(path)
        },
        _hasGroupLevelsExpandState: function(group, isExpanded) {
            if (group && Array.isArray(group)) {
                for (var i = 0; i < group.length; i++) {
                    if (group[i].isExpanded === isExpanded) {
                        return true
                    }
                }
            }
        },
        _customizeRemoteOperations: function(options, isReload, operationTypes) {
            var remoteOperations = options.remoteOperations;
            if (options.storeLoadOptions.group) {
                if (remoteOperations.grouping && !options.isCustomLoading) {
                    if (!remoteOperations.groupPaging || this._hasGroupLevelsExpandState(options.storeLoadOptions.group, true)) {
                        remoteOperations.paging = false
                    }
                }
                if (!remoteOperations.grouping && (!remoteOperations.sorting || !remoteOperations.filtering || options.isCustomLoading || this._hasGroupLevelsExpandState(options.storeLoadOptions.group, false))) {
                    remoteOperations.paging = false
                }
            } else {
                if (!options.isCustomLoading && remoteOperations.paging && operationTypes.grouping) {
                    this.resetCache()
                }
            }
            this.callBase.apply(this, arguments)
        },
        _handleDataLoading: function(options) {
            this.callBase(options);
            this._initGroupingHelper(options);
            return this._grouping.handleDataLoading(options)
        },
        _handleDataLoaded: function(options) {
            return this._grouping.handleDataLoaded(options, this.callBase.bind(this))
        },
        _handleDataLoadedCore: function(options) {
            return this._grouping.handleDataLoadedCore(options, this.callBase.bind(this))
        }
    }
}();
_uiData_grid4.default.extend(GroupingDataSourceAdapterExtender);
var GroupingDataControllerExtender = function() {
    return {
        init: function() {
            var that = this;
            that.callBase();
            that.createAction("onRowExpanding");
            that.createAction("onRowExpanded");
            that.createAction("onRowCollapsing");
            that.createAction("onRowCollapsed")
        },
        _beforeProcessItems: function(items) {
            var groupColumns = this._columnsController.getGroupColumns();
            items = this.callBase(items);
            if (items.length && groupColumns.length) {
                items = this._processGroupItems(items, groupColumns.length)
            }
            return items
        },
        _processItem: function(item, options) {
            if ((0, _type.isDefined)(item.groupIndex) && (0, _type.isString)(item.rowType) && 0 === item.rowType.indexOf("group")) {
                item = this._processGroupItem(item, options);
                options.dataIndex = 0
            } else {
                item = this.callBase.apply(this, arguments)
            }
            return item
        },
        _processGroupItem: function(item) {
            return item
        },
        _processGroupItems: function(items, groupsCount, options) {
            var scrollingMode, i, item, resultItems, that = this,
                groupedColumns = that._columnsController.getGroupColumns(),
                column = groupedColumns[groupedColumns.length - groupsCount];
            if (!options) {
                scrollingMode = that.option("scrolling.mode");
                options = {
                    collectContinuationItems: "virtual" !== scrollingMode && "infinite" !== scrollingMode,
                    resultItems: [],
                    path: [],
                    values: []
                }
            }
            resultItems = options.resultItems;
            if (options.data) {
                if (options.collectContinuationItems || !options.data.isContinuation) {
                    resultItems.push({
                        rowType: "group",
                        data: options.data,
                        groupIndex: options.path.length - 1,
                        isExpanded: !!options.data.items,
                        key: options.path.slice(0),
                        values: options.values.slice(0)
                    })
                }
            }
            if (items) {
                if (0 === groupsCount) {
                    resultItems.push.apply(resultItems, items)
                } else {
                    for (i = 0; i < items.length; i++) {
                        item = items[i];
                        if (item && "items" in item) {
                            options.data = item;
                            options.path.push(item.key);
                            options.values.push(column && column.deserializeValue && !column.calculateDisplayValue ? column.deserializeValue(item.key) : item.key);
                            that._processGroupItems(item.items, groupsCount - 1, options);
                            options.data = void 0;
                            options.path.pop();
                            options.values.pop()
                        } else {
                            resultItems.push(item)
                        }
                    }
                }
            }
            return resultItems
        },
        publicMethods: function() {
            return this.callBase().concat(["collapseAll", "expandAll", "isRowExpanded", "expandRow", "collapseRow"])
        },
        collapseAll: function(groupIndex) {
            var dataSource = this._dataSource;
            if (dataSource && dataSource.collapseAll(groupIndex)) {
                dataSource.pageIndex(0);
                dataSource.reload()
            }
        },
        expandAll: function(groupIndex) {
            var dataSource = this._dataSource;
            if (dataSource && dataSource.expandAll(groupIndex)) {
                dataSource.pageIndex(0);
                dataSource.reload()
            }
        },
        changeRowExpand: function(key) {
            var that = this,
                expanded = that.isRowExpanded(key),
                args = {
                    key: key,
                    expanded: expanded
                };
            that.executeAction(expanded ? "onRowCollapsing" : "onRowExpanding", args);
            if (!args.cancel) {
                return (0, _deferred.when)(that._changeRowExpandCore(key)).done(function() {
                    args.expanded = !expanded;
                    that.executeAction(expanded ? "onRowCollapsed" : "onRowExpanded", args)
                })
            }
            return (new _deferred.Deferred).resolve()
        },
        _changeRowExpandCore: function(key) {
            var d, that = this,
                dataSource = this._dataSource;
            if (!dataSource) {
                return
            }
            d = new _deferred.Deferred;
            (0, _deferred.when)(dataSource.changeRowExpand(key)).done(function() {
                that.load().done(d.resolve).fail(d.reject)
            }).fail(d.reject);
            return d
        },
        isRowExpanded: function(key) {
            var dataSource = this._dataSource;
            return dataSource && dataSource.isRowExpanded(key)
        },
        expandRow: function(key) {
            if (!this.isRowExpanded(key)) {
                return this.changeRowExpand(key)
            }
            return (new _deferred.Deferred).resolve()
        },
        collapseRow: function(key) {
            if (this.isRowExpanded(key)) {
                return this.changeRowExpand(key)
            }
            return (new _deferred.Deferred).resolve()
        },
        optionChanged: function(args) {
            if ("grouping" === args.name) {
                args.name = "dataSource"
            }
            this.callBase(args)
        }
    }
}();
var onGroupingMenuItemClick = function(column, params) {
    var columnsController = this._columnsController;
    switch (params.itemData.value) {
        case "group":
            var groups = columnsController._dataSource.group() || [];
            columnsController.columnOption(column.dataField, "groupIndex", groups.length);
            break;
        case "ungroup":
            columnsController.columnOption(column.dataField, "groupIndex", -1);
            break;
        case "ungroupAll":
            this.component.clearGrouping()
    }
};
var GroupingHeaderPanelExtender = function() {
    return {
        _getToolbarItems: function() {
            var items = this.callBase();
            return this._appendGroupingItem(items)
        },
        _appendGroupingItem: function(items) {
            var that = this,
                isRendered = false,
                groupPanelRenderedCallback = function(e) {
                    that._updateGroupPanelContent((0, _renderer2.default)(e.itemElement).find("." + DATAGRID_GROUP_PANEL_CLASS));
                    isRendered && that.renderCompleted.fire();
                    isRendered = true
                };
            if (that._isGroupPanelVisible()) {
                var toolbarItem = {
                    html: "<div class='" + DATAGRID_GROUP_PANEL_CLASS + "'></div>",
                    name: "groupPanel",
                    onItemRendered: groupPanelRenderedCallback,
                    location: "before",
                    locateInMenu: "never",
                    sortIndex: 1
                };
                items.push(toolbarItem)
            }
            return items
        },
        _isGroupPanelVisible: function() {
            var isVisible, groupPanelOptions = this.option("groupPanel");
            if (groupPanelOptions) {
                isVisible = groupPanelOptions.visible;
                if ("auto" === isVisible) {
                    isVisible = "desktop" === _devices2.default.current().deviceType ? true : false
                }
            }
            return isVisible
        },
        _renderGroupPanelItems: function($groupPanel, groupColumns) {
            var that = this;
            $groupPanel.empty();
            (0, _iterator.each)(groupColumns, function(index, groupColumn) {
                that._createGroupPanelItem($groupPanel, groupColumn)
            })
        },
        _createGroupPanelItem: function($rootElement, groupColumn) {
            return (0, _renderer2.default)("<div>").addClass(groupColumn.cssClass).addClass(DATAGRID_GROUP_PANEL_ITEM_CLASS).data("columnData", groupColumn).appendTo($rootElement).text(groupColumn.caption)
        },
        _columnOptionChanged: function(e) {
            if (!this._requireReady && !_uiData_grid2.default.checkChanges(e.optionNames, ["width", "visibleWidth"])) {
                var $toolbarElement = this.element(),
                    $groupPanel = $toolbarElement && $toolbarElement.find("." + DATAGRID_GROUP_PANEL_CLASS);
                if ($groupPanel && $groupPanel.length) {
                    this._updateGroupPanelContent($groupPanel);
                    this.renderCompleted.fire()
                }
            }
            this.callBase()
        },
        _updateGroupPanelContent: function($groupPanel) {
            var that = this,
                groupColumns = that.getController("columns").getGroupColumns(),
                groupPanelOptions = that.option("groupPanel");
            that._renderGroupPanelItems($groupPanel, groupColumns);
            if (groupPanelOptions.allowColumnDragging && !groupColumns.length) {
                (0, _renderer2.default)("<div>").addClass(DATAGRID_GROUP_PANEL_MESSAGE_CLASS).text(groupPanelOptions.emptyPanelText).appendTo($groupPanel);
                $groupPanel.closest("." + DATAGRID_GROUP_PANEL_LABEL_CLASS).css("maxWidth", "none");
                that.updateToolbarDimensions()
            }
        },
        allowDragging: function(column) {
            var groupPanelOptions = this.option("groupPanel");
            return this._isGroupPanelVisible() && groupPanelOptions.allowColumnDragging && column && column.allowGrouping
        },
        getColumnElements: function() {
            var $element = this.element();
            return $element && $element.find("." + DATAGRID_GROUP_PANEL_ITEM_CLASS)
        },
        getColumns: function() {
            return this.getController("columns").getGroupColumns()
        },
        getBoundingRect: function() {
            var offset, that = this,
                $element = that.element();
            if ($element && $element.find("." + DATAGRID_GROUP_PANEL_CLASS).length) {
                offset = $element.offset();
                return {
                    top: offset.top,
                    bottom: offset.top + $element.height()
                }
            }
            return null
        },
        getName: function() {
            return "group"
        },
        getContextMenuItems: function(options) {
            var items, that = this,
                contextMenuEnabled = that.option("grouping.contextMenuEnabled"),
                $groupedColumnElement = (0, _renderer2.default)(options.targetElement).closest("." + DATAGRID_GROUP_PANEL_ITEM_CLASS);
            if ($groupedColumnElement.length) {
                options.column = $groupedColumnElement.data("columnData")
            }
            if (contextMenuEnabled && options.column) {
                var column = options.column,
                    isGroupingAllowed = (0, _type.isDefined)(column.allowGrouping) ? column.allowGrouping : true;
                if (isGroupingAllowed) {
                    var isColumnGrouped = (0, _type.isDefined)(column.groupIndex) && column.groupIndex > -1,
                        groupingTexts = that.option("grouping.texts"),
                        onItemClick = onGroupingMenuItemClick.bind(that, column);
                    items = [{
                        text: groupingTexts.ungroup,
                        value: "ungroup",
                        disabled: !isColumnGrouped,
                        onItemClick: onItemClick
                    }, {
                        text: groupingTexts.ungroupAll,
                        value: "ungroupAll",
                        onItemClick: onItemClick
                    }]
                }
            }
            return items
        },
        isVisible: function() {
            return this.callBase() || this._isGroupPanelVisible()
        },
        optionChanged: function(args) {
            if ("groupPanel" === args.name) {
                this._invalidate();
                args.handled = true
            } else {
                this.callBase(args)
            }
        }
    }
}();
exports.GroupingHeaderPanelExtender = GroupingHeaderPanelExtender;
var GroupingRowsViewExtender = function() {
    return {
        getContextMenuItems: function(options) {
            var items, that = this,
                contextMenuEnabled = that.option("grouping.contextMenuEnabled");
            if (contextMenuEnabled && options.row && "group" === options.row.rowType) {
                var columnsController = that._columnsController,
                    column = columnsController.columnOption("groupIndex:" + options.row.groupIndex);
                if (column && column.allowGrouping) {
                    var groupingTexts = that.option("grouping.texts"),
                        onItemClick = onGroupingMenuItemClick.bind(that, column);
                    items = [];
                    items.push({
                        text: groupingTexts.ungroup,
                        value: "ungroup",
                        onItemClick: onItemClick
                    }, {
                        text: groupingTexts.ungroupAll,
                        value: "ungroupAll",
                        onItemClick: onItemClick
                    })
                }
            }
            return items
        },
        _rowClick: function(e) {
            var that = this,
                expandMode = that.option("grouping.expandMode"),
                scrollingMode = that.option("scrolling.mode"),
                isGroupRowStateChanged = "infinite" !== scrollingMode && "rowClick" === expandMode && (0, _renderer2.default)(e.event.target).closest("." + DATAGRID_GROUP_ROW_CLASS).length,
                isExpandButtonClicked = (0, _renderer2.default)(e.event.target).closest("." + DATAGRID_EXPAND_CLASS).length;
            if (isGroupRowStateChanged || isExpandButtonClicked) {
                that._changeGroupRowState(e)
            }
            that.callBase(e)
        },
        _changeGroupRowState: function(e) {
            var dataController = this.getController("data"),
                row = dataController.items()[e.rowIndex],
                allowCollapsing = this._columnsController.columnOption("groupIndex:" + row.groupIndex, "allowCollapsing");
            if ("data" === row.rowType || "group" === row.rowType && false !== allowCollapsing) {
                dataController.changeRowExpand(row.key);
                e.event.preventDefault();
                e.handled = true
            }
        }
    }
}();
var columnHeadersViewExtender = function() {
    return {
        getContextMenuItems: function(options) {
            var that = this,
                contextMenuEnabled = that.option("grouping.contextMenuEnabled"),
                items = that.callBase(options);
            if (contextMenuEnabled && options.row && ("header" === options.row.rowType || "detailAdaptive" === options.row.rowType)) {
                var column = options.column;
                if (!column.command && (!(0, _type.isDefined)(column.allowGrouping) || column.allowGrouping)) {
                    var groupingTexts = that.option("grouping.texts"),
                        isColumnGrouped = (0, _type.isDefined)(column.groupIndex) && column.groupIndex > -1,
                        onItemClick = onGroupingMenuItemClick.bind(that, column);
                    items = items || [];
                    items.push({
                        text: groupingTexts.groupByThisColumn,
                        value: "group",
                        beginGroup: true,
                        disabled: isColumnGrouped,
                        onItemClick: onItemClick
                    });
                    if (column.showWhenGrouped) {
                        items.push({
                            text: groupingTexts.ungroup,
                            value: "ungroup",
                            disabled: !isColumnGrouped,
                            onItemClick: onItemClick
                        })
                    }
                    items.push({
                        text: groupingTexts.ungroupAll,
                        value: "ungroupAll",
                        onItemClick: onItemClick
                    })
                }
            }
            return items
        }
    }
}();
_uiData_grid2.default.registerModule("grouping", {
    defaultOptions: function() {
        return {
            grouping: {
                autoExpandAll: true,
                allowCollapsing: true,
                contextMenuEnabled: false,
                expandMode: "buttonClick",
                texts: {
                    groupContinuesMessage: _message2.default.format("dxDataGrid-groupContinuesMessage"),
                    groupContinuedMessage: _message2.default.format("dxDataGrid-groupContinuedMessage"),
                    groupByThisColumn: _message2.default.format("dxDataGrid-groupHeaderText"),
                    ungroup: _message2.default.format("dxDataGrid-ungroupHeaderText"),
                    ungroupAll: _message2.default.format("dxDataGrid-ungroupAllText")
                }
            },
            groupPanel: {
                visible: false,
                emptyPanelText: _message2.default.format("dxDataGrid-groupPanelEmptyText"),
                allowColumnDragging: true
            }
        }
    },
    extenders: {
        controllers: {
            data: GroupingDataControllerExtender,
            columns: {
                _getExpandColumnOptions: function() {
                    var options = this.callBase.apply(this, arguments);
                    options.cellTemplate = _uiData_grid2.default.getExpandCellTemplate();
                    return options
                }
            }
        },
        views: {
            headerPanel: GroupingHeaderPanelExtender,
            rowsView: GroupingRowsViewExtender,
            columnHeadersView: columnHeadersViewExtender
        }
    }
});
