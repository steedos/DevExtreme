/**
 * DevExtreme (viz/vector_map/theme_manager.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var BaseThemeManager = require("../core/base_theme_manager").BaseThemeManager;
exports.ThemeManager = BaseThemeManager.inherit({
    _themeSection: "map",
    _fontFields: ["layer:area.label.font", "layer:marker:dot.label.font", "layer:marker:bubble.label.font", "layer:marker:pie.label.font", "layer:marker:image.label.font", "tooltip.font", "legend.font", "title.font", "title.subtitle.font", "loadingIndicator.font", "export.font"]
});
