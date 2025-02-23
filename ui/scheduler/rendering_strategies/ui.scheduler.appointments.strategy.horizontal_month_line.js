/**
 * DevExtreme (ui/scheduler/rendering_strategies/ui.scheduler.appointments.strategy.horizontal_month_line.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var HorizontalAppointmentsStrategy = require("./ui.scheduler.appointments.strategy.horizontal"),
    dateUtils = require("../../../core/utils/date"),
    query = require("../../../data/query");
var HOURS_IN_DAY = 24,
    MINUTES_IN_HOUR = 60,
    MILLISECONDS_IN_MINUTE = 6e4;
var HorizontalMonthLineRenderingStrategy = HorizontalAppointmentsStrategy.inherit({
    calculateAppointmentWidth: function(appointment, position, isRecurring) {
        var startDate = new Date(this.startDate(appointment, false, position)),
            endDate = new Date(this.endDate(appointment, position, isRecurring)),
            cellWidth = this._defaultWidth || this.getAppointmentMinSize();
        startDate = dateUtils.trimTime(startDate);
        var width = Math.ceil(this._getDurationInHour(startDate, endDate) / HOURS_IN_DAY) * cellWidth;
        width = this.cropAppointmentWidth(width, cellWidth);
        return width
    },
    _getDurationInHour: function(startDate, endDate) {
        var adjustedDuration = this._adjustDurationByDaylightDiff(endDate.getTime() - startDate.getTime(), startDate, endDate);
        return adjustedDuration / dateUtils.dateToMilliseconds("hour")
    },
    getDeltaTime: function(args, initialSize) {
        return HOURS_IN_DAY * MINUTES_IN_HOUR * MILLISECONDS_IN_MINUTE * this._getDeltaWidth(args, initialSize)
    },
    isAllDay: function() {
        return false
    },
    createTaskPositionMap: function(items, skipSorting) {
        if (!skipSorting) {
            this.instance.getAppointmentsInstance()._sortAppointmentsByStartDate(items)
        }
        return this.callBase(items)
    },
    _getSortedPositions: function(map, skipSorting) {
        var result = this.callBase(map);
        if (!skipSorting) {
            result = query(result).sortBy("top").thenBy("left").thenBy("cellPosition").thenBy("i").toArray()
        }
        return result
    },
    needCorrectAppointmentDates: function() {
        return false
    }
});
module.exports = HorizontalMonthLineRenderingStrategy;
