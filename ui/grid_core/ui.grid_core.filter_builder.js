/**
 * DevExtreme (ui/grid_core/ui.grid_core.filter_builder.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _uiGrid_core = require("./ui.grid_core.modules");
var _uiGrid_core2 = _interopRequireDefault(_uiGrid_core);
var _extend = require("../../core/utils/extend");
var _filter_builder = require("./../filter_builder");
var _filter_builder2 = _interopRequireDefault(_filter_builder);
var _message = require("../../localization/message");
var _message2 = _interopRequireDefault(_message);
var _scroll_view = require("./../scroll_view");
var _scroll_view2 = _interopRequireDefault(_scroll_view);
var _popup = require("./../popup");
var _popup2 = _interopRequireDefault(_popup);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var FilterBuilderView = _uiGrid_core2.default.View.inherit({
    _renderCore: function() {
        this._updatePopupOptions()
    },
    _updatePopupOptions: function() {
        if (this.option("filterBuilderPopup.visible")) {
            this._initPopup()
        } else {
            if (this._filterBuilderPopup) {
                this._filterBuilderPopup.hide()
            }
        }
    },
    _disposePopup: function() {
        if (this._filterBuilderPopup) {
            this._filterBuilderPopup.dispose();
            this._filterBuilderPopup = void 0
        }
        if (this._filterBuilder) {
            this._filterBuilder.dispose();
            this._filterBuilder = void 0
        }
    },
    _initPopup: function() {
        var that = this;
        that._disposePopup();
        that._filterBuilderPopup = that._createComponent(that.element(), _popup2.default, (0, _extend.extend)({
            title: _message2.default.format("dxDataGrid-filterBuilderPopupTitle"),
            contentTemplate: function($contentElement) {
                return that._getPopupContentTemplate($contentElement)
            },
            onOptionChanged: function(args) {
                if ("visible" === args.name) {
                    that.option("filterBuilderPopup.visible", args.value)
                }
            },
            toolbarItems: that._getPopupToolbarItems()
        }, that.option("filterBuilderPopup"), {
            onHidden: function(e) {
                that._disposePopup()
            }
        }))
    },
    _getPopupContentTemplate: function(contentElement) {
        var $contentElement = (0, _renderer2.default)(contentElement),
            $filterBuilderContainer = (0, _renderer2.default)("<div>").appendTo((0, _renderer2.default)(contentElement));
        this._filterBuilder = this._createComponent($filterBuilderContainer, _filter_builder2.default, (0, _extend.extend)({
            value: this.option("filterValue"),
            fields: this.getController("columns").getFilteringColumns()
        }, this.option("filterBuilder"), {
            customOperations: this.getController("filterSync").getCustomFilterOperations()
        }));
        this._createComponent($contentElement, _scroll_view2.default, {
            direction: "both"
        })
    },
    _getPopupToolbarItems: function() {
        var that = this;
        return [{
            toolbar: "bottom",
            location: "after",
            widget: "dxButton",
            options: {
                text: _message2.default.format("OK"),
                onClick: function(e) {
                    var filter = that._filterBuilder.option("value");
                    that.option("filterValue", filter);
                    that._filterBuilderPopup.hide()
                }
            }
        }, {
            toolbar: "bottom",
            location: "after",
            widget: "dxButton",
            options: {
                text: _message2.default.format("Cancel"),
                onClick: function(e) {
                    that._filterBuilderPopup.hide()
                }
            }
        }]
    },
    optionChanged: function(args) {
        switch (args.name) {
            case "filterBuilder":
            case "filterBuilderPopup":
                this._invalidate();
                args.handled = true;
                break;
            default:
                this.callBase(args)
        }
    }
});
module.exports = {
    defaultOptions: function() {
        return {
            filterBuilder: {
                groupOperationDescriptions: {
                    and: _message2.default.format("dxFilterBuilder-and"),
                    or: _message2.default.format("dxFilterBuilder-or"),
                    notAnd: _message2.default.format("dxFilterBuilder-notAnd"),
                    notOr: _message2.default.format("dxFilterBuilder-notOr")
                },
                filterOperationDescriptions: {
                    between: _message2.default.format("dxFilterBuilder-filterOperationBetween"),
                    equal: _message2.default.format("dxFilterBuilder-filterOperationEquals"),
                    notEqual: _message2.default.format("dxFilterBuilder-filterOperationNotEquals"),
                    lessThan: _message2.default.format("dxFilterBuilder-filterOperationLess"),
                    lessThanOrEqual: _message2.default.format("dxFilterBuilder-filterOperationLessOrEquals"),
                    greaterThan: _message2.default.format("dxFilterBuilder-filterOperationGreater"),
                    greaterThanOrEqual: _message2.default.format("dxFilterBuilder-filterOperationGreaterOrEquals"),
                    startsWith: _message2.default.format("dxFilterBuilder-filterOperationStartsWith"),
                    contains: _message2.default.format("dxFilterBuilder-filterOperationContains"),
                    notContains: _message2.default.format("dxFilterBuilder-filterOperationNotContains"),
                    endsWith: _message2.default.format("dxFilterBuilder-filterOperationEndsWith"),
                    isBlank: _message2.default.format("dxFilterBuilder-filterOperationIsBlank"),
                    isNotBlank: _message2.default.format("dxFilterBuilder-filterOperationIsNotBlank")
                }
            },
            filterBuilderPopup: {}
        }
    },
    views: {
        filterBuilderView: FilterBuilderView
    }
};
