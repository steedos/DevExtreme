/**
 * DevExtreme (events/transform.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var mathUtils = require("../core/utils/math"),
    iteratorUtils = require("../core/utils/iterator"),
    errors = require("../core/errors"),
    eventUtils = require("./utils"),
    Emitter = require("./core/emitter"),
    registerEmitter = require("./core/emitter_registrator");
var DX_PREFIX = "dx",
    TRANSFORM = "transform",
    TRANSLATE = "translate",
    ZOOM = "zoom",
    PINCH = "pinch",
    ROTATE = "rotate",
    START_POSTFIX = "start",
    UPDATE_POSTFIX = "",
    END_POSTFIX = "end";
var eventAliases = [];
var addAlias = function(eventName, eventArgs) {
    eventAliases.push({
        name: eventName,
        args: eventArgs
    })
};
addAlias(TRANSFORM, {
    scale: true,
    deltaScale: true,
    rotation: true,
    deltaRotation: true,
    translation: true,
    deltaTranslation: true
});
addAlias(TRANSLATE, {
    translation: true,
    deltaTranslation: true
});
addAlias(ZOOM, {
    scale: true,
    deltaScale: true
});
addAlias(PINCH, {
    scale: true,
    deltaScale: true
});
addAlias(ROTATE, {
    rotation: true,
    deltaRotation: true
});
var getVector = function(first, second) {
    return {
        x: second.pageX - first.pageX,
        y: -second.pageY + first.pageY,
        centerX: .5 * (second.pageX + first.pageX),
        centerY: .5 * (second.pageY + first.pageY)
    }
};
var getEventVector = function(e) {
    var pointers = e.pointers;
    return getVector(pointers[0], pointers[1])
};
var getDistance = function(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y)
};
var getScale = function(firstVector, secondVector) {
    return getDistance(firstVector) / getDistance(secondVector)
};
var getRotation = function(firstVector, secondVector) {
    var scalarProduct = firstVector.x * secondVector.x + firstVector.y * secondVector.y;
    var distanceProduct = getDistance(firstVector) * getDistance(secondVector);
    if (0 === distanceProduct) {
        return 0
    }
    var sign = mathUtils.sign(firstVector.x * secondVector.y - secondVector.x * firstVector.y);
    var angle = Math.acos(mathUtils.fitIntoRange(scalarProduct / distanceProduct, -1, 1));
    return sign * angle
};
var getTranslation = function(firstVector, secondVector) {
    return {
        x: firstVector.centerX - secondVector.centerX,
        y: firstVector.centerY - secondVector.centerY
    }
};
var TransformEmitter = Emitter.inherit({
    configure: function(data, eventName) {
        if (eventName.indexOf(ZOOM) > -1) {
            errors.log("W0005", eventName, "15.1", "Use '" + eventName.replace(ZOOM, PINCH) + "' event instead")
        }
        this.callBase(data)
    },
    validatePointers: function(e) {
        return eventUtils.hasTouches(e) > 1
    },
    start: function(e) {
        this._accept(e);
        var startVector = getEventVector(e);
        this._startVector = startVector;
        this._prevVector = startVector;
        this._fireEventAliases(START_POSTFIX, e)
    },
    move: function(e) {
        var currentVector = getEventVector(e),
            eventArgs = this._getEventArgs(currentVector);
        this._fireEventAliases(UPDATE_POSTFIX, e, eventArgs);
        this._prevVector = currentVector
    },
    end: function(e) {
        var eventArgs = this._getEventArgs(this._prevVector);
        this._fireEventAliases(END_POSTFIX, e, eventArgs)
    },
    _getEventArgs: function(vector) {
        return {
            scale: getScale(vector, this._startVector),
            deltaScale: getScale(vector, this._prevVector),
            rotation: getRotation(vector, this._startVector),
            deltaRotation: getRotation(vector, this._prevVector),
            translation: getTranslation(vector, this._startVector),
            deltaTranslation: getTranslation(vector, this._prevVector)
        }
    },
    _fireEventAliases: function(eventPostfix, originalEvent, eventArgs) {
        eventArgs = eventArgs || {};
        iteratorUtils.each(eventAliases, function(_, eventAlias) {
            var args = {};
            iteratorUtils.each(eventAlias.args, function(name) {
                if (name in eventArgs) {
                    args[name] = eventArgs[name]
                }
            });
            this._fireEvent(DX_PREFIX + eventAlias.name + eventPostfix, originalEvent, args)
        }.bind(this))
    }
});
var eventNames = eventAliases.reduce(function(result, eventAlias) {
    [START_POSTFIX, UPDATE_POSTFIX, END_POSTFIX].forEach(function(eventPostfix) {
        result.push(DX_PREFIX + eventAlias.name + eventPostfix)
    });
    return result
}, []);
registerEmitter({
    emitter: TransformEmitter,
    events: eventNames
});
iteratorUtils.each(eventNames, function(_, eventName) {
    exports[eventName.substring(DX_PREFIX.length)] = eventName
});
