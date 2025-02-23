/**
 * DevExtreme (ui/tree_list/ui.tree_list.focus.js)
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
var _deferred = require("../../core/utils/deferred");
var _uiGrid_core = require("../grid_core/ui.grid_core.focus");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}

function findIndex(items, callback) {
    var result = -1;
    items.forEach(function(node, index) {
        if (callback(node)) {
            result = index
        }
    });
    return result
}
_uiTree_list2.default.registerModule("focus", (0, _extend.extend)(true, {}, _uiGrid_core2.default, {
    extenders: {
        controllers: {
            data: {
                changeRowExpand: function(key) {
                    if (this.option("focusedRowEnabled") && this.isRowExpanded(key)) {
                        if (this._isFocusedRowInside(key)) {
                            this.option("focusedRowKey", key)
                        }
                    }
                    return this.callBase.apply(this, arguments)
                },
                _isFocusedRowInside: function(parentKey) {
                    var focusedRowKey = this.option("focusedRowKey"),
                        rowIndex = this.getRowIndexByKey(focusedRowKey),
                        focusedRow = rowIndex >= 0 && this.getVisibleRows()[rowIndex],
                        parent = focusedRow && focusedRow.node.parent;
                    while (parent) {
                        if (parent.key === parentKey) {
                            return true
                        }
                        parent = parent.parent
                    }
                    return false
                },
                getParentKey: function(key) {
                    var that = this,
                        dataSource = that._dataSource,
                        node = that.getNodeByKey(key),
                        d = new _deferred.Deferred;
                    if (node) {
                        d.resolve(node.parent ? node.parent.key : void 0)
                    } else {
                        dataSource.load({
                            filter: [dataSource.getKeyExpr(), "=", key]
                        }).done(function(items) {
                            var parentData = items[0];
                            if (parentData) {
                                d.resolve(dataSource.parentKeyOf(parentData))
                            } else {
                                d.reject()
                            }
                        }).fail(d.reject)
                    }
                    return d.promise()
                },
                expandAscendants: function(key) {
                    var that = this,
                        dataSource = that._dataSource,
                        d = new _deferred.Deferred;
                    that.getParentKey(key).done(function(parentKey) {
                        if (dataSource && void 0 !== parentKey && parentKey !== that.option("rootValue")) {
                            dataSource._isNodesInitializing = true;
                            that.expandRow(parentKey);
                            dataSource._isNodesInitializing = false;
                            that.expandAscendants(parentKey).done(d.resolve).fail(d.reject)
                        } else {
                            d.resolve()
                        }
                    }).fail(d.reject);
                    return d.promise()
                },
                getPageIndexByKey: function(key) {
                    var that = this,
                        dataSource = that._dataSource,
                        d = new _deferred.Deferred;
                    that.expandAscendants(key).done(function() {
                        dataSource.load({
                            filter: that.getCombinedFilter(),
                            sort: that.getController("columns").getSortDataSourceParameters(!dataSource.remoteOperations().sorting),
                            parentIds: []
                        }).done(function(nodes) {
                            var offset = findIndex(nodes, function(node) {
                                return that.keyOf(node.data) === key
                            });
                            var pageIndex = that.pageIndex();
                            if (offset >= 0) {
                                pageIndex = Math.floor(offset / that.pageSize())
                            }
                            d.resolve(pageIndex)
                        }).fail(d.reject)
                    }).fail(d.reject);
                    return d.promise()
                }
            }
        }
    }
}));
