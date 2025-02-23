/**
 * DevExtreme (framework/action_executors.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
require("../integration/jquery");
var $ = require("jquery"),
    location = require("../core/dom_adapter").getLocation(),
    dataCoreUtils = require("../core/utils/data"),
    extend = require("../core/utils/extend").extend,
    isPlainObject = require("../core/utils/type").isPlainObject,
    map = require("../core/utils/iterator").map,
    Route = require("./router").Route;

function prepareNavigateOptions(options, actionArguments) {
    if (actionArguments.args) {
        var sourceEventArguments = actionArguments.args[0];
        options.event = sourceEventArguments.event
    }
    if ("dxCommand" === (actionArguments.component || {}).NAME) {
        extend(options, actionArguments.component.option())
    }
}

function preventDefaultLinkBehavior(e) {
    if (!e) {
        return
    }
    var $targetElement = $(e.target);
    if ($targetElement.attr("href")) {
        e.preventDefault()
    }
}
var createActionExecutors = function(app) {
    return {
        routing: {
            execute: function(e) {
                var routeValues, uri, action = e.action,
                    options = {};
                if (isPlainObject(action)) {
                    routeValues = action.routeValues;
                    if (routeValues && isPlainObject(routeValues)) {
                        options = action.options
                    } else {
                        routeValues = action
                    }
                    uri = app.router.format(routeValues);
                    prepareNavigateOptions(options, e);
                    preventDefaultLinkBehavior(options.event);
                    app.navigate(uri, options);
                    e.handled = true
                }
            }
        },
        hash: {
            execute: function(e) {
                if ("string" !== typeof e.action || "#" !== e.action.charAt(0)) {
                    return
                }
                var uriTemplate = e.action.substr(1),
                    args = e.args[0],
                    uri = uriTemplate;
                var defaultEvaluate = function(expr) {
                    var getter = dataCoreUtils.compileGetter(expr),
                        model = e.args[0].model;
                    return getter(model)
                };
                var evaluate = args.evaluate || defaultEvaluate;
                uri = uriTemplate.replace(/\{([^}]+)\}/g, function(entry, expr) {
                    expr = expr.trim();
                    if (expr.indexOf(",") > -1) {
                        expr = map(expr.split(","), function(item) {
                            return item.trim()
                        })
                    }
                    var value = evaluate(expr);
                    if (void 0 === value) {
                        value = ""
                    }
                    value = Route.prototype.formatSegment(value);
                    return value
                });
                var options = {};
                prepareNavigateOptions(options, e);
                preventDefaultLinkBehavior(options.event);
                app.navigate(uri, options);
                e.handled = true
            }
        },
        url: {
            execute: function(e) {
                if ("string" === typeof e.action && "#" !== e.action.charAt(0)) {
                    location.href = e.action
                }
            }
        }
    }
};
exports.createActionExecutors = createActionExecutors;
