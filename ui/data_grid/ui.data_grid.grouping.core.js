/**
 * DevExtreme (ui/data_grid/ui.data_grid.grouping.core.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _class = require("../../core/class");
var _class2 = _interopRequireDefault(_class);
var _uiData_grid = require("./ui.data_grid.core");
var _uiData_grid2 = _interopRequireDefault(_uiData_grid);
var _utils = require("../../data/utils");
var _deferred = require("../../core/utils/deferred");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
exports.createOffsetFilter = function(path, storeLoadOptions) {
    var i, j, filterElement, selector, currentFilter, groups = (0, _utils.normalizeSortingInfo)(storeLoadOptions.group),
        filter = [];
    for (i = 0; i < path.length; i++) {
        filterElement = [];
        for (j = 0; j <= i; j++) {
            selector = groups[j].selector;
            if (i === j && (null === path[j] || false === path[j] || true === path[j])) {
                if (false === path[j]) {
                    filterElement.push([selector, "=", groups[j].desc ? true : null])
                } else {
                    if (path[j] ? !groups[j].desc : groups[j].desc) {
                        filterElement.push([selector, "<>", path[j]])
                    } else {
                        filterElement.push([selector, "<>", null]);
                        filterElement.push([selector, "=", null])
                    }
                }
            } else {
                currentFilter = [selector, i === j ? groups[j].desc ? ">" : "<" : "=", path[j]];
                if ("<" === currentFilter[1]) {
                    filterElement.push([currentFilter, "or", [selector, "=", null]])
                } else {
                    filterElement.push(currentFilter)
                }
            }
        }
        filter.push(_uiData_grid2.default.combineFilters(filterElement))
    }
    filter = _uiData_grid2.default.combineFilters(filter, "or");
    return _uiData_grid2.default.combineFilters([filter, storeLoadOptions.filter])
};
exports.GroupingHelper = _class2.default.inherit(function() {
    var findGroupInfoByKey = function(groupsInfo, key) {
        var hash = groupsInfo.hash;
        return hash && hash[JSON.stringify(key)]
    };
    var getGroupInfoIndexByOffset = function(groupsInfo, offset) {
        var index, leftIndex = 0,
            rightIndex = groupsInfo.length - 1;
        if (!groupsInfo.length) {
            return 0
        }
        do {
            var middleIndex = rightIndex + leftIndex >> 1;
            if (groupsInfo[middleIndex].offset > offset) {
                rightIndex = middleIndex
            } else {
                leftIndex = middleIndex
            }
        } while (rightIndex - leftIndex > 1);
        for (index = leftIndex; index <= rightIndex; index++) {
            if (groupsInfo[index].offset > offset) {
                break
            }
        }
        return index
    };
    var updateGroupInfoOffsets = function(groupsInfo, parents) {
        var groupInfo, index;
        parents = parents || [];
        for (index = 0; index < groupsInfo.length; index++) {
            groupInfo = groupsInfo[index];
            if (groupInfo.data && groupInfo.data.offset !== groupInfo.offset) {
                groupInfo.offset = groupInfo.data.offset;
                for (var parentIndex = 0; parentIndex < parents.length; parentIndex++) {
                    parents[parentIndex].offset = groupInfo.offset
                }
            }
        }
        groupsInfo.sort(function(a, b) {
            return a.offset - b.offset
        })
    };
    var cleanGroupsInfo = function cleanGroupsInfo(groupsInfo, groupIndex, groupsCount) {
        var i;
        for (i = 0; i < groupsInfo.length; i++) {
            if (groupIndex + 1 >= groupsCount) {
                groupsInfo[i].children = []
            } else {
                cleanGroupsInfo(groupsInfo[i].children, groupIndex + 1, groupsCount)
            }
        }
    };
    var calculateItemsCount = function calculateItemsCount(that, items, groupsCount) {
        var i, result = 0;
        if (items) {
            if (!groupsCount) {
                result = items.length
            } else {
                for (i = 0; i < items.length; i++) {
                    if (that.isGroupItemCountable(items[i])) {
                        result++
                    }
                    result += calculateItemsCount(that, items[i].items, groupsCount - 1)
                }
            }
        }
        return result
    };
    return {
        ctor: function(dataSourceAdapter) {
            this._dataSource = dataSourceAdapter;
            this.reset()
        },
        reset: function() {
            this._groupsInfo = [];
            this._totalCountCorrection = 0
        },
        totalCountCorrection: function() {
            return this._totalCountCorrection
        },
        updateTotalItemsCount: function(totalCountCorrection) {
            this._totalCountCorrection = totalCountCorrection || 0
        },
        isGroupItemCountable: function(item) {
            return !this._isVirtualPaging() || !item.isContinuation
        },
        _isVirtualPaging: function() {
            var scrollingMode = this._dataSource.option("scrolling.mode");
            return "virtual" === scrollingMode || "infinite" === scrollingMode
        },
        itemsCount: function itemsCount() {
            var dataSourceAdapter = this._dataSource,
                dataSource = dataSourceAdapter._dataSource,
                groupCount = _uiData_grid2.default.normalizeSortingInfo(dataSource.group() || []).length,
                itemsCount = calculateItemsCount(this, dataSource.items(), groupCount);
            return itemsCount
        },
        foreachGroups: function(callback, childrenAtFirst, foreachCollapsedGroups, updateOffsets, updateParentOffsets) {
            var that = this;

            function foreachGroupsCore(groupsInfo, callback, childrenAtFirst, parents) {
                var i, callbackResult, callbackResults = [];

                function executeCallback(callback, data, parents, callbackResults) {
                    var callbackResult = data && callback(data, parents);
                    callbackResult && callbackResults.push(callbackResult);
                    return callbackResult
                }
                for (i = 0; i < groupsInfo.length; i++) {
                    parents.push(groupsInfo[i].data);
                    if (!childrenAtFirst && false === executeCallback(callback, groupsInfo[i].data, parents, callbackResults)) {
                        return false
                    }
                    if (!groupsInfo[i].data || groupsInfo[i].data.isExpanded || foreachCollapsedGroups) {
                        callbackResult = foreachGroupsCore(groupsInfo[i].children, callback, childrenAtFirst, parents);
                        callbackResult && callbackResults.push(callbackResult);
                        if (false === callbackResult) {
                            return false
                        }
                    }
                    if (childrenAtFirst && false === executeCallback(callback, groupsInfo[i].data, parents, callbackResults)) {
                        return false
                    }
                    if (!groupsInfo[i].data || groupsInfo[i].data.offset !== groupsInfo[i].offset) {
                        updateOffsets = true
                    }
                    parents.pop()
                }
                var currentParents = updateParentOffsets && parents.slice(0);
                return updateOffsets && _deferred.when.apply(_renderer2.default, callbackResults).always(function() {
                    updateGroupInfoOffsets(groupsInfo, currentParents)
                })
            }
            return foreachGroupsCore(that._groupsInfo, callback, childrenAtFirst, [])
        },
        findGroupInfo: function(path) {
            var pathIndex, groupInfo, that = this,
                groupsInfo = that._groupsInfo;
            for (pathIndex = 0; groupsInfo && pathIndex < path.length; pathIndex++) {
                groupInfo = findGroupInfoByKey(groupsInfo, path[pathIndex]);
                groupsInfo = groupInfo && groupInfo.children
            }
            return groupInfo && groupInfo.data
        },
        addGroupInfo: function(groupInfoData) {
            var index, groupInfo, pathIndex, that = this,
                path = groupInfoData.path,
                groupsInfo = that._groupsInfo;
            for (pathIndex = 0; pathIndex < path.length; pathIndex++) {
                groupInfo = findGroupInfoByKey(groupsInfo, path[pathIndex]);
                if (!groupInfo) {
                    groupInfo = {
                        key: path[pathIndex],
                        offset: groupInfoData.offset,
                        data: {
                            offset: groupInfoData.offset,
                            isExpanded: true,
                            path: path.slice(0, pathIndex + 1)
                        },
                        children: []
                    };
                    index = getGroupInfoIndexByOffset(groupsInfo, groupInfoData.offset);
                    groupsInfo.splice(index, 0, groupInfo);
                    groupsInfo.hash = groupsInfo.hash || {};
                    groupsInfo.hash[JSON.stringify(groupInfo.key)] = groupInfo
                }
                if (pathIndex === path.length - 1) {
                    groupInfo.data = groupInfoData;
                    if (groupInfo.offset !== groupInfoData.offset) {
                        updateGroupInfoOffsets(groupsInfo)
                    }
                }
                groupsInfo = groupInfo.children
            }
        },
        allowCollapseAll: function() {
            return true
        },
        refresh: function(options) {
            var groupIndex, that = this,
                storeLoadOptions = options.storeLoadOptions,
                groups = (0, _utils.normalizeSortingInfo)(storeLoadOptions.group || []),
                oldGroups = "_group" in that ? (0, _utils.normalizeSortingInfo)(that._group || []) : groups,
                groupsCount = Math.min(oldGroups.length, groups.length);
            that._group = storeLoadOptions.group;
            for (groupIndex = 0; groupIndex < groupsCount; groupIndex++) {
                if (oldGroups[groupIndex].selector !== groups[groupIndex].selector) {
                    groupsCount = groupIndex;
                    break
                }
            }
            if (!groupsCount) {
                that.reset()
            } else {
                cleanGroupsInfo(that._groupsInfo, 0, groupsCount)
            }
        },
        handleDataLoading: function() {},
        handleDataLoaded: function(options, callBase) {
            callBase(options)
        },
        handleDataLoadedCore: function(options, callBase) {
            callBase(options)
        }
    }
}());
