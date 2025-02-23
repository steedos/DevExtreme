/**
 * DevExtreme (viz/axes/smart_formatter.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.smartFormatter = smartFormatter;
exports.formatRange = formatRange;
var _format_helper = require("../../format_helper");
var _format_helper2 = _interopRequireDefault(_format_helper);
var _type = require("../../core/utils/type");
var _date = require("../../core/utils/date");
var _date2 = _interopRequireDefault(_date);
var _math = require("../../core/utils/math");
var _utils = require("../core/utils");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var _format = _format_helper2.default.format;
var floor = Math.floor;
var abs = Math.abs;
var EXPONENTIAL = "exponential";
var formats = ["fixedPoint", "thousands", "millions", "billions", "trillions", EXPONENTIAL];
var dateUnitIntervals = ["millisecond", "second", "minute", "hour", "day", "month", "year"];

function getDatesDifferences(prevDate, curDate, nextDate, tickFormat) {
    var prevDifferences, nextDifferences, dateUnitInterval, tickFormatIndex, i, j, dateUnitsLength = dateUnitIntervals.length;
    if ("week" === tickFormat) {
        tickFormat = "day"
    } else {
        if ("quarter" === tickFormat) {
            tickFormat = "month"
        } else {
            if ("shorttime" === tickFormat) {
                tickFormat = "hour"
            } else {
                if ("longtime" === tickFormat) {
                    tickFormat = "second"
                }
            }
        }
    }
    tickFormatIndex = dateUnitIntervals.indexOf(tickFormat);
    if (nextDate) {
        nextDifferences = _date2.default.getDatesDifferences(curDate, nextDate);
        prevDifferences = _date2.default.getDatesDifferences(curDate, prevDate);
        if (nextDifferences[tickFormat]) {
            for (i = dateUnitsLength - 1; i >= tickFormatIndex; i--) {
                dateUnitInterval = dateUnitIntervals[i];
                if (i === tickFormatIndex) {
                    setDateUnitInterval(nextDifferences, tickFormatIndex + (nextDifferences.millisecond ? 2 : 1))
                } else {
                    if (nextDifferences[dateUnitInterval]) {
                        resetDateUnitInterval(nextDifferences, i);
                        break
                    }
                }
            }
        }
    } else {
        prevDifferences = _date2.default.getDatesDifferences(prevDate, curDate);
        for (i = dateUnitsLength - 1; i >= tickFormatIndex; i--) {
            dateUnitInterval = dateUnitIntervals[i];
            if (prevDifferences[dateUnitInterval]) {
                if (i - tickFormatIndex > 1) {
                    for (j = tickFormatIndex + 1; j >= 0; j--) {
                        resetDateUnitInterval(prevDifferences, j)
                    }
                    break
                } else {
                    if (isDateTimeStart(curDate, dateUnitInterval)) {
                        for (j = i - 1; j > 0; j--) {
                            resetDateUnitInterval(prevDifferences, j)
                        }
                        break
                    }
                }
            }
        }
    }
    return nextDate ? nextDifferences : prevDifferences
}

function isDateTimeStart(date, dateUnitInterval) {
    var i, unitNumbers = [date.getMilliseconds(), date.getSeconds(), date.getMinutes(), date.getHours(), date.getDate(), date.getMonth()],
        unitIndex = dateUnitIntervals.indexOf(dateUnitInterval);
    for (i = 0; i < unitIndex; i++) {
        if (4 === i && 1 !== unitNumbers[i] || 4 !== i && 0 !== unitNumbers[i]) {
            return false
        }
    }
    return true
}

function resetDateUnitInterval(differences, intervalIndex) {
    var dateUnitInterval = dateUnitIntervals[intervalIndex];
    if (differences[dateUnitInterval]) {
        differences[dateUnitInterval] = false;
        differences.count--
    }
}

function setDateUnitInterval(differences, intervalIndex) {
    var dateUnitInterval = dateUnitIntervals[intervalIndex];
    if (false === differences[dateUnitInterval]) {
        differences[dateUnitInterval] = true;
        differences.count++
    }
}

function getNoZeroIndex(str) {
    return str.length - parseInt(str).toString().length
}

function getTransitionTickIndex(ticks, value) {
    var i, curDiff, minDiff, nearestTickIndex = 0;
    minDiff = abs(value - ticks[0]);
    for (i = 1; i < ticks.length; i++) {
        curDiff = abs(value - ticks[i]);
        if (curDiff < minDiff) {
            minDiff = curDiff;
            nearestTickIndex = i
        }
    }
    return nearestTickIndex
}

function splitDecimalNumber(value) {
    return value.toString().split(".")
}

function createFormat(type) {
    var formatter = void 0;
    if ((0, _type.isFunction)(type)) {
        formatter = type;
        type = null
    }
    return {
        type: type,
        formatter: formatter
    }
}

function smartFormatter(tick, options) {
    var tickIntervalIndex, tickIndex, actualIndex, typeFormat, separatedTickInterval, datesDifferences, log10Tick, prevDateIndex, nextDateIndex, tickInterval = options.tickInterval,
        stringTick = abs(tick).toString(),
        precision = 0,
        offset = 0,
        indexOfFormat = 0,
        indexOfTick = -1,
        format = options.labelOptions.format,
        ticks = options.ticks,
        isLogarithmic = "logarithmic" === options.type;
    if (1 === ticks.length && 0 === ticks.indexOf(tick) && !(0, _type.isDefined)(tickInterval)) {
        tickInterval = abs(tick) >= 1 ? 1 : (0, _math.adjust)(1 - abs(tick), tick)
    }
    if (!(0, _type.isDefined)(format) && "discrete" !== options.type && tick && (10 === options.logarithmBase || !isLogarithmic)) {
        if ("datetime" !== options.dataType && (0, _type.isDefined)(tickInterval)) {
            if (ticks.length && ticks.indexOf(tick) === -1) {
                indexOfTick = getTransitionTickIndex(ticks, tick);
                tickInterval = (0, _math.adjust)(abs(tick - ticks[indexOfTick]), tick)
            }
            separatedTickInterval = splitDecimalNumber(tickInterval);
            if (separatedTickInterval < 2) {
                separatedTickInterval = splitDecimalNumber(tick)
            }
            if (isLogarithmic) {
                log10Tick = (0, _utils.getAdjustedLog10)(abs(tick));
                if (log10Tick > 0) {
                    typeFormat = formats[floor(log10Tick / 3)] || EXPONENTIAL
                } else {
                    if (log10Tick < -4) {
                        typeFormat = EXPONENTIAL
                    } else {
                        precision = void 0
                    }
                }
            } else {
                if (separatedTickInterval.length > 1 && !(0, _type.isExponential)(tickInterval)) {
                    precision = separatedTickInterval[1].length;
                    typeFormat = formats[indexOfFormat]
                } else {
                    if ((0, _type.isExponential)(tickInterval) && (stringTick.indexOf(".") !== -1 || (0, _type.isExponential)(tick))) {
                        typeFormat = EXPONENTIAL;
                        if (!(0, _type.isExponential)(tick)) {
                            precision = abs(getNoZeroIndex(stringTick.split(".")[1]) - (0, _math.getExponent)(tickInterval) + 1)
                        } else {
                            precision = Math.max(abs((0, _math.getExponent)(tick) - (0, _math.getExponent)(tickInterval)), abs((0, _math.getPrecision)(tick) - (0, _math.getPrecision)(tickInterval)))
                        }
                    } else {
                        tickIntervalIndex = floor((0, _utils.getAdjustedLog10)(tickInterval));
                        actualIndex = tickIndex = floor((0, _utils.getAdjustedLog10)(abs(tick)));
                        if (tickIndex - tickIntervalIndex >= 2) {
                            actualIndex = tickIntervalIndex
                        }
                        indexOfFormat = floor(actualIndex / 3);
                        offset = 3 * indexOfFormat;
                        if (indexOfFormat < 5) {
                            if (tickIntervalIndex - offset === 2 && tickIndex >= 3) {
                                indexOfFormat++;
                                offset = 3 * indexOfFormat
                            }
                            typeFormat = formats[indexOfFormat]
                        } else {
                            typeFormat = formats[formats.length - 1]
                        }
                        if (offset > 0) {
                            separatedTickInterval = splitDecimalNumber(tickInterval / Math.pow(10, offset));
                            if (separatedTickInterval[1]) {
                                precision = separatedTickInterval[1].length
                            }
                        }
                    }
                }
            }
            if (void 0 !== typeFormat || void 0 !== precision) {
                format = {
                    type: typeFormat,
                    precision: precision
                }
            }
        } else {
            if ("datetime" === options.dataType) {
                typeFormat = _date2.default.getDateFormatByTickInterval(tickInterval);
                if (options.showTransition && ticks.length) {
                    indexOfTick = ticks.map(Number).indexOf(+tick);
                    if (1 === ticks.length && 0 === indexOfTick) {
                        typeFormat = _format_helper2.default.getDateFormatByTicks(ticks)
                    } else {
                        if (indexOfTick === -1) {
                            prevDateIndex = getTransitionTickIndex(ticks, tick)
                        } else {
                            prevDateIndex = 0 === indexOfTick ? ticks.length - 1 : indexOfTick - 1;
                            nextDateIndex = 0 === indexOfTick ? 1 : -1
                        }
                        datesDifferences = getDatesDifferences(ticks[prevDateIndex], tick, ticks[nextDateIndex], typeFormat);
                        typeFormat = _format_helper2.default.getDateFormatByDifferences(datesDifferences, typeFormat)
                    }
                }
                format = createFormat(typeFormat)
            }
        }
    }
    return _format(tick, format)
}

function getHighDiffFormat(diff) {
    var stop = false;
    for (var i in diff) {
        if (true === diff[i] || "hour" === i || stop) {
            diff[i] = false;
            stop = true
        } else {
            if (false === diff[i]) {
                diff[i] = true
            }
        }
    }
    return createFormat(_format_helper2.default.getDateFormatByDifferences(diff))
}

function getHighAndSelfDiffFormat(diff, interval) {
    var stop = false;
    for (var i in diff) {
        if (stop) {
            diff[i] = false
        } else {
            if (i === interval) {
                stop = true
            } else {
                diff[i] = true
            }
        }
    }
    return createFormat(_format_helper2.default.getDateFormatByDifferences(diff))
}

function formatDateRange(startValue, endValue, tickInterval) {
    var diff = getDatesDifferences(startValue, endValue);
    var typeFormat = _date2.default.getDateFormatByTickInterval(tickInterval);
    var diffFormatType = _format_helper2.default.getDateFormatByDifferences(diff, typeFormat);
    var diffFormat = createFormat(diffFormatType);
    var values = [];
    if (tickInterval in diff) {
        var rangeFormat = getHighAndSelfDiffFormat(getDatesDifferences(startValue, endValue), tickInterval);
        var value = _format(startValue, rangeFormat);
        if (value) {
            values.push(value)
        }
    } else {
        var _rangeFormat = getHighDiffFormat(getDatesDifferences(startValue, endValue));
        var highValue = _format(startValue, _rangeFormat);
        if (highValue) {
            values.push(highValue)
        }
        values.push(_format(startValue, diffFormat) + " - " + _format(endValue, diffFormat))
    }
    return values.join(", ")
}

function processDateInterval(interval) {
    if ((0, _type.isObject)(interval)) {
        var dateUnits = Object.keys(interval);
        var sum = dateUnits.reduce(function(sum, k) {
            return interval[k] + sum
        }, 0);
        if (1 === sum) {
            var dateUnit = dateUnits.filter(function(k) {
                return 1 === interval[k]
            })[0];
            return dateUnit.slice(0, dateUnit.length - 1)
        }
    }
    return interval
}

function formatRange(startValue, endValue, tickInterval, _ref) {
    var dataType = _ref.dataType,
        type = _ref.type,
        logarithmBase = _ref.logarithmBase;
    if ("discrete" === type) {
        return ""
    }
    if ("datetime" === dataType) {
        return formatDateRange(startValue, endValue, processDateInterval(tickInterval))
    }
    var formatOptions = {
        ticks: [],
        type: type,
        dataType: dataType,
        tickInterval: tickInterval,
        logarithmBase: logarithmBase,
        labelOptions: {}
    };
    return smartFormatter(startValue, formatOptions) + " - " + smartFormatter(endValue, formatOptions)
}
