/**
 * DevExtreme (framework/command.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
require("../integration/jquery");
var $ = require("jquery"),
    errors = require("./errors"),
    extend = require("../core/utils/extend").extend,
    typeUtils = require("../core/utils/type"),
    registerComponent = require("../core/component_registrator"),
    DOMComponent = require("../core/dom_component"),
    isFunction = typeUtils.isFunction,
    isPlainObject = typeUtils.isPlainObject,
    noop = require("../core/utils/common").noop;
require("../integration/knockout");
var Command = DOMComponent.inherit({
    ctor: function(element, options) {
        if (isPlainObject(element)) {
            options = element;
            element = $("<div>")
        }
        this.callBase(element, options)
    },
    _setDeprecatedOptions: function() {
        this.callBase();
        extend(this._deprecatedOptions, {
            iconSrc: {
                since: "15.1",
                alias: "icon"
            }
        })
    },
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            onExecute: null,
            id: null,
            title: "",
            icon: "",
            visible: true,
            disabled: false,
            renderStage: "onViewShown"
        })
    },
    execute: function() {
        var isDisabled = this._options.disabled;
        if (isFunction(isDisabled)) {
            isDisabled = !!isDisabled.apply(this, arguments)
        }
        if (isDisabled) {
            throw errors.Error("E3004", this._options.id)
        }
        this.fireEvent("beforeExecute", arguments);
        this._createActionByOption("onExecute").apply(this, arguments);
        this.fireEvent("afterExecute", arguments)
    },
    _render: function() {
        this.callBase();
        this.$element().addClass("dx-command")
    },
    _renderDisabledState: noop,
    _dispose: function() {
        this.callBase();
        this.$element().removeData(this.NAME)
    }
});
registerComponent("dxCommand", Command);
module.exports = Command;
module.exports.default = module.exports;
