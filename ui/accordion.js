/**
 * DevExtreme (ui/accordion.js)
 * Version: 18.2.10
 * Build date: Mon Jul 29 2019
 *
 * Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
 * Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
 */
"use strict";
var $ = require("../core/renderer"),
    eventsEngine = require("../events/core/events_engine"),
    fx = require("../animation/fx"),
    clickEvent = require("../events/click"),
    devices = require("../core/devices"),
    extend = require("../core/utils/extend").extend,
    getPublicElement = require("../core/utils/dom").getPublicElement,
    iteratorUtils = require("../core/utils/iterator"),
    isPlainObject = require("../core/utils/type").isPlainObject,
    registerComponent = require("../core/component_registrator"),
    eventUtils = require("../events/utils"),
    CollectionWidget = require("./collection/ui.collection_widget.live_update").default,
    deferredUtils = require("../core/utils/deferred"),
    when = deferredUtils.when,
    Deferred = deferredUtils.Deferred,
    BindableTemplate = require("./widget/bindable_template"),
    iconUtils = require("../core/utils/icon"),
    isDefined = require("../core/utils/type").isDefined,
    themes = require("./themes");
var ACCORDION_CLASS = "dx-accordion",
    ACCORDION_WRAPPER_CLASS = "dx-accordion-wrapper",
    ACCORDION_ITEM_CLASS = "dx-accordion-item",
    ACCORDION_ITEM_OPENED_CLASS = "dx-accordion-item-opened",
    ACCORDION_ITEM_CLOSED_CLASS = "dx-accordion-item-closed",
    ACCORDION_ITEM_TITLE_CLASS = "dx-accordion-item-title",
    ACCORDION_ITEM_BODY_CLASS = "dx-accordion-item-body",
    ACCORDION_ITEM_TITLE_CAPTION_CLASS = "dx-accordion-item-title-caption",
    ACCORDION_ITEM_DATA_KEY = "dxAccordionItemData";
