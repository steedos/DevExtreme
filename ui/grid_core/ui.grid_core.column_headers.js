/**
 * DevExtreme (ui/grid_core/ui.grid_core.column_headers.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _events_engine = require("../../events/core/events_engine");
var _events_engine2 = _interopRequireDefault(_events_engine);
var _uiGrid_core = require("./ui.grid_core.columns_view");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _type = require("../../core/utils/type");
var _iterator = require("../../core/utils/iterator");
var _extend = require("../../core/utils/extend");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var CELL_CONTENT_CLASS = "text-content",
    HEADERS_CLASS = "headers",
    NOWRAP_CLASS = "nowrap",
    HEADER_ROW_CLASS = "dx-header-row",
    COLUMN_LINES_CLASS = "dx-column-lines",
    CONTEXT_MENU_SORT_ASC_ICON = "context-menu-sort-asc",
    CONTEXT_MENU_SORT_DESC_ICON = "context-menu-sort-desc",
    CONTEXT_MENU_SORT_NONE_ICON = "context-menu-sort-none",
    CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled",
    VISIBILITY_HIDDEN_CLASS = "dx-visibility-hidden",
    TEXT_CONTENT_ALIGNMENT_CLASS_PREFIX = "dx-text-content-alignment-",
    SORT_INDICATOR_CLASS = "dx-sort-indicator",
    HEADER_FILTER_INDICATOR_CLASS = "dx-header-filter-indicator",
    MULTI_ROW_HEADER_CLASS = "dx-header-multi-row";
module.exports = {
    defaultOptions: function() {
        return {
            showColumnHeaders: true,
            cellHintEnabled: true
        }
    },
    views: {
        columnHeadersView: _uiGrid_core2.default.ColumnsView.inherit(function() {
            var createCellContent = function(that, $cell, options) {
                var showColumnLines, $cellContent = (0, _renderer2.default)("<div>").addClass(that.addWidgetPrefix(CELL_CONTENT_CLASS));
                that.setAria("role", "presentation", $cellContent);
                addCssClassesToCellContent(that, $cell, options.column, $cellContent);
                showColumnLines = that.option("showColumnLines");
                return $cellContent[showColumnLines || "right" === options.column.alignment ? "appendTo" : "prependTo"]($cell)
            };
            var addCssClassesToCellContent = function(that, $cell, column, $cellContent) {
                var $indicatorElements = that._getIndicatorElements($cell, true),
                    $visibleIndicatorElements = that._getIndicatorElements($cell),
                    indicatorCount = $indicatorElements && $indicatorElements.length,
                    columnAlignment = that._getColumnAlignment(column.alignment);
                $cellContent = $cellContent || $cell.children("." + that.addWidgetPrefix(CELL_CONTENT_CLASS));
                $cellContent.toggleClass(TEXT_CONTENT_ALIGNMENT_CLASS_PREFIX + columnAlignment, indicatorCount > 0).toggleClass(TEXT_CONTENT_ALIGNMENT_CLASS_PREFIX + ("left" === columnAlignment ? "right" : "left"), indicatorCount > 0 && "center" === column.alignment).toggleClass(SORT_INDICATOR_CLASS, !!$visibleIndicatorElements.filter("." + that._getIndicatorClassName("sort")).length).toggleClass(HEADER_FILTER_INDICATOR_CLASS, !!$visibleIndicatorElements.filter("." + that._getIndicatorClassName("headerFilter")).length)
            };
            return {
                _createTable: function() {
                    var $table = this.callBase.apply(this, arguments);
                    _events_engine2.default.on($table, "mousedown selectstart", this.createAction(function(e) {
                        var event = e.event;
                        if (event.shiftKey) {
                            event.preventDefault()
                        }
                    }));
                    return $table
                },
                _getDefaultTemplate: function(column) {
                    var that = this;
                    return function($container, options) {
                        var $content = column.command ? $container : createCellContent(that, $container, options),
                            caption = "expand" !== column.command && column.caption;
                        if (caption) {
                            $content.text(caption)
                        } else {
                            if (column.command) {
                                $container.html("&nbsp;")
                            }
                        }
                    }
                },
                _getHeaderTemplate: function(column) {
                    return column.headerCellTemplate || {
                        allowRenderToDetachedContainer: true,
                        render: this._getDefaultTemplate(column)
                    }
                },
                _processTemplate: function(template, options) {
                    var resultTemplate, that = this,
                        column = options.column,
                        renderingTemplate = that.callBase(template);
                    if ("header" === options.rowType && renderingTemplate && column.headerCellTemplate && !column.command) {
                        resultTemplate = {
                            render: function(options) {
                                var $content = createCellContent(that, options.container, options.model);
                                renderingTemplate.render((0, _extend.extend)({}, options, {
                                    container: $content
                                }))
                            }
                        }
                    } else {
                        resultTemplate = renderingTemplate
                    }
                    return resultTemplate
                },
                _handleDataChanged: function(e) {
                    if ("refresh" !== e.changeType) {
                        return
                    }
                    if (this._isGroupingChanged || this._requireReady) {
                        this._isGroupingChanged = false;
                        this.render()
                    }
                },
                _renderCell: function($row, options) {
                    var $cell = this.callBase($row, options);
                    if ("header" === options.row.rowType) {
                        $cell.addClass(CELL_FOCUS_DISABLED_CLASS)
                    }
                    return $cell
                },
                _setCellAriaAttributes: function($cell, cellOptions) {
                    this.callBase($cell, cellOptions);
                    if ("header" === cellOptions.rowType) {
                        this.setAria("role", "columnheader", $cell);
                        if (cellOptions.column && !cellOptions.column.command && !cellOptions.column.isBand) {
                            $cell.attr("id", cellOptions.column.headerId);
                            this.setAria("label", _message2.default.format("dxDataGrid-ariaColumn") + " " + cellOptions.column.caption, $cell)
                        }
                    }
                },
                _createRow: function(row) {
                    var $row = this.callBase(row).toggleClass(COLUMN_LINES_CLASS, this.option("showColumnLines"));
                    if ("header" === row.rowType) {
                        $row.addClass(HEADER_ROW_CLASS)
                    }
                    return $row
                },
                _renderCore: function() {
                    var that = this,
                        $container = that.element();
                    if (that._tableElement && !that._dataController.isLoaded() && !that._hasRowElements) {
                        return
                    }
                    $container.addClass(that.addWidgetPrefix(HEADERS_CLASS)).toggleClass(that.addWidgetPrefix(NOWRAP_CLASS), !that.option("wordWrapEnabled")).empty();
                    that.setAria("role", "presentation", $container);
                    that._updateContent(that._renderTable());
                    if (that.getRowCount() > 1) {
                        $container.addClass(MULTI_ROW_HEADER_CLASS)
                    }
                    that.callBase.apply(that, arguments)
                },
                _renderRows: function() {
                    var that = this;
                    if (that._dataController.isLoaded() || that._hasRowElements) {
                        that.callBase.apply(that, arguments);
                        that._hasRowElements = true
                    }
                },
                _getRowVisibleColumns: function(rowIndex) {
                    return this._columnsController.getVisibleColumns(rowIndex)
                },
                _renderRow: function($table, options) {
                    options.columns = this._getRowVisibleColumns(options.row.rowIndex);
                    this.callBase($table, options)
                },
                _createCell: function(options) {
                    var column = options.column,
                        $cellElement = this.callBase.apply(this, arguments);
                    column.rowspan > 1 && "header" === options.rowType && $cellElement.attr("rowSpan", column.rowspan);
                    return $cellElement
                },
                _getRows: function() {
                    var i, result = [],
                        rowCount = this.getRowCount();
                    if (this.option("showColumnHeaders")) {
                        for (i = 0; i < rowCount; i++) {
                            result.push({
                                rowType: "header",
                                rowIndex: i
                            })
                        }
                    }
                    return result
                },
                _getCellTemplate: function(options) {
                    if ("header" === options.rowType) {
                        return this._getHeaderTemplate(options.column)
                    }
                },
                _columnOptionChanged: function(e) {
                    var changeTypes = e.changeTypes,
                        optionNames = e.optionNames;
                    if (changeTypes.grouping) {
                        this._isGroupingChanged = true;
                        return
                    }
                    this.callBase(e);
                    if (optionNames.width || optionNames.visible) {
                        this.resizeCompleted.fire()
                    }
                },
                _isElementVisible: function(elementOptions) {
                    return elementOptions && elementOptions.visible
                },
                _alignCaptionByCenter: function($cell) {
                    var $indicatorsContainer = this._getIndicatorContainer($cell, true);
                    if ($indicatorsContainer && $indicatorsContainer.length) {
                        $indicatorsContainer.filter("." + VISIBILITY_HIDDEN_CLASS).remove();
                        $indicatorsContainer = this._getIndicatorContainer($cell);
                        $indicatorsContainer.clone().addClass(VISIBILITY_HIDDEN_CLASS).css("float", "").insertBefore($cell.children("." + this.addWidgetPrefix(CELL_CONTENT_CLASS)))
                    }
                },
                _updateCell: function($cell, options) {
                    if ("header" === options.rowType && "center" === options.column.alignment) {
                        this._alignCaptionByCenter($cell)
                    }
                    this.callBase.apply(this, arguments)
                },
                _updateIndicator: function($cell, column, indicatorName) {
                    var $indicatorElement = this.callBase.apply(this, arguments);
                    if ("center" === column.alignment) {
                        this._alignCaptionByCenter($cell)
                    }
                    addCssClassesToCellContent(this, $cell, column);
                    return $indicatorElement
                },
                _getIndicatorContainer: function($cell, returnAll) {
                    var $indicatorsContainer = this.callBase($cell);
                    return returnAll ? $indicatorsContainer : $indicatorsContainer.filter(":not(." + VISIBILITY_HIDDEN_CLASS + ")")
                },
                _isSortableElement: function() {
                    return true
                },
                getHeadersRowHeight: function() {
                    var $tableElement = this._getTableElement(),
                        $headerRows = $tableElement && $tableElement.find("." + HEADER_ROW_CLASS);
                    return $headerRows && $headerRows.toArray().reduce(function(sum, headerRow) {
                        return sum + (0, _renderer2.default)(headerRow).height()
                    }, 0) || 0
                },
                getHeaderElement: function(index) {
                    var columnElements = this.getColumnElements();
                    return columnElements && columnElements.eq(index)
                },
                getColumnElements: function(index, bandColumnIndex) {
                    var rowIndex, result, $cellElement, visibleColumns, that = this,
                        columnsController = that._columnsController,
                        rowCount = that.getRowCount();
                    if (that.option("showColumnHeaders")) {
                        if (rowCount > 1 && (!(0, _type.isDefined)(index) || (0, _type.isDefined)(bandColumnIndex))) {
                            result = [];
                            visibleColumns = (0, _type.isDefined)(bandColumnIndex) ? columnsController.getChildrenByBandColumn(bandColumnIndex, true) : columnsController.getVisibleColumns();
                            (0, _iterator.each)(visibleColumns, function(_, column) {
                                rowIndex = (0, _type.isDefined)(index) ? index : columnsController.getRowIndex(column.index);
                                $cellElement = that._getCellElement(rowIndex, columnsController.getVisibleIndex(column.index, rowIndex));
                                $cellElement && result.push($cellElement.get(0))
                            });
                            return (0, _renderer2.default)(result)
                        } else {
                            if (!index || index < rowCount) {
                                return that.getCellElements(index || 0)
                            }
                        }
                    }
                },
                getVisibleColumnIndex: function(columnIndex, rowIndex) {
                    var column = this.getColumns()[columnIndex];
                    return column ? this._columnsController.getVisibleIndex(column.index, rowIndex) : -1
                },
                getColumnWidths: function() {
                    var $columnElements = this.getColumnElements();
                    if ($columnElements && $columnElements.length) {
                        return this._getWidths($columnElements)
                    }
                    return this.callBase.apply(this, arguments)
                },
                allowDragging: function(column, sourceLocation, draggingPanels) {
                    var i, draggingPanel, rowIndex = column && this._columnsController.getRowIndex(column.index),
                        columns = this.getColumns(0 === rowIndex ? 0 : null),
                        draggableColumnCount = 0,
                        allowDrag = function(column) {
                            return column.allowReordering || column.allowGrouping || column.allowHiding
                        };
                    for (i = 0; i < columns.length; i++) {
                        if (allowDrag(columns[i])) {
                            draggableColumnCount++
                        }
                    }
                    if (draggableColumnCount <= 1) {
                        return false
                    } else {
                        if (!draggingPanels) {
                            return (this.option("allowColumnReordering") || this._columnsController.isColumnOptionUsed("allowReordering")) && column && column.allowReordering
                        }
                    }
                    for (i = 0; i < draggingPanels.length; i++) {
                        draggingPanel = draggingPanels[i];
                        if (draggingPanel && draggingPanel.allowDragging(column, sourceLocation)) {
                            return true
                        }
                    }
                    return false
                },
                getBoundingRect: function() {
                    var offset, that = this,
                        $columnElements = that.getColumnElements();
                    if ($columnElements && $columnElements.length) {
                        offset = that._getTableElement().offset();
                        return {
                            top: offset.top
                        }
                    }
                    return null
                },
                getName: function() {
                    return "headers"
                },
                getColumnCount: function() {
                    var $columnElements = this.getColumnElements();
                    return $columnElements ? $columnElements.length : 0
                },
                isVisible: function() {
                    return this.option("showColumnHeaders")
                },
                optionChanged: function(args) {
                    var that = this;
                    switch (args.name) {
                        case "showColumnHeaders":
                        case "wordWrapEnabled":
                        case "showColumnLines":
                            that._invalidate(true, true);
                            args.handled = true;
                            break;
                        default:
                            that.callBase(args)
                    }
                },
                getHeight: function() {
                    return this.getElementHeight()
                },
                getContextMenuItems: function(options) {
                    var onItemClick, sortingOptions, that = this,
                        column = options.column;
                    if (options.row && ("header" === options.row.rowType || "detailAdaptive" === options.row.rowType)) {
                        sortingOptions = that.option("sorting");
                        if (sortingOptions && "none" !== sortingOptions.mode && column && column.allowSorting) {
                            onItemClick = function(params) {
                                setTimeout(function() {
                                    that._columnsController.changeSortOrder(column.index, params.itemData.value)
                                })
                            };
                            return [{
                                text: sortingOptions.ascendingText,
                                value: "asc",
                                disabled: "asc" === column.sortOrder,
                                icon: CONTEXT_MENU_SORT_ASC_ICON,
                                onItemClick: onItemClick
                            }, {
                                text: sortingOptions.descendingText,
                                value: "desc",
                                disabled: "desc" === column.sortOrder,
                                icon: CONTEXT_MENU_SORT_DESC_ICON,
                                onItemClick: onItemClick
                            }, {
                                text: sortingOptions.clearText,
                                value: "none",
                                disabled: !column.sortOrder,
                                icon: CONTEXT_MENU_SORT_NONE_ICON,
                                onItemClick: onItemClick
                            }]
                        }
                    }
                },
                getRowCount: function() {
                    return this._columnsController && this._columnsController.getRowCount()
                },
                setRowsOpacity: function(columnIndex, value, rowIndex) {
                    var i, columnElements, that = this,
                        rowCount = that.getRowCount(),
                        columns = that._columnsController.getColumns(),
                        column = columns && columns[columnIndex],
                        columnID = column && column.isBand && column.index,
                        setColumnOpacity = function(index, column) {
                            if (column.ownerBand === columnID) {
                                columnElements.eq(index).css({
                                    opacity: value
                                });
                                if (column.isBand) {
                                    that.setRowsOpacity(column.index, value, i + 1)
                                }
                            }
                        };
                    if ((0, _type.isDefined)(columnID)) {
                        rowIndex = rowIndex || 0;
                        for (i = rowIndex; i < rowCount; i++) {
                            columnElements = that.getCellElements(i);
                            (0, _iterator.each)(that.getColumns(i), setColumnOpacity)
                        }
                    }
                }
            }
        }())
    }
};
