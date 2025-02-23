/**
 * DevExtreme (ui/grid_core/ui.grid_core.state_storing.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _common = require("../../core/utils/common");
var _type = require("../../core/utils/type");
var _extend = require("../../core/utils/extend");
var _uiGrid_core = require("./ui.grid_core.state_storing_core");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var processLoadState = function(that) {
    var columnsController = that.getController("columns"),
        selectionController = that.getController("selection"),
        exportController = that.getController("export"),
        dataController = that.getController("data"),
        pagerView = that.getView("pagerView");
    if (columnsController) {
        columnsController.columnsChanged.add(function() {
            var columnsState = columnsController.getUserState(),
                columnsStateHash = (0, _common.getKeyHash)(columnsState),
                currentColumnsStateHash = (0, _common.getKeyHash)(that._state.columns);
            if (!(0, _common.equalByValue)(currentColumnsStateHash, columnsStateHash)) {
                (0, _extend.extend)(that._state, {
                    columns: columnsState
                });
                that.isEnabled() && that.save()
            }
        })
    }
    if (selectionController) {
        selectionController.selectionChanged.add(function(e) {
            (0, _extend.extend)(that._state, {
                selectedRowKeys: e.selectedRowKeys,
                selectionFilter: e.selectionFilter
            });
            that.isEnabled() && that.save()
        })
    }
    if (dataController) {
        that._initialPageSize = that.option("paging.pageSize");
        dataController.changed.add(function() {
            var userState = dataController.getUserState(),
                focusedRowEnabled = that.option("focusedRowEnabled");
            (0, _extend.extend)(that._state, userState, {
                allowedPageSizes: pagerView ? pagerView.getPageSizes() : void 0,
                filterPanel: {
                    filterEnabled: that.option("filterPanel.filterEnabled")
                },
                filterValue: that.option("filterValue"),
                focusedRowKey: focusedRowEnabled ? that.option("focusedRowKey") : void 0
            });
            that.isEnabled() && that.save()
        })
    }
    if (exportController) {
        exportController.selectionOnlyChanged.add(function() {
            (0, _extend.extend)(that._state, {
                exportSelectionOnly: exportController.selectionOnly()
            });
            that.isEnabled() && that.save()
        })
    }
};
module.exports = {
    defaultOptions: function() {
        return {
            stateStoring: {
                enabled: false,
                storageKey: null,
                type: "localStorage",
                customLoad: null,
                customSave: null,
                savingTimeout: 2e3
            }
        }
    },
    controllers: {
        stateStoring: _uiGrid_core2.default.StateStoringController
    },
    extenders: {
        views: {
            rowsView: {
                init: function() {
                    var that = this;
                    var dataController = that.getController("data");
                    that.callBase();
                    dataController.stateLoaded.add(function() {
                        if (dataController.isLoaded() && !dataController.getDataSource()) {
                            that.setLoading(false);
                            that.renderNoDataText();
                            var columnHeadersView = that.component.getView("columnHeadersView");
                            columnHeadersView && columnHeadersView.render();
                            that.component._fireContentReadyAction()
                        }
                    })
                }
            }
        },
        controllers: {
            stateStoring: {
                init: function() {
                    this.callBase.apply(this, arguments);
                    processLoadState(this)
                },
                isLoading: function() {
                    return this.callBase() || this.getController("data").isStateLoading()
                },
                state: function(_state) {
                    var result = this.callBase.apply(this, arguments);
                    if (void 0 !== _state) {
                        this.applyState((0, _extend.extend)({}, _state))
                    }
                    return result
                },
                applyState: function(state) {
                    var that = this,
                        allowedPageSizes = state.allowedPageSizes,
                        searchText = state.searchText,
                        selectedRowKeys = state.selectedRowKeys,
                        selectionFilter = state.selectionFilter,
                        exportController = that.getController("export"),
                        columnsController = that.getController("columns"),
                        dataController = that.getController("data"),
                        filterSyncController = that.getController("filterSync"),
                        scrollingMode = that.option("scrolling.mode"),
                        isVirtualScrollingMode = "virtual" === scrollingMode || "infinite" === scrollingMode,
                        showPageSizeSelector = true === that.option("pager.visible") && that.option("pager.showPageSizeSelector");
                    that.component.beginUpdate();
                    if (columnsController) {
                        columnsController.setUserState(state.columns)
                    }
                    if (exportController) {
                        exportController.selectionOnly(state.exportSelectionOnly)
                    }
                    that.option("selectedRowKeys", selectedRowKeys || []);
                    that.option("selectionFilter", selectionFilter);
                    if (allowedPageSizes && "auto" === that.option("pager.allowedPageSizes")) {
                        that.option("pager").allowedPageSizes = allowedPageSizes
                    }
                    if (that.option("focusedRowEnabled")) {
                        that.option("focusedRowKey", state.focusedRowKey)
                    }
                    that.component.endUpdate();
                    that.option("searchPanel.text", searchText || "");
                    that.option("filterValue", state.filterValue || (filterSyncController ? filterSyncController.getFilterValueFromColumns(state.columns) : null));
                    that.option("filterPanel.filterEnabled", state.filterPanel ? state.filterPanel.filterEnabled : true);
                    that.option("paging.pageSize", (!isVirtualScrollingMode || showPageSizeSelector) && (0, _type.isDefined)(state.pageSize) ? state.pageSize : that._initialPageSize);
                    that.option("paging.pageIndex", state.pageIndex || 0);
                    dataController && dataController.reset()
                }
            },
            columns: {
                getVisibleColumns: function() {
                    var visibleColumns = this.callBase.apply(this, arguments),
                        stateStoringController = this.getController("stateStoring");
                    return stateStoringController.isEnabled() && !stateStoringController.isLoaded() ? [] : visibleColumns
                }
            },
            data: {
                callbackNames: function() {
                    return this.callBase().concat(["stateLoaded"])
                },
                _refreshDataSource: function() {
                    var that = this,
                        callBase = that.callBase,
                        stateStoringController = that.getController("stateStoring");
                    if (stateStoringController.isEnabled() && !stateStoringController.isLoaded()) {
                        clearTimeout(that._restoreStateTimeoutID);
                        var deferred = new _deferred.Deferred;
                        that._restoreStateTimeoutID = setTimeout(function() {
                            stateStoringController.load().always(function() {
                                that._restoreStateTimeoutID = null;
                                callBase.call(that);
                                that.stateLoaded.fire();
                                deferred.resolve()
                            })
                        });
                        return deferred.promise()
                    } else {
                        if (!that.isStateLoading()) {
                            callBase.call(that)
                        }
                    }
                },
                isLoading: function() {
                    var that = this,
                        stateStoringController = that.getController("stateStoring");
                    return this.callBase() || stateStoringController.isLoading()
                },
                isStateLoading: function() {
                    return (0, _type.isDefined)(this._restoreStateTimeoutID)
                },
                isLoaded: function() {
                    return this.callBase() && !this.isStateLoading()
                },
                dispose: function() {
                    clearTimeout(this._restoreStateTimeoutID);
                    this.callBase()
                }
            }
        }
    }
};
