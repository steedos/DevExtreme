/**
 * DevExtreme (ui/grid_core/ui.grid_core.sorting.js)
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
var _click = require("../../events/click");
var _click2 = _interopRequireDefault(_click);
var _type = require("../../core/utils/type");
var _extend = require("../../core/utils/extend");
var _uiGrid_core = require("../grid_core/ui.grid_core.sorting_mixin");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _utils = require("../../events/utils");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var COLUMN_HEADERS_VIEW_NAMESPACE = "dxDataGridColumnHeadersView";
var ColumnHeadersViewSortingExtender = (0, _extend.extend)({}, _uiGrid_core2.default, {
    _createRow: function(row) {
        var that = this;
        var $row = that.callBase(row);
        if ("header" === row.rowType) {
            _events_engine2.default.on($row, (0, _utils.addNamespace)(_click2.default.name, COLUMN_HEADERS_VIEW_NAMESPACE), "td", that.createAction(function(e) {
                if ((0, _renderer2.default)(e.event.currentTarget).parent().get(0) !== $row.get(0)) {
                    return
                }
                var keyName = null;
                var event = e.event;
                var $cellElementFromEvent = (0, _renderer2.default)(event.currentTarget);
                var rowIndex = $cellElementFromEvent.parent().index();
                var columnIndex = -1;
                [].slice.call(that.getCellElements(rowIndex)).some(function($cellElement, index) {
                    if ($cellElement === $cellElementFromEvent.get(0)) {
                        columnIndex = index;
                        return true
                    }
                });
                var visibleColumns = that._columnsController.getVisibleColumns(rowIndex);
                var column = visibleColumns[columnIndex];
                var editingController = that.getController("editing");
                var editingMode = that.option("editing.mode");
                var isCellEditing = editingController && editingController.isEditing() && ("batch" === editingMode || "cell" === editingMode);
                if (isCellEditing || !that._isSortableElement((0, _renderer2.default)(event.target))) {
                    return
                }
                if (column && !(0, _type.isDefined)(column.groupIndex) && !column.command) {
                    if (event.shiftKey) {
                        keyName = "shift"
                    } else {
                        if (event.ctrlKey) {
                            keyName = "ctrl"
                        }
                    }
                    setTimeout(function() {
                        that._columnsController.changeSortOrder(column.index, keyName)
                    })
                }
            }))
        }
        return $row
    },
    _renderCellContent: function($cell, options) {
        var that = this;
        var column = options.column;
        if (!column.command && "header" === options.rowType) {
            that._applyColumnState({
                name: "sort",
                rootElement: $cell,
                column: column,
                showColumnLines: that.option("showColumnLines")
            })
        }
        that.callBase($cell, options)
    },
    _columnOptionChanged: function(e) {
        var changeTypes = e.changeTypes;
        if (1 === changeTypes.length && changeTypes.sorting) {
            this._updateIndicators("sort");
            return
        }
        this.callBase(e)
    },
    optionChanged: function(args) {
        var that = this;
        switch (args.name) {
            case "sorting":
                that._invalidate();
                args.handled = true;
                break;
            default:
                that.callBase(args)
        }
    }
});
var HeaderPanelSortingExtender = (0, _extend.extend)({}, _uiGrid_core2.default, {
    _createGroupPanelItem: function($rootElement, groupColumn) {
        var that = this;
        var $item = that.callBase.apply(that, arguments);
        _events_engine2.default.on($item, (0, _utils.addNamespace)(_click2.default.name, "dxDataGridHeaderPanel"), that.createAction(function() {
            setTimeout(function() {
                that.getController("columns").changeSortOrder(groupColumn.index)
            })
        }));
        that._applyColumnState({
            name: "sort",
            rootElement: $item,
            column: {
                alignment: that.option("rtlEnabled") ? "right" : "left",
                allowSorting: groupColumn.allowSorting,
                sortOrder: "desc" === groupColumn.sortOrder ? "desc" : "asc"
            },
            showColumnLines: true
        });
        return $item
    },
    optionChanged: function(args) {
        var that = this;
        switch (args.name) {
            case "sorting":
                that._invalidate();
                args.handled = true;
                break;
            default:
                that.callBase(args)
        }
    }
});
module.exports = {
    defaultOptions: function() {
        return {
            sorting: {
                mode: "single",
                ascendingText: _message2.default.format("dxDataGrid-sortingAscendingText"),
                descendingText: _message2.default.format("dxDataGrid-sortingDescendingText"),
                clearText: _message2.default.format("dxDataGrid-sortingClearText")
            }
        }
    },
    extenders: {
        views: {
            columnHeadersView: ColumnHeadersViewSortingExtender,
            headerPanel: HeaderPanelSortingExtender
        }
    }
};
