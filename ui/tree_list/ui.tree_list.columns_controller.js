/**
 * DevExtreme (ui/tree_list/ui.tree_list.columns_controller.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _type = require("../../core/utils/type");
var _uiTree_list = require("./ui.tree_list.core");
var _uiTree_list2 = _interopRequireDefault(_uiTree_list);
var _uiGrid_core = require("../grid_core/ui.grid_core.columns_controller");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
exports.ColumnsController = _uiGrid_core2.default.controllers.columns.inherit(function() {
    return {
        _getFirstItems: function(dataSourceAdapter) {
            return this.callBase(dataSourceAdapter).map(function(node) {
                return node.data
            })
        },
        getFirstDataColumnIndex: function() {
            var visibleColumns = this.getVisibleColumns(),
                visibleColumnsLength = visibleColumns.length,
                firstDataColumnIndex = 0;
            for (var i = 0; i <= visibleColumnsLength - 1; i++) {
                if (!(0, _type.isDefined)(visibleColumns[i].command)) {
                    firstDataColumnIndex = visibleColumns[i].index;
                    break
                }
            }
            return firstDataColumnIndex
        }
    }
}());
_uiTree_list2.default.registerModule("columns", {
    defaultOptions: _uiGrid_core2.default.defaultOptions,
    controllers: {
        columns: exports.ColumnsController
    }
});
