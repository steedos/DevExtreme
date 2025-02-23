/**
 * DevExtreme (viz/vector_map/tooltip_viewer.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var TOOLTIP_OFFSET = 12;

function TooltipViewer(params) {
    this._subscribeToTracker(params.tracker, params.tooltip, params.layerCollection)
}
TooltipViewer.prototype = {
    constructor: TooltipViewer,
    dispose: function() {
        this._offTracker();
        this._offTracker = null
    },
    _subscribeToTracker: function(tracker, tooltip, layerCollection) {
        this._offTracker = tracker.on({
            "focus-on": function(arg) {
                var layer, proxy, result = false;
                if (tooltip.isEnabled()) {
                    layer = layerCollection.byName(arg.data.name);
                    proxy = layer && layer.getProxy(arg.data.index);
                    if (proxy && tooltip.show(proxy, {
                            x: 0,
                            y: 0,
                            offset: 0
                        }, {
                            target: proxy
                        })) {
                        tooltip.move(arg.x, arg.y, TOOLTIP_OFFSET);
                        result = true
                    }
                }
                arg.done(result)
            },
            "focus-move": function(arg) {
                tooltip.move(arg.x, arg.y, TOOLTIP_OFFSET)
            },
            "focus-off": function() {
                tooltip.hide()
            }
        })
    }
};
exports.TooltipViewer = TooltipViewer;
