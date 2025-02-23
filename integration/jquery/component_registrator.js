/**
 * DevExtreme (integration/jquery/component_registrator.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var jQuery = require("jquery");
var componentRegistratorCallbacks = require("../../core/component_registrator_callbacks");
var errors = require("../../core/errors");
if (jQuery) {
    var registerJQueryComponent = function(name, componentClass) {
        jQuery.fn[name] = function(options) {
            var result, isMemberInvoke = "string" === typeof options;
            if (isMemberInvoke) {
                var memberName = options,
                    memberArgs = [].slice.call(arguments).slice(1);
                this.each(function() {
                    var instance = componentClass.getInstance(this);
                    if (!instance) {
                        throw errors.Error("E0009", name)
                    }
                    var member = instance[memberName],
                        memberValue = member.apply(instance, memberArgs);
                    if (void 0 === result) {
                        result = memberValue
                    }
                })
            } else {
                this.each(function() {
                    var instance = componentClass.getInstance(this);
                    if (instance) {
                        instance.option(options)
                    } else {
                        new componentClass(this, options)
                    }
                });
                result = this
            }
            return result
        }
    };
    componentRegistratorCallbacks.add(registerJQueryComponent)
}
