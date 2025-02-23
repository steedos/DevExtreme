/**
 * DevExtreme (ui/widget/empty_template.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    TemplateBase = require("./ui.template_base");
var EmptyTemplate = TemplateBase.inherit({
    _renderCore: function() {
        return $()
    }
});
module.exports = EmptyTemplate;
