/**
 * DevExtreme (viz/gauges/circular_range_container.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var BaseRangeContainer = require("./base_range_container"),
    _Number = Number,
    _max = Math.max,
    _normalizeEnum = require("../core/utils").normalizeEnum;
var CircularRangeContainer = BaseRangeContainer.inherit({
    _processOptions: function() {
        var that = this;
        that._inner = that._outer = 0;
        switch (_normalizeEnum(that._options.orientation)) {
            case "inside":
                that._inner = 1;
                break;
            case "center":
                that._inner = that._outer = .5;
                break;
            default:
                that._outer = 1
        }
    },
    _isVisible: function(layout) {
        var width = this._options.width;
        width = _Number(width) || _max(_Number(width.start), _Number(width.end));
        return layout.radius - this._inner * width > 0
    },
    _createRange: function(range, layout) {
        var that = this,
            width = (range.startWidth + range.endWidth) / 2;
        return that._renderer.arc(layout.x, layout.y, layout.radius - that._inner * width, layout.radius + that._outer * width, that._translator.translate(range.end), that._translator.translate(range.start)).attr({
            "stroke-linejoin": "round"
        })
    },
    measure: function(layout) {
        var width = this._options.width;
        width = _Number(width) || _max(_Number(width.start), _Number(width.end));
        return {
            min: layout.radius - this._inner * width,
            max: layout.radius + this._outer * width
        }
    }
});
module.exports = CircularRangeContainer;
