/**
 * DevExtreme (ui/tree_list/ui.tree_list.state_storing.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiTree_list = require("./ui.tree_list.core");
var _uiTree_list2 = _interopRequireDefault(_uiTree_list);
var _extend = require("../../core/utils/extend");
var _uiGrid_core = require("../grid_core/ui.grid_core.state_storing");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var origApplyState = _uiGrid_core2.default.extenders.controllers.stateStoring.applyState;
_uiTree_list2.default.registerModule("stateStoring", (0, _extend.extend)(true, {}, _uiGrid_core2.default, {
    extenders: {
        controllers: {
            stateStoring: {
                applyState: function(state) {
                    origApplyState.apply(this, arguments);
                    if (state.hasOwnProperty("expandedRowKeys")) {
                        this.option("expandedRowKeys", state.expandedRowKeys)
                    }
                }
            },
            data: {
                getUserState: function() {
                    var state = this.callBase.apply(this, arguments);
                    if (!this.option("autoExpandAll")) {
                        state.expandedRowKeys = this.option("expandedRowKeys")
                    }
                    return state
                }
            }
        }
    }
}));
