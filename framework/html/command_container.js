/**
 * DevExtreme (framework/html/command_container.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
require("../../integration/jquery");
var $ = require("jquery"),
    MarkupComponent = require("./markup_component").MarkupComponent,
    isPlainObject = require("../../core/utils/type").isPlainObject,
    registerComponent = require("../../core/component_registrator");
require("../../integration/knockout");
var CommandContainer = MarkupComponent.inherit({
    ctor: function(element, options) {
        if (isPlainObject(element)) {
            options = element;
            element = $("<div>")
        }
        this.callBase(element, options)
    },
    _setDefaultOptions: function() {
        this.callBase();
        this.option({
            id: null
        })
    },
    _render: function() {
        this.callBase();
        this.element().addClass("dx-command-container")
    }
});
registerComponent("dxCommandContainer", CommandContainer);
module.exports = CommandContainer;
