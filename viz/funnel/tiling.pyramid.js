/**
 * DevExtreme (viz/funnel/tiling.pyramid.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var CENTER = .5,
    LEFTCORNER = 0,
    RIGHTCORNER = 1;
module.exports = {
    getFigures: function(data, neckWidth, neckHeight) {
        var height = 0,
            y = 0,
            x = 0,
            offsetX = 0,
            halfNeckWidth = neckWidth / 2,
            offsetFromCorner = CENTER - halfNeckWidth,
            funnelHeight = 1 - neckHeight,
            neckLeftCorner = CENTER - halfNeckWidth,
            neckRightCorner = CENTER + halfNeckWidth;
        return data.map(function(value) {
            x = offsetX;
            y = height;
            height += value;
            offsetX = offsetFromCorner * height / funnelHeight;
            if (y <= funnelHeight && height <= funnelHeight) {
                return [x, y, RIGHTCORNER - x, y, RIGHTCORNER - offsetX, height, LEFTCORNER + offsetX, height]
            } else {
                if (y <= funnelHeight && height > funnelHeight) {
                    return [x, y, RIGHTCORNER - x, y, neckRightCorner, funnelHeight, neckRightCorner, height, neckLeftCorner, height, neckLeftCorner, funnelHeight]
                } else {
                    return [neckLeftCorner, y, neckRightCorner, y, neckRightCorner, height, neckLeftCorner, height]
                }
            }
        })
    },
    normalizeValues: function(items) {
        var sum = items.reduce(function(sum, item) {
            return sum + item.value
        }, 0);
        return items.map(function(item) {
            return item.value / sum
        })
    }
};
