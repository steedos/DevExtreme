/**
 * DevExtreme (ui/scheduler/workspaces/ui.scheduler.work_space.grouped.strategy.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var Class = require("../../../core/class"),
    abstract = Class.abstract;
var LAST_GROUP_CELL_CLASS = "dx-scheduler-last-group-cell",
    FIRST_GROUP_CELL_CLASS = "dx-scheduler-first-group-cell";
var GroupedStrategy = Class.inherit({
    ctor: function(workSpace) {
        this._workSpace = workSpace
    },
    getLastGroupCellClass: function() {
        return LAST_GROUP_CELL_CLASS
    },
    getFirstGroupCellClass: function() {
        return FIRST_GROUP_CELL_CLASS
    },
    _getOffsetByAllDayPanel: function() {
        return 0
    },
    _getGroupTop: function() {
        return 0
    },
    prepareCellIndexes: abstract,
    calculateCellIndex: abstract,
    getGroupIndex: abstract,
    insertAllDayRowsIntoDateTable: abstract,
    getTotalCellCount: abstract,
    addAdditionalGroupCellClasses: abstract,
    getHorizontalMax: abstract,
    getVerticalMax: abstract,
    calculateTimeCellRepeatCount: abstract,
    getWorkSpaceMinWidth: abstract,
    getAllDayHeight: abstract,
    getGroupCountAttr: abstract,
    getLeftOffset: abstract,
    shiftIndicator: abstract,
    getShaderOffset: abstract,
    getShaderTopOffset: abstract,
    getShaderMaxHeight: abstract,
    getShaderWidth: abstract,
    getScrollableScrollTop: abstract
});
module.exports = GroupedStrategy;
