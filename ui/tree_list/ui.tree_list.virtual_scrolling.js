/**
 * DevExtreme (ui/tree_list/ui.tree_list.virtual_scrolling.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiTree_list = require("./ui.tree_list.core");
var _uiTree_list2 = _interopRequireDefault(_uiTree_list);
var _uiTree_list3 = require("./ui.tree_list.data_source_adapter");
var _uiTree_list4 = _interopRequireDefault(_uiTree_list3);
var _uiGrid_core = require("../grid_core/ui.grid_core.virtual_scrolling");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _extend = require("../../core/utils/extend");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var oldDefaultOptions = _uiGrid_core2.default.defaultOptions,
    originalDataControllerExtender = _uiGrid_core2.default.extenders.controllers.data,
    originalDataSourceAdapterExtender = _uiGrid_core2.default.extenders.dataSourceAdapter;
_uiGrid_core2.default.extenders.controllers.data = (0, _extend.extend)({}, originalDataControllerExtender, {
    _loadOnOptionChange: function() {
        var virtualScrollController = this._dataSource && this._dataSource._virtualScrollController;
        virtualScrollController && virtualScrollController.reset();
        this.callBase()
    }
});
_uiGrid_core2.default.extenders.dataSourceAdapter = (0, _extend.extend)({}, originalDataSourceAdapterExtender, {
    changeRowExpand: function() {
        var _this = this;
        return this.callBase.apply(this, arguments).done(function() {
            var viewportItemIndex = _this.getViewportItemIndex();
            viewportItemIndex >= 0 && _this.setViewportItemIndex(viewportItemIndex)
        })
    }
});
_uiTree_list2.default.registerModule("virtualScrolling", (0, _extend.extend)({}, _uiGrid_core2.default, {
    defaultOptions: function() {
        return (0, _extend.extend)(true, oldDefaultOptions(), {
            scrolling: {
                mode: "virtual"
            }
        })
    }
}));
_uiTree_list4.default.extend(_uiGrid_core2.default.extenders.dataSourceAdapter);
