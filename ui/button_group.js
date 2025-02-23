/**
 * DevExtreme (ui/button_group.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _ui = require("./widget/ui.widget");
var _ui2 = _interopRequireDefault(_ui);
var _button = require("./button");
var _button2 = _interopRequireDefault(_button);
var _uiCollection_widget = require("./collection/ui.collection_widget.edit");
var _uiCollection_widget2 = _interopRequireDefault(_uiCollection_widget);
var _component_registrator = require("../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _extend = require("../core/utils/extend");
var _type = require("../core/utils/type");
var _bindable_template = require("./widget/bindable_template");
var _bindable_template2 = _interopRequireDefault(_bindable_template);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var BUTTON_GROUP_CLASS = "dx-buttongroup",
    BUTTON_GROUP_WRAPPER_CLASS = BUTTON_GROUP_CLASS + "-wrapper",
    BUTTON_GROUP_ITEM_CLASS = BUTTON_GROUP_CLASS + "-item",
    BUTTON_GROUP_FIRST_ITEM_CLASS = BUTTON_GROUP_CLASS + "-first-item",
    BUTTON_GROUP_LAST_ITEM_CLASS = BUTTON_GROUP_CLASS + "-last-item",
    BUTTON_GROUP_ITEM_HAS_WIDTH = BUTTON_GROUP_ITEM_CLASS + "-has-width",
    SHAPE_STANDARD_CLASS = "dx-shape-standard";
var ButtonCollection = _uiCollection_widget2.default.inherit({
    _renderItemContent: function(options) {
        options.container = (0, _renderer2.default)(options.container).parent();
        this.callBase(options)
    },
    _focusTarget: function() {
        return this.$element().parent()
    },
    _keyboardEventBindingTarget: function() {
        return this._focusTarget()
    },
    _refreshContent: function() {
        this._prepareContent();
        this._renderContent()
    },
    _itemClass: function() {
        return BUTTON_GROUP_ITEM_CLASS
    },
    _itemSelectHandler: function(e) {
        if ("single" === this.option("selectionMode") && this.isItemSelected(e.currentTarget)) {
            return
        }
        this.callBase(e)
    }
});
var ButtonGroup = _ui2.default.inherit({
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            hoverStateEnabled: true,
            focusStateEnabled: true,
            selectionMode: "single",
            selectedItems: [],
            selectedItemKeys: [],
            stylingMode: "contained",
            keyExpr: "text",
            items: [],
            itemTemplate: "item",
            onSelectionChanged: null
        })
    },
    _prepareItemStyles: function($item) {
        var itemIndex = $item.data("dxItemIndex");
        0 === itemIndex && $item.addClass(BUTTON_GROUP_FIRST_ITEM_CLASS);
        var items = this.option("items");
        items && itemIndex === items.length - 1 && $item.addClass(BUTTON_GROUP_LAST_ITEM_CLASS);
        $item.addClass(SHAPE_STANDARD_CLASS)
    },
    _initTemplates: function() {
        var _this = this;
        this.callBase();
        this._defaultTemplates.item = new _bindable_template2.default(function($container, data) {
            _this._prepareItemStyles($container);
            _this._createComponent($container, _button2.default, (0, _extend.extend)({}, data, _this._getBasicButtonOptions()))
        }, ["text", "type", "icon", "disabled", "visible", "hint"], this.option("integrationOptions.watchMethod"))
    },
    _initMarkup: function() {
        this.setAria("role", "group");
        this.$element().addClass(BUTTON_GROUP_CLASS);
        this._renderButtons();
        this._syncSelectionOptions();
        this.callBase()
    },
    _fireSelectionChangeEvent: function(addedItems, removedItems) {
        this._createActionByOption("onSelectionChanged", {
            excludeValidators: ["disabled", "readOnly"]
        })({
            addedItems: addedItems,
            removedItems: removedItems
        })
    },
    _getBasicButtonOptions: function() {
        return {
            focusStateEnabled: false,
            stylingMode: this.option("stylingMode"),
            hoverStateEnabled: this.option("hoverStateEnabled"),
            activeStateEnabled: this.option("activeStateEnabled")
        }
    },
    _renderButtons: function() {
        var _this2 = this;
        var $buttons = (0, _renderer2.default)("<div>").addClass(BUTTON_GROUP_WRAPPER_CLASS).appendTo(this.$element());
        var selectedItems = this.option("selectedItems");
        var options = {
            selectionMode: this.option("selectionMode"),
            items: this.option("items"),
            keyExpr: this.option("keyExpr"),
            itemTemplate: this._getTemplateByOption("itemTemplate"),
            scrollingEnabled: false,
            selectedItemKeys: this.option("selectedItemKeys"),
            focusStateEnabled: this.option("focusStateEnabled"),
            accessKey: this.option("accessKey"),
            tabIndex: this.option("tabIndex"),
            noDataText: "",
            selectionRequired: false,
            onItemRendered: function(e) {
                var width = _this2.option("width");
                (0, _type.isDefined)(width) && (0, _renderer2.default)(e.itemElement).addClass(BUTTON_GROUP_ITEM_HAS_WIDTH)
            },
            onSelectionChanged: function(e) {
                _this2._syncSelectionOptions();
                _this2._fireSelectionChangeEvent(e.addedItems, e.removedItems)
            }
        };
        if ((0, _type.isDefined)(selectedItems) && selectedItems.length) {
            options.selectedItems = selectedItems
        }
        this._buttonsCollection = this._createComponent($buttons, ButtonCollection, options)
    },
    _syncSelectionOptions: function() {
        this._setOptionSilent("selectedItems", this._buttonsCollection.option("selectedItems"));
        this._setOptionSilent("selectedItemKeys", this._buttonsCollection.option("selectedItemKeys"))
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "stylingMode":
            case "selectionMode":
            case "keyExpr":
            case "itemTemplate":
            case "items":
            case "activeStateEnabled":
            case "focusStateEnabled":
            case "hoverStateEnabled":
            case "tabIndex":
                this._invalidate();
                break;
            case "selectedItemKeys":
            case "selectedItems":
                this._buttonsCollection.option(args.name, args.value);
                break;
            case "onSelectionChanged":
                break;
            case "width":
                this.callBase(args);
                this.$element().find("." + BUTTON_GROUP_ITEM_CLASS).toggleClass(BUTTON_GROUP_ITEM_HAS_WIDTH, !!args.value);
                break;
            default:
                this.callBase(args)
        }
    }
});
(0, _component_registrator2.default)("dxButtonGroup", ButtonGroup);
module.exports = ButtonGroup;
module.exports.default = module.exports;
