/**
 * DevExtreme (ui/scheduler/workspaces/ui.scheduler.timeline_work_week.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var registerComponent = require("../../../core/component_registrator"),
    SchedulerTimelineWeek = require("./ui.scheduler.timeline_week"),
    dateUtils = require("../../../core/utils/date"),
    toMs = dateUtils.dateToMilliseconds;
var TIMELINE_CLASS = "dx-scheduler-timeline-work-week",
    MONDAY_INDEX = 1;
var SchedulerTimelineWorkWeek = SchedulerTimelineWeek.inherit({
    _getElementClass: function() {
        return TIMELINE_CLASS
    },
    _getWeekDuration: function() {
        return 5
    },
    _firstDayOfWeek: function() {
        return this.option("firstDayOfWeek") || MONDAY_INDEX
    },
    _incrementDate: function(date) {
        var day = date.getDay();
        if (5 === day) {
            date.setDate(date.getDate() + 2)
        }
        this.callBase(date)
    },
    _getOffsetByCount: function(cellIndex, rowIndex) {
        var weekendCount = Math.floor(cellIndex / (5 * this._getCellCountInDay()));
        if (weekendCount > 0) {
            return toMs("day") * weekendCount * 2
        } else {
            return 0
        }
    },
    _getWeekendsCount: function(days) {
        return 2 * Math.floor(days / 7)
    },
    _setFirstViewDate: function() {
        this._firstViewDate = dateUtils.getFirstWeekDate(this.option("currentDate"), this._firstDayOfWeek());
        this._firstViewDate = dateUtils.normalizeDateByWeek(this._firstViewDate, this.option("currentDate"));
        this._setStartDayHour(this._firstViewDate)
    }
});
registerComponent("dxSchedulerTimelineWorkWeek", SchedulerTimelineWorkWeek);
module.exports = SchedulerTimelineWorkWeek;
