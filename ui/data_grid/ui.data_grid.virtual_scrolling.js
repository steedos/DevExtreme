/**
 * DevExtreme (ui/data_grid/ui.data_grid.virtual_scrolling.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiData_grid = require("./ui.data_grid.core");
var _uiData_grid2 = _interopRequireDefault(_uiData_grid);
var _uiData_grid3 = require("./ui.data_grid.data_source_adapter");
var _uiData_grid4 = _interopRequireDefault(_uiData_grid3);
var _uiGrid_core = require("../grid_core/ui.grid_core.virtual_scrolling");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
_uiData_grid2.default.registerModule("virtualScrolling", _uiGrid_core2.default);
_uiData_grid4.default.extend(_uiGrid_core2.default.extenders.dataSourceAdapter);
