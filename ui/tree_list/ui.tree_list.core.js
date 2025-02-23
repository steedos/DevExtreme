/**
 * DevExtreme (ui/tree_list/ui.tree_list.core.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _extend = require("../../core/utils/extend");
var _uiGrid_core = require("../grid_core/ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}(0, _extend.extend)(exports, _uiGrid_core2.default, {
    modules: [],
    foreachNodes: function(nodes, callBack) {
        for (var i = 0; i < nodes.length; i++) {
            if (false !== callBack(nodes[i]) && nodes[i].hasChildren && nodes[i].children.length) {
                this.foreachNodes(nodes[i].children, callBack)
            }
        }
    }
});
