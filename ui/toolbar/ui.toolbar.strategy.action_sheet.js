/**
 * DevExtreme (ui/toolbar/ui.toolbar.strategy.action_sheet.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var ToolbarStrategy = require("./ui.toolbar.strategy"),
    extend = require("../../core/utils/extend").extend,
    ActionSheet = require("../action_sheet");
var ActionSheetStrategy = ToolbarStrategy.inherit({
    NAME: "actionSheet",
    _getMenuItemTemplate: function() {
        return this._toolbar._getTemplate("actionSheetItem")
    },
    render: function() {
        if (!this._hasVisibleMenuItems()) {
            return
        }
        this.callBase()
    },
    _menuWidgetClass: function() {
        return ActionSheet
    },
    _menuContainer: function() {
        return this._toolbar.$element()
    },
    _widgetOptions: function() {
        return extend({}, this.callBase(), {
            target: this._$button,
            showTitle: false
        })
    },
    _menuButtonOptions: function() {
        return extend({}, this.callBase(), {
            icon: "overflow"
        })
    },
    _toggleMenu: function() {
        this.callBase.apply(this, arguments);
        this._menu.toggle(this._menuShown);
        this._menuShown = false
    }
});
module.exports = ActionSheetStrategy;
