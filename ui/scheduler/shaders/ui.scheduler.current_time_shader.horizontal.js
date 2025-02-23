/**
 * DevExtreme (ui/scheduler/shaders/ui.scheduler.current_time_shader.horizontal.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var Shader = require("./ui.scheduler.current_time_shader");
var HorizontalCurrentTimeShader = Shader.inherit({
    _renderShader: function() {
        var groupCount = "horizontal" === this._workspace.option("groupOrientation") ? this._workspace._getGroupCount() : 1;
        this._customizeShader(this._$shader, 0);
        if (groupCount > 1) {
            for (var i = 1; i < groupCount; i++) {
                var $shader = this._createShader();
                this._customizeShader($shader, 1);
                this._shader.push($shader)
            }
        }
    },
    _customizeShader: function($shader, groupIndex) {
        var shaderWidth = this._workspace.getIndicationWidth(),
            maxWidth = this._$container.get(0).getBoundingClientRect().width;
        if (shaderWidth > maxWidth) {
            shaderWidth = maxWidth
        }
        if (shaderWidth > 0) {
            $shader.width(shaderWidth)
        }
        $shader.css("left", this._workspace._getCellCount() * this._workspace.getCellWidth() * groupIndex)
    }
});
module.exports = HorizontalCurrentTimeShader;
