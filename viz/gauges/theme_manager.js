/**
 * DevExtreme (viz/gauges/theme_manager.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var extend = require("../../core/utils/extend").extend,
    _extend = extend,
    BaseThemeManager = require("../core/base_theme_manager").BaseThemeManager;
var ThemeManager = BaseThemeManager.inherit({
    _themeSection: "gauge",
    _fontFields: ["scale.label.font", "valueIndicators.rangebar.text.font", "valueIndicators.textcloud.text.font", "title.font", "title.subtitle.font", "tooltip.font", "indicator.text.font", "loadingIndicator.font", "export.font"],
    _initializeTheme: function() {
        var subTheme, that = this;
        if (that._subTheme) {
            subTheme = _extend(true, {}, that._theme[that._subTheme], that._theme);
            _extend(true, that._theme, subTheme)
        }
        that.callBase.apply(that, arguments)
    }
});
module.exports = ThemeManager;
