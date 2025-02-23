/**
 * DevExtreme (ui/tree_list/ui.tree_list.validating.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _extend = require("../../core/utils/extend");
var _uiTree_list = require("./ui.tree_list.core");
var _uiTree_list2 = _interopRequireDefault(_uiTree_list);
var _uiGrid_core = require("../grid_core/ui.grid_core.validating");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var EditingControllerExtender = (0, _extend.extend)({}, _uiGrid_core2.default.extenders.controllers.editing);
delete EditingControllerExtender.processItems;
delete EditingControllerExtender.processDataItem;
_uiTree_list2.default.registerModule("validating", {
    defaultOptions: _uiGrid_core2.default.defaultOptions,
    controllers: _uiGrid_core2.default.controllers,
    extenders: {
        controllers: {
            editing: EditingControllerExtender,
            editorFactory: _uiGrid_core2.default.extenders.controllers.editorFactory
        },
        views: _uiGrid_core2.default.extenders.views
    }
});
