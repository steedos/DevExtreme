/**
 * DevExtreme (ui/notify.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    Action = require("../core/action"),
    viewPortUtils = require("../core/utils/view_port"),
    extend = require("../core/utils/extend").extend,
    isPlainObject = require("../core/utils/type").isPlainObject,
    Toast = require("./toast");
var $notify = null;
var notify = function(message, type, displayTime) {
    var options = isPlainObject(message) ? message : {
        message: message
    };
    var userHiddenAction = options.onHidden;
    extend(options, {
        type: type,
        displayTime: displayTime,
        onHidden: function(args) {
            $(args.element).remove();
            new Action(userHiddenAction, {
                context: args.model
            }).execute(arguments)
        }
    });
    $notify = $("<div>").appendTo(viewPortUtils.value());
    new Toast($notify, options).show()
};
module.exports = notify;
module.exports.default = module.exports;
