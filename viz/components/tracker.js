/**
 * DevExtreme (viz/components/tracker.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _eventData = require("../../events/utils").eventData,
    domAdapter = require("../../core/dom_adapter"),
    clickEventName = require("../../events/click").name,
    downPointerEventName = require("../../events/pointer").down,
    movePointerEventName = require("../../events/pointer").move,
    eventsEngine = require("../../events/core/events_engine");

function Tracker(parameters) {
    this._initHandlers(parameters)
}
Tracker.prototype = {
    constructor: Tracker,
    _initHandlers: function(parameters) {
        var document = domAdapter.getDocument();
        parameters.getCoords = function(e) {
            var data = _eventData(e),
                offset = parameters.widget._renderer.getRootOffset();
            return [data.x - offset.left, data.y - offset.top]
        };
        parameters.root.on(clickEventName, clickHandler);
        parameters.root.on(downPointerEventName, downHandler);
        eventsEngine.on(document, downPointerEventName, downHandler);
        eventsEngine.on(document, movePointerEventName, moveHandler);
        this._disposeHandlers = function() {
            parameters.root.off(clickEventName, clickHandler);
            parameters.root.off(downPointerEventName, downHandler);
            eventsEngine.off(document, downPointerEventName, downHandler);
            eventsEngine.off(document, movePointerEventName, moveHandler)
        };

        function clickHandler(e) {
            processClick(e, parameters)
        }
        var isRootDown = false;

        function downHandler(e) {
            if (isRootDown) {
                isRootDown = false
            } else {
                if (void 0 !== parameters.getData(e)) {
                    isRootDown = true
                }
                moveHandler(e)
            }
        }

        function moveHandler(e) {
            processHover(e, parameters);
            parameters.widget._getOption("tooltip").enabled && processTooltip(e, parameters)
        }
    },
    dispose: function() {
        this._disposeHandlers()
    }
};

function processClick(e, params) {
    var id = params.getData(e);
    if (id >= 0) {
        params.click({
            node: params.getNode(id),
            coords: params.getCoords(e),
            event: e
        })
    }
}

function processHover(e, params) {
    var id = params.getData(e);
    if (id >= 0) {
        params.getNode(id).setHover()
    } else {
        params.widget.clearHover()
    }
}

function processTooltip(e, params) {
    var coords, id = params.getData(e, true);
    if (id >= 0) {
        coords = _eventData(e);
        params.getNode(id).showTooltip([coords.x, coords.y])
    } else {
        params.widget.hideTooltip()
    }
}
module.exports.Tracker = Tracker;
