/**
 * DevExtreme (core/component_registrator.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("./renderer");
var callbacks = require("./component_registrator_callbacks");
var errors = require("./errors");
var publicComponentUtils = require("./utils/public_component");
var registerComponent = function(name, namespace, componentClass) {
    if (!componentClass) {
        componentClass = namespace
    } else {
        namespace[name] = componentClass
    }
    publicComponentUtils.name(componentClass, name);
    callbacks.fire(name, componentClass)
};
var registerRendererComponent = function(name, componentClass) {
    $.fn[name] = function(options) {
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
callbacks.add(registerRendererComponent);
module.exports = registerComponent;
