/**
 * DevExtreme (viz/series/points/range_bar_point.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var noop = require("../../../core/utils/common").noop,
    extend = require("../../../core/utils/extend").extend,
    barPoint = require("./bar_point"),
    rangeSymbolPointMethods = require("./range_symbol_point"),
    _extend = extend;
module.exports = _extend({}, barPoint, {
    deleteLabel: rangeSymbolPointMethods.deleteLabel,
    _getFormatObject: rangeSymbolPointMethods._getFormatObject,
    clearVisibility: function() {
        var graphic = this.graphic;
        if (graphic && graphic.attr("visibility")) {
            graphic.attr({
                visibility: null
            })
        }
    },
    setInvisibility: function() {
        var graphic = this.graphic;
        if (graphic && "hidden" !== graphic.attr("visibility")) {
            graphic.attr({
                visibility: "hidden"
            })
        }
        this._topLabel.draw(false);
        this._bottomLabel.draw(false)
    },
    getTooltipParams: function(location) {
        var x, y, that = this,
            edgeLocation = "edge" === location;
        if (that._options.rotated) {
            x = edgeLocation ? that.x + that.width : that.x + that.width / 2;
            y = that.y + that.height / 2
        } else {
            x = that.x + that.width / 2;
            y = edgeLocation ? that.y : that.y + that.height / 2
        }
        return {
            x: x,
            y: y,
            offset: 0
        }
    },
    _translate: function() {
        var that = this,
            barMethods = barPoint;
        barMethods._translate.call(that);
        if (that._options.rotated) {
            that.width = that.width || 1
        } else {
            that.height = that.height || 1
        }
    },
    hasCoords: rangeSymbolPointMethods.hasCoords,
    _updateData: rangeSymbolPointMethods._updateData,
    _getLabelPosition: rangeSymbolPointMethods._getLabelPosition,
    _getLabelMinFormatObject: rangeSymbolPointMethods._getLabelMinFormatObject,
    _updateLabelData: rangeSymbolPointMethods._updateLabelData,
    _updateLabelOptions: rangeSymbolPointMethods._updateLabelOptions,
    getCrosshairData: rangeSymbolPointMethods.getCrosshairData,
    _createLabel: rangeSymbolPointMethods._createLabel,
    _checkOverlay: rangeSymbolPointMethods._checkOverlay,
    _checkLabelsOverlay: rangeSymbolPointMethods._checkLabelsOverlay,
    _getOverlayCorrections: rangeSymbolPointMethods._getOverlayCorrections,
    _drawLabel: rangeSymbolPointMethods._drawLabel,
    _getLabelCoords: rangeSymbolPointMethods._getLabelCoords,
    _getGraphicBBox: function(location) {
        var isTop = "top" === location,
            bBox = barPoint._getGraphicBBox.call(this);
        if (!this._options.rotated) {
            bBox.y = isTop ? bBox.y : bBox.y + bBox.height;
            bBox.height = 0
        } else {
            bBox.x = isTop ? bBox.x + bBox.width : bBox.x;
            bBox.width = 0
        }
        return bBox
    },
    getLabel: rangeSymbolPointMethods.getLabel,
    getLabels: rangeSymbolPointMethods.getLabels,
    getBoundingRect: noop,
    getMinValue: rangeSymbolPointMethods.getMinValue,
    getMaxValue: rangeSymbolPointMethods.getMaxValue
});
