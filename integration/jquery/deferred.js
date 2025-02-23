/**
 * DevExtreme (integration/jquery/deferred.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var jQuery = require("jquery");
var deferredUtils = require("../../core/utils/deferred");
var useJQuery = require("./use_jquery")();
var compareVersion = require("../../core/utils/version").compare;
if (useJQuery) {
    var Deferred = jQuery.Deferred;
    var strategy = {
        Deferred: Deferred
    };
    strategy.when = compareVersion(jQuery.fn.jquery, [3]) < 0 ? jQuery.when : function(singleArg) {
        if (0 === arguments.length) {
            return (new Deferred).resolve()
        } else {
            if (1 === arguments.length) {
                return singleArg && singleArg.then ? singleArg : (new Deferred).resolve(singleArg)
            } else {
                return jQuery.when.apply(jQuery, arguments)
            }
        }
    };
    deferredUtils.setStrategy(strategy)
}
