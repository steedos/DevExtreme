/**
 * DevExtreme (ui/tabs/item.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../../core/renderer"),
    CollectionWidgetItem = require("../collection/item");
var TABS_ITEM_BADGE_CLASS = "dx-tabs-item-badge",
    BADGE_CLASS = "dx-badge";
var TabsItem = CollectionWidgetItem.inherit({
    _renderWatchers: function() {
        this.callBase();
        this._startWatcher("badge", this._renderBadge.bind(this))
    },
    _renderBadge: function(badge) {
        this._$element.children("." + BADGE_CLASS).remove();
        if (!badge) {
            return
        }
        var $badge = $("<div>").addClass(TABS_ITEM_BADGE_CLASS).addClass(BADGE_CLASS).text(badge);
        this._$element.append($badge)
    }
});
module.exports = TabsItem;
