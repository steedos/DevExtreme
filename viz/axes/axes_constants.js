/**
 * DevExtreme (viz/axes/axes_constants.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _map = require("../core/utils").map;
module.exports = {
    logarithmic: "logarithmic",
    discrete: "discrete",
    numeric: "numeric",
    left: "left",
    right: "right",
    top: "top",
    bottom: "bottom",
    center: "center",
    horizontal: "horizontal",
    vertical: "vertical",
    convertTicksToValues: function(ticks) {
        return _map(ticks || [], function(item) {
            return item.value
        })
    },
    validateOverlappingMode: function(mode) {
        return "ignore" === mode || "none" === mode ? mode : "hide"
    },
    getTicksCountInRange: function(ticks, valueKey, range) {
        var i = 1;
        if (ticks.length > 1) {
            for (; i < ticks.length; i++) {
                if (Math.abs(ticks[i].coords[valueKey] - ticks[0].coords[valueKey]) >= range) {
                    break
                }
            }
        }
        return i
    },
    areLabelsOverlap: function(bBox1, bBox2, spacing, alignment) {
        var hasHorizontalOverlapping, hasVerticalOverlapping, horizontalInverted = bBox1.x > bBox2.x,
            verticalInverted = bBox1.y > bBox2.y,
            x1 = bBox1.x,
            x2 = bBox2.x,
            width1 = bBox1.width,
            width2 = bBox2.width;
        if ("left" === alignment) {
            x1 += width1 / 2;
            x2 += width2 / 2
        } else {
            if ("right" === alignment) {
                x1 -= width1 / 2;
                x2 -= width2 / 2
            }
        }
        hasHorizontalOverlapping = horizontalInverted ? x2 + width2 + spacing > x1 : x1 + width1 + spacing > x2;
        hasVerticalOverlapping = verticalInverted ? bBox2.y + bBox2.height > bBox1.y : bBox1.y + bBox1.height > bBox2.y;
        return hasHorizontalOverlapping && hasVerticalOverlapping
    }
};
