/**
 * DevExtreme (ui/grid_core/ui.grid_core.master_detail.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _uiGrid_core = require("./ui.grid_core.utils");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _common = require("../../core/utils/common");
var _iterator = require("../../core/utils/iterator");
var _type = require("../../core/utils/type");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var MASTER_DETAIL_CELL_CLASS = "dx-master-detail-cell",
    MASTER_DETAIL_ROW_CLASS = "dx-master-detail-row",
    CELL_FOCUS_DISABLED_CLASS = "dx-cell-focus-disabled",
    ROW_LINES_CLASS = "dx-row-lines";
module.exports = {
    defaultOptions: function() {
        return {
            masterDetail: {
                enabled: false,
                autoExpandAll: false,
                template: null
            }
        }
    },
    extenders: {
        controllers: {
            columns: {
                _getExpandColumnsCore: function() {
                    var expandColumns = this.callBase();
                    if (this.option("masterDetail.enabled")) {
                        expandColumns.push({
                            type: "detailExpand",
                            cellTemplate: _uiGrid_core2.default.getExpandCellTemplate()
                        })
                    }
                    return expandColumns
                }
            },
            data: function() {
                var initMasterDetail = function(that) {
                    that._expandedItems = [];
                    that._isExpandAll = that.option("masterDetail.autoExpandAll")
                };
                return {
                    init: function() {
                        var that = this;
                        initMasterDetail(that);
                        that.callBase()
                    },
                    expandAll: function(groupIndex) {
                        var that = this;
                        if (groupIndex < 0) {
                            that._isExpandAll = true;
                            that._expandedItems = [];
                            that.updateItems()
                        } else {
                            that.callBase.apply(that, arguments)
                        }
                    },
                    collapseAll: function(groupIndex) {
                        var that = this;
                        if (groupIndex < 0) {
                            that._isExpandAll = false;
                            that._expandedItems = [];
                            that.updateItems()
                        } else {
                            that.callBase.apply(that, arguments)
                        }
                    },
                    isRowExpanded: function(key) {
                        var that = this,
                            expandIndex = _uiGrid_core2.default.getIndexByKey(key, that._expandedItems);
                        if (Array.isArray(key)) {
                            return that.callBase.apply(that, arguments)
                        } else {
                            return !!(that._isExpandAll ^ (expandIndex >= 0 && that._expandedItems[expandIndex].visible))
                        }
                    },
                    _getRowIndicesForExpand: function(key) {
                        var rowIndex = this.getRowIndexByKey(key);
                        return [rowIndex, rowIndex + 1]
                    },
                    _changeRowExpandCore: function(key) {
                        var expandIndex, editingController, that = this;
                        if (Array.isArray(key)) {
                            return that.callBase.apply(that, arguments)
                        } else {
                            expandIndex = _uiGrid_core2.default.getIndexByKey(key, that._expandedItems);
                            if (expandIndex >= 0) {
                                var visible = that._expandedItems[expandIndex].visible;
                                that._expandedItems[expandIndex].visible = !visible
                            } else {
                                that._expandedItems.push({
                                    key: key,
                                    visible: true
                                });
                                editingController = that.getController("editing");
                                if (editingController) {
                                    editingController.correctEditRowIndexAfterExpand(key)
                                }
                            }
                            that.updateItems({
                                changeType: "update",
                                rowIndices: that._getRowIndicesForExpand(key)
                            })
                        }
                    },
                    _processDataItem: function(data, options) {
                        var that = this,
                            dataItem = that.callBase.apply(that, arguments);
                        dataItem.isExpanded = that.isRowExpanded(dataItem.key);
                        if (void 0 === options.detailColumnIndex) {
                            options.detailColumnIndex = -1;
                            (0, _iterator.each)(options.visibleColumns, function(index, column) {
                                if ("expand" === column.command && !(0, _type.isDefined)(column.groupIndex)) {
                                    options.detailColumnIndex = index;
                                    return false
                                }
                            })
                        }
                        if (options.detailColumnIndex >= 0) {
                            dataItem.values[options.detailColumnIndex] = dataItem.isExpanded
                        }
                        return dataItem
                    },
                    _processItems: function(items, changeType) {
                        var expandIndex, that = this,
                            result = [];
                        items = that.callBase.apply(that, arguments);
                        if ("loadingAll" === changeType) {
                            return items
                        }
                        if ("refresh" === changeType) {
                            that._expandedItems = (0, _common.grep)(that._expandedItems, function(item) {
                                return item.visible
                            })
                        }(0, _iterator.each)(items, function(index, item) {
                            result.push(item);
                            expandIndex = _uiGrid_core2.default.getIndexByKey(item.key, that._expandedItems);
                            if ("data" === item.rowType && (item.isExpanded || expandIndex >= 0) && !item.inserted) {
                                result.push({
                                    visible: item.isExpanded,
                                    rowType: "detail",
                                    key: item.key,
                                    data: item.data,
                                    values: []
                                })
                            }
                        });
                        return result
                    },
                    optionChanged: function(args) {
                        var value, previousValue, isEnabledChanged, isAutoExpandAllChanged, that = this;
                        if ("masterDetail" === args.name) {
                            args.name = "dataSource";
                            switch (args.fullName) {
                                case "masterDetail":
                                    value = args.value || {};
                                    previousValue = args.previousValue || {};
                                    isEnabledChanged = value.enabled !== previousValue.enabled;
                                    isAutoExpandAllChanged = value.autoExpandAll !== previousValue.autoExpandAll;
                                    break;
                                case "masterDetail.enabled":
                                    isEnabledChanged = true;
                                    break;
                                case "masterDetail.autoExpandAll":
                                    isAutoExpandAllChanged = true
                            }
                            if (isEnabledChanged || isAutoExpandAllChanged) {
                                initMasterDetail(that)
                            }
                        }
                        that.callBase(args)
                    }
                }
            }()
        },
        views: {
            rowsView: function() {
                return {
                    _getCellTemplate: function(options) {
                        var template, that = this,
                            column = options.column,
                            editingController = that.getController("editing"),
                            isEditRow = editingController && editingController.isEditRow(options.rowIndex);
                        if ("detail" === column.command && !isEditRow) {
                            template = that.option("masterDetail.template") || {
                                allowRenderToDetachedContainer: false,
                                render: that._getDefaultTemplate(column)
                            }
                        } else {
                            template = that.callBase.apply(that, arguments)
                        }
                        return template
                    },
                    _cellPrepared: function($cell, options) {
                        var that = this,
                            component = that.component;
                        that.callBase.apply(that, arguments);
                        if ("detail" === options.rowType && "detail" === options.column.command) {
                            $cell.find("." + that.getWidgetContainerClass()).each(function() {
                                var dataGrid = (0, _renderer2.default)(this).parent().data("dxDataGrid");
                                if (dataGrid) {
                                    dataGrid.on("contentReady", function() {
                                        if (that._isFixedColumns) {
                                            var $rows = (0, _renderer2.default)(component.getRowElement(options.rowIndex));
                                            if ($rows && 2 === $rows.length && $rows.eq(0).height() !== $rows.eq(1).height()) {
                                                component.updateDimensions()
                                            }
                                        } else {
                                            var scrollable = component.getScrollable();
                                            scrollable && scrollable.update()
                                        }
                                    })
                                }
                            })
                        }
                    },
                    _isDetailRow: function(row) {
                        return row && row.rowType && 0 === row.rowType.indexOf("detail")
                    },
                    _createRow: function(row) {
                        var $row = this.callBase(row);
                        if (row && this._isDetailRow(row)) {
                            this.option("showRowLines") && $row.addClass(ROW_LINES_CLASS);
                            $row.addClass(MASTER_DETAIL_ROW_CLASS);
                            if ((0, _type.isDefined)(row.visible)) {
                                $row.toggle(row.visible)
                            }
                        }
                        return $row
                    },
                    _renderCells: function($row, options) {
                        var $detailCell, row = options.row,
                            visibleColumns = this._columnsController.getVisibleColumns();
                        if (row.rowType && this._isDetailRow(row)) {
                            $detailCell = this._renderCell($row, {
                                value: null,
                                row: row,
                                rowIndex: row.rowIndex,
                                column: {
                                    command: "detail"
                                },
                                columnIndex: 0
                            });
                            $detailCell.addClass(CELL_FOCUS_DISABLED_CLASS).addClass(MASTER_DETAIL_CELL_CLASS).attr("colSpan", visibleColumns.length)
                        } else {
                            this.callBase.apply(this, arguments)
                        }
                    }
                }
            }()
        }
    }
};
