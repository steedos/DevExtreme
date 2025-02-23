/**
 * DevExtreme (ui/widget/function_template.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var TemplateBase = require("./ui.template_base"),
    domUtils = require("../../core/utils/dom");
var FunctionTemplate = TemplateBase.inherit({
    ctor: function(render) {
        this._render = render
    },
    _renderCore: function(options) {
        return domUtils.normalizeTemplateElement(this._render(options))
    }
});
module.exports = FunctionTemplate;
