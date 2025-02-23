/**
 * DevExtreme (ui/scheduler/timezones/ui.scheduler.timezones.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var query = require("../../../data/query"),
    errors = require("../../../core/errors"),
    tzData = require("./ui.scheduler.timezones_data");
var SchedulerTimezones = {
    _displayNames: tzData.displayNames,
    _list: tzData.timezones,
    getTimezones: function() {
        return this._list
    },
    getDisplayNames: function() {
        return this._displayNames
    },
    queryableTimezones: function() {
        return query(this.getTimezones())
    },
    getTimezoneById: function(id) {
        var result, i = 0,
            tzList = this.getTimezones();
        if (id) {
            while (!result) {
                if (!tzList[i]) {
                    errors.log("W0009", id);
                    return
                }
                var currentId = tzList[i].id;
                if (currentId === id) {
                    result = tzList[i]
                }
                i++
            }
        }
        return result
    },
    getTimezoneOffsetById: function(id, dateTimeStamp) {
        var offsets, offsetIndices, untils, result, tz = this.getTimezoneById(id);
        if (tz) {
            if (tz.link) {
                var rootTz = this.getTimezones()[tz.link];
                offsets = rootTz.offsets;
                untils = rootTz.untils;
                offsetIndices = rootTz.offsetIndices
            } else {
                offsets = tz.offsets;
                untils = tz.untils;
                offsetIndices = tz.offsetIndices
            }
            result = this.getUtcOffset(offsets, offsetIndices, untils, dateTimeStamp)
        }
        return result
    },
    getUtcOffset: function(offsets, offsetIndices, untils, dateTimeStamp) {
        var index = 0;
        var offsetIndicesList = offsetIndices.split("");
        var untilsList = untils.split("|").map(function(until) {
            if ("Infinity" === until) {
                return null
            }
            return 1e3 * parseInt(until, 36)
        });
        var currentUntil = 0;
        for (var i = 0, listLength = untilsList.length; i < listLength; i++) {
            currentUntil += untilsList[i];
            if (dateTimeStamp >= currentUntil) {
                index = i;
                continue
            } else {
                break
            }
        }
        if (untilsList[index + 1]) {
            index++
        }
        return offsets[Number(offsetIndicesList[index])]
    },
    getTimezoneShortDisplayNameById: function(id) {
        var result, tz = this.getTimezoneById(id);
        if (tz) {
            result = tz.DisplayName.substring(0, 11)
        }
        return result
    },
    getTimezonesDisplayName: function() {
        return query(this.getDisplayNames()).sortBy().toArray()
    },
    getTimezoneDisplayNameById: function(id) {
        var tz = this.getTimezoneById(id);
        return tz ? this.getDisplayNames()[tz.winIndex] : ""
    },
    getSimilarTimezones: function(id) {
        if (!id) {
            return []
        }
        var tz = this.getTimezoneById(id);
        return this.getTimezonesIdsByWinIndex(tz.winIndex)
    },
    getTimezonesIdsByWinIndex: function(winIndex) {
        return this.queryableTimezones().filter(["winIndex", winIndex]).sortBy("title").toArray().map(function(item) {
            return {
                id: item.id,
                displayName: item.title
            }
        })
    },
    getTimezonesIdsByDisplayName: function(displayName) {
        var displayNameIndex = this.getDisplayNames().indexOf(displayName);
        return this.getTimezonesIdsByWinIndex(displayNameIndex)
    },
    getClientTimezoneOffset: function(date) {
        return 6e4 * date.getTimezoneOffset()
    },
    processDateDependOnTimezone: function(date, tzOffset) {
        var result = new Date(date);
        if (tzOffset) {
            var tzDiff = tzOffset + this.getClientTimezoneOffset(date) / 36e5;
            result = new Date(result.setHours(result.getHours() + tzDiff))
        }
        return result
    }
};
module.exports = SchedulerTimezones;
