/**
 * DevExtreme (ui/grid_core/ui.grid_core.pager.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _pager = require("../pager");
var _pager2 = _interopRequireDefault(_pager);
var _array = require("../../core/utils/array");
var _type = require("../../core/utils/type");
var _window = require("../../core/utils/window");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var PAGER_CLASS = "pager",
    MAX_PAGES_COUNT = 10;
var PagerView = _uiGrid_core2.default.View.inherit({
    init: function() {
        var that = this,
            dataController = that.getController("data");
        that._isVisible = false;
        dataController.changed.add(function(e) {
            if (e && e.repaintChangesOnly) {
                var pager = that._getPager();
                if (pager) {
                    pager.option({
                        pageCount: dataController.pageCount(),
                        totalCount: dataController.totalCount(),
                        hasKnownLastPage: dataController.hasKnownLastPage()
                    })
                } else {
                    that.render()
                }
            } else {
                if (!e || "update" !== e.changeType) {
                    that.render()
                }
            }
        })
    },
    _getPager: function() {
        var $element = this.element();
        return $element && $element.data("dxPager")
    },
    _renderCore: function() {
        var that = this,
            $element = that.element().addClass(that.addWidgetPrefix(PAGER_CLASS)),
            pagerOptions = that.option("pager") || {},
            dataController = that.getController("data"),
            options = {
                maxPagesCount: MAX_PAGES_COUNT,
                pageIndex: 1 + (parseInt(dataController.pageIndex()) || 0),
                pageCount: dataController.pageCount(),
                pageSize: dataController.pageSize(),
                showPageSizes: pagerOptions.showPageSizeSelector,
                showInfo: pagerOptions.showInfo,
                pagesNavigatorVisible: pagerOptions.visible,
                showNavigationButtons: pagerOptions.showNavigationButtons,
                pageSizes: that.getPageSizes(),
                totalCount: dataController.totalCount(),
                hasKnownLastPage: dataController.hasKnownLastPage(),
                pageIndexChanged: function(pageIndex) {
                    if (dataController.pageIndex() !== pageIndex - 1) {
                        setTimeout(function() {
                            dataController.pageIndex(pageIndex - 1)
                        })
                    }
                },
                pageSizeChanged: function(pageSize) {
                    setTimeout(function() {
                        dataController.pageSize(pageSize)
                    })
                }
            };
        if ((0, _type.isDefined)(pagerOptions.infoText)) {
            options.infoText = pagerOptions.infoText
        }
        that._createComponent($element, _pager2.default, options)
    },
    getPageSizes: function() {
        var that = this,
            dataController = that.getController("data"),
            pagerOptions = that.option("pager"),
            allowedPageSizes = pagerOptions && pagerOptions.allowedPageSizes,
            pageSize = dataController.pageSize();
        if (!(0, _type.isDefined)(that._pageSizes) || (0, _array.inArray)(pageSize, that._pageSizes) === -1) {
            that._pageSizes = [];
            if (pagerOptions) {
                if (Array.isArray(allowedPageSizes)) {
                    that._pageSizes = allowedPageSizes
                } else {
                    if (allowedPageSizes && pageSize > 1) {
                        that._pageSizes = [Math.floor(pageSize / 2), pageSize, 2 * pageSize]
                    }
                }
            }
        }
        return that._pageSizes
    },
    isVisible: function() {
        var that = this,
            dataController = that.getController("data"),
            pagerOptions = that.option("pager"),
            pagerVisible = pagerOptions && pagerOptions.visible,
            scrolling = that.option("scrolling");
        if (that._isVisible) {
            return true
        }
        if ("auto" === pagerVisible) {
            if (scrolling && ("virtual" === scrolling.mode || "infinite" === scrolling.mode)) {
                pagerVisible = false
            } else {
                pagerVisible = dataController.pageCount() > 1 || dataController.isLoaded() && !dataController.hasKnownLastPage()
            }
        }
        that._isVisible = pagerVisible;
        return pagerVisible
    },
    getHeight: function() {
        return this.getElementHeight()
    },
    optionChanged: function(args) {
        var that = this,
            name = args.name,
            isPager = "pager" === name,
            isPaging = "paging" === name,
            isDataSource = "dataSource" === name,
            isScrolling = "scrolling" === name,
            dataController = that.getController("data");
        if (isPager || isPaging || isScrolling || isDataSource) {
            args.handled = true;
            if (dataController.skipProcessingPagingChange(args.fullName)) {
                return
            }
            if (isPager || isPaging) {
                that._pageSizes = null
            }
            if (isPager || isPaging || isScrolling) {
                that._isVisible = false
            }
            if (!isDataSource) {
                that._invalidate();
                if ((0, _window.hasWindow)() && isPager && that.component) {
                    that.component.resize()
                }
            }
        }
    }
});
module.exports = {
    defaultOptions: function() {
        return {
            pager: {
                visible: "auto",
                showPageSizeSelector: false,
                allowedPageSizes: "auto"
            }
        }
    },
    views: {
        pagerView: PagerView
    }
};
