/**
 * DevExtreme (viz/funnel/tooltip.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var noop = require("../../core/utils/common").noop;

function getCoords(figureCoords, renderer) {
    var offset = renderer.getRootOffset();
    return [(figureCoords[0] + figureCoords[2]) / 2 + offset.left, (figureCoords[1] + figureCoords[5]) / 2 + offset.top]
}
exports.plugin = {
    name: "funnel-tooltip",
    init: noop,
    dispose: noop,
    extenders: {
        _buildNodes: function() {
            this.hideTooltip()
        },
        _change_TILING: function() {
            if (this._tooltipIndex >= 0) {
                this._moveTooltip(this._items[this._tooltipIndex])
            }
        }
    },
    members: {
        hideTooltip: function() {
            if (this._tooltipIndex >= 0) {
                this._tooltipIndex = -1;
                this._tooltip.hide()
            }
        },
        _moveTooltip: function(item, coords) {
            var xy = coords || item.coords && getCoords(item.coords, this._renderer) || [-1e3, -1e3];
            this._tooltip.move(xy[0], xy[1], 0)
        },
        _showTooltip: function(index, coords) {
            var that = this,
                tooltip = that._tooltip,
                item = that._items[index],
                state = that._tooltipIndex === index || tooltip.show({
                    value: item.value,
                    valueText: tooltip.formatValue(item.value),
                    percentText: tooltip.formatValue(item.percent, "percent"),
                    percent: item.percent,
                    item: item
                }, {
                    x: 0,
                    y: 0,
                    offset: 0
                }, {
                    item: item
                });
            if (state) {
                that._moveTooltip(item, coords)
            } else {
                tooltip.hide()
            }
            that._tooltipIndex = state ? index : -1
        }
    },
    customize: function(constructor) {
        constructor.addPlugin(require("../core/tooltip").plugin)
    }
};
