/**
 * DevExtreme (ui/scheduler/workspaces/ui.scheduler.timeline_week.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var registerComponent = require("../../../core/component_registrator"),
    SchedulerTimeline = require("./ui.scheduler.timeline");
var TIMELINE_CLASS = "dx-scheduler-timeline-week",
    HEADER_ROW_CLASS = "dx-scheduler-header-row";
var SchedulerTimelineWeek = SchedulerTimeline.inherit({
    _getElementClass: function() {
        return TIMELINE_CLASS
    },
    _getCellCount: function() {
        return this.callBase() * this._getWeekDuration()
    },
    _setTableSizes: function() {
        this.callBase();
        var cellWidth = this.getCellWidth(),
            minWidth = this.getWorkSpaceMinWidth(),
            $headerCells = this.$element().find("." + HEADER_ROW_CLASS).last().find("th");
        var width = cellWidth * $headerCells.length;
        if (width < minWidth) {
            width = minWidth
        }
        this._$headerPanel.width(width)
    },
    _getHeaderPanelCellWidth: function($headerRow) {
        return $headerRow.children().first().get(0).getBoundingClientRect().width
    },
    _getWeekDuration: function() {
        return 7
    },
    _needRenderWeekHeader: function() {
        return true
    },
    _incrementDate: function(date) {
        date.setDate(date.getDate() + 1)
    }
});
registerComponent("dxSchedulerTimelineWeek", SchedulerTimelineWeek);
module.exports = SchedulerTimelineWeek;
