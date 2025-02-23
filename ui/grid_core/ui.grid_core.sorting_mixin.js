/**
 * DevExtreme (ui/grid_core/ui.grid_core.sorting_mixin.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _type = require("../../core/utils/type");
var SORT_CLASS = "dx-sort",
    SORT_NONE_CLASS = "dx-sort-none",
    SORTUP_CLASS = "dx-sort-up",
    SORTDOWN_CLASS = "dx-sort-down",
    HEADERS_ACTION_CLASS = "action";
module.exports = {
    _applyColumnState: function(options) {
        var ariaSortState, $sortIndicator, that = this,
            sortingMode = that.option("sorting.mode"),
            rootElement = options.rootElement,
            column = options.column,
            $indicatorsContainer = that._getIndicatorContainer(rootElement);
        if ("sort" === options.name) {
            rootElement.find("." + SORT_CLASS).remove();
            !$indicatorsContainer.children().length && $indicatorsContainer.remove();
            if (("single" === sortingMode || "multiple" === sortingMode) && column.allowSorting || (0, _type.isDefined)(column.sortOrder)) {
                ariaSortState = "asc" === column.sortOrder ? "ascending" : "descending";
                $sortIndicator = that.callBase(options).toggleClass(SORTUP_CLASS, "asc" === column.sortOrder).toggleClass(SORTDOWN_CLASS, "desc" === column.sortOrder);
                options.rootElement.addClass(that.addWidgetPrefix(HEADERS_ACTION_CLASS))
            }
            if (!(0, _type.isDefined)(column.sortOrder)) {
                that.setAria("sort", "none", rootElement)
            } else {
                that.setAria("sort", ariaSortState, rootElement)
            }
            return $sortIndicator
        } else {
            return that.callBase(options)
        }
    },
    _getIndicatorClassName: function(name) {
        if ("sort" === name) {
            return SORT_CLASS
        }
        return this.callBase(name)
    },
    _renderIndicator: function(options) {
        var rtlEnabled, column = options.column,
            $container = options.container,
            $indicator = options.indicator;
        if ("sort" === options.name) {
            rtlEnabled = this.option("rtlEnabled");
            if (!(0, _type.isDefined)(column.sortOrder)) {
                $indicator && $indicator.addClass(SORT_NONE_CLASS)
            }
            if ($container.children().length && (!rtlEnabled && "left" === options.columnAlignment || rtlEnabled && "right" === options.columnAlignment)) {
                $container.prepend($indicator);
                return
            }
        }
        this.callBase(options)
    },
    _updateIndicator: function($cell, column, indicatorName) {
        if ("sort" === indicatorName && (0, _type.isDefined)(column.groupIndex)) {
            return
        }
        return this.callBase.apply(this, arguments)
    },
    _getIndicatorElements: function($cell, returnAll) {
        var $indicatorElements = this.callBase($cell);
        return returnAll ? $indicatorElements : $indicatorElements && $indicatorElements.not("." + SORT_NONE_CLASS)
    }
};
