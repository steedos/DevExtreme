/**
 * DevExtreme (ui/tab_panel.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var _renderer = require("../core/renderer");
var _renderer2 = _interopRequireDefault(_renderer);
var _support = require("../core/utils/support");
var _support2 = _interopRequireDefault(_support);
var _extend = require("../core/utils/extend");
var _devices = require("../core/devices");
var _devices2 = _interopRequireDefault(_devices);
var _component_registrator = require("../core/component_registrator");
var _component_registrator2 = _interopRequireDefault(_component_registrator);
var _multi_view = require("./multi_view");
var _multi_view2 = _interopRequireDefault(_multi_view);
var _tabs = require("./tabs");
var _tabs2 = _interopRequireDefault(_tabs);
var _item = require("./tab_panel/item");
var _item2 = _interopRequireDefault(_item);
var _icon = require("../core/utils/icon");
var _icon2 = _interopRequireDefault(_icon);
var _dom = require("../core/utils/dom");
var _bindable_template = require("./widget/bindable_template");
var _bindable_template2 = _interopRequireDefault(_bindable_template);
var _window = require("../core/utils/window");
var _window2 = _interopRequireDefault(_window);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        "default": obj
    }
}
var TABPANEL_CLASS = "dx-tabpanel";
var TABPANEL_TABS_CLASS = "dx-tabpanel-tabs";
var TABPANEL_CONTAINER_CLASS = "dx-tabpanel-container";
var TABS_ITEM_TEXT_CLASS = "dx-tab-text";
var TabPanel = _multi_view2.default.inherit({
    _getDefaultOptions: function() {
        return (0, _extend.extend)(this.callBase(), {
            itemTitleTemplate: "title",
            hoverStateEnabled: true,
            showNavButtons: false,
            scrollByContent: true,
            scrollingEnabled: true,
            onTitleClick: null,
            onTitleHold: null,
            onTitleRendered: null,
            badgeExpr: function(data) {
                return data ? data.badge : void 0
            }
        })
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: function() {
                return "desktop" === _devices2.default.real().deviceType && !_devices2.default.isSimulator()
            },
            options: {
                focusStateEnabled: true
            }
        }, {
            device: function() {
                return !_support2.default.touch
            },
            options: {
                swipeEnabled: false
            }
        }, {
            device: {
                platform: "generic"
            },
            options: {
                animationEnabled: false
            }
        }])
    },
    _init: function() {
        this.callBase();
        this.$element().addClass(TABPANEL_CLASS);
        this.setAria("role", "tabpanel")
    },
    _initMarkup: function() {
        this.callBase();
        this._createTitleActions();
        this._renderLayout()
    },
    _initTemplates: function() {
        this.callBase();
        this._defaultTemplates.title = new _bindable_template2.default(function($container, data) {
            $container.text(data.title || String(data));
            var $iconElement = _icon2.default.getImageContainer(data.icon);
            $container.wrapInner((0, _renderer2.default)("<span>").addClass(TABS_ITEM_TEXT_CLASS));
            $iconElement && $iconElement.prependTo($container)
        }, ["title", "icon"], this.option("integrationOptions.watchMethod"))
    },
    _createTitleActions: function() {
        this._createTitleClickAction();
        this._createTitleHoldAction();
        this._createTitleRenderedAction()
    },
    _createTitleClickAction: function() {
        this._titleClickAction = this._createActionByOption("onTitleClick")
    },
    _createTitleHoldAction: function() {
        this._titleHoldAction = this._createActionByOption("onTitleHold")
    },
    _createTitleRenderedAction: function() {
        this._titleRenderedAction = this._createActionByOption("onTitleRendered")
    },
    _renderContent: function() {
        var that = this;
        this.callBase();
        if (this.option("templatesRenderAsynchronously")) {
            this._resizeEventTimer = setTimeout(function() {
                that._updateLayout()
            }, 0)
        }
    },
    _renderLayout: function() {
        if (this._tabs) {
            return
        }
        var $element = this.$element();
        this._$tabContainer = (0, _renderer2.default)("<div>").addClass(TABPANEL_TABS_CLASS).appendTo($element);
        var $tabs = (0, _renderer2.default)("<div>").appendTo(this._$tabContainer);
        this._tabs = this._createComponent($tabs, _tabs2.default, this._tabConfig());
        this._$container = (0, _renderer2.default)("<div>").addClass(TABPANEL_CONTAINER_CLASS).appendTo($element);
        this._$container.append(this._$wrapper);
        this._updateLayout()
    },
    _updateLayout: function() {
        if (_window2.default.hasWindow()) {
            var tabsHeight = this._$tabContainer.outerHeight();
            this._$container.css({
                marginTop: -tabsHeight,
                paddingTop: tabsHeight
            })
        }
    },
    _refreshActiveDescendant: function() {
        if (!this._tabs) {
            return
        }
        var tabs = this._tabs,
            tabItems = tabs.itemElements(),
            $activeTab = (0, _renderer2.default)(tabItems[tabs.option("selectedIndex")]),
            id = this.getFocusedItemId();
        this.setAria("controls", void 0, (0, _renderer2.default)(tabItems));
        this.setAria("controls", id, $activeTab)
    },
    _tabConfig: function() {
        return {
            selectOnFocus: true,
            focusStateEnabled: this.option("focusStateEnabled"),
            hoverStateEnabled: this.option("hoverStateEnabled"),
            repaintChangesOnly: this.option("repaintChangesOnly"),
            tabIndex: this.option("tabIndex"),
            selectedIndex: this.option("selectedIndex"),
            badgeExpr: this.option("badgeExpr"),
            onItemClick: this._titleClickAction.bind(this),
            onItemHold: this._titleHoldAction.bind(this),
            itemHoldTimeout: this.option("itemHoldTimeout"),
            onSelectionChanged: function(e) {
                this.option("selectedIndex", e.component.option("selectedIndex"));
                this._refreshActiveDescendant()
            }.bind(this),
            onItemRendered: this._titleRenderedAction.bind(this),
            itemTemplate: this._getTemplateByOption("itemTitleTemplate"),
            items: this.option("items"),
            noDataText: null,
            scrollingEnabled: this.option("scrollingEnabled"),
            scrollByContent: this.option("scrollByContent"),
            showNavButtons: this.option("showNavButtons"),
            itemTemplateProperty: "tabTemplate",
            loopItemFocus: this.option("loop"),
            selectionRequired: true,
            onOptionChanged: function(args) {
                if ("focusedElement" === args.name) {
                    if (args.value) {
                        var $value = (0, _renderer2.default)(args.value);
                        var $newItem = this._itemElements().eq($value.index());
                        this.option("focusedElement", (0, _dom.getPublicElement)($newItem))
                    } else {
                        this.option("focusedElement", args.value)
                    }
                }
            }.bind(this),
            onFocusIn: function(args) {
                this._focusInHandler(args.event)
            }.bind(this),
            onFocusOut: function(args) {
                this._focusOutHandler(args.event)
            }.bind(this)
        }
    },
    _renderFocusTarget: function() {
        this._focusTarget().attr("tabIndex", -1);
        this._refreshActiveDescendant()
    },
    _updateFocusState: function(e, isFocused) {
        this.callBase(e, isFocused);
        if (e.target === this._tabs._focusTarget().get(0)) {
            this._toggleFocusClass(isFocused, this._focusTarget())
        }
    },
    _setTabsOption: function(name, value) {
        if (this._tabs) {
            this._tabs.option(name, value)
        }
    },
    _visibilityChanged: function(visible) {
        if (visible) {
            this._tabs._dimensionChanged();
            this._updateLayout()
        }
    },
    registerKeyHandler: function(key, handler) {
        this.callBase(key, handler);
        if (this._tabs) {
            this._tabs.registerKeyHandler(key, handler)
        }
    },
    repaint: function() {
        this.callBase();
        this._tabs.repaint()
    },
    _optionChanged: function(args) {
        var name = args.name,
            value = args.value,
            fullName = args.fullName;
        switch (name) {
            case "dataSource":
                this.callBase(args);
                break;
            case "items":
                this._setTabsOption(fullName, value);
                this._updateLayout();
                if (!this.option("repaintChangesOnly")) {
                    this._tabs.repaint()
                }
                this.callBase(args);
                break;
            case "width":
                this.callBase(args);
                this._tabs.repaint();
                break;
            case "selectedIndex":
            case "selectedItem":
            case "itemHoldTimeout":
            case "focusStateEnabled":
            case "hoverStateEnabled":
                this._setTabsOption(fullName, value);
                this.callBase(args);
                break;
            case "scrollingEnabled":
            case "scrollByContent":
            case "showNavButtons":
                this._setTabsOption(fullName, value);
                break;
            case "focusedElement":
                var id = value ? (0, _renderer2.default)(value).index() : value;
                var newItem = value ? this._tabs._itemElements().eq(id) : value;
                this._setTabsOption("focusedElement", (0, _dom.getPublicElement)(newItem));
                this.callBase(args);
                break;
            case "itemTitleTemplate":
                this._setTabsOption("itemTemplate", this._getTemplateByOption("itemTitleTemplate"));
                break;
            case "onTitleClick":
                this._createTitleClickAction();
                this._setTabsOption("onItemClick", this._titleClickAction.bind(this));
                break;
            case "onTitleHold":
                this._createTitleHoldAction();
                this._setTabsOption("onItemHold", this._titleHoldAction.bind(this));
                break;
            case "onTitleRendered":
                this._createTitleRenderedAction();
                this._setTabsOption("onItemRendered", this._titleRenderedAction.bind(this));
                break;
            case "loop":
                this._setTabsOption("loopItemFocus", value);
                break;
            case "badgeExpr":
                this._invalidate();
                break;
            default:
                this.callBase(args)
        }
    },
    _clean: function() {
        clearTimeout(this._resizeEventTimer);
        this.callBase()
    }
});
TabPanel.ItemClass = _item2.default;
(0, _component_registrator2.default)("dxTabPanel", TabPanel);
module.exports = TabPanel;
module.exports.default = module.exports;