var Accordion = CollectionWidget.inherit({
    _activeStateUnit: "." + ACCORDION_ITEM_CLASS,
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            hoverStateEnabled: true,
            height: void 0,
            itemTitleTemplate: "title",
            onItemTitleClick: null,
            selectedIndex: 0,
            collapsible: false,
            multiple: false,
            animationDuration: 300,
            deferRendering: true,
            selectionByClick: true,
            activeStateEnabled: true,
            _itemAttributes: {
                role: "tab"
            },
            _animationEasing: "ease"
        })
    },
    _defaultOptionsRules: function() {
        return this.callBase().concat([{
            device: function() {
                return "desktop" === devices.real().deviceType && !devices.isSimulator()
            },
            options: {
                focusStateEnabled: true
            }
        }, {
            device: function() {
                return themes.isMaterial()
            },
            options: {
                animationDuration: 200,
                _animationEasing: "cubic-bezier(0.4, 0, 0.2, 1)"
            }
        }])
    },
    _itemElements: function() {
        return this._itemContainer().children(this._itemSelector())
    },
    _init: function() {
        this.callBase();
        this.option("selectionRequired", !this.option("collapsible"));
        this.option("selectionMode", this.option("multiple") ? "multiple" : "single");
        var $element = this.$element();
        $element.addClass(ACCORDION_CLASS);
        this._$container = $("<div>").addClass(ACCORDION_WRAPPER_CLASS);
        $element.append(this._$container)
    },
    _initTemplates: function() {
        this.callBase();
        this._defaultTemplates.title = new BindableTemplate(function($container, data) {
            var $templateContainer = $("<div>").addClass(ACCORDION_ITEM_TITLE_CAPTION_CLASS).appendTo($container);
            if (isPlainObject(data)) {
                if (data.title) {
                    $templateContainer.text(data.title)
                }
                $templateContainer.append(iconUtils.getImageContainer(data.icon))
            } else {
                $templateContainer.text(String(data))
            }
        }, ["title", "icon"], this.option("integrationOptions.watchMethod"))
    },
    _initMarkup: function() {
        this._deferredItems = [];
        this.callBase();
        this.setAria({
            role: "tablist",
            multiselectable: this.option("multiple")
        })
    },
    _render: function() {
        this.callBase();
        this._updateItemHeightsWrapper(true)
    },
    _itemDataKey: function() {
        return ACCORDION_ITEM_DATA_KEY
    },
    _itemClass: function() {
        return ACCORDION_ITEM_CLASS
    },
    _itemContainer: function() {
        return this._$container
    },
    _itemTitles: function() {
        return this._itemElements().find("." + ACCORDION_ITEM_TITLE_CLASS)
    },
    _itemContents: function() {
        return this._itemElements().find("." + ACCORDION_ITEM_BODY_CLASS)
    },
    _getItemData: function(target) {
        return $(target).parent().data(this._itemDataKey()) || this.callBase.apply(this, arguments)
    },
    _executeItemRenderAction: function(itemData) {
        if (itemData.type) {
            return
        }
        this.callBase.apply(this, arguments)
    },
    _itemSelectHandler: function(e) {
        if ($(e.target).closest(this._itemContents()).length) {
            return
        }
        this.callBase.apply(this, arguments)
    },
    _afterItemElementDeleted: function($item, deletedActionArgs) {
        this._deferredItems.splice(deletedActionArgs.itemIndex, 1);
        this.callBase.apply(this, arguments)
    },
    _renderItemContent: function(args) {
        var itemTitle = this.callBase(extend({}, args, {
            contentClass: ACCORDION_ITEM_TITLE_CLASS,
            templateProperty: "titleTemplate",
            defaultTemplateName: this.option("itemTitleTemplate")
        }));
        this._attachItemTitleClickAction(itemTitle);
        var deferred = new Deferred;
        if (isDefined(this._deferredItems[args.index])) {
            this._deferredItems[args.index] = deferred
        } else {
            this._deferredItems.push(deferred)
        }
        if (!this.option("deferRendering") || this._getSelectedItemIndices().indexOf(args.index) >= 0) {
            deferred.resolve()
        }
        deferred.done(this.callBase.bind(this, extend({}, args, {
            contentClass: ACCORDION_ITEM_BODY_CLASS,
            container: getPublicElement($("<div>").appendTo($(itemTitle).parent()))
        })))
    },
    _attachItemTitleClickAction: function(itemTitle) {
        var eventName = eventUtils.addNamespace(clickEvent.name, this.NAME);
        eventsEngine.off(itemTitle, eventName);
        eventsEngine.on(itemTitle, eventName, this._itemTitleClickHandler.bind(this))
    },
    _itemTitleClickHandler: function(e) {
        this._itemDXEventHandler(e, "onItemTitleClick")
    },
    _renderSelection: function(addedSelection, removedSelection) {
        this._itemElements().addClass(ACCORDION_ITEM_CLOSED_CLASS);
        this.setAria("hidden", true, this._itemContents());
        this._updateItems(addedSelection, removedSelection)
    },
    _updateSelection: function(addedSelection, removedSelection) {
        this._updateItems(addedSelection, removedSelection);
        this._updateItemHeightsWrapper(false)
    },
    _updateItems: function(addedSelection, removedSelection) {
        var $items = this._itemElements(),
            that = this;
        iteratorUtils.each(addedSelection, function(_, index) {
            that._deferredItems[index].resolve();
            var $item = $items.eq(index).addClass(ACCORDION_ITEM_OPENED_CLASS).removeClass(ACCORDION_ITEM_CLOSED_CLASS);
            that.setAria("hidden", false, $item.find("." + ACCORDION_ITEM_BODY_CLASS))
        });
        iteratorUtils.each(removedSelection, function(_, index) {
            var $item = $items.eq(index).removeClass(ACCORDION_ITEM_OPENED_CLASS);
            that.setAria("hidden", true, $item.find("." + ACCORDION_ITEM_BODY_CLASS))
        })
    },
    _updateItemHeightsWrapper: function(skipAnimation) {
        if (this.option("templatesRenderAsynchronously")) {
            this._animationTimer = setTimeout(function() {
                this._updateItemHeights(skipAnimation)
            }.bind(this))
        } else {
            this._updateItemHeights(skipAnimation)
        }
    },
    _updateItemHeights: function(skipAnimation) {
        var that = this,
            deferredAnimate = that._deferredAnimate,
            itemHeight = this._splitFreeSpace(this._calculateFreeSpace());
        clearTimeout(this._animationTimer);
        return when.apply($, [].slice.call(this._itemElements()).map(function(item) {
            return that._updateItemHeight($(item), itemHeight, skipAnimation)
        })).done(function() {
            if (deferredAnimate) {
                deferredAnimate.resolveWith(that)
            }
        })
    },
    _updateItemHeight: function($item, itemHeight, skipAnimation) {
        var $title = $item.children("." + ACCORDION_ITEM_TITLE_CLASS);
        if (fx.isAnimating($item)) {
            fx.stop($item)
        }
        var startItemHeight = $item.outerHeight(),
            finalItemHeight = $item.hasClass(ACCORDION_ITEM_OPENED_CLASS) ? itemHeight + $title.outerHeight() || $item.height("auto").outerHeight() : $title.outerHeight();
        return this._animateItem($item, startItemHeight, finalItemHeight, skipAnimation, !!itemHeight)
    },
    _animateItem: function($element, startHeight, endHeight, skipAnimation, fixedHeight) {
        var d;
        if (skipAnimation || startHeight === endHeight) {
            $element.css("height", endHeight);
            d = (new Deferred).resolve()
        } else {
            d = fx.animate($element, {
                type: "custom",
                from: {
                    height: startHeight
                },
                to: {
                    height: endHeight
                },
                duration: this.option("animationDuration"),
                easing: this.option("_animationEasing")
            })
        }
        return d.done(function() {
            if ($element.hasClass(ACCORDION_ITEM_OPENED_CLASS) && !fixedHeight) {
                $element.css("height", "")
            }
            $element.not("." + ACCORDION_ITEM_OPENED_CLASS).addClass(ACCORDION_ITEM_CLOSED_CLASS)
        })
    },
    _splitFreeSpace: function(freeSpace) {
        if (!freeSpace) {
            return freeSpace
        }
        return freeSpace / this.option("selectedItems").length
    },
    _calculateFreeSpace: function() {
        var height = this.option("height");
        if (void 0 === height || "auto" === height) {
            return
        }
        var $titles = this._itemTitles(),
            itemsHeight = 0;
        iteratorUtils.each($titles, function(_, title) {
            itemsHeight += $(title).outerHeight()
        });
        return this.$element().height() - itemsHeight
    },
    _visibilityChanged: function(visible) {
        if (visible) {
            this._dimensionChanged()
        }
    },
    _dimensionChanged: function() {
        this._updateItemHeights(true)
    },
    _clean: function() {
        clearTimeout(this._animationTimer);
        this.callBase()
    },
    _optionChanged: function(args) {
        switch (args.name) {
            case "animationDuration":
            case "onItemTitleClick":
            case "_animationEasing":
                break;
            case "collapsible":
                this.option("selectionRequired", !this.option("collapsible"));
                break;
            case "itemTitleTemplate":
            case "height":
            case "deferRendering":
                this._invalidate();
                break;
            case "multiple":
                this.option("selectionMode", args.value ? "multiple" : "single");
                break;
            default:
                this.callBase(args)
        }
    },
    expandItem: function(index) {
        this._deferredAnimate = new Deferred;
        this.selectItem(index);
        return this._deferredAnimate.promise()
    },
    collapseItem: function(index) {
        this._deferredAnimate = new Deferred;
        this.unselectItem(index);
        return this._deferredAnimate.promise()
    },
    updateDimensions: function() {
        return this._updateItemHeights(false)
    }
});
registerComponent("dxAccordion", Accordion);
module.exports = Accordion;
module.exports.default = module.exports;
