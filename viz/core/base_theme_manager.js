/**
 * DevExtreme (viz/core/base_theme_manager.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var Class = require("../../core/class"),
    extend = require("../../core/utils/extend").extend,
    typeUtils = require("../../core/utils/type"),
    each = require("../../core/utils/iterator").each,
    paletteModule = require("../palette"),
    _isString = typeUtils.isString,
    _parseScalar = require("./utils").parseScalar,
    themeModule = require("../themes"),
    _getTheme = themeModule.getTheme,
    _addCacheItem = themeModule.addCacheItem,
    _removeCacheItem = themeModule.removeCacheItem,
    _extend = extend,
    _each = each;
require("./themes/generic.light");
require("./themes/generic.dark");
require("./themes/generic.contrast");
require("./themes/generic.carmine");
require("./themes/generic.darkmoon");
require("./themes/generic.softblue");
require("./themes/generic.darkviolet");
require("./themes/generic.greenmist");
require("./themes/material");
require("./themes/ios");
require("./themes/android");
require("./themes/win");

function getThemePart(theme, path) {
    var _theme = theme;
    path && _each(path.split("."), function(_, pathItem) {
        return _theme = _theme[pathItem]
    });
    return _theme
}
exports.BaseThemeManager = Class.inherit({
    ctor: function() {
        _addCacheItem(this)
    },
    dispose: function() {
        var that = this;
        _removeCacheItem(that);
        that._callback = that._theme = that._font = null;
        return that
    },
    setCallback: function(callback) {
        this._callback = callback;
        return this
    },
    setTheme: function(theme, rtl) {
        this._current = theme;
        this._rtl = rtl;
        return this.refresh()
    },
    refresh: function() {
        var that = this,
            current = that._current || {},
            theme = _getTheme(current.name || current);
        that._themeName = theme.name;
        that._defaultPalette = theme.defaultPalette;
        that._font = _extend({}, theme.font, current.font);
        that._themeSection && _each(that._themeSection.split("."), function(_, path) {
            theme = _extend(true, {}, theme[path])
        });
        that._theme = _extend(true, {}, theme, _isString(current) ? {} : current);
        that._initializeTheme();
        if (_parseScalar(that._rtl, that._theme.rtlEnabled)) {
            _extend(true, that._theme, that._theme._rtl)
        }
        that._callback();
        return that
    },
    theme: function(path) {
        return getThemePart(this._theme, path)
    },
    themeName: function() {
        return this._themeName
    },
    createPalette: function(palette, options) {
        return new paletteModule.Palette(palette, options, this._defaultPalette)
    },
    createDiscretePalette: function(palette, count) {
        return new paletteModule.DiscretePalette(palette, count, this._defaultPalette)
    },
    createGradientPalette: function(palette) {
        return new paletteModule.GradientPalette(palette, this._defaultPalette)
    },
    getAccentColor: function(palette) {
        return paletteModule.getAccentColor(palette, this._defaultPalette)
    },
    _initializeTheme: function() {
        var that = this;
        _each(that._fontFields || [], function(_, path) {
            that._initializeFont(getThemePart(that._theme, path))
        })
    },
    _initializeFont: function(font) {
        _extend(font, this._font, _extend({}, font))
    }
});
