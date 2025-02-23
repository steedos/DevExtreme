/**
 * DevExtreme (ui/tree_list/ui.tree_list.grid_view.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiTree_list = require("./ui.tree_list.core");
var _uiTree_list2 = _interopRequireDefault(_uiTree_list);
var _uiGrid_core = require("../grid_core/ui.grid_core.grid_view");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var GridView = _uiGrid_core2.default.views.gridView.inherit(function() {
    return {
        _getWidgetAriaLabel: function() {
            return "dxTreeList-ariaTreeList"
        },
        _getTableRoleName: function() {
            return "treegrid"
        }
    }
}());
_uiTree_list2.default.registerModule("gridView", {
    defaultOptions: _uiGrid_core2.default.defaultOptions,
    controllers: _uiGrid_core2.default.controllers,
    views: {
        gridView: GridView
    },
    extenders: {
        controllers: {
            resizing: {
                _toggleBestFitMode: function(isBestFit) {
                    this.callBase(isBestFit);
                    if (!this.option("legacyRendering")) {
                        var $rowsTable = this._rowsView._getTableElement();
                        $rowsTable.find(".dx-treelist-cell-expandable").toggleClass(this.addWidgetPrefix("best-fit"), isBestFit)
                    }
                }
            }
        }
    }
});
