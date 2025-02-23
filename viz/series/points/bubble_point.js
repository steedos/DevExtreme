/**
 * DevExtreme (viz/series/points/bubble_point.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var extend = require("../../../core/utils/extend").extend,
    symbolPoint = require("./symbol_point"),
    _extend = extend,
    MIN_BUBBLE_HEIGHT = 20;
module.exports = _extend({}, symbolPoint, {
    correctCoordinates: function(diameter) {
        this.bubbleSize = diameter / 2
    },
    _drawMarker: function(renderer, group, animationEnabled) {
        var that = this,
            attr = _extend({
                translateX: that.x,
                translateY: that.y
            }, that._getStyle());
        that.graphic = renderer.circle(0, 0, animationEnabled ? 0 : that.bubbleSize).smartAttr(attr).data({
            "chart-data-point": that
        }).append(group)
    },
    getTooltipParams: function(location) {
        var height, that = this,
            graphic = that.graphic;
        if (!graphic) {
            return
        }
        height = graphic.getBBox().height;
        return {
            x: that.x,
            y: that.y,
            offset: height < MIN_BUBBLE_HEIGHT || "edge" === location ? height / 2 : 0
        }
    },
    _getLabelFormatObject: function() {
        var formatObject = symbolPoint._getLabelFormatObject.call(this);
        formatObject.size = this.initialSize;
        return formatObject
    },
    _updateData: function(data) {
        symbolPoint._updateData.call(this, data);
        this.size = this.initialSize = data.size
    },
    _getGraphicBBox: function() {
        var that = this;
        return that._getSymbolBBox(that.x, that.y, that.bubbleSize)
    },
    _updateMarker: function(animationEnabled, style) {
        var that = this;
        if (!animationEnabled) {
            style = _extend({
                r: that.bubbleSize,
                translateX: that.x,
                translateY: that.y
            }, style)
        }
        that.graphic.smartAttr(style)
    },
    _getFormatObject: function(tooltip) {
        var formatObject = symbolPoint._getFormatObject.call(this, tooltip);
        formatObject.sizeText = tooltip.formatValue(this.initialSize);
        return formatObject
    },
    _storeTrackerR: function() {
        return this.bubbleSize
    },
    _getLabelCoords: function(label) {
        var coords;
        if ("inside" === label.getLayoutOptions().position) {
            coords = this._getLabelCoordOfPosition(label, "inside")
        } else {
            coords = symbolPoint._getLabelCoords.call(this, label)
        }
        return coords
    }
});
