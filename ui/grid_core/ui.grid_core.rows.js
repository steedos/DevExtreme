/**
 * DevExtreme (ui/grid_core/ui.grid_core.rows.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _window = require("../../core/utils/window");
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _common = require("../../core/utils/common");
var _style = require("../../core/utils/style");
var _style2 = _interopRequireDefault(_style);
var _type = require("../../core/utils/type");
var _iterator = require("../../core/utils/iterator");
var _extend = require("../../core/utils/extend");
var _string = require("../../core/utils/string");
var _position = require("../../core/utils/position");
var _data = require("../../core/utils/data");
var _uiGrid_core = require("./ui.grid_core.utils");
var _uiGrid_core2 = require("./ui.grid_core.columns_view");
var _uiGrid_core3 = _interopRequireDefault(_uiGrid_core2);
var _ui = require("../scroll_view/ui.scrollable");
var _ui2 = _interopRequireDefault(_ui);
var _remove_event = require("../../core/remove_event");
var _remove_event2 = _interopRequireDefault(_remove_event);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _browser = require("../../core/utils/browser");
var _browser2 = _interopRequireDefault(_browser);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var ROWS_VIEW_CLASS = "rowsview",
    CONTENT_CLASS = "content",
    NOWRAP_CLASS = "nowrap",
    GROUP_ROW_CLASS = "dx-group-row",
    GROUP_CELL_CLASS = "dx-group-cell",
    DATA_ROW_CLASS = "dx-data-row",
    FREE_SPACE_CLASS = "dx-freespace-row",
    ROW_LINES_CLASS = "dx-row-lines",
    COLUMN_LINES_CLASS = "dx-column-lines",
    ROW_ALTERNATION_CLASS = "dx-row-alt",
    LAST_ROW_BORDER = "dx-last-row-border",
    EMPTY_CLASS = "dx-empty",
    ROW_INSERTED_ANIMATION_CLASS = "row-inserted-animation",
    LOADPANEL_HIDE_TIMEOUT = 200;
module.exports = {
    defaultOptions: function() {
        return {
            hoverStateEnabled: false,
            scrolling: {
                useNative: "auto"
            },
            loadPanel: {
                enabled: "auto",
                text: _message2.default.format("Loading"),
                width: 200,
                height: 90,
                showIndicator: true,
                indicatorSrc: "",
                showPane: true
            },
            rowTemplate: null,
            columnAutoWidth: false,
            noDataText: _message2.default.format("dxDataGrid-noDataText"),
            wordWrapEnabled: false,
            showColumnLines: true,
            showRowLines: false,
            rowAlternationEnabled: false,
            activeStateEnabled: false,
            twoWayBindingEnabled: true
        }
    },
    views: {
        rowsView: _uiGrid_core3.default.ColumnsView.inherit(function() {
            var defaultCellTemplate = function($container, options) {
                var isDataTextEmpty = (0, _string.isEmpty)(options.text) && "data" === options.rowType,
                    text = options.text,
                    container = $container.get(0);
                if (isDataTextEmpty) {
                    (0, _uiGrid_core.setEmptyText)($container)
                } else {
                    if (options.column.encodeHtml) {
                        container.textContent = text
                    } else {
                        container.innerHTML = text
                    }
                }
            };
            var getScrollableBottomPadding = function(that) {
                var scrollable = that.getScrollable();
                return scrollable ? Math.ceil(parseFloat(scrollable.$content().css("paddingBottom"))) : 0
            };
            return {
                _getDefaultTemplate: function(column) {
                    switch (column.command) {
                        case "empty":
                            return function(container) {
                                container.html("&nbsp;")
                            };
                        default:
                            return defaultCellTemplate
                    }
                },
                _getDefaultGroupTemplate: function(column) {
                    var that = this,
                        summaryTexts = that.option("summary.texts");
                    return function($container, options) {
                        var data = options.data,
                            text = options.column.caption + ": " + options.text,
                            container = $container.get(0);
                        if (options.summaryItems && options.summaryItems.length) {
                            text += " " + (0, _uiGrid_core.getGroupRowSummaryText)(options.summaryItems, summaryTexts)
                        }
                        if (data) {
                            if (options.groupContinuedMessage && options.groupContinuesMessage) {
                                text += " (" + options.groupContinuedMessage + ". " + options.groupContinuesMessage + ")"
                            } else {
                                if (options.groupContinuesMessage) {
                                    text += " (" + options.groupContinuesMessage + ")"
                                } else {
                                    if (options.groupContinuedMessage) {
                                        text += " (" + options.groupContinuedMessage + ")"
                                    }
                                }
                            }
                        }
                        $container.addClass(GROUP_CELL_CLASS);
                        if (column.encodeHtml) {
                            container.textContent = text
                        } else {
                            container.innerHTML = text
                        }
                    }
                },
                _update: function() {},
                _getCellTemplate: function(options) {
                    var template, that = this,
                        column = options.column;
                    if ("group" === options.rowType && (0, _type.isDefined)(column.groupIndex) && !column.showWhenGrouped && !column.command) {
                        template = column.groupCellTemplate || {
                            allowRenderToDetachedContainer: true,
                            render: that._getDefaultGroupTemplate(column)
                        }
                    } else {
                        template = column.cellTemplate || {
                            allowRenderToDetachedContainer: true,
                            render: that._getDefaultTemplate(column)
                        }
                    }
                    return template
                },
                _createRow: function(row) {
                    var isGroup, isDataRow, isRowExpanded, $row = this.callBase(row);
                    if (row) {
                        isGroup = "group" === row.rowType;
                        isDataRow = "data" === row.rowType;
                        isDataRow && $row.addClass(DATA_ROW_CLASS);
                        isDataRow && this.option("showRowLines") && $row.addClass(ROW_LINES_CLASS);
                        this.option("showColumnLines") && $row.addClass(COLUMN_LINES_CLASS);
                        if (false === row.visible) {
                            $row.hide()
                        }
                        if (isGroup) {
                            $row.addClass(GROUP_ROW_CLASS);
                            isRowExpanded = row.isExpanded;
                            this.setAria("role", "row", $row);
                            this.setAria("expanded", (0, _type.isDefined)(isRowExpanded) && isRowExpanded.toString(), $row)
                        }
                    }
                    return $row
                },
                _rowPrepared: function($row, row) {
                    var _this = this;
                    if ("data" === row.rowType) {
                        if (this.option("rowAlternationEnabled")) {
                            var getRowAlt = function() {
                                return row.dataIndex % 2 === 1
                            };
                            getRowAlt() && $row.addClass(ROW_ALTERNATION_CLASS);
                            row.watch && row.watch(getRowAlt, function(value) {
                                $row.toggleClass(ROW_ALTERNATION_CLASS, value)
                            })
                        }
                        this._setAriaRowIndex(row, $row);
                        row.watch && row.watch(function() {
                            return row.rowIndex
                        }, function() {
                            return _this._setAriaRowIndex(row, $row)
                        })
                    }
                    this.callBase.apply(this, arguments)
                },
                _setAriaRowIndex: function(row, $row) {
                    var component = this.component,
                        isPagerMode = "standard" === component.option("scrolling.mode") && "virtual" !== component.option("scrolling.rowRenderingMode"),
                        rowIndex = row.rowIndex + 1;
                    if (isPagerMode) {
                        rowIndex = component.pageIndex() * component.pageSize() + rowIndex
                    } else {
                        rowIndex += this._dataController.getRowIndexOffset()
                    }
                    this.setAria("rowindex", rowIndex, $row)
                },
                _afterRowPrepared: function(e) {
                    var _this2 = this;
                    var arg = e.args[0],
                        dataController = this._dataController,
                        watch = this.option("integrationOptions.watchMethod");
                    if (!arg.data || "data" !== arg.rowType || arg.inserted || !this.option("twoWayBindingEnabled") || !watch) {
                        return
                    }
                    var dispose = watch(function() {
                        return dataController.generateDataValues(arg.data, arg.columns)
                    }, function() {
                        dataController.repaintRows([arg.rowIndex], _this2.option("repaintChangesOnly"))
                    }, {
                        deep: true,
                        skipImmediate: true
                    });
                    _events_engine2.default.on(arg.rowElement, _remove_event2.default, dispose)
                },
                _renderScrollable: function(force) {
                    var that = this,
                        $element = that.element();
                    if (!$element.children().length) {
                        $element.append("<div>")
                    }
                    if (force || !that._loadPanel) {
                        that._renderLoadPanel($element, $element.parent(), that._dataController.isLocalStore())
                    }
                    if ((force || !that.getScrollable()) && that._dataController.isLoaded()) {
                        var columns = that.getColumns(),
                            allColumnsHasWidth = true;
                        for (var i = 0; i < columns.length; i++) {
                            if (!columns[i].width && !columns[i].minWidth) {
                                allColumnsHasWidth = false;
                                break
                            }
                        }
                        if (that.option("columnAutoWidth") || that._hasHeight || allColumnsHasWidth || that._columnsController._isColumnFixing()) {
                            that._renderScrollableCore($element)
                        }
                    }
                },
                _handleScroll: function(e) {
                    var that = this;
                    that._isScrollByEvent = !!e.event;
                    that._scrollTop = e.scrollOffset.top;
                    that._scrollLeft = e.scrollOffset.left;
                    that.scrollChanged.fire(e.scrollOffset, that.name)
                },
                _renderScrollableCore: function($element) {
                    var that = this,
                        dxScrollableOptions = that._createScrollableOptions(),
                        scrollHandler = that._handleScroll.bind(that);
                    dxScrollableOptions.onScroll = scrollHandler;
                    dxScrollableOptions.onStop = scrollHandler;
                    that._scrollable = that._createComponent($element, _ui2.default, dxScrollableOptions);
                    that._scrollableContainer = that._scrollable && that._scrollable._$container
                },
                _renderLoadPanel: _uiGrid_core.renderLoadPanel,
                _renderContent: function(contentElement, tableElement) {
                    contentElement.replaceWith((0, _renderer2.default)("<div>").addClass(this.addWidgetPrefix(CONTENT_CLASS)).append(tableElement));
                    return this._findContentElement()
                },
                _updateContent: function(newTableElement, change) {
                    var that = this,
                        tableElement = that._getTableElement(),
                        contentElement = that._findContentElement(),
                        changeType = change && change.changeType,
                        executors = [],
                        highlightChanges = this.option("highlightChanges"),
                        rowInsertedClass = this.addWidgetPrefix(ROW_INSERTED_ANIMATION_CLASS);
                    switch (changeType) {
                        case "update":
                            (0, _iterator.each)(change.rowIndices, function(index, rowIndex) {
                                var $newRowElement = that._getRowElements(newTableElement).eq(index),
                                    changeType = change.changeTypes && change.changeTypes[index],
                                    item = change.items && change.items[index];
                                executors.push(function() {
                                    var $rowsElement = that._getRowElements(),
                                        $rowElement = $rowsElement.eq(rowIndex);
                                    switch (changeType) {
                                        case "update":
                                            if (item) {
                                                var columnIndices = change.columnIndices && change.columnIndices[index];
                                                if ((0, _type.isDefined)(item.visible) && item.visible !== $rowElement.is(":visible")) {
                                                    $rowElement.toggle(item.visible)
                                                } else {
                                                    if (columnIndices) {
                                                        that._updateCells($rowElement, $newRowElement, columnIndices)
                                                    } else {
                                                        $rowElement.replaceWith($newRowElement)
                                                    }
                                                }
                                            }
                                            break;
                                        case "insert":
                                            if (!$rowsElement.length) {
                                                $newRowElement.prependTo(tableElement.children("tbody"))
                                            } else {
                                                if ($rowElement.length) {
                                                    $newRowElement.insertBefore($rowElement)
                                                } else {
                                                    $newRowElement.insertAfter($rowsElement.last())
                                                }
                                            }
                                            if (highlightChanges && change.isLiveUpdate) {
                                                $newRowElement.addClass(rowInsertedClass)
                                            }
                                            break;
                                        case "remove":
                                            $rowElement.remove()
                                    }
                                })
                            });
                            (0, _iterator.each)(executors, function() {
                                this()
                            });
                            newTableElement.remove();
                            break;
                        default:
                            that._setTableElement(newTableElement);
                            contentElement.addClass(that.addWidgetPrefix(CONTENT_CLASS));
                            that._renderContent(contentElement, newTableElement)
                    }
                },
                _createEmptyRow: function(className, isFixed, height) {
                    var i, $cell, that = this,
                        $row = that._createRow(),
                        columns = isFixed ? this.getFixedColumns() : this.getColumns();
                    $row.addClass(className).toggleClass(COLUMN_LINES_CLASS, that.option("showColumnLines"));
                    for (i = 0; i < columns.length; i++) {
                        $cell = that._createCell({
                            column: columns[i],
                            rowType: "freeSpace",
                            columnIndex: i,
                            columns: columns
                        });
                        (0, _type.isNumeric)(height) && $cell.css("height", height);
                        $row.append($cell)
                    }
                    that.setAria("role", "presentation", $row);
                    return $row
                },
                _appendEmptyRow: function($table, $emptyRow, location) {
                    var $tBodies = this._getBodies($table),
                        $container = $tBodies.length && !$emptyRow.is("tbody") ? $tBodies : $table;
                    if ("top" === location) {
                        $container.first().prepend($emptyRow)
                    } else {
                        $container.last().append($emptyRow)
                    }
                },
                _renderFreeSpaceRow: function($tableElement) {
                    var $freeSpaceRowElement = this._createEmptyRow(FREE_SPACE_CLASS);
                    $freeSpaceRowElement = this._wrapRowIfNeed($tableElement, $freeSpaceRowElement);
                    this._appendEmptyRow($tableElement, $freeSpaceRowElement)
                },
                _checkRowKeys: function(options) {
                    var that = this,
                        rows = that._getRows(options),
                        keyExpr = that._dataController.store() && that._dataController.store().key();
                    keyExpr && rows.some(function(row) {
                        if ("data" === row.rowType && void 0 === row.key) {
                            that._dataController.fireError("E1046", keyExpr);
                            return true
                        }
                    })
                },
                _needUpdateRowHeight: function(itemsCount) {
                    return itemsCount > 0 && !this._rowHeight
                },
                _getRowsHeight: function($tableElement) {
                    var $rowElements = $tableElement.children("tbody").children().not(".dx-virtual-row").not("." + FREE_SPACE_CLASS);
                    return $rowElements.toArray().reduce(function(sum, row) {
                        return sum + row.getBoundingClientRect().height
                    }, 0)
                },
                _updateRowHeight: function() {
                    var rowsHeight, that = this,
                        $tableElement = that._getTableElement(),
                        itemsCount = that._dataController.items().length;
                    if ($tableElement && that._needUpdateRowHeight(itemsCount)) {
                        rowsHeight = that._getRowsHeight($tableElement);
                        that._rowHeight = rowsHeight / itemsCount
                    }
                },
                _findContentElement: function() {
                    var $content = this.element(),
                        scrollable = this.getScrollable();
                    if ($content) {
                        if (scrollable) {
                            $content = scrollable.$content()
                        }
                        return $content.children().first()
                    }
                },
                _getRowElements: function(tableElement) {
                    var $rows = this.callBase(tableElement);
                    return $rows && $rows.not("." + FREE_SPACE_CLASS)
                },
                _getFreeSpaceRowElements: function($table) {
                    var tableElements = $table || this.getTableElements();
                    return tableElements && tableElements.children("tbody").children("." + FREE_SPACE_CLASS)
                },
                _getNoDataText: function() {
                    return this.option("noDataText")
                },
                _rowClick: function(e) {
                    var item = this._dataController.items()[e.rowIndex] || {};
                    this.executeAction("onRowClick", (0, _extend.extend)({
                        evaluate: function(expr) {
                            var getter = (0, _data.compileGetter)(expr);
                            return getter(item.data)
                        }
                    }, e, item))
                },
                _getColumnsCountBeforeGroups: function(columns) {
                    for (var i = 0; i < columns.length; i++) {
                        if ("groupExpand" === columns[i].type) {
                            return i
                        }
                    }
                    return 0
                },
                _getGroupCellOptions: function(options) {
                    var columnsCountBeforeGroups = this._getColumnsCountBeforeGroups(options.columns),
                        columnIndex = (options.row.groupIndex || 0) + columnsCountBeforeGroups;
                    return {
                        columnIndex: columnIndex,
                        colspan: options.columns.length - columnIndex - 1
                    }
                },
                _renderCells: function($row, options) {
                    if ("group" === options.row.rowType) {
                        this._renderGroupedCells($row, options)
                    } else {
                        if (options.row.values) {
                            this.callBase($row, options)
                        }
                    }
                },
                _renderGroupedCells: function($row, options) {
                    var i, expandColumn, isExpanded, groupColumn, groupColumnAlignment, row = options.row,
                        columns = options.columns,
                        rowIndex = row.rowIndex,
                        groupCellOptions = this._getGroupCellOptions(options);
                    for (i = 0; i <= groupCellOptions.columnIndex; i++) {
                        if (i === groupCellOptions.columnIndex && columns[i].allowCollapsing && "infinite" !== options.scrollingMode) {
                            isExpanded = !!row.isExpanded;
                            expandColumn = columns[i]
                        } else {
                            isExpanded = null;
                            expandColumn = {
                                command: "expand",
                                cssClass: columns[i].cssClass
                            }
                        }
                        this._renderCell($row, {
                            value: isExpanded,
                            row: row,
                            rowIndex: rowIndex,
                            column: expandColumn,
                            columnIndex: i
                        })
                    }
                    groupColumnAlignment = (0, _position.getDefaultAlignment)(this.option("rtlEnabled"));
                    groupColumn = (0, _extend.extend)({}, columns[groupCellOptions.columnIndex], {
                        command: null,
                        cssClass: null,
                        width: null,
                        showWhenGrouped: false,
                        alignment: groupColumnAlignment
                    });
                    if (groupCellOptions.colspan > 1) {
                        groupColumn.colspan = groupCellOptions.colspan
                    }
                    this._renderCell($row, {
                        value: row.values[row.groupIndex],
                        row: row,
                        rowIndex: rowIndex,
                        column: groupColumn,
                        columnIndex: groupCellOptions.columnIndex
                    })
                },
                _renderRows: function($table, options) {
                    var that = this,
                        scrollingMode = that.option("scrolling.mode");
                    that.callBase($table, (0, _extend.extend)({
                        scrollingMode: scrollingMode
                    }, options));
                    that._checkRowKeys(options.change);
                    that._renderFreeSpaceRow($table);
                    if (!that._hasHeight) {
                        that.updateFreeSpaceRowHeight($table)
                    }
                },
                _renderRow: function($table, options) {
                    var that = this,
                        row = options.row,
                        rowTemplate = that.option("rowTemplate");
                    if (("data" === row.rowType || "group" === row.rowType) && !(0, _type.isDefined)(row.groupIndex) && rowTemplate) {
                        that.renderTemplate($table, rowTemplate, (0, _extend.extend)({
                            columns: options.columns
                        }, row), true)
                    } else {
                        that.callBase($table, options)
                    }
                },
                _renderTable: function(options) {
                    var that = this,
                        $table = that.callBase(options),
                        resizeCompletedHandler = function resizeCompletedHandler() {
                            var scrollableInstance = that.getScrollable();
                            if (scrollableInstance && that.element().closest((0, _window.getWindow)().document).length) {
                                that.resizeCompleted.remove(resizeCompletedHandler);
                                scrollableInstance._visibilityChanged(true)
                            }
                        };
                    if (!(0, _type.isDefined)(that._getTableElement())) {
                        that._setTableElement($table);
                        that._renderScrollable(true);
                        that.resizeCompleted.add(resizeCompletedHandler)
                    } else {
                        that._renderScrollable()
                    }
                    return $table
                },
                _createTable: function() {
                    var $table = this.callBase.apply(this, arguments);
                    if (this.option("rowTemplate")) {
                        $table.appendTo(this.component.$element())
                    }
                    return $table
                },
                _renderCore: function(change) {
                    var $table, that = this,
                        $element = that.element();
                    $element.addClass(that.addWidgetPrefix(ROWS_VIEW_CLASS)).toggleClass(that.addWidgetPrefix(NOWRAP_CLASS), !that.option("wordWrapEnabled"));
                    $element.toggleClass(EMPTY_CLASS, 0 === that._dataController.items().length);
                    that.setAria("role", "presentation", $element);
                    $table = that._renderTable({
                        change: change
                    });
                    that._updateContent($table, change);
                    that.callBase(change);
                    that._lastColumnWidths = null
                },
                _getRows: function(change) {
                    return change && change.items || this._dataController.items()
                },
                _getCellOptions: function(options) {
                    var parameters, groupingTextsOptions, scrollingMode, that = this,
                        column = options.column,
                        row = options.row,
                        data = row.data,
                        summaryCells = row && row.summaryCells,
                        value = options.value,
                        displayValue = (0, _uiGrid_core.getDisplayValue)(column, value, data, row.rowType);
                    parameters = this.callBase(options);
                    parameters.value = value;
                    parameters.oldValue = options.oldValue;
                    parameters.displayValue = displayValue;
                    parameters.row = row;
                    parameters.key = row.key;
                    parameters.data = data;
                    parameters.rowType = row.rowType;
                    parameters.values = row.values;
                    parameters.text = !column.command ? (0, _uiGrid_core.formatValue)(displayValue, column) : "";
                    parameters.rowIndex = row.rowIndex;
                    parameters.summaryItems = summaryCells && summaryCells[options.columnIndex];
                    parameters.resized = column.resizedCallbacks;
                    if ((0, _type.isDefined)(column.groupIndex) && !column.command) {
                        groupingTextsOptions = that.option("grouping.texts");
                        scrollingMode = that.option("scrolling.mode");
                        if ("virtual" !== scrollingMode && "infinite" !== scrollingMode) {
                            parameters.groupContinuesMessage = data && data.isContinuationOnNextPage && groupingTextsOptions && groupingTextsOptions.groupContinuesMessage;
                            parameters.groupContinuedMessage = data && data.isContinuation && groupingTextsOptions && groupingTextsOptions.groupContinuedMessage
                        }
                    }
                    return parameters
                },
                _setRowsOpacityCore: function($rows, visibleColumns, columnIndex, value) {
                    var columnsController = this._columnsController,
                        columns = columnsController.getColumns(),
                        column = columns && columns[columnIndex],
                        columnID = column && column.isBand && column.index;
                    (0, _iterator.each)($rows, function(rowIndex, row) {
                        if (!(0, _renderer2.default)(row).hasClass(GROUP_ROW_CLASS)) {
                            for (var i = 0; i < visibleColumns.length; i++) {
                                if ((0, _type.isNumeric)(columnID) && columnsController.isParentBandColumn(visibleColumns[i].index, columnID) || visibleColumns[i].index === columnIndex) {
                                    $rows.eq(rowIndex).children().eq(i).css({
                                        opacity: value
                                    });
                                    if (!(0, _type.isNumeric)(columnID)) {
                                        break
                                    }
                                }
                            }
                        }
                    })
                },
                _getDevicePixelRatio: function() {
                    return (0, _window.getWindow)().devicePixelRatio
                },
                renderNoDataText: _uiGrid_core.renderNoDataText,
                getCellOptions: function(rowIndex, columnIdentifier) {
                    var cellOptions, column, rowOptions = this._dataController.items()[rowIndex];
                    if (rowOptions) {
                        if ((0, _type.isString)(columnIdentifier)) {
                            column = this._columnsController.columnOption(columnIdentifier)
                        } else {
                            column = this._columnsController.getVisibleColumns()[columnIdentifier]
                        }
                        if (column) {
                            cellOptions = this._getCellOptions({
                                value: column.calculateCellValue(rowOptions.data),
                                rowIndex: rowOptions.rowIndex,
                                row: rowOptions,
                                column: column
                            })
                        }
                    }
                    return cellOptions
                },
                getRow: function(index) {
                    if (index >= 0) {
                        var rows = this._getRowElements();
                        if (rows.length > index) {
                            return (0, _renderer2.default)(rows[index])
                        }
                    }
                },
                getCellIndex: function($cell) {
                    var cellIndex = $cell.length ? $cell[0].cellIndex : -1;
                    return cellIndex
                },
                updateFreeSpaceRowHeight: function($table) {
                    var freeSpaceRowCount, scrollingMode, that = this,
                        dataController = that._dataController,
                        itemCount = dataController.items().length,
                        contentElement = that._findContentElement(),
                        freeSpaceRowElements = that._getFreeSpaceRowElements($table);
                    if (freeSpaceRowElements && contentElement && dataController.totalCount() >= 0) {
                        var isFreeSpaceRowVisible = false;
                        if (itemCount > 0) {
                            if (!that._hasHeight) {
                                freeSpaceRowCount = dataController.pageSize() - itemCount;
                                scrollingMode = that.option("scrolling.mode");
                                if (freeSpaceRowCount > 0 && dataController.pageCount() > 1 && "virtual" !== scrollingMode && "infinite" !== scrollingMode) {
                                    _style2.default.setHeight(freeSpaceRowElements, freeSpaceRowCount * that._rowHeight);
                                    isFreeSpaceRowVisible = true
                                }
                                if (!isFreeSpaceRowVisible && $table) {
                                    _style2.default.setHeight(freeSpaceRowElements, 0)
                                } else {
                                    freeSpaceRowElements.toggle(isFreeSpaceRowVisible)
                                }
                                that._updateLastRowBorder(isFreeSpaceRowVisible)
                            } else {
                                freeSpaceRowElements.hide();
                                (0, _common.deferUpdate)(function() {
                                    var scrollablePadding = getScrollableBottomPadding(that),
                                        scrollbarWidth = that.getScrollbarWidth(true),
                                        elementHeightWithoutScrollbar = that.element().height() - scrollbarWidth - scrollablePadding,
                                        contentHeight = contentElement.outerHeight(),
                                        showFreeSpaceRow = elementHeightWithoutScrollbar - contentHeight > 0,
                                        rowsHeight = that._getRowsHeight(contentElement.children().first()),
                                        $tableElement = $table || that.getTableElements(),
                                        borderTopWidth = Math.ceil(parseFloat($tableElement.css("borderTopWidth"))),
                                        heightCorrection = _browser2.default.webkit && that._getDevicePixelRatio() >= 2 ? 1 : 0,
                                        resultHeight = elementHeightWithoutScrollbar - rowsHeight - borderTopWidth - heightCorrection;
                                    if (showFreeSpaceRow) {
                                        (0, _common.deferRender)(function() {
                                            freeSpaceRowElements.css("height", resultHeight);
                                            isFreeSpaceRowVisible = true;
                                            freeSpaceRowElements.show()
                                        })
                                    }(0, _common.deferRender)(function() {
                                        that._updateLastRowBorder(isFreeSpaceRowVisible)
                                    })
                                })
                            }
                        } else {
                            freeSpaceRowElements.css("height", 0);
                            freeSpaceRowElements.show();
                            that._updateLastRowBorder(true)
                        }
                    }
                },
                _columnOptionChanged: function(e) {
                    var optionNames = e.optionNames;
                    if (e.changeTypes.grouping) {
                        return
                    }
                    if (optionNames.width || optionNames.visibleWidth) {
                        this.callBase(e);
                        this._fireColumnResizedCallbacks()
                    }
                },
                getScrollable: function() {
                    return this._scrollable
                },
                init: function() {
                    var that = this,
                        dataController = that.getController("data");
                    that.callBase();
                    that._editorFactoryController = that.getController("editorFactory");
                    that._rowHeight = 0;
                    that._scrollTop = 0;
                    that._scrollLeft = -1;
                    that._hasHeight = false;
                    dataController.loadingChanged.add(function(isLoading, messageText) {
                        that.setLoading(isLoading, messageText)
                    });
                    dataController.dataSourceChanged.add(function() {
                        if (that._scrollLeft >= 0) {
                            that._handleScroll({
                                scrollOffset: {
                                    top: that._scrollTop,
                                    left: that._scrollLeft
                                }
                            })
                        }
                    })
                },
                _handleDataChanged: function(change) {
                    var that = this;
                    switch (change.changeType) {
                        case "refresh":
                        case "prepend":
                        case "append":
                        case "update":
                            that.render(null, change);
                            break;
                        default:
                            that._update(change)
                    }
                },
                publicMethods: function() {
                    return ["isScrollbarVisible", "getTopVisibleRowData", "getScrollbarWidth", "getCellElement", "getRowElement", "getScrollable"]
                },
                contentWidth: function() {
                    return this.element().width() - this.getScrollbarWidth()
                },
                getScrollbarWidth: function(isHorizontal) {
                    var scrollableContainer = this._scrollableContainer && this._scrollableContainer.get(0),
                        scrollbarWidth = 0;
                    if (scrollableContainer) {
                        if (!isHorizontal) {
                            scrollbarWidth = scrollableContainer.clientWidth ? scrollableContainer.offsetWidth - scrollableContainer.clientWidth : 0
                        } else {
                            scrollbarWidth = scrollableContainer.clientHeight ? scrollableContainer.offsetHeight - scrollableContainer.clientHeight : 0;
                            scrollbarWidth += getScrollableBottomPadding(this)
                        }
                    }
                    return scrollbarWidth > 0 ? scrollbarWidth : 0
                },
                _fireColumnResizedCallbacks: function() {
                    var i, that = this,
                        lastColumnWidths = that._lastColumnWidths || [],
                        columnWidths = [],
                        columns = that.getColumns();
                    for (i = 0; i < columns.length; i++) {
                        columnWidths[i] = columns[i].visibleWidth;
                        if (columns[i].resizedCallbacks && !(0, _type.isDefined)(columns[i].groupIndex) && lastColumnWidths[i] !== columnWidths[i]) {
                            columns[i].resizedCallbacks.fire(columnWidths[i])
                        }
                    }
                    that._lastColumnWidths = columnWidths
                },
                _updateLastRowBorder: function(isFreeSpaceRowVisible) {
                    if (this.option("showBorders") && this.option("showRowLines") && !isFreeSpaceRowVisible) {
                        this.element().addClass(LAST_ROW_BORDER)
                    } else {
                        this.element().removeClass(LAST_ROW_BORDER)
                    }
                },
                _updateScrollable: function() {
                    var dxScrollable = _ui2.default.getInstance(this.element());
                    if (dxScrollable) {
                        dxScrollable.update();
                        this._updateHorizontalScrollPosition()
                    }
                },
                _updateHorizontalScrollPosition: function() {
                    var scrollable = this.getScrollable(),
                        scrollLeft = scrollable && scrollable.scrollOffset().left;
                    if (this._scrollLeft >= 0 && scrollLeft !== this._scrollLeft) {
                        scrollable.scrollTo({
                            x: this._scrollLeft
                        })
                    }
                },
                _resizeCore: function() {
                    var that = this;
                    that._fireColumnResizedCallbacks();
                    that._updateRowHeight();
                    (0, _common.deferRender)(function() {
                        that._renderScrollable();
                        that.renderNoDataText();
                        that.updateFreeSpaceRowHeight();
                        (0, _common.deferUpdate)(function() {
                            that._updateScrollable()
                        })
                    })
                },
                scrollTo: function(location) {
                    var $element = this.element(),
                        dxScrollable = $element && _ui2.default.getInstance($element);
                    if (dxScrollable) {
                        dxScrollable.scrollTo(location)
                    }
                },
                height: function(_height, hasHeight) {
                    var that = this,
                        $element = this.element();
                    if (0 === arguments.length) {
                        return $element ? $element.outerHeight(true) : 0
                    }
                    that._hasHeight = void 0 === hasHeight ? "auto" !== _height : hasHeight;
                    if ((0, _type.isDefined)(_height) && $element) {
                        _style2.default.setHeight($element, _height)
                    }
                },
                setLoading: function(isLoading, messageText) {
                    var visibilityOptions, that = this,
                        loadPanel = that._loadPanel,
                        dataController = that._dataController,
                        loadPanelOptions = that.option("loadPanel") || {},
                        animation = dataController.isLoaded() ? loadPanelOptions.animation : null,
                        $element = that.element();
                    if (!(0, _window.hasWindow)()) {
                        return
                    }
                    if (!loadPanel && void 0 !== messageText && dataController.isLocalStore() && "auto" === loadPanelOptions.enabled && $element) {
                        that._renderLoadPanel($element, $element.parent());
                        loadPanel = that._loadPanel
                    }
                    if (loadPanel) {
                        visibilityOptions = {
                            message: messageText || loadPanelOptions.text,
                            animation: animation,
                            visible: isLoading
                        };
                        clearTimeout(that._hideLoadingTimeoutID);
                        if (loadPanel.option("visible") && !isLoading) {
                            that._hideLoadingTimeoutID = setTimeout(function() {
                                loadPanel.option(visibilityOptions)
                            }, LOADPANEL_HIDE_TIMEOUT)
                        } else {
                            loadPanel.option(visibilityOptions)
                        }
                    }
                },
                setRowsOpacity: function(columnIndex, value) {
                    var $rows = this._getRowElements().not("." + GROUP_ROW_CLASS) || [];
                    this._setRowsOpacityCore($rows, this.getColumns(), columnIndex, value)
                },
                _getCellElementsCore: function(rowIndex) {
                    var groupCellIndex, $cells = this.callBase(rowIndex);
                    if ($cells) {
                        groupCellIndex = $cells.filter("." + GROUP_CELL_CLASS).index();
                        if (groupCellIndex >= 0 && $cells.length > groupCellIndex + 1) {
                            return $cells.slice(0, groupCellIndex + 1)
                        }
                    }
                    return $cells
                },
                getTopVisibleItemIndex: function() {
                    var rowElements, rowElement, that = this,
                        itemIndex = 0,
                        prevOffsetTop = 0,
                        offsetTop = 0,
                        scrollPosition = that._scrollTop,
                        $contentElement = that._findContentElement(),
                        contentElementOffsetTop = $contentElement && $contentElement.offset().top,
                        items = that._dataController.items(),
                        tableElement = that._getTableElement();
                    if (items.length && tableElement) {
                        rowElements = that._getRowElements(tableElement).filter(":visible");
                        for (itemIndex = 0; itemIndex < items.length; itemIndex++) {
                            prevOffsetTop = offsetTop;
                            rowElement = rowElements.eq(itemIndex);
                            if (rowElement.length) {
                                offsetTop = rowElement.offset().top - contentElementOffsetTop;
                                if (offsetTop > scrollPosition) {
                                    if (2 * scrollPosition < Math.round(offsetTop + prevOffsetTop) && itemIndex) {
                                        itemIndex--
                                    }
                                    break
                                }
                            }
                        }
                        if (itemIndex && itemIndex === items.length) {
                            itemIndex--
                        }
                    }
                    return itemIndex
                },
                getTopVisibleRowData: function() {
                    var itemIndex = this.getTopVisibleItemIndex(),
                        items = this._dataController.items();
                    if (items[itemIndex]) {
                        return items[itemIndex].data
                    }
                },
                optionChanged: function(args) {
                    var that = this;
                    that.callBase(args);
                    switch (args.name) {
                        case "wordWrapEnabled":
                        case "showColumnLines":
                        case "showRowLines":
                        case "rowAlternationEnabled":
                        case "rowTemplate":
                        case "twoWayBindingEnabled":
                            that._invalidate(true, true);
                            args.handled = true;
                            break;
                        case "scrolling":
                            that._rowHeight = null;
                            that._tableElement = null;
                            args.handled = true;
                            break;
                        case "rtlEnabled":
                            that._rowHeight = null;
                            that._tableElement = null;
                            break;
                        case "loadPanel":
                            that._tableElement = null;
                            that._invalidate(true, "loadPanel.enabled" !== args.fullName);
                            args.handled = true;
                            break;
                        case "noDataText":
                            that.renderNoDataText();
                            args.handled = true
                    }
                },
                dispose: function() {
                    clearTimeout(this._hideLoadingTimeoutID);
                    this._scrollable && this._scrollable.dispose()
                },
                setScrollerSpacing: function() {}
            }
        }())
    }
};
