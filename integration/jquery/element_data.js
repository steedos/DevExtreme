/**
 * DevExtreme (integration/jquery/element_data.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var jQuery = require("jquery");
var dataUtils = require("../../core/element_data");
var useJQuery = require("./use_jquery")();
if (useJQuery) {
    dataUtils.setDataStrategy(jQuery)
}
