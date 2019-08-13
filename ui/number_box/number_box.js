/**
 * DevExtreme (ui/number_box/number_box.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var registerComponent = require("../../core/component_registrator"),
    NumberBoxMask = require("./number_box.mask");
registerComponent("dxNumberBox", NumberBoxMask);
module.exports = NumberBoxMask;
