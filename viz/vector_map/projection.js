/**
 * DevExtreme (viz/vector_map/projection.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var projectionModule = require("./projection.main"),
    projection = projectionModule.projection,
    _min = Math.min,
    _max = Math.max,
    _sin = Math.sin,
    _asin = Math.asin,
    _tan = Math.tan,
    _atan = Math.atan,
    _exp = Math.exp,
    _log = Math.log,
    PI = Math.PI,
    PI_DIV_4 = PI / 4,
    GEO_LON_BOUND = 180,
    GEO_LAT_BOUND = 90,
    RADIANS = PI / 180,
    MERCATOR_LAT_BOUND = (2 * _atan(_exp(PI)) - PI / 2) / RADIANS,
    MILLER_LAT_BOUND = (2.5 * _atan(_exp(.8 * PI)) - .625 * PI) / RADIANS;

function clamp(value, threshold) {
    return _max(_min(value, +threshold), -threshold)
}
projection.add("mercator", projection({
    aspectRatio: 1,
    to: function(coordinates) {
        return [coordinates[0] / GEO_LON_BOUND, _log(_tan(PI_DIV_4 + clamp(coordinates[1], MERCATOR_LAT_BOUND) * RADIANS / 2)) / PI]
    },
    from: function(coordinates) {
        return [coordinates[0] * GEO_LON_BOUND, (2 * _atan(_exp(coordinates[1] * PI)) - PI / 2) / RADIANS]
    }
}));
projection.add("equirectangular", projection({
    aspectRatio: 2,
    to: function(coordinates) {
        return [coordinates[0] / GEO_LON_BOUND, coordinates[1] / GEO_LAT_BOUND]
    },
    from: function(coordinates) {
        return [coordinates[0] * GEO_LON_BOUND, coordinates[1] * GEO_LAT_BOUND]
    }
}));
projection.add("lambert", projection({
    aspectRatio: 2,
    to: function(coordinates) {
        return [coordinates[0] / GEO_LON_BOUND, _sin(clamp(coordinates[1], GEO_LAT_BOUND) * RADIANS)]
    },
    from: function(coordinates) {
        return [coordinates[0] * GEO_LON_BOUND, _asin(clamp(coordinates[1], 1)) / RADIANS]
    }
}));
projection.add("miller", projection({
    aspectRatio: 1,
    to: function(coordinates) {
        return [coordinates[0] / GEO_LON_BOUND, 1.25 * _log(_tan(PI_DIV_4 + clamp(coordinates[1], MILLER_LAT_BOUND) * RADIANS * .4)) / PI]
    },
    from: function(coordinates) {
        return [coordinates[0] * GEO_LON_BOUND, (2.5 * _atan(_exp(.8 * coordinates[1] * PI)) - .625 * PI) / RADIANS]
    }
}));
exports.projection = projection;
