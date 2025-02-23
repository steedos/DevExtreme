/**
 * DevExtreme (localization/default_date_names.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var iteratorUtils = require("../core/utils/iterator");
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    PERIODS = ["AM", "PM"],
    QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
var cutCaptions = function(captions, format) {
    var lengthByFormat = {
        abbreviated: 3,
        "short": 2,
        narrow: 1
    };
    return iteratorUtils.map(captions, function(caption) {
        return caption.substr(0, lengthByFormat[format])
    })
};
module.exports = {
    getMonthNames: function(format) {
        return cutCaptions(MONTHS, format)
    },
    getDayNames: function(format) {
        return cutCaptions(DAYS, format)
    },
    getQuarterNames: function(format) {
        return QUARTERS
    },
    getPeriodNames: function(format) {
        return PERIODS
    }
};
